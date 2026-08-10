import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const f = createUploadthing();

/**
 * Upload router. Only execom/admin/owner may upload; the resulting UploadThing
 * URL is what gets stored in the DB image columns.
 */
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 20 } })
    .middleware(async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new UploadThingError("Unauthorized");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["execom", "admin", "owner"].includes(profile.role)) {
        throw new UploadThingError("Forbidden");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const supabase = await createClient();
      await supabase.from("media_assets").insert({
        url: file.ufsUrl,
        name: file.name,
        mime: file.type ?? "image/jpeg",
        size: file.size,
        created_by: metadata.userId,
      });
      return { url: file.ufsUrl, uploadedBy: metadata.userId };
    }),

  /**
   * Public form file upload route. No admin role required — any visitor who
   * submits a form may upload files. The folder the file lands in is determined
   * by the upload_folder field setting passed as input metadata.
   */
  formFileUploader: f({ blob: { maxFileSize: "16MB", maxFileCount: 1 } })
    .input(z.object({ folder: z.string().default("forms") }))
    .middleware(async ({ input }) => {
      return { folder: input.folder || "forms" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Use the service-role client so the admin-only RLS write policy
      // doesn't silently reject the insert for anonymous form submitters.
      const supabase = createAdminClient();
      await supabase.from("media_assets").insert({
        url: file.ufsUrl,
        name: file.name,
        mime: file.type ?? "application/octet-stream",
        size: file.size,
        folder: metadata.folder,
        created_by: null,
      });
      return { url: file.ufsUrl, folder: metadata.folder };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

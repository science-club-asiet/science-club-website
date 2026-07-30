import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from "@/lib/supabase/server";

const f = createUploadthing();

/**
 * Upload router. Only execom/admin/owner may upload; the resulting UploadThing
 * URL is what gets stored in the DB image columns.
 */
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

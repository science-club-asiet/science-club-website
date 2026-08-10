"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

/**
 * Creates an Event (draft) + Registration Form + draft Announcement post + checklist.
 * Returns the URL of the created event to redirect to.
 */
export async function playbookOrganizeWorkshop() {
  const { supabase, user } = await requireAdmin();

  // 1. Create the Event
  const { data: event, error: evtErr } = await supabase
    .from("events")
    .insert({
      title: "New Workshop",
      slug: `workshop-${Date.now()}`,
      category: "workshop",
      is_published: false,
    })
    .select("id")
    .single();

  if (evtErr || !event) throw new Error("Failed to create Event: " + evtErr?.message);

  // 2. Create the Registration Form
  const { data: form, error: formErr } = await supabase
    .from("forms")
    .insert({
      title: "Workshop Registration",
      slug: `workshop-reg-${Date.now()}`,
      purpose: "event",
      is_active: false,
    })
    .select("id")
    .single();

  if (formErr || !form) throw new Error("Failed to create Form: " + formErr?.message);

  await supabase.from("form_fields").insert([
    { form_id: form.id, field_key: "full_name", label: "Full Name", field_type: "text", required: true, display_order: 0 },
    { form_id: form.id, field_key: "email", label: "Email Address", field_type: "email", required: true, display_order: 1 },
    { form_id: form.id, field_key: "department", label: "Department", field_type: "text", required: true, display_order: 2 },
  ]);

  // 3. Create the Announcement Post
  await supabase.from("posts").insert({
    title: "Upcoming Workshop Announcement",
    slug: `workshop-announcement-${Date.now()}`,
    type: "announcement",
    status: "draft",
    excerpt: "We are thrilled to announce a new workshop...",
  });

  // 4. Create tasks
  const tasks = [
    "Finalize workshop topic and speaker",
    "Book the venue",
    "Publish the registration form",
    "Publish the announcement post",
    "Send email to members",
  ].map(title => ({
    title,
    entity_type: "events",
    entity_id: event.id,
    created_by: user.id,
  }));
  await supabase.from("tasks").insert(tasks);

  revalidatePath("/admin/events");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/forms");

  return `/admin/events/${event.id}/edit`;
}

export async function playbookNewMemberIntake() {
  const { supabase, user } = await requireAdmin();

  const { data: form, error } = await supabase
    .from("forms")
    .insert({
      title: "Membership Application",
      slug: `membership-app-${Date.now()}`,
      purpose: "membership",
      is_active: false,
    })
    .select("id")
    .single();

  if (error || !form) throw new Error("Failed to create Form: " + error?.message);

  await supabase.from("form_fields").insert([
    { form_id: form.id, field_key: "full_name", label: "Full Name", field_type: "text", required: true, display_order: 0 },
    { form_id: form.id, field_key: "email", label: "Email Address", field_type: "email", required: true, display_order: 1 },
    { form_id: form.id, field_key: "motivation", label: "Why do you want to join?", field_type: "textarea", required: true, display_order: 2 },
  ]);

  const tasks = [
    "Review application form fields",
    "Publish the application form",
    "Update social media links to point to the form",
    "Review incoming applications in the Kanban pipeline",
  ].map(title => ({
    title,
    entity_type: "forms",
    entity_id: form.id,
    created_by: user.id,
  }));
  await supabase.from("tasks").insert(tasks);

  revalidatePath("/admin/forms");
  return `/admin/forms/${form.id}`;
}

export async function playbookPublishResearch() {
  const { supabase, user } = await requireAdmin();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title: "New Research Paper",
      slug: `research-${Date.now()}`,
      type: "paper",
      status: "draft",
      meta: {
        pdf_url: "",
        doi: "",
        authors: [],
      },
    })
    .select("id")
    .single();

  if (error || !post) throw new Error("Failed to create Post: " + error?.message);

  const tasks = [
    "Upload the PDF document",
    "Fill in the DOI and authors in the Meta field",
    "Write an abstract in the excerpt field",
    "Publish the paper",
  ].map(title => ({
    title,
    entity_type: "posts",
    entity_id: post.id,
    created_by: user.id,
  }));
  await supabase.from("tasks").insert(tasks);

  revalidatePath("/admin/posts");
  return `/admin/posts/${post.id}/edit`;
}

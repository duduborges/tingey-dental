import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";
    const { clinic_name, notification_email, new_password } = body;

    const updates: Record<string, unknown> = {};

    if (clinic_name !== undefined) updates.clinic_name = clinic_name;
    if (notification_email !== undefined) updates.notification_email = notification_email;

    if (new_password) {
      const hash = await bcrypt.hash(new_password, 10);
      updates.admin_password_hash = hash;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("clinic_settings")
      .update(updates)
      .eq("clinic_slug", clinicSlug);

    if (error) {
      console.error("Settings update error:", error);
      return Response.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

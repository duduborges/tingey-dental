import { supabase, getClinicId } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { admin_email, current_password, new_name, new_password, notification_email } = body;

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    /* ---- Find admin user ---- */
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, password, name, notification_email")
      .eq("clinic_id", clinicId)
      .eq("email", admin_email)
      .single();

    if (!admin) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    /* ---- Update name (no password needed) ---- */
    if (new_name !== undefined) updates.name = new_name;

    /* ---- Update notification email (no password needed) ---- */
    if (notification_email !== undefined) updates.notification_email = notification_email;

    /* ---- Update password (requires current password) ---- */
    if (new_password) {
      if (!current_password) {
        return Response.json({ error: "Current password is required to change password" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(current_password, admin.password);
      if (!isValid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 401 });
      }
      updates.password = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", admin.id);

    if (error) {
      console.error("Settings update error:", error);
      return Response.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return Response.json({
      success: true,
      admin_name: new_name || admin.name,
      notification_email: notification_email !== undefined ? notification_email : admin.notification_email,
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    /* ---- Fetch admin credentials ---- */
    const { data: settings, error } = await supabase
      .from("clinic_settings")
      .select("admin_email, admin_password_hash, clinic_name, notification_email")
      .eq("clinic_slug", clinicSlug)
      .single();

    if (error || !settings) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    /* ---- Verify email ---- */
    if (settings.admin_email !== email) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    /* ---- Verify password ---- */
    const isValid = await bcrypt.compare(password, settings.admin_password_hash);
    if (!isValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({
      success: true,
      admin: {
        email: settings.admin_email,
        clinic_name: settings.clinic_name,
        notification_email: settings.notification_email,
      },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

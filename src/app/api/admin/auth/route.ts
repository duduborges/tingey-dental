import { supabase, getClinicId } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const clinicId = await getClinicId();
    if (!clinicId) {
      return Response.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, email, password, name, notification_email, clinic_id")
      .eq("clinic_id", clinicId)
      .eq("email", email)
      .single();

    if (error || !admin) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({
      success: true,
      admin: {
        email: admin.email,
        name: admin.name,
        notification_email: admin.notification_email,
      },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { supabase } from "@/app/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_name,
      patient_email,
      patient_phone,
      service_id,
      appointment_date,
      appointment_time,
      notes,
    } = body;

    const clinicSlug = process.env.CLINIC_SLUG || "tingey-dental";

    /* ---- Validate required fields ---- */
    if (!patient_name || !patient_email || !patient_phone || !appointment_date || !appointment_time) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    /* ---- Check slot availability ---- */
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("clinic_slug", clinicSlug)
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (existing && existing.length > 0) {
      return Response.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    /* ---- Insert appointment ---- */
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        clinic_slug: clinicSlug,
        patient_name,
        patient_email,
        patient_phone,
        service_id: service_id || null,
        appointment_date,
        appointment_time,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: "Failed to book appointment" }, { status: 500 });
    }

    /* ---- Send confirmation email to patient ---- */
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM || "booking@resend.eduardoborges.dev.br",
        to: patient_email,
        subject: "Appointment Request Received - Tingey Dental",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0033FF; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Tingey Dental</h1>
            </div>
            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1a1a2e; margin-top: 0;">Appointment Request Received</h2>
              <p>Dear ${patient_name},</p>
              <p>Thank you for requesting an appointment at Tingey Dental. Here are the details:</p>
              <div style="background: #EEF2FF; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Date:</strong> ${appointment_date}</p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${appointment_time}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> Pending Confirmation</p>
              </div>
              <p>Our team will confirm your appointment shortly. If you need to reach us, call <a href="tel:+12087344111" style="color: #0033FF;">(208) 734-4111</a>.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">568 Falls Ave, Twin Falls, ID 83301</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    /* ---- Notify clinic if notification email is set ---- */
    try {
      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("notification_email")
        .eq("clinic_slug", clinicSlug)
        .single();

      if (settings?.notification_email) {
        await resend.emails.send({
          from: process.env.RESEND_FROM || "booking@resend.eduardoborges.dev.br",
          to: settings.notification_email,
          subject: `New Appointment Request - ${patient_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0033FF;">New Appointment Request</h2>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                <p><strong>Patient:</strong> ${patient_name}</p>
                <p><strong>Email:</strong> ${patient_email}</p>
                <p><strong>Phone:</strong> ${patient_phone}</p>
                <p><strong>Date:</strong> ${appointment_date}</p>
                <p><strong>Time:</strong> ${appointment_time}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
              </div>
              <p style="margin-top: 16px;">Log in to the admin dashboard to confirm or manage this appointment.</p>
            </div>
          `,
        });
      }
    } catch (notifyError) {
      console.error("Clinic notify error:", notifyError);
    }

    return Response.json({ success: true, appointment });
  } catch (err) {
    console.error("Book error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

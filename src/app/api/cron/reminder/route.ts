import { supabase, getClinicId, getClinic } from "@/app/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clinicId = await getClinicId();
  if (!clinicId) {
    return Response.json({ error: "Clinic not found" }, { status: 404 });
  }

  const clinic = await getClinic();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*, services(name)")
    .eq("clinic_id", clinicId)
    .eq("appointment_date", tomorrowStr)
    .eq("status", "confirmed");

  if (error) {
    console.error("Cron reminder fetch error:", error);
    return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }

  let sent = 0;
  for (const apt of appointments || []) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM || "booking@resend.eduardoborges.dev.br",
        to: apt.patient_email,
        subject: `Appointment Reminder - ${clinic?.name || "Tingey Dental"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0033FF; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${clinic?.name || "Tingey Dental"}</h1>
            </div>
            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1a1a2e; margin-top: 0;">Appointment Reminder</h2>
              <p>Dear ${apt.patient_name},</p>
              <p>This is a friendly reminder about your appointment tomorrow:</p>
              <div style="background: #EEF2FF; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Date:</strong> ${apt.appointment_date}</p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${apt.appointment_time}</p>
              </div>
              <p style="color: #0033FF;">Please arrive 10 minutes early.</p>
              <p>Call <a href="tel:+12087344111" style="color: #0033FF;">${clinic?.phone || "(208) 734-4111"}</a> to reschedule.</p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">${clinic?.address || "568 Falls Ave, Twin Falls, ID 83301"}</p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (emailErr) {
      console.error(`Failed to send reminder to ${apt.patient_email}:`, emailErr);
    }
  }

  return Response.json({
    success: true,
    date: tomorrowStr,
    total_appointments: (appointments || []).length,
    reminders_sent: sent,
  });
}

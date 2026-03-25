import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return Response.json({ error: "to, subject, and html are required" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "booking@resend.eduardoborges.dev.br",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Notify email error:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

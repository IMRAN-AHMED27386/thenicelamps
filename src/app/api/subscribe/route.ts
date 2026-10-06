import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {}

  if (body.botcheck) {
    return NextResponse.json({ success: true, message: "ok" });
  }

  const email = String(body.email || "").trim();
  const source = String(body.signup_source || "Website").slice(0, 80);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error("Missing SMTP_USER / SMTP_PASS env vars");
    return NextResponse.json(
      { success: false, message: "Server email not configured." },
      { status: 500 }
    );
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtpout.secureserver.net",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const notify = transporter.sendMail({
    from: `"TheNiceLamps Website" <${user}>`,
    to: user,
    replyTo: email,
    subject: "🌸 New TheNiceLamps Signup",
    text:
      `You have a new newsletter signup!\n\n` +
      `Email:  ${email}\n` +
      `Source: ${source}\n` +
      `Time:   ${new Date().toUTCString()}\n`,
  });

  const autoReply = transporter.sendMail({
    from: `"TheNiceLamps" <${user}>`,
    to: email,
    subject: "You're on the list! 🌸 — TheNiceLamps",
    text:
      `Hello!\n\n` +
      `Thank you for joining the TheNiceLamps list — you're officially one of the first ` +
      `to hear about new arrivals, early access and member-only style drops.\n\n` +
      `Premium Fancy Lighting\nhttps://thenicelamps.com\n\n` +
      `With love,\nThe TheNiceLamps Team 💖`,
  });

  try {
    await Promise.all([notify, autoReply]);
    return NextResponse.json({ success: true, message: "Subscribed!" });
  } catch (err) {
    console.error("Email send failed:", err);
    return NextResponse.json(
      { success: false, message: "Could not send email right now." },
      { status: 500 }
    );
  }
}

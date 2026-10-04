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
  const productName = String(body.productName || "").slice(0, 120);
  const productSlug = String(body.productSlug || "").slice(0, 120);

  if (!EMAIL_RE.test(email) || !productName || !productSlug) {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    // Local dev without SMTP creds — the Firestore record still exists.
    console.error("Missing SMTP_USER / SMTP_PASS env vars");
    return NextResponse.json({ success: true, message: "ok" });
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtpout.secureserver.net",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const productUrl = `https://thenicelamps.com/product/${productSlug}`;

  const notify = transporter.sendMail({
    from: `"TheNiceLamps Website" <${user}>`,
    to: user,
    replyTo: email,
    subject: `🔔 Stock request: ${productName}`,
    text:
      `Someone wants a product that is out of stock!\n\n` +
      `Product: ${productName}\n` +
      `Link:    ${productUrl}\n` +
      `Email:   ${email}\n` +
      `Time:    ${new Date().toUTCString()}\n\n` +
      `All requests are saved in Firestore under "stockRequests" ` +
      `(also visible in the admin panel → Requests tab).\n`,
  });

  const autoReply = transporter.sendMail({
    from: `"TheNiceLamps" <${user}>`,
    to: email,
    subject: `We'll save you one! 💡 — ${productName}`,
    text:
      `Hello!\n\n` +
      `Thank you for your interest in "${productName}" — it's currently out of ` +
      `stock, but you're on the list: the moment it's back, you'll be the ` +
      `first to know.\n\n` +
      `${productUrl}\n\n` +
      `Brilliance in Every Corner\nhttps://thenicelamps.com\n\n` +
      `Warmly,\nThe TheNiceLamps Team 💡`,
  });

  try {
    await Promise.all([notify, autoReply]);
    return NextResponse.json({ success: true, message: "ok" });
  } catch (err) {
    console.error("Notify-me email failed:", err);
    // Firestore record already captured the request; don't fail the UX.
    return NextResponse.json({ success: true, message: "ok" });
  }
}

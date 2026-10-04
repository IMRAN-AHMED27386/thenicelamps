import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  let order: {
    id?: string;
    total?: number;
    customer?: Record<string, string>;
    items?: { qty: number; name: string; size: string; price: number }[];
    payment?: string;
  } = {};
  try {
    order = await request.json();
  } catch {}

  if (!order?.id || !order?.customer) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    // Email not configured (e.g. local dev) — order is already saved, so OK.
    return NextResponse.json({ success: true, emailed: false });
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtpout.secureserver.net",
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const c = order.customer;
  const lines = (order.items || [])
    .map((i) => `  ${i.qty} × ${i.name} (${i.size}) — ₹${i.price * i.qty}`)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `"TheNiceLamps Store" <${user}>`,
      to: user,
      subject: `🛍 New Order ${order.id} — ₹${order.total}`,
      text:
        `New Cash on Delivery order!\n\n` +
        `Order:  ${order.id}\n` +
        `Total:  ₹${order.total}\n\n` +
        `Customer:\n` +
        `  ${c.name}\n  ${c.phone}${c.email ? `\n  ${c.email}` : ""}\n\n` +
        `Deliver to:\n` +
        `  ${c.address}\n  ${c.city}, ${c.state} ${c.pincode}\n\n` +
        `Items:\n${lines}\n\n` +
        `Manage: https://thenicelamps.com/admin\n`,
    });
    return NextResponse.json({ success: true, emailed: true });
  } catch {
    return NextResponse.json({ success: true, emailed: false });
  }
}

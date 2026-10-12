import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/company";
import {
  buildContactEmailHtmlWithMeta,
  buildContactEmailTextWithMeta,
  validateContactPayload,
} from "@/lib/contact-email";

function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  const transport = getSmtpTransport();
  if (!transport) {
    // `code` lets the form point visitors to another way of reaching us, in their language.
    return NextResponse.json(
      {
        code: "mail_not_configured",
        error: "現在、フォームからの送信を受け付けできません。お手数ですが、Lancersのプロフィールページからご連絡ください。",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const validated = validateContactPayload(body);

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const payload = validated.data;
    const to = process.env.CONTACT_EMAIL_TO ?? process.env.SMTP_USER;
    const from = `"${COMPANY.name}" <${process.env.SMTP_USER}>`;
    const subject = `[${COMPANY.name}] お問い合わせ: ${payload.name} <${payload.email}>`;
    const senderIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const sourceUrl = request.headers.get("origin") ?? request.headers.get("referer");
    const userAgent = request.headers.get("user-agent");
    const meta = {
      submittedAt: new Date().toISOString(),
      sourceLabel: `${COMPANY.name} Webサイト お問い合わせフォーム`,
      sourceUrl,
      senderIp,
      userAgent,
    };

    await transport.sendMail({
      from,
      to,
      replyTo: payload.email,
      subject,
      html: buildContactEmailHtmlWithMeta(payload, meta),
      text: buildContactEmailTextWithMeta(payload, meta),
      headers: {
        "X-Contact-Source": "axis-website/contact-form",
        "X-Auto-Response-Suppress": "All",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `メール送信エラー: ${message}` },
      { status: 500 }
    );
  }
}

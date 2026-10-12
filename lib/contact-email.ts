export type ContactFormPayload = {
  company?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
  formStartedAt?: number;
};

export type ContactEmailMeta = {
  submittedAt: string;
  sourceLabel: string;
  sourceUrl?: string | null;
  senderIp?: string | null;
  userAgent?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildContactEmailHtml(payload: ContactFormPayload) {
  const rows = [
    ["会社名", payload.company?.trim() || "（未入力）"],
    ["担当者名", payload.name.trim()],
    ["メールアドレス", payload.email.trim()],
    ["電話番号", payload.phone?.trim() || "（未入力）"],
    ["お問い合わせ内容", payload.message.trim()],
  ];

  const bodyRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 16px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;color:#334155;width:180px;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:12px 16px;border:1px solid #e2e8f0;color:#0f172a;white-space:pre-wrap;">
            ${escapeHtml(value)}
          </td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin:0 0 16px;font-size:20px;">株式会社アクシス お問い合わせ</h2>
      <p style="margin:0 0 20px;color:#475569;">Webサイトのお問い合わせフォームから新しいメッセージが届きました。</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">${bodyRows}</table>
    </div>
  `;
}

export function buildContactEmailHtmlWithMeta(
  payload: ContactFormPayload,
  meta: ContactEmailMeta
) {
  return `
    ${buildContactEmailHtml(payload)}
    <div style="margin-top:24px;max-width:640px;border-top:1px solid #e2e8f0;padding-top:16px;color:#64748b;font-size:12px;">
      <p style="margin:0 0 8px;">送信元情報</p>
      <ul style="margin:0;padding-left:18px;">
        <li>送信日時: ${escapeHtml(meta.submittedAt)}</li>
        <li>送信元: ${escapeHtml(meta.sourceLabel)}</li>
        <li>URL: ${escapeHtml(meta.sourceUrl || "（未取得）")}</li>
        <li>IP: ${escapeHtml(meta.senderIp || "（未取得）")}</li>
        <li>User-Agent: ${escapeHtml(meta.userAgent || "（未取得）")}</li>
      </ul>
    </div>
  `;
}

export function buildContactEmailText(payload: ContactFormPayload) {
  return [
    "株式会社アクシス お問い合わせ",
    "",
    `会社名: ${payload.company?.trim() || "（未入力）"}`,
    `担当者名: ${payload.name.trim()}`,
    `メールアドレス: ${payload.email.trim()}`,
    `電話番号: ${payload.phone?.trim() || "（未入力）"}`,
    "",
    "お問い合わせ内容:",
    payload.message.trim(),
  ].join("\n");
}

export function buildContactEmailTextWithMeta(
  payload: ContactFormPayload,
  meta: ContactEmailMeta
) {
  return [
    buildContactEmailText(payload),
    "",
    "送信元情報:",
    `送信日時: ${meta.submittedAt}`,
    `送信元: ${meta.sourceLabel}`,
    `URL: ${meta.sourceUrl || "（未取得）"}`,
    `IP: ${meta.senderIp || "（未取得）"}`,
    `User-Agent: ${meta.userAgent || "（未取得）"}`,
  ].join("\n");
}

function normalizeCompact(value: string) {
  return value.toLowerCase().replace(/[\s\-_.,!?/\\|()[\]{}"'`~@#$%^&*+=:;]+/g, "");
}

function looksLikeJunk(value: string) {
  const compact = normalizeCompact(value);

  if (!compact) return false;
  if (compact.length <= 3) return true;
  if (/^(test|teste|testing|qwe|qwerty|asd|asdf|zxc|demo|spam|hello|hi)+$/.test(compact)) {
    return true;
  }
  if (/^([a-z0-9])\1{3,}$/.test(compact)) return true;
  if (/^(1234|12345|123456|1111|0000)+$/.test(compact)) return true;

  const uniqueChars = new Set(compact).size;
  return compact.length >= 5 && uniqueChars <= 2;
}

export function validateContactPayload(body: unknown):
  | { ok: true; data: ContactFormPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const input = body as Record<string, unknown>;
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();
  const company = input.company !== undefined ? String(input.company).trim() : "";
  const phone = input.phone !== undefined ? String(input.phone).trim() : "";
  const website = input.website !== undefined ? String(input.website).trim() : "";
  const formStartedAt = Number(input.formStartedAt ?? 0);

  if (!name) return { ok: false, error: "担当者名は必須です。" };
  if (!email) return { ok: false, error: "メールアドレスは必須です。" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "有効なメールアドレスを入力してください。" };
  }
  if (!message) return { ok: false, error: "お問い合わせ内容は必須です。" };
  if (message.length > 5000) {
    return { ok: false, error: "お問い合わせ内容が長すぎます。" };
  }
  if (website) {
    return { ok: false, error: "送信内容を確認できませんでした。" };
  }
  if (!Number.isFinite(formStartedAt) || formStartedAt <= 0) {
    return { ok: false, error: "フォーム情報が不正です。" };
  }
  if (Date.now() - formStartedAt < 3000) {
    return { ok: false, error: "送信が早すぎます。内容をご確認の上、再度お試しください。" };
  }
  if (name.replace(/\s+/g, "").length < 2) {
    return { ok: false, error: "担当者名をもう少し詳しく入力してください。" };
  }
  if (message.replace(/\s+/g, "").length < 10) {
    return { ok: false, error: "お問い合わせ内容をもう少し詳しく入力してください。" };
  }
  if ([name, company, message].some((value) => value && looksLikeJunk(value))) {
    return { ok: false, error: "内容を確認できないため送信できませんでした。具体的な内容をご入力ください。" };
  }

  return {
    ok: true,
    data: { company, name, email, phone, message, website, formStartedAt },
  };
}

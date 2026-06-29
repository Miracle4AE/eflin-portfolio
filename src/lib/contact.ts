import type { ContactFormData } from "@/lib/validation";
import { getProjectTypeOptions } from "@/lib/validation";
import { getLocaleLabel } from "@/i18n/get-dictionary";
import { siteConfig } from "@/data/site";

export type EmailProvider = "resend" | "dev";

export interface SendContactResult {
  ok: boolean;
  provider: EmailProvider;
  message?: string;
}

function getProjectTypeLabel(data: ContactFormData): string {
  const locale = data.locale ?? "en";
  return (
    getProjectTypeOptions(locale).find((o) => o.value === data.projectType)
      ?.label ?? data.projectType
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildContactEmailHtml(data: ContactFormData): string {
  const timestamp = new Date().toISOString();
  const projectLabel = getProjectTypeLabel(data);
  const languageLabel = getLocaleLabel(data.locale ?? "en");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f2eb;font-family:Georgia,'Times New Roman',serif;color:#3d3834;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2eb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#f0ebe3;border:1px solid rgba(61,56,52,0.1);">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid rgba(181,146,141,0.25);">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#b5928d;">New Inquiry</p>
              <h1 style="margin:0;font-size:24px;font-weight:400;color:#3d3834;">${siteConfig.name} Portfolio</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${emailRow("Name", data.name)}
                ${emailRow("Email", data.email)}
                ${emailRow("Company / Studio", data.company || "—")}
                ${emailRow("Project Type", projectLabel)}
                ${emailRow("Language", languageLabel)}
                ${emailRow("Source", data.sourcePage || "—")}
                ${emailRow("Timestamp", timestamp)}
              </table>
              <div style="margin-top:28px;padding-top:28px;border-top:1px solid rgba(61,56,52,0.08);">
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8a8480;">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#3d3834;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function emailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#8a8480;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;font-size:14px;color:#3d3834;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

export function buildContactEmailText(data: ContactFormData): string {
  const projectLabel = getProjectTypeLabel(data);
  const languageLabel = getLocaleLabel(data.locale ?? "en");
  const timestamp = new Date().toISOString();

  return [
    `New inquiry — ${siteConfig.name} Portfolio`,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Company / Studio: ${data.company || "—"}`,
    `Project Type: ${projectLabel}`,
    `Language: ${languageLabel}`,
    `Source: ${data.sourcePage || "—"}`,
    `Timestamp: ${timestamp}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
}

async function sendViaResend(data: ContactFormData): Promise<SendContactResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.email;
  const from =
    process.env.CONTACT_FROM_EMAIL ?? `${siteConfig.name} Portfolio <onboarding@resend.dev>`;

  if (!apiKey) {
    return { ok: false, provider: "resend", message: "Email service not configured." };
  }

  const subject = `[Portfolio] ${data.name} — ${getProjectTypeLabel(data)}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject,
      html: buildContactEmailHtml(data),
      text: buildContactEmailText(data),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[contact] Resend error:", response.status, errorBody);
    return { ok: false, provider: "resend", message: "Failed to send message." };
  }

  return { ok: true, provider: "resend" };
}

async function sendViaDevFallback(data: ContactFormData): Promise<SendContactResult> {
  console.info("[contact] Dev fallback — message logged (no RESEND_API_KEY):");
  console.info(buildContactEmailText(data));
  return {
    ok: true,
    provider: "dev",
    message: "Development mode: message logged to server console.",
  };
}

export async function sendContactEmail(
  data: ContactFormData,
): Promise<SendContactResult> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  if (hasResend) {
    return sendViaResend(data);
  }

  if (isProduction) {
    console.error("[contact] RESEND_API_KEY missing in production.");
    return {
      ok: false,
      provider: "resend",
      message: "Contact form is temporarily unavailable.",
    };
  }

  return sendViaDevFallback(data);
}

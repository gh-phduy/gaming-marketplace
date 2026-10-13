import { readFile, writeFile, mkdir } from "node:fs/promises";

const copy = JSON.parse(
  await readFile(new URL("./confirmation-copy.json", import.meta.url), "utf8"),
);
// Supabase validates the template source itself against the 255-character limit.
const subject = `{{ if .Data.confirmation_subject }}{{ .Data.confirmation_subject }}{{ else }}${copy.en.subject}{{ end }}`;
for (const [name, value] of [
  ["Subject template", subject],
  ...Object.entries(copy).map(([locale, text]) => [locale, text.subject]),
]) {
  if ([...value].length > 255 || /[\r\n]/.test(value)) {
    throw new Error(
      `${name}: email subjects must be one line and <=255 characters.`,
    );
  }
}
const escapeHtml = (value) =>
  value.replace(
    /[&<>"\']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "\'": "&#39;",
      })[char],
  );

function localized(field, html = true) {
  const value = (locale) =>
    field === "language"
      ? locale
      : html
        ? escapeHtml(copy[locale][field])
        : copy[locale][field];
  return (
    Object.keys(copy)
      .filter((locale) => locale !== "en")
      .map(
        (locale, index) =>
          `{{ ${index ? "else if" : "if"} eq .Data.locale "${locale}" }}${value(locale)}`,
      )
      .join("") + `{{ else }}${value("en")}{{ end }}`
  );
}

function render(
  text,
  language,
  direction,
  confirmationURL,
  displayURL = confirmationURL,
) {
  return `<!doctype html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${text.subject}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    table { border-collapse:separate; border-spacing:0; }
    @media only screen and (max-width:620px) {
      .outer-pad { padding:20px 12px !important; }
      .card-pad { padding-left:24px !important; padding-right:24px !important; }
      .headline { font-size:28px !important; line-height:36px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#10151e;font-family:Arial,Helvetica,sans-serif;color:#f5f7fa;">
  <div style="display:none;font-size:1px;color:#10151e;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${text.preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#10151e" style="width:100%;background-color:#10151e;">
    <tr>
      <td align="center" class="outer-pad" style="padding:40px 20px;">
        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <span dir="ltr" style="font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:34px;font-weight:900;letter-spacing:-1px;color:#f5f7fa;">DIF<span style="color:#63c54c;">MARK</span></span>
              <div style="padding-top:5px;font-size:9px;line-height:14px;letter-spacing:3px;color:#8c97a7;">DIGITAL MARKETPLACE</div>
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #303a48;border-top:4px solid #63c54c;border-radius:18px;background-color:#1b2430;overflow:hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#1b2430" style="width:100%;background-color:#1b2430;border-radius:16px;">
                <tr>
                  <td align="center" class="card-pad" style="padding:36px 40px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" width="64" height="64" bgcolor="#263a29" style="width:64px;height:64px;border:1px solid #3c6540;border-radius:32px;font-size:32px;line-height:64px;color:#63c54c;"><span aria-hidden="true">&#10003;</span></td></tr></table>
                    <p style="margin:24px 0 12px;font-size:11px;line-height:18px;font-weight:700;letter-spacing:1.6px;color:#87da73;">${text.eyebrow}</p>
                    <h1 class="headline" style="margin:0;font-size:32px;line-height:40px;letter-spacing:-0.6px;font-weight:700;color:#f5f7fa;">${text.heading}</h1>
                    <p style="margin:18px 0 0;font-size:15px;line-height:26px;color:#b6c0ce;">${text.body}</p>
                  </td>
                </tr>
                <tr>
                  <td class="card-pad" style="padding:28px 40px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;"><tr><td align="center" bgcolor="#63c54c" style="background-color:#63c54c;border-radius:10px;"><a href="${confirmationURL}" style="display:block;padding:18px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;font-weight:700;color:#10230d;text-decoration:none;">${text.button}</a></td></tr></table>
                  </td>
                </tr>
                <tr>
                  <td class="card-pad" style="padding:26px 40px 32px;">
                    <p style="margin:0 0 8px;font-size:12px;line-height:20px;color:#98a5b8;">${text.fallback}</p>
                    <p dir="ltr" style="margin:0;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a href="${confirmationURL}" style="color:#87da73;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${displayURL}</a></p>
                  </td>
                </tr>
                <tr>
                  <td class="card-pad" style="padding:22px 40px;border-top:1px solid #303a48;background-color:#18212c;border-radius:0 0 16px 16px;">
                    <p style="margin:0;font-size:12px;line-height:20px;color:#98a5b8;">${text.ignore}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 16px 0;">
              <p style="margin:0;font-size:12px;line-height:20px;font-weight:700;color:#b6c0ce;">Difmark Gaming Marketplace</p>
              <p style="margin:4px 0 0;font-size:11px;line-height:18px;color:#7f8d9f;">${text.footer}</p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const text = Object.fromEntries(
  Object.keys(copy.en).map((field) => [field, localized(field)]),
);
const template = render(
  text,
  localized("language"),
  '{{ if eq .Data.locale "ar" }}rtl{{ else }}ltr{{ end }}',
  "{{ .ConfirmationURL }}",
);
await writeFile(new URL("./confirm-signup.html", import.meta.url), template);
await writeFile(
  new URL("./confirm-signup-subject.txt", import.meta.url),
  subject + "\n",
);

const previewDir = new URL(
  "../../.codex-artifacts/auth-email/",
  import.meta.url,
);
await mkdir(previewDir, { recursive: true });
for (const locale of ["en", "vi", "ar"]) {
  const preview = render(
    Object.fromEntries(
      Object.entries(copy[locale]).map(([key, value]) => [
        key,
        escapeHtml(value),
      ]),
    ),
    locale,
    locale === "ar" ? "rtl" : "ltr",
    "#email-preview",
    "https://gamingmarketplace.click/verify?token=preview-only&amp;type=email",
  );
  await writeFile(
    new URL(`confirm-signup-${locale}.html`, previewDir),
    preview,
  );
}
console.log(
  `Built confirmation HTML and subject for ${Object.keys(copy).length} languages. Preview links are inert.`,
);

import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_uffm7an";
const PUBLIC_KEY  = "i_F7KVbwBTOrTYVlQ";

// Template ID-ja default (fallback / email i personalizuar)
const DEFAULT_TEMPLATE_ID = "template_o2im52x";

// ─────────────────────────────────────────────────────────────────────────────
// HEADER me logo SVG — vendoset në krye të çdo email body
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_HEADER = `<table cellpadding="0" cellspacing="0" width="100%" style="background:#1433A8;padding:18px 28px;margin-bottom:24px;border-radius:6px 6px 0 0;"><tr><td><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" width="150" height="47"><path d="M7 13C7 8 11 5 17 5C23 5 27 8 27 12C27 16 24 18 18 20C11 22 5 25 5 31C5 37 10 40 18 40C26 40 31 36 31 31" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="39" y1="5" x2="57" y2="5" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="48" y1="5" x2="48" y2="40" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><circle cx="74" cy="13" r="5.5" fill="none" stroke="#ffffff" stroke-width="6"/><path d="M63 40C63 29 85 29 85 40" fill="none" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="65" y1="33" x2="83" y2="33" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="93" y1="5" x2="93" y2="40" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="93" y1="5" x2="111" y2="5" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="93" y1="22" x2="109" y2="22" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="5" x2="118" y2="40" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="5" x2="136" y2="5" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="22" x2="134" y2="22" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round"/><text x="139" y="40" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#7EAAFF">.al</text></svg></td></tr></table>`;

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER me nënshkrim HTML
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_FOOTER = `<br><br><table cellpadding="0" cellspacing="0" style="border-top:2px solid #1433A8;padding-top:12px;margin-top:8px;font-family:Arial,sans-serif;"><tr><td style="padding-right:14px;vertical-align:middle;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" width="120" height="37"><path d="M7 13C7 8 11 5 17 5C23 5 27 8 27 12C27 16 24 18 18 20C11 22 5 25 5 31C5 37 10 40 18 40C26 40 31 36 31 31" fill="none" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="39" y1="5" x2="57" y2="5" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="48" y1="5" x2="48" y2="40" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><circle cx="74" cy="13" r="5.5" fill="none" stroke="#1433A8" stroke-width="6"/><path d="M63 40C63 29 85 29 85 40" fill="none" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="65" y1="33" x2="83" y2="33" stroke="#1433A8" stroke-width="3" stroke-linecap="round"/><line x1="93" y1="5" x2="93" y2="40" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="93" y1="5" x2="111" y2="5" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="93" y1="22" x2="109" y2="22" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="5" x2="118" y2="40" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="5" x2="136" y2="5" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><line x1="118" y1="22" x2="134" y2="22" stroke="#1433A8" stroke-width="6.5" stroke-linecap="round"/><text x="139" y="40" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#2755F5">.al</text></svg></td><td style="vertical-align:middle;font-size:13px;color:#333;line-height:1.9;"><strong style="color:#1433A8;">Ekipi i Staff.al</strong><br>📞 <a href="tel:0672002800" style="color:#333;text-decoration:none;">067 200 2800</a><br>✉️ <a href="mailto:info@staff.al" style="color:#1433A8;text-decoration:none;">info@staff.al</a><br>🌐 <a href="https://staff.al" style="color:#1433A8;text-decoration:none;">staff.al</a><br>📱 <a href="https://download.staff.al" style="color:#1433A8;text-decoration:none;">Shkarko App</a></td></tr></table>`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE-T VENDOSEN KËTU — brenda CRM-it, jo në EmailJS
// ─────────────────────────────────────────────────────────────────────────────
export type EmailTemplate = {
  id: string;
  label: string;
  icon: string;
  defaultSubject: string;
  defaultBody: string;
  /** Template ID specifik nga EmailJS — nëse nuk vendoset, përdoret DEFAULT_TEMPLATE_ID */
  templateId?: string;
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "custom",
    icon: "✏️",
    label: "Email i personalizuar",
    defaultSubject: "",
    defaultBody: "",
  },
  {
    id: "payment_reminder",
    icon: "💳",
    label: "Rikujtesë pagese",
    defaultSubject: "Rikujtesë: Fatura juaj është e papaguar",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Ju kujtojmë me respekt se fatura juaj është ende e papaguar. Ju lutemi kryeni pagesën sa më shpejt të jetë e mundur.<br><br>Nëse keni ndonjë pyetje, mos hezitoni të na kontaktoni.<br><br>Faleminderit,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
  {
    id: "subscription_expiry",
    icon: "⏳",
    label: "Skadim abonimit",
    defaultSubject: "Abonimenti juaj po skadon së shpejti",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Ju njoftojmë se abonimenti juaj po skadon së shpejti. Për të vazhduar pa ndërprerje shërbimin, ju lutemi rinovoni abonimentin tuaj.<br><br>Nëse keni pyetje ose dëshironi të ndryshoni planin, kontaktoni ekipin tonë.<br><br>Faleminderit për besimin,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
  {
    id: "welcome",
    icon: "👋",
    label: "Mirëseardhje",
    defaultSubject: "Mirë se vini! Jemi të lumtur t'ju kemi",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Ju mirëpresim si klient të ri! Jemi të lumtur që keni zgjedhur shërbimet tona.<br><br>Në çdo moment mund të na kontaktoni për çdo pyetje ose nevojë.<br><br>Me respekt,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
  {
    id: "offer",
    icon: "🎁",
    label: "Ofertë e re",
    defaultSubject: "Kemi një ofertë speciale për ju",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Kemi kënaqësinë t&#39;ju njoftojmë për një ofertë speciale që kemi përgatitur posaçërisht për ju.<br><br>Ju lutemi na kontaktoni për të mësuar më shumë.<br><br>Me respekt,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
  {
    id: "meeting_reminder",
    icon: "📅",
    label: "Rikujtesë takimi",
    defaultSubject: "Rikujtesë: Takimi ynë i ardhshëm",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Ju kujtojmë takimin tonë të planifikuar. Ju lutemi konfirmoni disponueshmërinë tuaj ose na lajmëroni nëse keni nevojë të ndryshoni datën.<br><br>Pritur t&#39;ju takojmë,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
  {
    id: "invoice_sent",
    icon: "🧾",
    label: "Fatura u dërgua",
    defaultSubject: "Fatura juaj nga ekipi ynë",
    defaultBody: `${EMAIL_HEADER}I/E nderuar {{to_name}},<br><br>Me kënaqësi ju njoftojmë se fatura juaj është gati. Ju lutemi shqyrtoni detajet dhe kryeni pagesën brenda afatit të caktuar.<br><br>Faleminderit për bashkëpunimin,<br>Ekipi i Staff.al${EMAIL_FOOTER}`,
    templateId: "template_o2im52x",
  },
];

export function isEmailConfigured(): boolean {
  return true;
}

export async function sendEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  message: string;
  fromName?: string;
  /** Template ID specifik — nëse nuk jepet, përdoret DEFAULT_TEMPLATE_ID */
  templateId?: string;
}): Promise<void> {
  const templateId = params.templateId ?? DEFAULT_TEMPLATE_ID;
  await emailjs.send(
    SERVICE_ID,
    templateId,
    {
      to_email:  params.toEmail,
      to_name:   params.toName,
      subject:   params.subject,
      message:   params.message,
      from_name: params.fromName ?? "CRM",
    },
    PUBLIC_KEY
  );
}

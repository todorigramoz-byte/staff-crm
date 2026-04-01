import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_uffm7an";
const PUBLIC_KEY  = "i_F7KVbwBTOrTYVlQ";

// Template ID-ja default (fallback / email i personalizuar)
const DEFAULT_TEMPLATE_ID = "template_o2im52x";

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
    // Nuk ka templateId specifik — përdor DEFAULT_TEMPLATE_ID
  },
  {
    id: "payment_reminder",
    icon: "💳",
    label: "Rikujtesë pagese",
    defaultSubject: "Rikujtesë: Fatura juaj është e papaguar",
    defaultBody: `I/E nderuar {{to_name}},\n\nJu kujtojmë me respekt se fatura juaj është ende e papaguar. Ju lutemi kryeni pagesën sa më shpejt të jetë e mundur.\n\nNëse keni ndonjë pyetje, mos hezitoni të na kontaktoni.\n\nFaleminderit,\nEchipa jonë`,
    // 👉 Vendos Template ID-në tënde nga EmailJS për "Rikujtesë pagese":
    templateId: "template_o2im52x",
  },
  {
    id: "subscription_expiry",
    icon: "⏳",
    label: "Skadim abonimit",
    defaultSubject: "Abonimenti juaj po skadon së shpejti",
    defaultBody: `I/E nderuar {{to_name}},\n\nJu njoftojmë se abonimenti juaj po skadon së shpejti. Për të vazhduar pa ndërprerje shërbimin, ju lutemi rinovoni abonimin tuaj.\n\nNëse keni pyetje ose dëshironi të ndryshoni planin, kontaktoni ekipin tonë.\n\nFaleminderit për besimin,\nEchipa jonë`,
    // 👉 Vendos Template ID-në tënde nga EmailJS për "Skadim abonimit":
    templateId: "template_o2im52x",
  },
  {
    id: "welcome",
    icon: "👋",
    label: "Mirëseardhje",
    defaultSubject: "Mirë se vini! Jemi të lumtur t'ju kemi",
    defaultBody: `I/E nderuar {{to_name}},\n\nJu mirëpresim si klient të ri! Jemi të lumtur që keni zgjedhur shërbimet tona.\n\nNë çdo moment mund të na kontaktoni për çdo pyetje ose nevojë.\n\nMe respekt,\nEchipa jonë`,
    templateId: "template_o2im52x",
  },
  {
    id: "offer",
    icon: "🎁",
    label: "Ofertë e re",
    defaultSubject: "Kemi një ofertë speciale për ju",
    defaultBody: `I/E nderuar {{to_name}},\n\nKemi kënaqësinë t'ju njoftojmë për një ofertë speciale që kemi përgatitur posaçërisht për ju.\n\nJu lutemi na kontaktoni për të mësuar më shumë.\n\nMe respekt,\nEchipa jonë`,
    templateId: "template_o2im52x",
  },
  {
    id: "meeting_reminder",
    icon: "📅",
    label: "Rikujtesë takimi",
    defaultSubject: "Rikujtesë: Takimi ynë i ardhshëm",
    defaultBody: `I/E nderuar {{to_name}},\n\nJu kujtojmë takimin tonë të planifikuar. Ju lutemi konfirmoni disponueshmërinë tuaj ose na lajmëroni nëse keni nevojë të ndryshoni datën.\n\nPritur t'ju takojmë,\nEchipa jonë`,
    templateId: "template_o2im52x",
  },
  {
    id: "invoice_sent",
    icon: "🧾",
    label: "Fatura u dërgua",
    defaultSubject: "Fatura juaj nga ekipi ynë",
    defaultBody: `I/E nderuar {{to_name}},\n\nGazëm të njoftojmë se fatura juaj është gati. Ju lutemi shqyrtoni detajet dhe kryeni pagesën brenda afatit të caktuar.\n\nFaleminderit për bashkëpunimin,\nEchipa jonë`,
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

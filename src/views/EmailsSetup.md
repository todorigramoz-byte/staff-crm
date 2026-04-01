# Si të konfigurosh EmailJS (falas)

## Hapi 1 — Krijo llogari
Shko te: https://www.emailjs.com
Kliko "Sign Up Free" — ofron 200 email/muaj falas.

## Hapi 2 — Shto shërbimin email
- Dashboard → "Email Services" → "Add New Service"
- Zgjidh Gmail, Outlook, ose SMTP
- Autentikohuni dhe kopjo **Service ID** (p.sh. `service_abc123`)

## Hapi 3 — Krijo template
- Dashboard → "Email Templates" → "Create New Template"
- Në fushën "To Email" vendos: `{{to_email}}`
- Shto fushat: `{{to_name}}`, `{{subject}}`, `{{message}}`, `{{from_name}}`
- Kopjo **Template ID** (p.sh. `template_xyz789`)

## Hapi 4 — Merr Public Key
- Dashboard → Account → "API Keys"
- Kopjo **Public Key** (p.sh. `aBcDeFg1234567890`)

## Hapi 5 — Vendos vlerat në kod
Hap `src/views/Emails.tsx` dhe plotëso:

```ts
const EMAILJS_SERVICE_ID  = "service_abc123";
const EMAILJS_TEMPLATE_ID = "template_xyz789";
const EMAILJS_PUBLIC_KEY  = "aBcDeFg1234567890";
```

Pas kësaj, butoni "Dërgo" do të dërgojë email real direkt!

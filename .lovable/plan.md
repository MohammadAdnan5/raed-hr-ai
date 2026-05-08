## Goal
When the salary certificate flow completes, actually send a real email to `Alz3bei.mohammad2022@gmail.com` (instead of only showing a toast).

## Approach

1. **Enable Lovable Cloud** (required for backend/email sending).
2. **Set up email infrastructure** — provision a sender domain via Lovable Emails so we can send real transactional emails from the app.
3. **Create a transactional email template** "salary-certificate-issued" (Arabic, RTL) with minimal content:
   - Subject: "تم إصدار خطاب تعريف بالراتب"
   - Body: short confirmation noting recipient organization (e.g., "موجّه إلى: البنك الأهلي") and that the document is available in "وثائقي".
4. **Wire the trigger** — in `Index.tsx` `onIssueSalaryLetter` handler, after creating the document and showing the toast, invoke `send-transactional-email` with:
   - `recipientEmail: "Alz3bei.mohammad2022@gmail.com"` (hardcoded for the demo)
   - `templateName: "salary-certificate-issued"`
   - `templateData: { recipient }`
   - `idempotencyKey: salary-${Date.now()}`
5. **Update the toast** so it confirms the email was sent to `Alz3bei.mohammad2022@gmail.com` (replacing the previous `m.adnan@PSAU.SA` placeholder in the toast — the chat message can still mention the user's "official" address for the demo, or we align both — see question below).

## Files to touch
- `src/pages/Index.tsx` — add `supabase.functions.invoke('send-transactional-email', ...)` call inside `onIssueSalaryLetter`.
- New: `supabase/functions/_shared/transactional-email-templates/salary-certificate-issued.tsx`
- Updated: `supabase/functions/_shared/transactional-email-templates/registry.ts`

## Prerequisites handled by tools
- Enable Cloud
- Email domain setup dialog (user will configure a sender domain)
- Setup email infra + scaffold transactional email Edge Functions
- Deploy Edge Functions

## Question
The earlier demo uses `m.adnan@PSAU.SA` in chat copy and toast. Should I:
- **(A)** Keep chat/toast text as `Alz3bei.mohammad2022@gmail.com` everywhere (real address shown), or
- **(B)** Show `m.adnan@PSAU.SA` in the UI for the demo persona but actually deliver the email to `Alz3bei.mohammad2022@gmail.com` behind the scenes?

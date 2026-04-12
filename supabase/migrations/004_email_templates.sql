-- ============================================================
-- PayWay Migration 004 — Email Templates
-- ============================================================

CREATE TABLE IF NOT EXISTS email_templates (
  type        text PRIMARY KEY,
  subject     text NOT NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email_templates"
  ON email_templates FOR ALL
  USING (is_admin());

-- Seed default templates
INSERT INTO email_templates (type, subject, body) VALUES
('welcome', 'Velkommen til PayWay!', '<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0a2f5b; margin: 0;">Velkommen til PayWay</h1>
    <p style="color: #6b7280; margin-top: 8px;">Betaling til Føroyar</p>
  </div>
  <p style="color: #111827;">Hej {{name}},</p>
  <p style="color: #111827;">Tak fordi du oprettede en konto hos PayWay. Du er nu klar til at sende og modtage betalinger.</p>
  <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="color: #166534; margin: 0; font-weight: 600;">Din konto er aktiv</p>
    <p style="color: #166534; margin: 8px 0 0;">Log ind i appen og begynd at bruge PayWay med det samme.</p>
  </div>
  <p style="color: #6b7280; font-size: 13px;">Hvis du har spørgsmål, kontakt os på support@payway.fo</p>
</div>'),
('password_reset', 'Nulstil din adgangskode - PayWay', '<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
  <h1 style="color: #0a2f5b;">Nulstil adgangskode</h1>
  <p style="color: #111827;">Hej {{name}},</p>
  <p style="color: #111827;">Vi modtog en anmodning om at nulstille din adgangskode. Klik på knappen nedenfor:</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{reset_link}}" style="background: #2ec964; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700;">Nulstil adgangskode</a>
  </div>
  <p style="color: #6b7280; font-size: 13px;">Hvis du ikke anmodede om dette, kan du ignorere denne email.</p>
</div>')
ON CONFLICT (type) DO NOTHING;

NOTIFY pgrst, 'reload schema';

/**
 * Scizen – Outreach Email Templates
 *
 * All functions return HTML strings intended for Resend / sendOutreach().
 * Keep them short, mobile-friendly and on-brand.
 */

const brandStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
    .brand { font-weight: 700; color: #0f172a; font-size: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #6b7280; }
  </style>
`;

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${brandStyles}
</head>
<body>
  <div class="container">
    <div class="brand">Scizen</div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
    ${bodyHtml}
    <div class="footer">
      Vous recevez cet email parce que vous avez été identifié comme potentiellement intéressé par la gestion de SCI familiale.<br>
      <a href="mailto:hello@scizen.fr" style="color:#6b7280;">hello@scizen.fr</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Beta invite — personalised cold email referencing the lead's pain.
 */
export function betaInvite(leadName: string, painSnippet?: string): string {
  const name = leadName || "là-bas";
  const pain = painSnippet
    ? `On a repéré votre message où vous parlez de la difficulté à gérer votre SCI familiale :<br><br>
<blockquote style="margin:0;padding:12px 16px;background:#f3f4f6;border-left:3px solid #0f172a;border-radius:4px;font-style:italic;color:#374151;">
  “${painSnippet.slice(0, 280)}${painSnippet.length > 280 ? "…" : ""}”
</blockquote><br>`
    : "";

  const body = `<p>Bonjour ${name},</p>

${pain}
<p>On construit <strong>Scizen</strong>, un outil simple pour suivre les parts, rédiger les PV d'assemblée générale et gérer la trésorerie d'une SCI familiale — sans se prendre la tête.</p>

<p>On cherche des familles qui galèrent réellement avec ça pour tester la beta gratuitement pendant 30 jours. Ça vous tente ?</p>

<p style="margin-top:24px;">
  <a href="https://scizen.fr/beta?ref=outreach" class="btn">Rejoindre la beta</a>
</p>

<p style="margin-top:24px;">
  Pas intéressé ? Répondez "STOP" — on vous relancera pas.
</p>

<p>— L'équipe Scizen</p>`;

  return layout("Invitation beta – Scizen", body);
}

/**
 * Welcome — sent right after a lead signs up via an outreach link.
 */
export function welcomeBeta(_userEmail: string): string {
  const body = `<p>Bienvenue parmi les beta-testeurs Scizen 👋</p>

<p>Merci d'avoir rejoint l'aventure. Voici vos prochaines étapes :</p>

<ol>
  <li><strong>Créez votre SCI</strong> en 2 minutes depuis le dashboard.</li>
  <li><strong>Invitez vos proches</strong> (frères, sœurs, parents) en tant qu'actionnaires.</li>
  <li><strong>Lancez votre première AG</strong> et générez le PV automatiquement.</li>
</ol>

<p style="margin-top:24px;">
  <a href="https://scizen.fr/dashboard" class="btn">Ouvrir le dashboard</a>
</p>

<p>Un bug, une suggestion ou une incompréhension ? Répondez directement à cet email — on lit tout.</p>

<p>— L'équipe Scizen</p>`;

  return layout("Bienvenue dans la beta Scizen", body);
}

/**
 * Follow-up — gentle nudge 7 days after signup with no activity.
 */
export function followUpNoActivity(_userEmail: string): string {
  const body = `<p>Bonjour,</p>

<p>On a remarqué que vous vous êtes inscrit·e à la beta Scizen il y a une semaine, mais vous n'avez pas encore créé de SCI.</p>

<p>Si vous hésitez ou bloquez sur un truc, dites-le nous — on peut vous aider à importer vos données ou répondre à vos questions en 5 min chrono.</p>

<p style="margin-top:24px;">
  <a href="https://scizen.fr/dashboard?action=create-sci" class="btn">Créer ma SCI</a>
</p>

<p>Sinon, si ce n'est plus d'actualité, ignorez ce message — pas de spam, promis.</p>

<p>— L'équipe Scizen</p>`;

  return layout("Besoin d'un coup de main avec Scizen ?", body);
}

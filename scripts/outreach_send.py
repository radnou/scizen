#!/usr/bin/env python3
"""
Outreach Send — Scizen
Envoi d'emails personnalises aux prospects collectes par signal_scraper.py.

Usage:
    python scripts/outreach_send.py --config scripts/outreach_config.yaml --dry-run
    python scripts/outreach_send.py --config scripts/outreach_config.yaml

Requirements:
    pip install requests pyyaml python-dotenv
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
import yaml

# ── CONFIG ──────────────────────────────────────────────────────

RESEND_BASE = "https://api.resend.com"
RESEND_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "hello@scizen.fr")
DB_URL = os.getenv("DATABASE_URL", "")

TEMPLATES = {
    "betaInvite": lambda name, pain: f"""
<html>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2937;">
<div style="font-weight:700;font-size:20px;">Scizen</div>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
<p>Bonjour {name or 'là-bas'},</p>
<p>On construit <strong>Scizen</strong>, un outil simple pour suivre les parts, rédiger les PV d'assemblée générale et gérer la trésorerie d'une SCI familiale.</p>
<p>On cherche des familles qui galèrent réellement avec ça pour tester la beta gratuitement pendant 30 jours. Ça vous tente ?</p>
<p style="margin-top:24px;"><a href="https://scizen.fr/register" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Rejoindre la beta</a></p>
<p style="margin-top:24px;font-size:12px;color:#6b7280;">Pas intéressé ? Répondez "STOP".<br><a href="mailto:hello@scizen.fr" style="color:#6b7280;">hello@scizen.fr</a></p>
</body>
</html>
""",
}


# ── DB helpers (fallback via API si pas de DB directe) ───────────

def mark_lead_contacted(lead_id: str) -> None:
    pass  # TODO: insert into outreachLogs via API


def insert_outreach_log(campaign_id: str, lead_id: str, status: str, error: str | None = None) -> None:
    pass  # TODO: API call


# ── RESEND ──────────────────────────────────────────────────────

def send_email(to: str, subject: str, html: str) -> dict | None:
    if not RESEND_KEY:
        print("[warn] RESEND_API_KEY manquant.", file=sys.stderr)
        return None
    payload = {
        "from": EMAIL_FROM,
        "to": to,
        "subject": subject,
        "html": html,
    }
    r = requests.post(f"{RESEND_BASE}/emails", json=payload, headers={"Authorization": f"Bearer {RESEND_KEY}"}, timeout=30)
    if r.status_code not in (200, 202):
        print(f"[resend] HTTP {r.status_code}: {r.text}", file=sys.stderr)
        return None
    return r.json()


# ── LEADS ───────────────────────────────────────────────────────

def load_leads_from_index(index_path: Path) -> list[dict]:
    """Parse le markdown index et retourne les leads filtrés."""
    leads: list[dict] = []
    if not index_path.exists():
        print(f"[warn] Index non trouvé: {index_path}")
        return leads

    content = index_path.read_text(encoding="utf-8")
    for line in content.splitlines():
        if line.startswith("|") and "Nom" not in line and "---" not in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 6:
                score_str = parts[3]
                try:
                    score = int(score_str)
                except ValueError:
                    score = 0
                leads.append({
                    "name": parts[1],
                    "platform": parts[2],
                    "score": score,
                    "url": parts[4].strip("<>"),
                    "email": parts[5] if "@" in parts[5] else None,
                })
    return leads


def leads_from_markdown_files(leads_dir: Path) -> list[dict]:
    leads: list[dict] = []
    for md in leads_dir.glob("*.md"):
        if md.name.startswith("index_"):
            continue
        text = md.read_text(encoding="utf-8")
        meta: dict = {}
        in_frontmatter = False
        front_lines: list[str] = []
        for line in text.splitlines():
            if line.strip() == "---":
                if in_frontmatter:
                    break
                in_frontmatter = True
                continue
            if in_frontmatter:
                front_lines.append(line)
        for line in front_lines:
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        leads.append({
            "id": meta.get("id", ""),
            "name": meta.get("display_name", "") or meta.get("username", ""),
            "platform": meta.get("platform", ""),
            "score": int(meta.get("score", "0")),
            "url": meta.get("url", ""),
            "email": meta.get("email", None),
            "public_email": meta.get("public_email", "false").lower() == "true",
            "pain_snippet": meta.get("pain_snippet", ""),
            "source": meta.get("source", ""),
        })
    return leads


# ── REPORT ───────────────────────────────────────────────────────

def write_report(sent: int, failed: int, leads: list[dict], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    report = output_dir / f"outreach_{date_str}.md"
    lines = [f"# Rapport Outreach — {date_str}\n\n| Nom | Email | Plateforme | Score | Statut |"]
    lines.append("|-----|-------|------------|-------|--------|")
    for lead in leads:
        lines.append(
            f"| {lead.get('name','')} | {lead.get('email','')} | {lead.get('platform','')} | "
            f"{lead.get('score',0)} | {'✅ envoyé' if lead.get('sent') else '❌ échec'} |"
        )
    lines.append(f"\n**Total :** {sent} envoyés, {failed} échecs, {len(leads)} leads traités.")
    report.write_text("\n".join(lines), encoding="utf-8")
    return report


# ── MAIN ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Envoie les emails de prospection Scizen")
    parser.add_argument("--config", default="scripts/outreach_config.yaml", help="Fichier de config")
    parser.add_argument("--dry-run", action="store_true", help="Simule sans envoyer")
    parser.add_argument("--leads-dir", default="data/leads", help="Dossier leads")
    parser.add_argument("--output-dir", default="data/reports", help="Dossier rapports")
    args = parser.parse_args()

    config_path = Path(args.config)
    if not config_path.exists():
        print(f"[fatal] Config introuvable: {config_path}", file=sys.stderr)
        sys.exit(1)

    with config_path.open() as f:
        cfg = yaml.safe_load(f)

    campaigns = cfg.get("campaigns", [])
    if not campaigns:
        print("[warn] Aucune campagne définie.")
        return

    leads_dir = Path(args.leads_dir).expanduser()
    leads = leads_from_markdown_files(leads_dir)
    if not leads:
        print("[warn] Aucun lead trouvé.")
        return

    total_sent = 0
    total_failed = 0

    for campaign in campaigns:
        print(f"\n[campagne] {campaign['name']} — template: {campaign['template']}")
        tpl_name = campaign["template"]
        subject = campaign["subject"]
        max_sends = campaign.get("max_daily_sends", 10)
        filters = campaign.get("filters", {})
        min_score = filters.get("min_score", 0)
        sources = filters.get("sources", [])

        tpl = TEMPLATES.get(tpl_name)
        if not tpl:
            print(f"[warn] Template inconnu: {tpl_name}")
            continue

        sent_today = 0
        for lead in leads:
            if sent_today >= max_sends:
                break
            if lead.get("email") is None or "non public" in str(lead.get("email")):
                continue
            if lead["score"] < min_score:
                continue
            if sources and lead.get("source") not in sources:
                continue

            html = tpl(lead.get("name"), lead.get("pain_snippet", ""))
            print(f"  → {lead['email']} ({lead.get('name','inconnu')}) [score:{lead['score']}]")

            if args.dry_run:
                print(f"    [DRY-RUN] Email non envoyé")
                lead["sent"] = True
                sent_today += 1
                total_sent += 1
                continue

            res = send_email(lead["email"], subject, html)
            if res:
                lead["sent"] = True
                sent_today += 1
                total_sent += 1
                mark_lead_contacted(lead["id"])
                insert_outreach_log(campaign["name"], lead["id"], "sent")
                print(f"    ✅ envoyé (id: {res.get('id', '?')})")
            else:
                lead["sent"] = False
                total_failed += 1
                insert_outreach_log(campaign["name"], lead["id"], "failed", "send_error")
                print(f"    ❌ échec")

    report = write_report(total_sent, total_failed, leads, Path(args.output_dir))
    print(f"\n[+] Rapport écrit: {report}")


if __name__ == "__main__":
    main()

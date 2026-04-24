#!/usr/bin/env python3
"""
Signal Scraper - Scizen

Recupere les signaux sociaux de douleur autour des  SCI familiales.
Sources: Reddit, forums francais (via Tavily Search API).

Usage:
    python scripts/signal_scraper.py --output data/leads/

Requirements:
    pip install requests python-dotenv
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from http.client import responses
from pathlib import Path
from typing import Any

import requests

# ── CONFIG ──────────────────────────────────────────────────────

TAVILY_BASE = os.getenv("TAVILY_BASE_URL", "https://api.tavily.com")
TAVILY_KEY  = os.getenv("TAVILY_API_KEY", "")

REDDIT_API  = "https://www.reddit.com/search.json"
HEADERS     = {"User-Agent": "ScizenBot/1.0 (hermes-agent)"}

# Mots-cles de douleur SCI familiale
QUERIES = [
    # Reddit FR
    "site:reddit.com/r/vosfinances gerer famille SCI",
    "site:reddit.com/r/vosfinances parts sociales SCI",
    "site:reddit.com/r/vosfinances heriter SCI",
    "site:reddit.com/r/vosfinances assemblée générale SCI",
    "site:reddit.com/r/vosfinances charges SCI famille",
    "site:reddit.com/r/France SCI familiale gestion",
    "site:reddit.com/r/FranceNotaires SCI parts",
    "site:reddit.com/r/conseiljuridique SCI famille",
    # Recherche generale
    "comment gerer une SCI familiale gestion des parts",
    "SCI familiale outil gestion parts sociales",
    "assemblée générale SCI familiale procès verbal",
    "succession parts sociales SCI comment faire",
    "gerer SCI entre freres et soeurs outil",
]

# Regex emails
def find_emails(text: str) -> list[str]:
    pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
    return list(set(pattern.findall(text)))


# ── TAVILY ──────────────────────────────────────────────────────

def search_tavily(query: str, max_results: int = 10) -> dict[str, Any] | None:
    if not TAVILY_KEY:
        print("[warn] TAVILY_API_KEY manquant.", file=sys.stderr)
        return None
    payload = {
        "api_key": TAVILY_KEY,
        "query": query,
        "max_results": max_results,
        "include_answer": False,
        "include_domains": ["reddit.com", "les-impots.com", "commentcamarche.com", "forum-conseil-juridique.fr", "vos-sous.fr"],
    }
    r = requests.post(f"{TAVILY_BASE}/search", json=payload, timeout=30)
    if r.status_code != 200:
        print(f"[tavily] HTTP {r.status_code}: {responses.get(r.status_code, '?')}", file=sys.stderr)
        return None
    return r.json()


# ── REDDIT ──────────────────────────────────────────────────────

def search_reddit(query: str, limit: int = 25) -> dict[str, Any] | None:
    params = {"q": query, "limit": limit, "sort": "new", "t": "month"}
    try:
        r = requests.get(REDDIT_API, headers=HEADERS, params=params, timeout=30)
        if r.status_code != 200:
            print(f"[reddit] HTTP {r.status_code}", file=sys.stderr)
            return None
        return r.json()
    except Exception as exc:
        print(f"[reddit] {exc}", file=sys.stderr)
        return None


def extract_reddit_posts(data: dict | None) -> list[dict]:
    if not data:
        return []
    posts: list[dict] = []
    for child in data.get("data", {}).get("children", []):
        p = child.get("data", {})
        posts.append({
            "id": p.get("id"),
            "title": p.get("title", ""),
            "selftext": p.get("selftext", ""),
            "url": f"https://reddit.com{p.get('permalink', '')}",
            "author": p.get("author"),
            "subreddit": p.get("subreddit"),
            "created_utc": p.get("created_utc"),
            "score": p.get("score", 0),
        })
    return posts


# ── DEDUP & SCORING ─────────────────────────────────────────────

def lead_id(src: str, url: str) -> str:
    return hashlib.sha256(f"{src}:{url}".encode()).hexdigest()[:16]


def score_lead(post: dict) -> int:
    s = 0
    text = f"{post.get('title','')} {post.get('selftext','')}".lower()

    # Mots de haute douleur
    if any(k in text for k in ("galere", "galere", "perdu", "paie", "compliqué", "fait chier")):
        s += 30
    if any(k in text for k in ("outil", "appli", "logiciel", "solution")):
        s += 25
    if any(k in text for k in ("SCI familiale", "parts sociales", "herite", "succession")):
        s += 20
    if "reddit" in post.get("source", ""):
        s += 10    # plateforme interactive

    # Engagement
    s += min(post.get("score", 0) // 10, 15)
    return min(s, 100)


# ── MARKDOWN EXPORT ───────────────────────────────────────────────

def write_lead_markdown(lead: dict, output_dir: Path) -> Path:
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    fname = f"{date_str}_{lead['id']}.md"
    out = output_dir / fname

    md = f"""---
id: {lead['id']}
source: {lead.get('source', '')}
platform: {lead.get('platform', '')}
url: {lead.get('url', '')}
username: {lead.get('username', '')}
display_name: {lead.get('display_name', '')}
email: {lead.get('email', '')}
public_email: {lead.get('public_email', False)}
score: {lead.get('score', 0)}
tags: {lead.get('tags', '')}
contacted: false
subscribed: false
scraped_at: {lead.get('scraped_at', '')}
---

# {lead.get('display_name', 'Lead sans nom')}

## Extrait de douleur

> {lead.get('pain_snippet', '')}

## URL Source
<{lead.get('url', '')}>
"""
    out.write_text(md, encoding="utf-8")
    return out


def write_batch_index(leads: list[dict], output_dir: Path) -> Path:
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    index = output_dir / f"index_{date_str}.md"

    lines = [f"# Index leads — {date_str}\n\n| Nom | Plateforme | Score | URL | Email |")
    lines.append("|-----|------------|-------|-----|-------|")
    for lead in leads:
        email = lead.get("email", "") or "`non public`"
        lines.append(
            f"| {lead.get('display_name','`inconnu`')} | {lead.get('platform','')} | "
            f"{lead.get('score',0)} | <{lead.get('url','')}> | {email} |"
        )

    index.write_text("\n".join(lines), encoding="utf-8")
    return index


# ── MAIN ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape les signaux sociaux de douleur SCI")
    parser.add_argument("--output", default="data/leads", help="Dossier de sortie")
    parser.add_argument("--reddit-only", action="store_true", help="Seulement Reddit")
    parser.add_argument("--tavily-only", action="store_true", help="Seulement Tavily")
    args = parser.parse_args()

    out_dir = Path(args.output).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)

    all_leads: list[dict] = []
    seen_ids: set[str] = set()

    # 1. REDDIT
    if not args.tavily_only:
        for q in QUERIES[:8]:
            print(f"[reddit] query: {q[:60]}...")
            raw = search_reddit(q)
            posts = extract_reddit_posts(raw)
            for post in posts:
                lid = lead_id("reddit", post["url"])
                if lid in seen_ids:
                    continue
                seen_ids.add(lid)

                emails = find_emails(post["selftext"] + " " + (post.get("author_flair_text") or ""))
                public_email = bool(emails)
                email = emails[0] if emails else None

                lead = {
                    "id": lid,
                    "source": "reddit",
                    "platform": post["subreddit"],
                    "url": post["url"],
                    "username": post["author"],
                    "display_name": post["author"],
                    "email": email,
                    "public_email": public_email,
                    "painSnippet": (post["title"] + "\n" + post["selftext"])[:600],
                    "score": score_lead(post),
                    "tags": "reddit,SCI,douleur",
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }
                all_leads.append(lead)
                write_lead_markdown(lead, out_dir)

            print(f"  -> {len(posts)} posts récupérés")

    # 2. TAVILY
    if not args.reddit_only:
        for q in QUERIES[8:]:
            print(f"[tavily] query: {q[:60]}...")
            data = search_tavily(q)
            if not data:
                continue
            for result in data.get("results", []):
                url = result.get("url", "")
                lid = lead_id("tavily", url)
                if lid in seen_ids:
                    continue
                seen_ids.add(lid)

                content = result.get("content", "")
                emails = find_emails(content)
                public_email = bool(emails)
                email = emails[0] if emails else None

                lead = {
                    "id": lid,
                    "source": "tavily",
                    "platform": result.get("domain", ""),
                    "url": url,
                    "username": None,
                    "display_name": None,
                    "email": email,
                    "public_email": public_email,
                    "painSnippet": content[:600],
                    "score": 0,
                    "tags": "forum,SCI,douleur",
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }
                all_leads.append(lead)
                write_lead_markdown(lead, out_dir)

            print(f"  -> {len(data.get('results', []))} résultats")

    # Index batch
    index_path = write_batch_index(all_leads, out_dir)
    print(f"\n[+] {len(all_leads)} leads scrapés")
    print(f"[+] Index écrit: {index_path}")


if __name__ == "__main__":
    main()

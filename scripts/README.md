# Scripts Scizen — Guide d'utilisation

## Prérequis

```bash
pip install requests pyyaml python-dotenv
```

## 1. Signal Scraper

Récupère les leads (familles en galère avec leur SCI) depuis Reddit et Tavily.

```bash
# Requiert TAVILY_API_KEY dans .env ou exporté
export TAVILY_API_KEY="tvly-xxx"
python scripts/signal_scraper.py --output data/leads/
```

**Sortie :**
- `data/leads/YYYYMMDD_LID.md` — un fichier par lead
- `data/leads/index_YYYYMMDD.md` — index batch avec tableau récap

## 2. Outreach Send

Envoie les emails de prospection beta via Resend.

```bash
# Requiert RESEND_API_KEY et DATABASE_URL dans .env
export RESEND_API_KEY="re_xxx"
export EMAIL_FROM="hello@scizen.fr"
python scripts/outreach_send.py --config scripts/outreach_config.yaml --dry-run
python scripts/outreach_send.py --config scripts/outreach_config.yaml
```

**Sortie :**
- `data/reports/outreach_YYYYMMDD.md` — rapport d'envoi

## 3. Config

Copiez le template et adaptez :

```bash
cp scripts/outreach_config.yaml.example scripts/outreach_config.yaml
```

## Automatisation (cron)

```bash
# Scraper tous les jours à 9h
0 9 * * * cd ~/projets/hermes-projets/scizen && python scripts/signal_scraper.py --output data/leads/ >> /tmp/scizen_scraper.log 2>&1

# Outreach tous les jours à 10h
0 10 * * * cd ~/projets/hermes-projets/scizen && python scripts/outreach_send.py --config scripts/outreach_config.yaml >> /tmp/scizen_outreach.log 2>&1
```

## LemonSqueezy Setup

1. Créer un compte sur [lemonsqueezy.com](https://lemonsqueezy.com)
2. Créer un store + produit "Scizen" à 19€/mois
3. Copier les IDs (store, product, variant) dans `.env`
4. Créer un webhook pointant sur `https://votre-domaine.com/api/webhooks/lemon-squeezy`
5. Activer les events : `subscription_created`, `subscription_updated`, `subscription_cancelled`

## Domaine

Sans domaine, le checkout LemonSqueezy ne fonctionne pas. Options :
- **Vercel** — déploiement gratuit, domaine `scizen.vercel.app`
- **Netlify** — déploiement gratuit, domaine `scizen.netlify.app`
- **OVH/Gandi** — domaine `.fr` ~10€/an

## Roadmap

1. [ ] Réparer le build prod (Next.js 16 / TypeScript conflit)
2. [ ] Déployer sur Vercel
3. [ ] Configurer le webhook LS en prod
4. [ ] Lancer le scraper manuellement et recruter 5 beta testeurs
5. [ ] Itérer sur le produit selon feedback

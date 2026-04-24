# SCIzen — DOCS.md

## Mission

SCIzen connecte les familles avec la transparence de leur SCI.
Les familles paient 19€/mois pour gérer leurs AG, leurs parts et leurs charges sans dispute.
Goal : fluidifier les premières AG familiales sans avocat ni comptable forfaitaire.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- TypeScript
- Drizzle ORM + Neon PostgreSQL
- Stripe (billing)

## Schema DB

Voir `/src/db/schema.ts` :
- `users` — authentification basique
- `scis` — une SCI (nom, adresse, capital, parts)
- `shareholders` — associés d'une SCI (parts, rôle, statut de l'invitation)
- `ags` — assemblées générales (date, ODJ, PV, statut)
- `transactions` — flux financiers (revenu, dépense, dividende)

## Conventions

- Tous les fichiers de routes API : `src/app/api/*/route.ts`
- Composants UI dans `src/components/`
- Lint + build doivent passer avant chaque push
- DOCS.md reste synchronisé avec le code

## Historique

### 2026-04-24 — Init
- Repo créé, Next.js scaffold v16 init
- Schema DB v1 (5 tables)
- Prêt pour CEO Run #1 (MVP screens, Stripe product, outreach)

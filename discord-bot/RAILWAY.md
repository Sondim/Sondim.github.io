# Deploy on Railway (Hobby)

Replaces Discloud zip uploads. After this is set up once: edit code → commit → push → bot updates.

## One-time setup

1. Create a [Railway](https://railway.com) account and start a **Hobby** plan ($5/mo).
2. **New Project** → **Deploy from GitHub repo** → choose `Sondim/Sondim.github.io`.
3. Open the new service → **Settings**:
   - **Root Directory:** `discord-bot`
   - **Watch Paths** (optional): `discord-bot/**`
4. **Variables** → add every key from `.env.example` (paste values from your local `.env`).
   Also add:
   - `DATA_DIR` = `/data`
5. **Settings → Volumes** → add a volume:
   - Mount path: `/data`
   - Size: `0.5` GB is enough
6. Deploy. Open **Deployments → Logs**. You want:
   - `Logged in as …`
   - `Registered /setup and /reset-progress…`
7. In Discord (staff account): `/setup` once if intros need refreshing.
8. Stop / delete the old Discloud app so two bots don’t fight over the same token.

## Everyday updates

```text
change content.js / index.js → commit → git push origin main
```

Railway rebuilds automatically. No zip.

## If something breaks

- **Logs** in Railway show boot errors (`Missing DISCORD_TOKEN`, `TokenInvalid`, etc.).
- **TokenInvalid:** reset the bot token in Discord Developer Portal, update Railway variable `DISCORD_TOKEN`, redeploy.
- Progress between students lives in `/data/progress.json` on the volume (survives redeploys).

# Deploy checklist

Primary host: **Railway** (see `RAILWAY.md`).

## After a code update

1. Commit + `git push origin main`
2. Confirm Railway logs: `Logged in as …`
3. Run `/setup` only if channel intro copy/buttons need refreshing
4. Test with a second account if the change affects the course flow

## First-time / host switch

1. Follow `RAILWAY.md` (Hobby, root `discord-bot`, Variables, volume at `/data`)
2. Stop the old Discloud app so it does not reuse the same token
3. `/setup` once in Discord

## If logs say `TokenInvalid`

1. [Discord Developer Portal](https://discord.com/developers/applications) → your bot → **Reset Token**
2. Update Railway Variable `DISCORD_TOKEN` (and local `.env` if you use it)
3. Redeploy

## If logs say `Missing …`

Compare Railway Variables with `.env.example`.

# GNS Radio — Self-Hosted Stream Setup

## Current State
The site runs a **browser-based cycling player** pulling approved tracks from Neon DB.
This folder contains everything needed to upgrade to a **live 24/7 Icecast stream**.

## Architecture
```
Neon DB (artist_tracks) 
  → /api/radio/playlist (M3U)
  → Liquidsoap (pulls + streams)
  → Icecast2 (broadcast server)
  → radio.goodnaturedsouls.com:8000/gns-radio
  → NEXT_PUBLIC_RADIO_STREAM_URL env var
  → /radio page live stream embed
```

## Files
- `gns-radio.liq` — Liquidsoap automation script
- `icecast.xml` — Icecast2 server config
- `setup-vps.sh` — One-shot Ubuntu 22.04 setup script

## Steps to go live
1. Spin up DigitalOcean Ubuntu 22.04 droplet ($6-12/mo)
2. SSH in as root
3. Upload this folder: `scp -r radio-server/ root@YOUR_IP:/tmp/gns-radio/`
4. Run: `cd /tmp/gns-radio && bash setup-vps.sh`
5. Update passwords in `/etc/icecast2/icecast.xml` and the systemd service
6. Point `radio.goodnaturedsouls.com` DNS A record to VPS IP
7. Add to Vercel env vars:
   `NEXT_PUBLIC_RADIO_STREAM_URL=http://radio.goodnaturedsouls.com:8000/gns-radio`
8. Redeploy — live stream embed appears on /radio automatically

## Now playing metadata
Icecast exposes now-playing at:
`http://radio.goodnaturedsouls.com:8000/status-json.xsl`
This can be polled from the site to show live now-playing in the radio bar.

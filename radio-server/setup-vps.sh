#!/bin/bash
# GNS Radio — VPS setup script
# Run on a fresh Ubuntu 22.04 DigitalOcean droplet as root
# Usage: bash setup-vps.sh

set -e

echo "=== GNS Radio VPS Setup ==="

# 1. Update system
apt update && apt upgrade -y

# 2. Install Icecast2 and Liquidsoap
apt install -y icecast2 liquidsoap curl

# 3. Copy configs
cp icecast.xml /etc/icecast2/icecast.xml
cp gns-radio.liq /etc/liquidsoap/gns-radio.liq
chmod +x /etc/liquidsoap/gns-radio.liq

# 4. Create systemd service for Liquidsoap
cat > /etc/systemd/system/gns-radio.service << 'SERVICE'
[Unit]
Description=GNS Radio Liquidsoap Stream
After=network.target icecast2.service
Requires=icecast2.service

[Service]
Type=simple
User=liquidsoap
ExecStart=/usr/bin/liquidsoap /etc/liquidsoap/gns-radio.liq
Restart=always
RestartSec=5
Environment=GNS_API_URL=https://goodnaturedsouls.com/api/artist-tracks
Environment=GNS_PLAYLIST_URL=https://goodnaturedsouls.com/api/radio/playlist
Environment=ICECAST_HOST=localhost
Environment=ICECAST_PORT=8000
Environment=ICECAST_PASSWORD=CHANGEME_SOURCE
Environment=ICECAST_MOUNT=/gns-radio
Environment=ICECAST_NAME=GNS Radio
Environment=ICECAST_DESC=Good Natured Souls — Exist Altruistic
Environment=ICECAST_URL=https://goodnaturedsouls.com/radio

[Install]
WantedBy=multi-user.target
SERVICE

# 5. Enable and start services
systemctl daemon-reload
systemctl enable icecast2
systemctl enable gns-radio
systemctl start icecast2
sleep 2
systemctl start gns-radio

echo ""
echo "=== Done ==="
echo "Icecast admin: http://YOUR_VPS_IP:8000/admin"
echo "Stream URL:    http://YOUR_VPS_IP:8000/gns-radio"
echo "Next steps:"
echo "  1. Point radio.goodnaturedsouls.com DNS A record to this VPS IP"
echo "  2. Set NEXT_PUBLIC_RADIO_STREAM_URL=http://radio.goodnaturedsouls.com:8000/gns-radio in Vercel"
echo "  3. Update passwords in /etc/icecast2/icecast.xml and /etc/systemd/system/gns-radio.service"
echo "  4. systemctl restart icecast2 gns-radio"

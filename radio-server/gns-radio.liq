#!/usr/bin/liquidsoap
# GNS Radio — Liquidsoap stream script
# Plug in: set GNS_API_URL and ICECAST_PASSWORD then run this file
# liquidsoap /etc/liquidsoap/gns-radio.liq

# ── Config ────────────────────────────────────────────────────────────────────
let api_url   = getenv(default="https://goodnaturedsouls.com/api/artist-tracks", "GNS_API_URL")
let ice_host  = getenv(default="localhost",   "ICECAST_HOST")
let ice_port  = int_of_string(getenv(default="8000", "ICECAST_PORT"))
let ice_pass  = getenv(default="changeme",    "ICECAST_PASSWORD")
let ice_mount = getenv(default="/gns-radio",  "ICECAST_MOUNT")
let ice_name  = getenv(default="GNS Radio",   "ICECAST_NAME")
let ice_desc  = getenv(default="Good Natured Souls — Exist Altruistic", "ICECAST_DESC")
let ice_url   = getenv(default="https://goodnaturedsouls.com/radio", "ICECAST_URL")

# ── Fetch track list from GNS API ─────────────────────────────────────────────
# Liquidsoap polls this playlist endpoint which returns an M3U of approved MP3s
# You will need to add /api/radio/playlist route (see playlist-route.ts)
let playlist_url = getenv(default="https://goodnaturedsouls.com/api/radio/playlist", "GNS_PLAYLIST_URL")

# ── Sources ───────────────────────────────────────────────────────────────────
# Primary: live playlist from GNS API (M3U of approved MP3 URLs)
let live = playlist(
  id="gns_playlist",
  playlist_url,
  mode="randomize",
  reload=300,          # Reload playlist every 5 min to pick up new approved tracks
  reload_mode="watch"
)

# Fallback: silence if playlist fails
let fallback_source = blank(id="silence")

# ── Processing ────────────────────────────────────────────────────────────────
let radio = fallback(
  id="gns_radio",
  track_sensitive=false,
  [live, fallback_source]
)

# Normalize loudness
let radio = normalize(target=-14., radio)

# Crossfade between tracks
let radio = crossfade(duration=3., radio)

# ── Output to Icecast ─────────────────────────────────────────────────────────
output.icecast(
  %mp3(bitrate=128, samplerate=44100, stereo=true),
  host=ice_host,
  port=ice_port,
  password=ice_pass,
  mount=ice_mount,
  name=ice_name,
  description=ice_desc,
  url=ice_url,
  public=true,
  radio
)

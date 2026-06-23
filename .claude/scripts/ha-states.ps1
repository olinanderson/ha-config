# ha-states.ps1 - read-only Home Assistant state check over Tailscale/SSH.
# Reads the existing HA API token on the host and GETs /api/states for each
# entity. Read-only: only performs HTTP GET against the local HA API.
#
# Usage:  & .claude\scripts\ha-states.ps1            # default Apple Watch set
#         & .claude\scripts\ha-states.ps1 sensor.foo sensor.bar
param(
    [string[]]$Entities
)

if (-not $Entities -or $Entities.Count -eq 0) {
    $Entities = @(
        'sensor.192_168_10_90_0c_enginerpm',                       # WiCAN canary
        'sensor.apple_watch_ultra_apple_watch_payload_metrics',
        'sensor.apple_watch_ultra_apple_watch_heart_rate',
        'sensor.apple_watch_ultra_apple_watch_resting_heart_rate',
        'sensor.apple_watch_ultra_apple_watch_heart_rate_variability',
        'sensor.apple_watch_ultra_apple_watch_respiratory_rate',
        'sensor.apple_watch_ultra_apple_watch_blood_oxygen',
        'sensor.apple_watch_ultra_apple_watch_steps_today',
        'sensor.apple_watch_ultra_apple_watch_active_energy_today',
        'sensor.apple_watch_ultra_apple_watch_sleep_asleep',
        'sensor.apple_watch_ultra_apple_watch_sleep_deep',
        'sensor.apple_watch_ultra_apple_watch_sleep_rem',
        'sensor.apple_watch_ultra_apple_watch_sleep_core',
        'sensor.apple_watch_ultra_apple_watch_sleep_in_bed',
        'sensor.apple_watch_ultra_apple_watch_sleep_start',
        'sensor.apple_watch_ultra_apple_watch_sleep_end',
        'sensor.apple_watch_ultra_apple_watch_sleep_score'
    )
}

$haHost = '100.80.15.86'
$key    = "$env:USERPROFILE\.ssh\id_ed25519"
$list   = ($Entities -join ' ')

# Remote bash (LF-only, base64-delivered to avoid CRLF/quoting issues).
$remoteScript = @"
TOKEN=`$(cat /config/.gps_filter_token 2>/dev/null)
if [ -z "`$TOKEN" ]; then echo NO_TOKEN_FOUND; exit 1; fi
for e in $list; do
  printf '%-58s ' "`$e"
  curl -s -H "Authorization: Bearer `$TOKEN" "http://localhost:8123/api/states/`$e" | python3 -c "import sys,json;d=json.load(sys.stdin);a=d.get('attributes',{});print(d.get('state',d.get('message')),a.get('unit_of_measurement',''))"
done
echo '--- payload_metrics .names attribute (real metric strings from the app) ---'
curl -s -H "Authorization: Bearer `$TOKEN" 'http://localhost:8123/api/states/sensor.apple_watch_ultra_apple_watch_payload_metrics' | python3 -c "import sys,json;print(json.load(sys.stdin).get('attributes',{}).get('names'))"
"@ -replace "`r`n", "`n"

$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remoteScript))

# HA's Dropbear SSH only offers ETM MACs; pin AES-CTR + an ETM MAC.
$sshOpts = @(
    '-i', $key,
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ConnectTimeout=15',
    '-o', 'Compression=no',
    '-o', 'ServerAliveInterval=5',
    '-o', 'Ciphers=aes256-ctr,aes128-ctr',
    '-o', 'MACs=hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,umac-128-etm@openssh.com'
)

$attempt = 0
while ($attempt -lt 3) {
    $attempt++
    $out = ssh @sshOpts "hassio@$haHost" "echo $b64 | base64 -d | bash" 2>&1
    if ($LASTEXITCODE -eq 0) { $out; return }
    Write-Output "-- attempt $attempt failed (exit $LASTEXITCODE): $($out | Select-Object -Last 1)"
    Start-Sleep -Seconds 2
}
Write-Output "All SSH attempts failed."

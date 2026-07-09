#!/bin/sh
# Auto-start the VBAN receiver: streams PC audio (VoiceMeeter VBAN "Stream1") to the
# van's USB->SPDIF output. Run on the HAOS host (root@172.30.32.1) by HA on boot.
SINK=alsa_output.usb-Generic_USB_SPDIF_Adapter_202110200032-00.iec958-stereo
AUDIO_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' hassio_audio 2>/dev/null)
[ -z "$AUDIO_IP" ] && AUDIO_IP=172.30.32.4

# Forward host UDP 6980 into the audio container (same pattern as the old scream 4010 rules)
iptables -t nat -C PREROUTING  -p udp --dport 6980 -j DNAT --to-destination "$AUDIO_IP":6980 2>/dev/null || iptables -t nat -A PREROUTING  -p udp --dport 6980 -j DNAT --to-destination "$AUDIO_IP":6980
iptables        -C DOCKER-USER -p udp -d "$AUDIO_IP" --dport 6980 -j ACCEPT 2>/dev/null              || iptables        -I DOCKER-USER -p udp -d "$AUDIO_IP" --dport 6980 -j ACCEPT
iptables -t nat -C POSTROUTING -p udp -d "$AUDIO_IP" --dport 6980 -j MASQUERADE 2>/dev/null          || iptables -t nat -A POSTROUTING -p udp -d "$AUDIO_IP" --dport 6980 -j MASQUERADE

# Stage the receiver binary into the (ephemeral) audio container
docker cp /mnt/data/supervisor/homeassistant/vban/vban_receptor hassio_audio:/usr/local/bin/vban_receptor
docker exec hassio_audio chmod +x /usr/local/bin/vban_receptor

# Crackle fix: reload the USB-SPDIF card with timer-scheduling off (tsched=no)
MOD=$(docker exec hassio_audio sh -c 'pactl list short modules | grep usb-Generic_USB_SPDIF | grep alsa-card | head -1 | cut -f1')
if [ -n "$MOD" ]; then
  docker exec hassio_audio pactl unload-module "$MOD" 2>/dev/null
  sleep 1
  docker exec hassio_audio pactl load-module module-alsa-card device_id=1 name=usb-Generic_USB_SPDIF_Adapter_202110200032-00 tsched=no 2>/dev/null
  sleep 1
fi
docker exec hassio_audio pactl set-default-sink "$SINK" 2>/dev/null

# (Re)start the receiver on the default sink (= SPDIF). No -d: opening the sink by name fails.
docker exec hassio_audio pkill -f vban_receptor 2>/dev/null
docker exec hassio_audio pkill -f scream 2>/dev/null
sleep 1
docker exec -d hassio_audio /usr/local/bin/vban_receptor -i 172.30.32.1 -p 6980 -s Stream1 -b pulseaudio -q 1
echo "vban receiver started"

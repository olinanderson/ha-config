# The HA Box

The computer that runs Home Assistant in the van.

| | |
|---|---|
| **Machine** | Beelink MINI S (DMI vendor AZW), Intel N95 (Alder Lake-N) |
| **BIOS** | AMI, version ADLNV105, dated 2023-12-12 |
| **OS** | Home Assistant OS. SSH as `hassio@100.80.15.86` (`access.md`) |

## Booting by itself after a power loss

Whether the box boots when power comes back after an outage is one chipset
bit: AG3E (After G3 Enable), bit 0 of GEN_PMCON_A in the power management
controller, at physical address 0xFE001020 (PWRMBASE 0xFE000000 + 0x1020).

| AG3E | When power comes back |
|---|---|
| 1 | Stays off until someone presses the power button |
| 0 | Boots by itself |

The coin-cell side of the chipset keeps the bit through an outage. The BIOS
writes it at every boot from its option "State After G3".

On 2026-10-22 that option was "S5 State". The bit read 1 (GEN_PMCON_A
0xd8da3839), so after any power loss Home Assistant stayed down until someone
pressed the button. That day the bit was cleared over SSH (0xd8da3838). Since
then:

- Automation `ha_box_power_on_after_power_loss` runs
  `ha_box/power_on_after_power_loss.py` through
  `shell_command.ha_box_power_on_after_power_loss` at every HA start. When
  the BIOS had set the bit, it clears it and logs a warning: "HA box set to
  boot by itself after a power loss. The BIOS had set it to stay off at this
  boot…". When the bit is already clear it does nothing. If it can't set it,
  it raises a notification and logs an error. Its traces keep what the script
  printed at the last five starts. This HA has no logbook.
- The script writes nothing unless the DMI reads AZW, MINI S and BIOS
  ADLNV105, and /proc/iomem has the chipset's region at 0xFE000000. It changes
  only bit 0, with the 8-bit read-modify-write coreboot uses. The HA container
  is privileged, so it can open /dev/mem.
- To read the bit without changing it:

  ```bash
  ssh hassio@100.80.15.86 'sudo docker exec homeassistant python3 /config/ha_box/power_on_after_power_loss.py --check'
  ```

The gap: after a boot the bit is 1 from the BIOS until HA has started, a
minute or two. If the power goes out in that window, or HA doesn't start at
all, the box stays off after the outage.

### The lasting fix, in the BIOS

It needs a keyboard and an HDMI screen on the box.

1. Restart the box and press **Del** at the Beelink logo to enter setup.
2. Open **Chipset**, then **PCH-IO Configuration**, and set **State After G3**
   to **S0 State**. That is where it usually is on these Beelink BIOSes. If it
   isn't there, look for the same option under Advanced or Power.
3. Press **F4** to save and exit.

After that the startup hook finds the bit already clear and does nothing.

### Testing it

With HA up, unplug the box's power for about 10 seconds and plug it back in.
It should boot by itself. The system log (Settings, System, Logs) then shows
what the BIOS did at that boot. The warning "HA box set to boot by itself…
The BIOS had set it to stay off at this boot" means the BIOS option is still
"S5 State" and the hook did the work. No warning means the bit was already
clear.

### Undo

Disable `ha_box_power_on_after_power_loss`. The BIOS writes its own option back
at the next boot.

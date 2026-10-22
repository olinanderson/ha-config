#!/usr/bin/env python3
"""Have the HA box boot by itself when power comes back after an outage.

Background in docs/ha-box.md. The box is a Beelink (AZW) MINI S: Intel N95,
AMI BIOS ADLNV105. What it does when power returns is one chipset bit, AG3E
(After G3 Enable): bit 0 of GEN_PMCON_A in the power management controller,
at 0xFE001020 (PWRMBASE 0xFE000000 + 0x1020). 1 = stay off, 0 = boot. The
coin-cell (RTC) side of the chipset keeps it through the outage, and the BIOS
writes it at every boot from its "State After G3" option.

That option was "S5 State" (stay off) on 2026-10-22. So automation
ha_box_power_on_after_power_loss runs this at every HA start to clear the bit
again. Only that bit changes, with the 8-bit read-modify-write coreboot uses.
With the BIOS option on "S0 State" the bit is already 0 and this does nothing.

Runs in the Home Assistant container, which is privileged and so can open
/dev/mem. It writes nothing unless the machine and BIOS version are the ones
above and /proc/iomem has the chipset's region at PWRMBASE.

    python3 power_on_after_power_loss.py          # clear the bit if it is set
    python3 power_on_after_power_loss.py --check  # read only

Prints one JSON line: status ("set", "already", "check", "refused" or
"failed"), a message that reads after "HA box", and the register before and
after. Exits 0 whatever happened: the automation reads the status.
"""
from __future__ import annotations

import json
import mmap
import os
import struct
import sys

EXPECTED_DMI = {
    "sys_vendor": "AZW",
    "product_name": "MINI S",
    "bios_version": "ADLNV105",
}
PWRMBASE = 0xFE000000
GEN_PMCON_A = 0x1020
AG3E = 0x01  # bit 0 of the register's low byte: 1 = stay off, 0 = boot
REG_PHYS = PWRMBASE + GEN_PMCON_A  # 0xFE001020
PAGE = REG_PHYS & ~0xFFF  # 0xFE001000: mmap needs a page-aligned offset
REG = REG_PHYS & 0xFFF  # 0x20 within that page


def dmi_problem(root: str = "/sys/class/dmi/id") -> str | None:
    """None when this is the machine and BIOS the address was checked on."""
    for name, want in EXPECTED_DMI.items():
        try:
            with open(os.path.join(root, name)) as f:
                got = f.read().strip()
        except OSError as e:
            return f"can't read DMI {name} ({e})"
        if got != want:
            return f"DMI {name} is {got!r}, not {want!r}"
    return None


def iomem_problem(path: str = "/proc/iomem") -> str | None:
    """None when a top-level region starts at PWRMBASE and covers the register.

    Without CAP_SYS_ADMIN every range reads 00000000-00000000, which also fails.
    """
    try:
        with open(path) as f:
            lines = f.read().splitlines()
    except OSError as e:
        return f"can't read {path} ({e})"
    for line in lines:
        if line.startswith(" "):  # nested: claimed inside a top-level region
            continue
        span = line.split(" : ", 1)[0]
        try:
            start, end = (int(x, 16) for x in span.split("-"))
        except ValueError:
            continue
        if start == PWRMBASE and end >= REG_PHYS + 3:
            return None
    return f"/proc/iomem has no region at {PWRMBASE:#010x} covering {REG_PHYS:#010x}"


def read_reg(m: mmap.mmap, reg: int) -> int:
    return struct.unpack("<I", m[reg:reg + 4])[0]


def run(check_only: bool, dev: str = "/dev/mem", page: int = PAGE, reg: int = REG) -> dict:
    """Read the register, and clear AG3E unless check_only. Returns the result."""
    flags = (os.O_RDONLY if check_only else os.O_RDWR) | os.O_SYNC
    prot = mmap.PROT_READ if check_only else mmap.PROT_READ | mmap.PROT_WRITE
    fd = os.open(dev, flags)
    try:
        with mmap.mmap(fd, mmap.PAGESIZE, mmap.MAP_SHARED, prot, offset=page) as m:
            before = read_reg(m, reg)
            after = before
            if before == 0xFFFFFFFF:
                status = "refused"
                message = ("wrote nothing: the power register reads all ones, "
                           "so nothing answers at that address")
            elif check_only:
                status = "check"
                message = ("stays off after a power loss (AG3E 1)" if before & AG3E
                           else "boots by itself after a power loss (AG3E 0)")
            elif not before & AG3E:
                status = "already"
                message = "already boots by itself after a power loss (AG3E 0)"
            else:
                m[reg:reg + 1] = bytes([m[reg] & ~AG3E & 0xFF])  # byte 0 only
                after = read_reg(m, reg)
                if after & AG3E:
                    status = "failed"
                    message = "tried to set boot after a power loss, but AG3E still reads 1"
                else:
                    status = "set"
                    message = ("set to boot by itself after a power loss. The BIOS had "
                               "set it to stay off at this boot (AG3E 1 to 0)")
    finally:
        os.close(fd)
    return {"status": status, "message": message,
            "before": f"{before:#010x}", "after": f"{after:#010x}"}


def main(argv: list[str]) -> int:
    check_only = "--check" in argv[1:]
    problem = dmi_problem() or iomem_problem()
    if problem:
        result = {"status": "refused", "message": f"wrote nothing: {problem}"}
    else:
        try:
            result = run(check_only)
        except OSError as e:
            result = {"status": "failed", "message": f"couldn't map the power register ({e})"}
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

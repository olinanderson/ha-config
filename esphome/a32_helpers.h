#pragma once
// Small C++ helpers for a32-pro-esp32-s3.yaml (pulled in via `esphome: includes:`).

#include "esphome/components/pcf8574/pcf8574.h"
#include "esphome/components/xl9535/xl9535.h"
#include "esphome/core/log.h"

#include <cstdio>
#include <string>

namespace a32 {

// How many of the eight DI33-40 rocker inputs on the PCF8574 currently read
// active (pin LOW; they are `inverted: true` inputs). Used as a sanity check:
// a failed I2C read makes every pin read LOW, and so does the expander's
// quasi-bidirectional output latch being corrupted low by a glitched bus
// transaction. Both look like all eight rockers pressed in the same instant,
// which never happens for real (2026-09-04 and 2026-09-14: LPG valve opened,
// grey water valve opened, bed driven down, heater toggled - all at once).
// Takes a pointer because a bare `id(pcf8574_in_3)` in a lambda is the raw
// component pointer (ESPHome only rewrites `id(x).member` to `x->member`).
inline int pcf_active_count(esphome::pcf8574::PCF8574Component *chip) {
  int n = 0;
  for (uint8_t pin = 0; pin < 8; pin++) {
    if (!chip->digital_read(pin))
      n++;
  }
  return n;
}

// One XL9535 register pair (port 0, port 1): if either byte isn't `want`,
// log it, rewrite it and add e.g. "0x24 pol D1 FF" to `report`. Returns the
// number of bytes rewritten. A failed read only adds a note.
inline int xl9535_fix_pair(esphome::xl9535::XL9535Component *chip, uint8_t reg, uint8_t want,
                           const char *what, std::string &report) {
  char note[40];
  const char *sep = report.empty() ? "" : ", ";
  uint8_t v[2];
  if (chip->read_register(reg, &v[0], 1) != esphome::i2c::ERROR_OK ||
      chip->read_register(reg + 1, &v[1], 1) != esphome::i2c::ERROR_OK) {
    snprintf(note, sizeof(note), "%s0x%02X %s unreadable", sep, chip->get_i2c_address(), what);
    report += note;
    return 0;
  }
  if (v[0] == want && v[1] == want)
    return 0;
  ESP_LOGE("xl9535_check", "0x%02X %s reads %02X %02X, should be %02X %02X -> rewriting", chip->get_i2c_address(),
           what, v[0], v[1], want, want);
  snprintf(note, sizeof(note), "%s0x%02X %s %02X %02X", sep, chip->get_i2c_address(), what, v[0], v[1]);
  report += note;
  int fixed = 0;
  for (uint8_t i = 0; i < 2; i++) {
    if (v[i] != want) {
      chip->write_register(reg + i, &want, 1);
      fixed++;
    }
  }
  return fixed;
}

// DI01-32 are on two XL9535 expanders (0x24, 0x25). Each has a polarity
// pair (0x04/0x05: a set bit flips what that pin reads) and a direction pair
// (0x06/0x07: 1 = input). They power up 00 and FF and ESPHome never writes
// polarity, yet after the whole-van power-off on 2026-09-30 22 of the 32
// inputs read inverted, pressed = off and released = on: Bed Up (DI24)
// started on release and ran until Bed Down cut it, and the monitor and
// water buttons acted on release. A board restart doesn't power the
// expanders down, so nothing cleared it. The first boot with this check
// (2026-10-07) found polarity D1 FF on 0x24 and EC 2F on 0x25, the exact
// inverted inputs, and garbage on both output chips too. This puts polarity
// back to 00 and, for `inputs` (all 16 pins are inputs), direction to FF.
inline int xl9535_check(esphome::xl9535::XL9535Component *chip, bool inputs, std::string &report) {
  if (chip->is_failed()) {
    char note[32];
    snprintf(note, sizeof(note), "%s0x%02X failed", report.empty() ? "" : ", ", chip->get_i2c_address());
    report += note;
    return 0;
  }
  int fixed = xl9535_fix_pair(chip, 0x04, 0x00, "pol", report);
  if (inputs)
    fixed += xl9535_fix_pair(chip, 0x06, 0xFF, "dir", report);
  return fixed;
}

}  // namespace a32

#pragma once
// Small C++ helpers for a32-pro-esp32-s3.yaml (pulled in via `esphome: includes:`).

#include "esphome/components/pcf8574/pcf8574.h"

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

}  // namespace a32

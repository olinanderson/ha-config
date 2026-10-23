# Winterizing the Water System

Built 2026-10-22 for the user's own winterizing guide. No antifreeze goes in
anywhere: every line is drained, then blown dry with the compressor, and the
places air can't clear are emptied by hand. Home Assistant adds three things:

- **The walkthrough** (Water page, Winterize card, **Start winterizing**): the
  twelve steps below, one at a time, the fresh tank first. It says what to do
  and does the water part itself; while it runs nothing else touches the
  water.
- **Winterized** (`input_boolean.water_winterized`), a lock that holds the
  water system off all winter, whoever tries to switch it on.
- **The blow-out** (`script.water_blowout`), which cycles Main, Recirc and
  Flush while the compressor blows through a pump's air port, so the air
  reaches every branch. It ends with the valves in Main, the water off and
  Winterized on.

Both pump fuses come out along the way and stay out. The fuses are the real
lock; Winterized is the one on the dashboard. As of 2026-10-22 neither the
walkthrough nor the blow-out had run on the van.

## The plumbing, as the user describes it

Two pumps, each with a small inline filter right before it:

- the **else pump** (`switch.a32_pro_switch30_main_system_water_pump`, "main"
  in the firmware), which feeds everything but the shower loop from the fresh
  tank: the sink hot and cold, the drinking spigot (off the sink's cold line,
  its filter under the right side of the sink, drawer out), the outdoor
  shower hot and cold, and a cold **fresh fill** in the shower;
- the **recirc pump** (`switch.a32_pro_switch29_shower_system_water_pump`),
  which takes the shower pan's water through the drain filter and the shower
  tank, pushes it through three filters (a 40 µm spin-down, then two large
  housings, 20 µm and 5 µm) and the UV lamp, then through HX-1 (heated) and
  HX-3 (cooled) to the shower's hot/cold **mixer** and the head. In Recirc
  it is all loop water, one side cooled in HX-3 and the other heated in
  HX-1; Flush is when fresh water is pumped into the shower (the user,
  2026-10-22).

The modes move three valves: Main closes all three, Recirc opens valve 1,
Flush opens valves 2 and 3 (by the drawing, the loop to grey and the fresh
trunk). The firmware starts the else pump in every mode and the recirc pump
in Recirc and Flush, and turns the UV lamp on in Recirc and Flush. The drawing
in `piping diagram/` was made on 2026-09-12 and corrected on 2026-10-22 from
the user's description. Valve 1 gates the loop's cooling path (the fresh pass
through HX-3), probably with a check valve after it: the user's reading, not
checked at the pipes.

## The procedure

The walkthrough's twelve steps, the same text as the card
(`react-dashboard/src/components/WinterizeCard.tsx`, `STEPS`; change both).

**Drain**

1. **Drain the fresh tank.** Open the tank's drain valve and leave it open
   all winter. Keep the water on and run the sink until nothing comes out
   (the user's way, 2026-10-22). The card shows the live sender
   (`sensor.a32_pro_fresh_water_tank_level`, not the stable level, which lags
   minutes); **Drained** asks first while it still reads over 5 %. The sender
   reads 0 % once the float is down (the user confirms it reads 0 % when
   drained; before 2026-10-22 it had never read below 30 %).
2. **Open every outlet**, each to the middle, so hot and cold both drain:
   outdoor shower hot and cold, the shower fresh fill, the shower mixer hot
   and cold, the sink hot and cold, the drinking spigot.
3. **Empty the lines and the shower tank.** **Water on in Flush**
   (`script.water_winterize_drain_on`): the master on, Flush, and the UV lamp
   off 12 s later (it would cook dry as the lines empty). Both pumps run with
   the loop open to grey. Go round the outlets; when every one only spits,
   **They only spit · water off** (`script.water_winterize_drain_off`): the
   pumps and the UV lamp off, valves 2 and 3 closed through their relays while
   the a32 still powers them, 10 s, the master off, on to the next step (4;
   from step 5, 6). The pumps run dry for a few seconds on purpose: that empties the pump heads, which
   the blow-out never reaches (by the drawing the air ports are after the
   pumps' check valves). The valves go through the relays rather than Main
   because a mode change restarts the pumps, dry. The card shows the water,
   both pumps and the grey tank, and says to dump the grey tank first when it
   reads over 80 %: the flush drains into it.
4. **Shower filters out.** Unscrew the three housings in the shower: the
   spin-down (40 µm), then the two large ones (20 and 5 µm). Empty them into
   the drain and put the housings back empty.
5. **Flush the shower tank again.** What ran out of the housings went down
   the drain into the shower tank. **Water on in Flush** again (the same
   `_drain_on`): the recirc pump sends it to grey; the else pump runs dry
   meanwhile, which a diaphragm pump takes for a minute or two. When the
   recirc pump only spits, **Shower tank empty · water off** (`_drain_off`,
   on to step 6). The button, not the rocker: the rocker cuts the power with
   valves 2 and 3 still open, which gives the else port's air a way into the
   loop and out to grey (the rocker left them open on 2026-10-22 19:34 MDT);
   the button closes them first. Asked by the user 2026-10-22, after a hand
   flush at this point.

**The fresh side through the else port**

6. **Else pump's fuse out, compressor on its port** (the top one), its valve
   open, about **30 psi** on the compressor's regulator (my number; the
   system has no pressure sensor HA could watch). Never above 40 to 50 psi,
   the usual limit for RV plumbing and filter housings. The water stays off:
   after step 5 the valves are closed, which is what Main gives, and the
   pump's fuse is out anyway. The compressor's switch
   (`switch.a32_pro_switch28_compressor`, also a Home tile) is on the card:
   every step, the running face and the idle blow-out controls (asked
   2026-10-22); Shop Mode greys it and would re-shut it.
7. **Blow out the fresh side, one outlet at a time.** Close every outlet.
   Then one outlet at a time until only air comes: outdoor shower hot,
   outdoor shower cold, the shower fresh fill, the drinking spigot, sink
   cold, sink hot (the shower mixer is on the loop: it gets its air in
   step 9). Go round again until nothing comes out anywhere. Take the
   outdoor shower hose off and empty it. The drinking filter stays in until
   step 11, after the blow-outs: the user's order (2026-10-22); once it is
   off its lines are open, so it can't come out before the air. Open the
   spigot like the others; a wet carbon block may pass little air at 30 psi,
   and the line past it drains when the filter comes off.

**Every branch: the blow-out, once on each port**

8. **Recirc pump's fuse out, compressor onto its port**, its valve open,
   30 psi again. Both fuses are now out. Open the shower mixer to the middle
   and close every other outlet. Leave the tank drain open.
9. **Blow-out, recirc port.** Press **Start blow-out**. It runs Main, Recirc
   and Flush for the set minutes, as many rounds as set (2 minutes and
   2 rounds, 12 minutes in all), and holds the pumps and the UV lamp off. It
   ends with the water off and Winterized on. Next waits until it has ended.
10. **Blow-out, else port.** Move the compressor back to the else pump's air
    port and press **Start blow-out** again; it runs with Winterized on. Then,
    with the valves back in Main, open each outlet once more, one at a time,
    until nothing comes out.

**Filters and what air can't clear**

11. **Filters out.** The drinking filter: take the top drawer next to the
    sink out, un-velcro the filter behind it and unscrew it, with the spigot
    open so the line to it drains (the user's directions, 2026-10-22). Then
    both inline filters before the pumps, emptied, which drains the pumps'
    suction side; and the three shower housings opened once more and emptied.
12. **What air can't clear.** The P-trap under the sink, by hand or with a
    wet-vac: air can't push trap water out, since (by the drawing) the A/C
    condensate and toilet lines join above it at the Y connectors and the air
    escapes up them. Sponge out the shower pan. Dump the grey tank (the card
    has the dump valve, `switch.a32_pro_switch06_grey_water_tank_valve`, which
    the lock leaves alone) and close the valve once it reads empty.
    Compressor off, both air-port valves closed. The tank drain stays open.
    **Done** (`script.water_winterize_finish`) turns Winterized on, if the
    blow-outs hadn't, and ends the walkthrough.

It ends with the tank drain open, the water off, Winterized on and both pump
fuses out.

Also, with no antifreeze:

- **Heat exchangers**: brazed plate, they crack if water freezes in them.
  Give them air time (more blow-out rounds if anything still spits). By the
  drawing HX-1 and HX-2 carry the hydronic heater's coolant, so a heater run
  warms them; HX-3 gets air only.
- **Pump heads**: the few seconds dry in steps 3 and 5. The blow-out can't
  reach them.

| Where antifreeze usually goes | Instead |
|---|---|
| P-trap | Emptied by hand or wet-vac |
| Grey tank | Dumped, valve closed once empty |
| Pump heads | Run dry for a few seconds at the end of the drain, inline filters out |
| Heat exchangers | Blow-out rounds |
| Lines and fixtures | The blow-out on each port, then each outlet in turn |

## How the air goes

By the corrected drawing (the user's description of 2026-10-22). The
blow-out cycles all three modes on each port, so every valve's branch gets
air.

| Compressor on | Main | Recirc | Flush |
|---|---|---|---|
| Recirc pump's air port | The loop: filters, UV, HX-1 and HX-3 to the shower head (mixer open) | The same (valve 1 is on the fresh side) | Valve 2 down the flush line to grey, valve 3 into the fresh trunk |
| Else pump's air port | Every fresh outlet (the fresh fill too) and HX-2 | The same, plus valve 1: the fresh pass through HX-3, back into the tank | Valve 3 into the riser, filters and shower head |

That is why it runs once on each port, with the shower mixer open both times.

## The walkthrough

From the Winterize card, **Start winterizing** (`script.water_winterize_start`,
only while Winterized is off and no blow-out runs):

- `input_boolean.water_winterizing` is on from Start to Done or Stop, and
  `input_number.water_winterize_step` (0 = none) holds the step, so the phone
  and the laptop show the same one and it survives a reload.
- While the flag is on, Power Saving, Bedtime, Shower Mode, Sleep Mode and
  its morning restore leave the water alone, and the 1 Hz snapshot and the
  pre-sleep scene leave the master out: the water is the walkthrough's. The
  guard ignores the flag; it holds whatever Winterized holds, which is off
  until step 9's blow-out turns it on.
- Plain steps set the step from the card. The water-touching ones go through
  `script.water_winterize_drain_on` and `_drain_off` (steps 3 and 5;
  `_drain_off` moves the step on, 3 to 4 and 5 to 6; `_drain_on` refuses
  once Winterized is on, the guard would undo it), the blow-out (steps 9
  and 10) and `script.water_winterize_finish` (step 12). **Stop
  winterizing** asks, then `script.water_winterize_stop`: the water and the
  UV lamp off, the flag off, step 0. Back works everywhere but during a run.
- The compressor's switch (`switch.a32_pro_switch28_compressor`) is on the
  card: every step, the running face and the idle blow-out controls.
- The card's checklists are the phone's own: they clear on a reload and at
  every step.

## Winterized, the lock

While `input_boolean.water_winterized` is on:

- `water_winterized_guard` switches straight back off whatever turns on: the
  master, both pumps, the valves, switch10 to 13, the UV lamp, the fresh and
  shower tank heaters and their pads. That covers routines, the dashboard,
  voice, the DI27 rocker and the a32 coming back from a reboot.
- `water_winterized_on` switches all of that off at once when it is turned on
  by hand (`script.water_winterize_shutdown`).
- `water_winterized_on_start` applies it again after an HA restart, once the
  a32 is connected.
- Bedtime, Shower Mode and the Sleep Mode morning restore leave the water off.
  Shower Mode still turns the lights and the roof fan on.
- The 1 Hz snapshot that Power Saving restores leaves the master out.
- Voice: "turn on the water (system)" answers that it is winterized
  (`WaterSystemOn` sentence), and Claude's prompt says the same.
- The Water page greys out the master switch, and the Fresh chips on the Home
  and Van pages read **Winterized** instead of an empty tank.

Left alone on purpose:

- The **grey tank heater** and the **grey dump valve**: the sink and the
  toilet still drain into the grey tank.
- The **hydronic heater** and **Hot Water Mode**, which is also the Heater
  card's manual burner switch. The burner heats the van.

The lock lives in HA. The DI27 rocker works in the a32 itself, so with HA down
it can still switch the water on; with the fuses out nothing pumps.

## The blow-out

`script.water_blowout`, from the Winterize card on the Water page (on its own,
or as steps 9 and 10 of the walkthrough):

- **Settings**: `input_number.water_blowout_minutes` (1 to 10 per mode) and
  `input_number.water_blowout_rounds` (1 to 5), set to 2 and 2.
- **While it runs** `input_boolean.water_blowout_running` is on. The guard
  leaves the master and the valves to the blow-out and holds the pumps, the UV
  lamp and the tank heaters off. Power Saving, Sleep Mode and Bedtime leave
  the water on, so the run isn't cut short.
- **Status**: `input_text.water_blowout_status` ("Recirc · round 1 of 2"),
  `input_datetime.water_blowout_step_ends` and `input_datetime.water_blowout_ends`
  drive the card's countdown, progress bar and "Done at".
- **How it ends**: every way goes through `script.water_blowout_finish`. If the
  water is still on, it sets Main and waits 12 s for the valves; then
  Winterized on, the run flag off, everything off, and how it ended in the
  status ("Done", "Stopped", "Stopped when the water was switched off",
  "Stopped when Shop Mode was armed", "Cut short by a Home Assistant restart").
- **Stop** (`script.water_blowout_stop`, the card's Stop button) ends it the
  same way. So does switching the water off, which is the quickest stop.
- **Shop Mode** armed: it doesn't start, and a running blow-out ends.

The a32's mode change waits 10 s while the valves move, then starts the pumps.
Switching the master off inside that wait doesn't cancel it, so the pumps can
come on with the master off. The guard switches them off within a second.
That's why the finish waits 12 s after setting Main.

## Spring: de-winterizing

1. Put every filter back: the three shower filters (40 µm spin-down, 20 µm,
   5 µm), both inline pre-pump filters and the drinking filter.
2. Close the tank drain and the outlets, refit the outdoor shower hose, and
   fill the fresh tank.
3. Put both pump fuses back.
4. Water page, Winterize card: turn **Winterized** off. It asks first.
5. Switch the water on. It starts in its last mode: Main after a blow-out
   that ended normally; press Main if it shows another. Open each outlet
   until the water runs without air, then run Recirc and Flush for a minute
   each.
6. Turn the fresh and shower tank heaters back on if they are wanted.

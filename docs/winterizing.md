# Winterizing the Water System

Built 2026-10-22 for the user's own winterizing guide. No antifreeze goes in
anywhere: every line is drained, then blown dry with the compressor, and the
places air can't clear are emptied by hand. Home Assistant adds two things:

- **Winterized** (`input_boolean.water_winterized`), a lock that holds the
  water system off all winter, whoever tries to switch it on.
- **The blow-out** (`script.water_blowout`), which cycles Main, Recirc and
  Flush while the compressor blows through a pump's air port, so the air
  reaches every branch. It ends with the valves in Main, the water off and
  Winterized on.

Both pump fuses come out at the end and stay out. The fuses are the real lock;
Winterized is the one on the dashboard. As of 2026-10-22 the blow-out had not
yet run on the van.

## The procedure

The user's 22 steps, in order, with the corrections. The plumbing is in
`piping diagram/`.

**Drain**

1. Open the fresh tank's manual drain valve and leave it open all winter.
2. Open every faucet, each to the middle so hot and cold both drain.
3. Water on in Flush and wait until every outlet only spits: outdoor shower
   hot and cold, the shower's fresh fill, the shower mixer hot and cold, the
   sink hot and cold, the drinking spigot. Switch the water off as soon as
   they spit, so the pumps don't run dry for long. A few seconds dry is what
   empties the pump heads: the air ports are after the pumps' check valves,
   so the blow-out never reaches them.
4. Unscrew the shower filters (both large housings and the small spin-down)
   and empty them into the drain.
5. Put the empty housings back, without filters.

**Main side through the main port**

6. Pull the main ("else") pump fuse.
7. Compressor on the main pump's air port (top), its valve open, at about
   **30 psi**. Never above 40 to 50 psi, the usual limit for RV plumbing and
   filter housings.
8. Water on in Main. Main runs only the main pump, whose fuse is out, and
   moves no valves.
9. to 15. One outlet open at a time until only air comes out: outdoor shower
   hot, outdoor shower cold, the shower's fresh fill, the drinking spigot,
   sink cold, sink hot. **Pull the drinking filter before the spigot** (under
   the right side of the sink, drawer out): a carbon block holds water and
   cracks or tears when it freezes, and blowing through it only wets it.
   Take the outdoor shower hose off and empty it.

**Every branch: the blow-out**

16. Pull the recirc pump fuse. Both fuses are now out.
17. Compressor on the recirc pump's air port, its valve open, 30 psi.
18. **Open the shower mixer to the middle** and close every other outlet.
    Leave the tank drain open. On the Water page, Winterize card, press
    **Start blow-out**. It runs Main, Recirc and Flush for the set minutes,
    as many rounds as set (2 minutes and 2 rounds, 12 minutes in all), and
    holds the pumps and the UV lamp off. The firmware turns the UV lamp on in
    Recirc and Flush and it would cook dry; HA switches it straight back off.
    When it ends the water is off and Winterized is on.
    Then move the compressor to the main pump's air port and press **Start
    blow-out** again: it runs with Winterized on. Afterwards, with the valves
    back in Main, open each outlet once more (as in 9 to 15) until nothing
    comes out.
19. Move on only when nothing comes out anywhere.

**Filters and what air can't clear**

20. Remove the drinking filter if it isn't out already.
21. Remove the pre-pump filters (the small cylinders right before each pump)
    and empty them. That drains the pumps' suction side.
22. Remove the shower filters.

Then, with no antifreeze:

- **P-trap**: empty it by hand or with a wet-vac. Air can't push trap water
  out: the A/C condensate line and the toilet urine line join above it at the
  Y connectors, and the air escapes up them.
- **Grey tank**: dump it, then close the dump valve once it is empty.
- **Shower pan and loop pump**: sponge out the shower pan; the drain filter
  before the loop pump comes out in step 21.
- **Heat exchangers**: they are brazed plate and crack if water freezes in
  them. Give them air time (more blow-out rounds if anything still spits).
  Running the hydronic heater dries HX-1 and HX-2, which carry its coolant.
  HX-3 gets air only.
- **Pump heads**: the few seconds dry in step 3. The blow-out can't reach them.

It ends with the tank drain open, the water off, Winterized on and both pump
fuses out.

| Where antifreeze usually goes | Instead |
|---|---|
| P-trap | Emptied by hand or wet-vac |
| Grey tank | Dumped, valve closed once empty |
| Pump heads | Run dry for a few seconds at the end of the drain, suction filters out |
| Heat exchangers | Blow-out rounds; the hydronic heater dries HX-1 and HX-2 |
| Lines and fixtures | The blow-out, then each outlet in turn |

## How the air goes

| Compressor on | Main | Recirc | Flush |
|---|---|---|---|
| Recirc pump's air port | Filters, UV, HX-1 and HX-3 to the shower head (mixer open) | The same, plus valve 1 into the fresh side, out through HX-3 into the tank | Valve 2 down the flush line to grey, valve 3 into the fresh trunk |
| Main pump's air port | Every fresh outlet, HX-2, and HX-3 back into the tank | Valve 1 into the loop, then the riser, filters and shower head | Valve 3 into the riser, filters and shower head |

That is why it runs once on each port, with the shower mixer open both times.

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

- The **grey tank heater**: the sink and the toilet still drain into the grey
  tank.
- The **hydronic heater** and **Hot Water Mode**, which is also the Heater
  card's manual burner switch. The burner heats the van.

The lock lives in HA. The DI27 rocker works in the a32 itself, so with HA down
it can still switch the water on; with the fuses out nothing pumps.

## The blow-out

`script.water_blowout`, from the Winterize card on the Water page:

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

1. Put every filter back: the shower filters, the spin-down, the pre-pump
   filters and the drinking filter.
2. Close the tank drain and the outlets, refit the outdoor shower hose, and
   fill the fresh tank.
3. Put both pump fuses back.
4. Water page, Winterize card: turn **Winterized** off. It asks first.
5. Switch the water on. It starts in its last mode: Main after a blow-out
   that ended normally; press Main if it shows another. Open each outlet
   until the water runs without air, then run Recirc and Flush for a minute
   each.
6. Turn the fresh and shower tank heaters back on if they are wanted.

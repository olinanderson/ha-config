# Voice Assistant

Since 2026-10-07: HA's local sentences first, Claude for everything else.

## How a spoken command flows

```
"Okay Nabu" ─ wake word, detected on the Voice PE itself (micro_wake_word)
   │  audio streams to HA
   ▼
Whisper (faster-whisper app on HA, model auto, English) ─ speech to text
   ▼
Local sentences: HA's own + custom_sentences/en/van.yaml
   │  exact match that works → done, nothing leaves the van
   │  anything else ↓
   ▼
Claude (Anthropic integration, "Claude conversation", Haiku 5.5, low effort)
   │  sees the exposed entities by name, alias and area, and acts through
   │  HA's intent tools (HassTurnOn, HassLightSet, GetLiveContext …) and
   │  the exposed scripts
   ▼
OpenAI TTS (gpt-4o-mini-tts) ─ the answer is spoken on the Voice PE
```

The pipeline is "Home Assistant" (the preferred one). The Voice PE is
"Home Assistant Voice 096586" in area Van, so "turn off the lights" said to
it means the Van's lights.

Before 2026-10-07 every sentence went to ChatGPT (gpt-4o-mini, 2.3–7 s),
nothing had an area (so "the lights" got "which area?"), and the old custom
sentences didn't match.

## Files

| File | What it holds |
|---|---|
| `voice/spec.yaml` | Areas, device areas, entity aliases and areas, the **complete** list of what Assist may see, the Claude model, the pipeline |
| `voice/prompt.md` | Claude's instructions |
| `voice/apply.py` | Writes spec.yaml and prompt.md into HA's registries (they live in `.storage`, not YAML). `deploy.sh` runs it when `voice/` changes; prints each change; `--dry` only prints |
| `custom_sentences/en/van.yaml` | Local sentences |
| `intent_scripts.yaml` | What the local sentences do |
| `scripts.yaml` → `voice_roof_fan` | Claude's roof fan tool (power, intake/exhaust, speed); the local roof fan sentences use it too |
| `scripts.yaml` → `voice_light_warmth` | Claude's tool for the Main and Cabinet lights' warmth (warmer/cooler steps, warm white … daylight, a percent as on the dashboard's warmth slider, kelvin); the `LightWarmth` sentences use it too |
| `custom_components/voice_log/` | Writes every run to the voice log (below) |

## What things are called

- **Van** is inside (aliases Indoor, Indoors, Inside, Interior, Cabin, Living
  space, House, Coach, Camper). "The lights" and "the indoor lights" are all
  four: Main, Cabinet, Shower and Accent lights. Main and Cabinet are white
  only with a warmth, 2000 K (candle) to 6535 K; Shower and Accent only dim.
- **Outside** has the Left, Right and Rear outdoor lights, the Weather and the
  under-van sensor.
- Also: Roof fan, Roof fan lid, Air conditioner (A/C), Heater, Heater auto
  (the Heater card's Auto / Manual), Inside temperature, House battery, Propane, Fresh water, Grey water, Propane
  valve, Grey water valve, Sleep mode, Shower mode, Power saving mode, Cook
  mode. The full list with every alias is `voice/spec.yaml`.

## Local sentences

Answered on the HA box at once, free. Claude never sees these intents
(`platforms: [conversation]` in `intent_scripts.yaml`); it has its own tools
for the same jobs.

| Intent | Say | Does |
|---|---|---|
| `IndoorDimmersOff/On` | "turn off the (indoor) lights", "lights on" | `light.turn_off/on`, area Van |
| `LightWarmth` | "make the (main/cabinet) lights warmer", "cooler", "set the lights to warm white", "mostly yellow", "daylight", "90% warm", "30 percent cool" | `script.voice_light_warmth`; "the lights" is whichever of Main and Cabinet are on. A step is 70 mireds (about five from warmest to coolest) and skips lights that are off. A percent is the dashboard slider's position, linear in kelvin: 90 % warm is about 2450 K |
| `OutdoorLightsOff/On` | "outdoor lights off" | The three outdoor switches |
| `RoofFanTurnOn` | "turn the roof fan on (to intake) (at 50 percent)" | `script.voice_roof_fan`; left-out direction/speed stay as they are |
| `RoofFanTurnOff` | "roof fan off" | Same script, off; the lid closes |
| `CookModeStart/Stop` | "cook mode on", "done cooking" | `script.cook_mode` / `script.cook_mode_off` |
| `StartBedtimeRoutine` | "good night", "I'm going to bed" | `script.sleep_mode_on` |
| `GoodMorning` | "good morning", "morning", "good morning Jarvis", "I'm up" | `script.wake_up_routine`, which ends Sleep Mode; says "Good morning. Sleep mode off." when it was on |
| `InsideTemperature` | "what's the temperature (inside)" | Speaks Living Space Temperature |
| `LocalTime` | "what time is it" | Speaks the time where the van is, with the zone: "It's 10:26 PM Pacific time." |
| `LocalDate` | "what's the date", "what day is it" | Speaks the date where the van is |

HA's own sentences cover named devices: "turn off the main lights", "set the
lights to 30 percent", "turn on the heater".

The Voice PE was powered from the inverter (checked 2026-10-09), and Sleep
Mode switches the inverter off, so it is offline all night. Since "good
morning" is what ends Sleep Mode (the wake time leaves it on since
2026-10-09), the wake time turns the inverter back on while the Voice PE is
offline, if the inverter was on at bedtime, on weekends and stat holidays
too; before then only the dashboard ends Sleep. Always-on power (the van's
always-on USB hub, or a 12 V USB-C supply, 5 V 2 A) keeps it listening all
night, and the inverter then stays off until "good morning".

## Changing things

- **Expose, rename or move an entity:** edit `voice/spec.yaml`, commit,
  `bash deploy.sh`. `expose:` is the whole list: everything else is hidden
  from Assist, and new entities are not exposed on their own. Entities
  without a unique_id can be exposed but take no aliases or area.
- **How Claude talks or behaves:** `voice/prompt.md`, then deploy.
- **A new local sentence:** `custom_sentences/en/van.yaml` plus its action in
  `intent_scripts.yaml`; deploy reloads both.
- **Another model:** `agent:` in `voice/spec.yaml`, then deploy. Sonnet and
  Opus 5.5 need `thinking_effort` low or higher; the API rejects `none` on
  them. Haiku 4.5 takes `thinking_budget: 0` instead.

## Testing

- **Settings > Voice assistants > Home Assistant > ⋮ > Debug** shows each
  spoken run: what Whisper heard, local or Claude, timings.
- **Developer tools > Assist**: type a sentence and see the intent and
  entities it matched.
- **Local matching without acting**: websocket
  `conversation/agent/homeassistant/debug` with `sentences` and the Voice
  PE's `device_id` (`0026618f4429fdcd4c612ccb18fae4d1`).
- **Claude directly**: websocket `conversation/process` with
  `agent_id: conversation.claude_conversation` and the same `device_id`.

## Voice log

Since 2026-10-08 every run, spoken or typed in the Assist dialog, is one line
of JSON in `/config/vanlife-data/voice_log.jsonl` (not in git, not served).
`custom_components/voice_log` copies it from the debug view's records within
10 s of the run ending; HA itself keeps only the last 10 runs, in memory.
Over 10 MB the log moves to `voice_log.1.jsonl`.

| Field | What it holds |
|---|---|
| `time` | When the run started, HA's time (Mountain) |
| `result` | `ok`; `unable`: the reply says it couldn't (a guess from words like "can't", "unable", "not sure which"); `failed`: a tool or the answer returned an error or a device that failed; `asked`: the reply asked something back (it ended in a question), so the request may be half done; `error`: the pipeline itself failed (Whisper, Claude, TTS); `no_speech`: nothing heard (a false wake word, silence after a question, or a run cut off before any words) |
| `heard` | What Whisper heard, or what was typed |
| `reply` | What it said |
| `by` | `local` (a sentence) or the agent, `conversation.claude_conversation` |
| `tools` | Claude's tool calls: name, arguments, then the entities `done` or `failed`, the `error`, or the `result` (cut to 200 characters) |
| `done`, `failed` | The entities a local sentence acted on |
| `error` | The pipeline error: code and message |
| `follow_up` | It asked something back and listened again |
| `seconds` | `listen` (speaking + Whisper), `think` (sentence or Claude), `total` |
| `input`, `satellite`, `pipeline`, `conversation_id` | Where it came from; a follow-up keeps the conversation_id |

Everything that wasn't `ok`:

```
ssh hassio@100.80.15.86 "sudo grep -v '\"result\": \"ok\"' /config/vanlife-data/voice_log.jsonl"
```

The first line is the request that started the log: "turn the heater on and
set it to 26 degrees Celsius on auto". Claude turned it on at 26 °C, then said
it couldn't set auto. Auto is the Heater card's Auto / Manual for the blower
(`switch.a32_pro_coolant_blower_mode_auto_manual`), which had no voice name.
Fixed the same day: it is "Heater auto" now, and the prompt says that "auto"
for the heater means Heater auto on, and that the air conditioner has no auto
mode (on cool it holds its set temperature by itself).

`ok` only means nothing reported an error. At 11:23 that day "set the
undercabinet lighting to 20% and then make it mostly yellow light" was `ok`:
Claude sent the colour yellow, which the white-only Cabinet lights turned into
about 3600 K, a neutral white, and said "set to yellow". Fixed the same day
with `script.voice_light_warmth` (Things to know).

At 12:25 "turn the undercabinet lighting to 10% and then make it 90% warm"
set 10 % and then asked whether 90 percent warm meant about 2000 kelvin or
brightness: Light warmth control had no percent. It has one since, the
position on the dashboard's warmth slider (100 the warmest), and a reply
that asks something back is `asked` since then, no longer `ok`.

## API key

The Anthropic integration uses the key from the OpenClaw config on asylum.
It is only in HA's config entry, never in git.

## Model benchmark, 2026-10-07

Ten typed commands to each setup through `conversation/process`, as if spoken
to the Voice PE, twice each: seven questions (battery, inside temperature,
roof fan, propane, which lights, jacket weather, time) and three commands
that changed nothing because the device was already that way (outdoor lights
off, shower light on, propane valve closed). Times run from the text arriving
to the answer, so Whisper and the voice come on top. Cost is per command at
API list prices: first command in five minutes (the cache is written) / one
within five minutes of another (the cache is read).

| Setup | Median | Slowest | ¢ per command | Right |
|---|---|---|---|---|
| **Haiku 5.5, low effort** (chosen) | 1.3 s | 1.9 s | 0.18 / 0.06 | 20/20 |
| Haiku 5.5, no thinking | 1.3 s | 1.9 s | 0.18 / 0.06 | 20/20 |
| Haiku 4.5 | 1.6 s | 2.0 s | 1.4 / 0.4 | 20/20 |
| Sonnet 5.5, low effort | 2.1 s | 3.3 s | 3.6 / 1.0 | 20/20 |
| Opus 5.5, low effort | 2.2 s | 3.7 s | 7.1 / 1.9 | 20/20 |
| ChatGPT gpt-4o-mini (before) | 2.3–7 s | | | |

Every request carries about 10,800 tokens of tools and entity list (8,000 on
Haiku 4.5's older tokenizer), and questions about how things are now add a
GetLiveContext round of about 3,500 more. That is nearly all of the cost.
Answers ran about 50 tokens. At 20 Claude commands a day, Haiku 5.5 is about
a dollar a month and Sonnet 5.5 about twenty.

Sonnet and Opus worded a few answers a little better ("at about 40 percent",
fewer extras). Haiku 5.5 without thinking once added the under-van sensor to
the weather answer. Low effort was as fast as no thinking on these and lets
the model think when a request needs it.

## Things to know

- HA's clock is Mountain time (America/Edmonton) wherever the van is.
  Times are said where the van is, with the zone named ("10:26 PM Pacific
  time"). `sensor.van_time_zone` (template/van_time_zone.yaml) has the zone,
  its UTC offset and what to call it. Open-Meteo looks the zone up from
  `zone.home`, rounded to about 1 km, every 15 min (configuration.yaml,
  `rest:`), and the sensor keeps the last answer offline. `LocalTime` and
  `LocalDate` replace HA's own time and date sentences, which use HA's
  clock. Claude still gets Mountain times from GetDateTime; the prompt tells
  it how far the van's zone is from Mountain and to name the zone.
- The roof fan's direction comes from `sensor.roof_fan_direction`; the fan
  entity's own direction attribute isn't in what Claude is shown.
- Light warmth goes through `script.voice_light_warmth` (Light warmth
  control), not HA's HassLightSet. That tool's description says only
  "brightness or color" and its `temperature` (kelvin) slot has no
  description, and Claude isn't shown which lights have a warmth or where it
  is. Its `color` on the white-only Main and Cabinet lights becomes the
  nearest white by HA's conversion: yellow 3591 K (neutral), orange 1825 K
  (so the warmest, 2000), red 6279 K (a cool white); amber isn't a colour
  name at all. HA's own local sentences do colour
  temperature only with those words ("set the main lights color temperature
  to warm white"), and "set the lights to yellow" matched its colour
  sentence; `LightWarmth` takes those now (a custom sentence wins a tie).
- The propane and grey water valves stay exposed on purpose; the prompt tells
  Claude to open them only when the user names that valve.
- Hidden from Assist: `script.all_lights_toggle` (it toggles, so "turn off"
  could turn the lights on) and BME280 1 (warmed by the inverter).
- The ChatGPT integration is still installed but the pipeline doesn't use it.

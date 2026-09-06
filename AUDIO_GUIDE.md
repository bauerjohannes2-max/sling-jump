# Sling Jump - Audio System Guide

> Architecture: Web Audio Dynamic Buffer Pool + Procedural Synthesizer Fallback  
> Features: Zero Latency, Low-Pass Ducking, Pitch-Ramp Combos

---

## 1. Engine Structure (`js/audio/AudioManager.js`)
- **Tier 1 (Buffers):** Web Audio buffers loaded from `assets/audio/`. Crossfade between BGM states (menu, gameplay, gameover). Dynamic low-pass filter ducking (650 Hz in slow-mo, 20,000 Hz on launch). Combo pitch ramps (+1 semitone per pickup).
- **Tier 2 (Synthesizer Fallback):** Real-time multi-oscillator Web Audio synthesis when audio assets are missing or offline. Zero latency, 0 download footprint.

---

## 2. Audio Asset Map
### Music (`assets/audio/music/`)
- `bgm_menu.mp3`: Ambient cosmic synthwave, 95 BPM, A Minor / D Dorian.
- `bgm_gameplay.mp3`: Driving arcade synthwave, 128 BPM, D Minor.
- `bgm_gameover.mp3`: Dramatic descending sting, 80 BPM, D Minor -> C.

### SFX (`assets/audio/sfx/`)
| SFX Key | File | Description |
| :--- | :--- | :--- |
| `sfx_grapple_lock` | `sfx_grapple_lock.wav` | Magnetic lock-on click (100ms) |
| `sfx_slingshot_boost` | `sfx_slingshot_boost.wav` | Kinetic sling release whoosh (350ms) |
| `sfx_core_pickup` | `sfx_core_pickup.wav` | Resonant crystalline chime (250ms) |
| `sfx_node_shatter` | `sfx_node_shatter.wav` | Fragile node fracture pop (250ms) |
| `sfx_near_miss` | `sfx_near_miss.wav` | Doppler flyby tension zip (200ms) |
| `sfx_crash` | `sfx_crash.wav` | Kinetic hull impact crunch (800ms) |
| `sfx_ui_click` | `sfx_ui_click.wav` | Minimalist tactile click (50ms) |

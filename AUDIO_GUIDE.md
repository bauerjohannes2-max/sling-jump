# Sling Jump - Audio System & Google Lyria Pipeline Guide

> **Version:** 4.5.0  
> **Architecture:** Web Audio API Dynamic Buffer Pool + Procedural Synthesizer Fallback  
> **Target:** Zero Latency, 60+ FPS, Dynamic Low-Pass Ducking, Pitch-Ramp Combos  

---

## 1. Overview of the In-Game Audio Architecture

Sling Jump features a dual-tier professional audio engine (`js/audio/AudioManager.js`):

1. **Tier 1 - Preloaded High-Fidelity Audio Buffers (`assets/audio/`)**:
   - Decoded asynchronously into Web Audio buffers via `decodeAudioData`.
   - Dynamic 1.5s exponential crossfading between state tracks (`bgm_menu`, `bgm_gameplay`, `bgm_gameover`).
   - Bullet-Time Dynamic Low-Pass Ducking: Automatically drops cutoff frequency to 650 Hz during slow-motion grapple charge, restoring to 20,000 Hz upon launch.
   - Core Combo Pitch Ramp: Consecutive core pickups scale pitch by `+1 semitone` per pickup up to an 8x multiplier.

2. **Tier 2 - Procedural Web Audio Synthesizer Fallback (Zero-Asset Failsafe)**:
   - If any audio asset is missing, network is offline, or decoding is pending, the built-in procedural audio generator (`playProceduralAmbient` & `playProceduralSfx`) immediately synthesizes rich multi-oscillator synthwave space chords and sound effects with zero latency and 0 bytes downloaded.

---

## 2. Google Lyria 3.5 & MusicFX Generation Guide

Google Lyria 3.5 (DeepMind's flagship music foundation model) and MusicFX generate high-resolution synthwave, electronic, and ambient game loops.

To generate custom studio-quality tracks for Sling Jump, use the following tested prompt matrices in **Google AI Studio (Lyria)** or **MusicFX**:

### Track 1: Main Menu Theme (`bgm_menu.mp3`)
- **Target Duration:** 60 - 90 seconds (seamless loop)
- **BPM:** 95 BPM
- **Key:** A Minor / D Dorian
- **Prompt:**
  ```text
  Cosmic ambient synthwave, ethereal retrofuturistic space arcade menu, warm analog Juno pads, gentle shimmering arpeggiated bells, soft sub bass pulse, 95 BPM, cinematic minimalism, spatial reverb, no drums or subtle soft kick, looping game soundtrack
  ```
- **Destination:** `assets/audio/music/bgm_menu.mp3`

---

### Track 2: Gameplay Theme (`bgm_gameplay.mp3`)
- **Target Duration:** 90 - 120 seconds (seamless loop)
- **BPM:** 128 BPM
- **Key:** D Minor
- **Prompt:**
  ```text
  Driving 128 BPM synthwave arcade action, punchy retro analog bassline, energetic electronic pulse, crisp sidechained synth chords, melodic neon arpeggios, high-octane cosmic ascent, clean mix, arcade rhythm, seamless loop
  ```
- **Destination:** `assets/audio/music/bgm_gameplay.mp3`

---

### Track 3: Game Over Theme (`bgm_gameover.mp3`)
- **Target Duration:** 8 - 15 seconds (one-shot sting)
- **BPM:** 80 BPM
- **Key:** D Minor resolving to C
- **Prompt:**
  ```text
  Dramatic space descent, poignant cinematic synth chord resolution, deep sub-bass fadeout, celestial reverb decay, nostalgic arcade loss sting, 10 seconds, zero drums
  ```
- **Destination:** `assets/audio/music/bgm_gameover.mp3`

---

## 3. Sound Effects Generation Matrix (Lyria / AudioFX)

| SFX Key | Filename | Prompt / Sound Description |
| :--- | :--- | :--- |
| `sfx_grapple_lock` | `sfx_grapple_lock.wav` | *Snappy high-tech magnetic lock-on click, futuristic laser grapple tether, short 100ms vector ping* |
| `sfx_slingshot_boost` | `sfx_slingshot_boost.wav` | *Powerful kinetic sling launch whoosh, rising frequency vector release, punchy futuristic propulsion, 350ms* |
| `sfx_core_pickup` | `sfx_core_pickup.wav` | *Sparkling crystalline harmonic chime, collectible energy orb ding, high pitch bell resonance, 250ms* |
| `sfx_node_shatter` | `sfx_node_shatter.wav` | *Crystalline glass star shattering into energy shards, crisp geometric fracture with sub bass pop, 250ms* |
| `sfx_near_miss` | `sfx_near_miss.wav` | *High-speed orbital flyby zip, Doppler whistle effect, tension vector swoosh, 200ms* |
| `sfx_crash` | `sfx_crash.wav` | *Deep kinetic hull impact rumble, electrical shield dispersal crunch, 800ms* |
| `sfx_ui_click` | `sfx_ui_click.wav` | *Clean minimalist tactile vector UI click, subtle glass tap, 50ms* |

---

## 4. How to Update In-Game Audio Assets

1. Generate your `.mp3` or `.wav` files using the prompts above.
2. Export as **44.1 kHz, 16-bit Stereo or Mono**.
3. Place music files into:
   ```
   assets/audio/music/
     ├── bgm_menu.mp3
     ├── bgm_gameplay.mp3
     └── bgm_gameover.mp3
   ```
4. Place sound effects into:
   ```
   assets/audio/sfx/
     ├── sfx_core_pickup.wav
     ├── sfx_crash.wav
     ├── sfx_grapple_lock.wav
     ├── sfx_near_miss.wav
     ├── sfx_node_shatter.wav
     ├── sfx_slingshot_boost.wav
     └── sfx_ui_click.wav
   ```
5. Reload the game. `AudioManager.js` will automatically detect, decode, and use the new assets with procedural failover preserved!

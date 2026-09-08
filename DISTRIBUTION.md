# Space Jump - Distribution & Hosting Guide

> Live: [`https://bauerjohannes2-max.github.io/space-jump/`](https://bauerjohannes2-max.github.io/space-jump/)  
> Repository: [`https://github.com/bauerjohannes2-max/space-jump`](https://github.com/bauerjohannes2-max/space-jump)  
> Host: GitHub Pages Global Edge CDN (SSL/HTTPS, PWA Offline Support)

---

## 1. Access & Installation
- **Permanent URL:** `https://bauerjohannes2-max.github.io/space-jump/` (24/7 global access).
- **iOS Safari:** Share -> "Add to Home Screen" (runs fullscreen PWA).
- **Android Chrome:** Menu -> "Install App" / "Add to Home Screen".
- **Auto-Update:** Git push to `main` triggers auto-deploy via GitHub Actions in 30-60s.

---

## 2. Release & Platform Matrix
| Platform | Target Model | Integration |
| :--- | :--- | :--- |
| **CrazyGames / Poki** | Ad-Revenue Share | Initialize platform SDK in `main.js`, upload HTML5 zip |
| **itch.io** | Web / Direct Download | Upload HTML5 zip, set title & screenshot |
| **Steam** | Paid Download ($1.99 - $2.99) | Tauri desktop wrapper (`src-tauri/`), compile native exe |

---

## 3. Launch Checklist
- [x] Zero emojis, pure vector and canvas rendering
- [x] Web Audio API with procedural synth fallback
- [x] Local storage persistence & Global Top-100 Leaderboards
- [x] Responsive 9:16 mobile / desktop viewport
- [x] Forward-reach solver (guaranteed playable leaps)
- [ ] Share score canvas snapshot export
- [ ] Ad SDK adapter (CrazyGames/Poki)
- [ ] Tauri desktop build configuration

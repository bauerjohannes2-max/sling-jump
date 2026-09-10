/**
 * Space Jump - WorldManager
 * Pure Procedural Generation Engine with Mathematical Reachability Solver,
 * Gentle Difficulty Scaling, Dynamic Path Branching & Parallax Starfield.
 */
class WorldManager {
  constructor(storageService) {
    this.storage = storageService;
    this.nodes = [];
    this.energyOrbs = [];
    this.stars = [];
    this.highestGeneratedY = 0;
    this.lastNodeType = 'STANDARD';
    this.lastNodeX = 0;
    this.lastNodeY = 0;
    this.nodesSinceLastBoost = 10;

    this.currentTheme = this.getActiveTheme();
  }

  getActiveTheme() {
    const themeId = this.storage ? this.storage.data.selectedTheme : 'deep_space';
    return CONSTANTS.THEMES.find(t => t.id === themeId) || CONSTANTS.THEMES[0];
  }

  setTheme(themeId) {
    this.currentTheme = CONSTANTS.THEMES.find(t => t.id === themeId) || CONSTANTS.THEMES[0];
    if (this.storage) {
      this.storage.data.selectedTheme = this.currentTheme.id;
      this.storage.save();
    }
  }

  initStarfield(width, height) {
    this.stars = [];
    const numStars = Math.min(72, Math.floor((width * height) / 9000));
    for (let i = 0; i < numStars; i++) {
      const r = Math.random();
      const layer = r < 0.45 ? 0.20 : (r < 0.80 ? 0.45 : 0.75);
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.4 + 0.6,
        layer: layer,
        twinkleSpeed: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.45 + 0.35
      });
    }
  }

  reset(width, height) {
    this.nodes = [];
    this.energyOrbs = [];
    this.highestGeneratedY = 0;
    this.nodesSinceLastBoost = 10;
    this.currentTheme = this.getActiveTheme();

    // 1. Fully Procedural Start (Randomized initial node around viewport center)
    const startY = Math.max(320, Math.floor(height * 0.48));
    this.startY = startY;
    const randomStartOffsetX = (Math.random() - 0.5) * 80;
    const startX = Math.max(80, Math.min(width - 80, width / 2 + randomStartOffsetX));

    const startNode = new OrbitNode(startX, startY, 'STANDARD', width, 0);
    this.nodes.push(startNode);

    this.lastNodeX = startX;
    this.lastNodeY = startY;
    this.lastNodeType = 'STANDARD';
    this.highestGeneratedY = startY;

    // 2. Generate procedural upward trajectory
    this.generateUpTo(startY + height * 2.5, width, startY - height * 0.5);

    return startNode;
  }

  generateUpTo(targetY, width, cameraY) {
    const baseOriginY = (this.startY !== undefined && this.startY !== null) ? this.startY : 0;
    while (this.highestGeneratedY < targetY) {
      const altitude = Math.max(0, (this.highestGeneratedY - baseOriginY) * CONSTANTS.PHYSICS.METERS_PER_PIXEL);

      // 1. EARLIER & PROGRESSIVE DIFFICULTY SCALING CURVE
      let minGap, maxGap;
      let typeProbabilities = { standard: 1.0, boost: 0.0, moving: 0.0, fragile: 0.0, decoy: 0.0 };
      let forkProbability = 0.0;

      if (altitude < 250) {
        // ZONE 1: START & KALIBRIERUNG (0m - 250m) -> Solide Basis mit dezenter Dynamik
        minGap = 160;
        maxGap = 205;
        typeProbabilities = { standard: 0.90, moving: 0.10, boost: 0.0, fragile: 0.0, decoy: 0.0 };
        forkProbability = 0.04;
      } else if (altitude < 750) {
        // ZONE 2: ERDORBIT & ERSTE BEWEGUNG (250m - 750m) -> Weniger Standard-Knoten, spürbare Dynamik
        minGap = 175;
        maxGap = 225;
        typeProbabilities = { standard: 0.65, moving: 0.22, boost: 0.05, fragile: 0.08, decoy: 0.0 };
        forkProbability = 0.05;
      } else if (altitude < 2000) {
        // ZONE 3: STRATOSPHÄRE (750m - 2000m) -> Taktische Zeituhr- (20%) + Pendel (28%)
        minGap = 195;
        maxGap = 250;
        typeProbabilities = { standard: 0.44, moving: 0.28, fragile: 0.20, boost: 0.05, decoy: 0.03 };
        forkProbability = 0.04;
      } else if (altitude < 5000) {
        // ZONE 4: MESOSPHÄRE (2000m - 5000m) -> Anspruchsvolle Abstände, 26% Zeituhr, 30% Pendel
        minGap = 215;
        maxGap = 270;
        typeProbabilities = { standard: 0.34, moving: 0.30, fragile: 0.26, decoy: 0.06, boost: 0.04 };
        forkProbability = 0.03;
      } else if (altitude < 9000) {
        // ZONE 5: THERMOSPHÄRE (5000m - 9000m) -> Weite Sprünge, 34% Fragile, 30% Moving, 7% Decoy
        minGap = 230;
        maxGap = 290;
        typeProbabilities = { standard: 0.26, moving: 0.30, fragile: 0.34, decoy: 0.07, boost: 0.03 };
        forkProbability = 0.03;
      } else if (altitude < 14000) {
        // ZONE 6: TIEFRAUM-GEFAHRENZONE (9000m - 14000m) -> Präzisions-Climber, 40% Fragile
        minGap = 240;
        maxGap = 305;
        typeProbabilities = { standard: 0.20, moving: 0.30, fragile: 0.40, decoy: 0.08, boost: 0.02 };
        forkProbability = 0.03;
      } else {
        // ZONE 7: MEISTER-KOSMOS (14000m+) -> Höchste Meisterschaft, 44% Zeituhr, weite Distanzen
        minGap = 250;
        maxGap = 320;
        typeProbabilities = { standard: 0.16, moving: 0.30, fragile: 0.44, decoy: 0.08, boost: 0.02 };
        forkProbability = 0.03;
      }

      // If previous node was a Super-Boost, grant an expansive catapult gap
      if (this.lastNodeType === 'BOOST') {
        minGap = 340;
        maxGap = 420;
        forkProbability = 0.0;
      }

      // If previous node was Fragile or Decoy, guarantee a solid, reachable landing node
      if (this.lastNodeType === 'FRAGILE' || this.lastNodeType === 'DECOY') {
        minGap = 165;
        maxGap = 205;
      }

      const gap = Math.random() * (maxGap - minGap) + minGap;
      const nextY = this.highestGeneratedY + gap;
      this.highestGeneratedY = nextY;

      // 2. MATHEMATICAL REACHABILITY SOLVER FOR HORIZONTAL PLACEMENT
      const edgePadding = Math.min(85, width * 0.12);
      const maxHorizontalReach = Math.min(width * 0.42, 220);
      let minX = Math.max(edgePadding, this.lastNodeX - maxHorizontalReach);
      let maxX = Math.min(width - edgePadding, this.lastNodeX + maxHorizontalReach);

      if (maxX - minX < 140) {
        minX = edgePadding;
        maxX = width - edgePadding;
      }

      // 3. PROCEDURAL PATTERN DISPATCH: DUAL-PATH FORK vs SINGLE NODE
      const isFork = Math.random() < forkProbability && this.lastNodeType !== 'BOOST' && width > 420;

      if (isFork) {
        // Spawns 2 alternative tactical path nodes (Left and Right)
        const leftX = Math.random() * (width * 0.35 - edgePadding) + edgePadding;
        const rightX = Math.random() * (width - edgePadding - width * 0.65) + width * 0.65;

        // Guaranteed safety: at most one fork branch can be tricky/fragile
        const leftType = 'STANDARD';
        const forkBoostChance = altitude >= 10000 ? 0.015 : 0.04;
        let rightType = 'STANDARD';
        if (Math.random() < forkBoostChance && this.nodesSinceLastBoost >= 8) {
          rightType = 'BOOST';
          this.nodesSinceLastBoost = 0;
        } else {
          rightType = Math.random() < 0.2 ? 'MOVING' : 'STANDARD';
          this.nodesSinceLastBoost++;
        }

        const nodeLeft = new OrbitNode(leftX, nextY, leftType, width, altitude);
        const nodeRight = new OrbitNode(rightX, nextY + (Math.random() * 20 - 10), rightType, width, altitude);

        this.nodes.push(nodeLeft);
        this.nodes.push(nodeRight);

        // Rare coin collectible in fork corridors (16% chance)
        if (Math.random() < 0.16) {
          this.addSafeStar((leftX + rightX) / 2, nextY, width);
        }

        // Choose one as anchor for next step
        this.lastNodeX = Math.random() < 0.5 ? leftX : rightX;
        this.lastNodeType = 'STANDARD';
      } else {
        // Single Procedural Node
        let nodeX = Math.random() * (maxX - minX) + minX;

        // Alternating rhythm for natural flight momentum
        if (this.lastNodeX < width * 0.45) {
          nodeX = Math.random() * (width - width * 0.45 - 70) + (width * 0.45);
        } else if (this.lastNodeX > width * 0.55) {
          nodeX = Math.random() * (width * 0.55 - 70) + 70;
        }

        // Determine Type with Safety Rules
        let type = 'STANDARD';
        const rand = Math.random();

        const pBoost = typeProbabilities.boost;
        const pMoving = pBoost + typeProbabilities.moving;
        const pFragile = pMoving + typeProbabilities.fragile;
        const pDecoy = pFragile + typeProbabilities.decoy;

        if (rand < pBoost) {
          type = 'BOOST';
        } else if (rand < pMoving) {
          type = 'MOVING';
        } else if (rand < pFragile) {
          // SAFETY RULE: Never 2 fragile/decoy nodes consecutively
          type = (this.lastNodeType !== 'FRAGILE' && this.lastNodeType !== 'DECOY') ? 'FRAGILE' : 'STANDARD';
        } else if (rand < pDecoy) {
          type = (this.lastNodeType !== 'FRAGILE' && this.lastNodeType !== 'DECOY') ? 'DECOY' : 'STANDARD';
        } else {
          type = 'STANDARD';
        }

        // Enforce 8-node cooldown on BOOST nodes (prevents turbo spam, esp. >= 10,000m)
        if (type === 'BOOST') {
          if (this.nodesSinceLastBoost < 8) {
            type = Math.random() < 0.3 ? 'MOVING' : 'STANDARD';
            this.nodesSinceLastBoost++;
          } else {
            this.nodesSinceLastBoost = 0;
          }
        } else {
          this.nodesSinceLastBoost++;
        }

        const newNode = new OrbitNode(nodeX, nextY, type, width, altitude);

        if (type === 'MOVING') {
          newNode.moveRange = Math.min(width * 0.20, 100);
        }

        this.nodes.push(newNode);
        this.lastNodeX = nodeX;
        this.lastNodeType = type;

        // 4. PROCEDURAL COLLECTIBLE FLIGHT FORMATIONS (Balanced rarity: ~35% spawn chance)
        const prevNode = this.nodes[this.nodes.length - 2];
        this.spawnStarFormation(prevNode, newNode, width);
      }

      // 5. LETHAL HAZARD SPACE MINE SPAWN (Starts at 5,000m - earlier tactical danger)
      const mineChance = altitude >= 12000 ? 0.10 : 0.06;
      if (altitude >= 5000 && Math.random() < mineChance) {
        const prevNode = this.nodes[this.nodes.length - 2] || this.nodes[this.nodes.length - 1];
        if (prevNode && prevNode.type !== 'HAZARD') {
          const midY = (prevNode.y + nextY) / 2;
          const mineX = Math.random() * (width - 160) + 80;
          const distPrev = Math.hypot(mineX - prevNode.x, midY - prevNode.y);
          const distNext = Math.hypot(mineX - this.lastNodeX, midY - nextY);
          if (distPrev > 82 && distNext > 82) {
            const hazardMine = new OrbitNode(mineX, midY, 'HAZARD', width, altitude);
            this.nodes.push(hazardMine);
          }
        }
      }

      this.lastNodeY = nextY;
    }

    // In-place compaction (Zero array reallocation)
    const cleanupThreshold = cameraY - 140;
    let keepNodeCount = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      if (n.y > cleanupThreshold || n.isHooked) {
        this.nodes[keepNodeCount++] = n;
      }
    }
    this.nodes.length = keepNodeCount;

    let keepOrbCount = 0;
    for (let i = 0; i < this.energyOrbs.length; i++) {
      const o = this.energyOrbs[i];
      if (o.y > cleanupThreshold && !o.collected) {
        this.energyOrbs[keepOrbCount++] = o;
      }
    }
    this.energyOrbs.length = keepOrbCount;
  }

  /**
   * Helper to safely add an EnergyOrb or Hyper-Kristall only if strictly outside all node circles (min 68-76px)
   */
  addSafeStar(x, y, width, type = 'COIN') {
    if (x < 35 || x > width - 35) return false;

    // Strict Node Exclusion Rule: Never inside or touching any node circle
    const MIN_NODE_DIST = type === 'CRYSTAL' ? 76 : 68;
    for (const node of this.nodes) {
      if (Math.hypot(x - node.x, y - node.y) < MIN_NODE_DIST) {
        return false;
      }
    }

    // Avoid clustering over existing stars
    for (const orb of this.energyOrbs) {
      if (Math.hypot(x - orb.x, y - orb.y) < 24) {
        return false;
      }
    }

    this.energyOrbs.push(new EnergyOrb(x, y, type));
    return true;
  }

  /**
   * Spawns rewarding geometric star formations along natural ballistic flight corridors
   */
  spawnStarFormation(prevNode, newNode, width) {
    if (!prevNode || !newNode) return;

    const dx = newNode.x - prevNode.x;
    const dy = newNode.y - prevNode.y;

    // 1. Ultra-Rare Hyper-Kristall Spawn (Ultra-rare: 0.25% chance above 8,000m deep space altitude)
    const baseOriginY = (this.startY !== undefined && this.startY !== null) ? this.startY : 0;
    const currentAltitudeMeters = Math.max(0, (this.lastNodeY - baseOriginY) * (CONSTANTS.PHYSICS.METERS_PER_PIXEL || 0.125));
    const hasNearbyCrystal = this.energyOrbs.some(o => o.type === 'CRYSTAL' && Math.abs(o.y - this.lastNodeY) < 6000);
    if (currentAltitudeMeters >= 8000 && !hasNearbyCrystal && Math.random() < 0.0025) {
      const crystalX = Math.random() * (width - 140) + 70;
      const crystalY = (prevNode.y + newNode.y) / 2 + (Math.random() * 20 - 10);
      this.addSafeStar(crystalX, crystalY, width, 'CRYSTAL');
    }

    // 2. Turbo Boost Vertical Rocket Stream (2 focused coins above catapult node)
    if (prevNode.type === 'BOOST') {
      const starCount = 2;
      const stepY = dy / (starCount + 1);
      for (let i = 1; i <= starCount; i++) {
        const sx = prevNode.x + (dx * (i / (starCount + 1))) * 0.25;
        const sy = prevNode.y + stepY * i;
        this.addSafeStar(sx, sy, width);
      }
      return;
    }

    // 3. Balanced rarity (16% spawn chance across normal gaps)
    if (Math.random() > 0.16) {
      return;
    }

    const roll = Math.random();

    if (roll < 0.60) {
      // Single Arc Coin in the midpoint of the flight path
      const midX = (prevNode.x + newNode.x) / 2;
      const midY = (prevNode.y + newNode.y) / 2 + 10;
      this.addSafeStar(midX, midY, width);
    } else {
      // Direct Laser Line: 2 coins aligned on the jump vector
      const count = 2;
      for (let i = 1; i <= count; i++) {
        const t = (i) / (count + 1);
        const sx = prevNode.x + dx * t;
        const sy = prevNode.y + dy * t;
        this.addSafeStar(sx, sy, width);
      }
    }
  }

  getNearestNode(ship, cameraY = 0) {
    let bestNode = null;
    let bestScore = Infinity;
    const minVisibleY = cameraY - 15;
    const maxReach = CONSTANTS.PHYSICS.HOOK_RANGE;

    for (const node of this.nodes) {
      if (node.isBroken || node.type === 'HAZARD' || node.y < minVisibleY) continue;
      const dx = node.x - ship.x;
      const dy = node.y - ship.y;
      const dist = Math.hypot(dx, dy);

      if (dist > maxReach) continue;

      // Directional weighting: prioritize forward flight trajectory
      const spd = Math.hypot(ship.vx, ship.vy);
      let directionFactor = 1.0;

      if (spd > 40 && dist > 10) {
        const dot = (dx * ship.vx + dy * ship.vy) / (dist * spd);
        if (dot > 0.3) {
          directionFactor = 0.85; // Favorable forward target
        } else if (dot < -0.2) {
          directionFactor = 1.35; // Behind ship penalty
        }
      }

      // Vertical bias: nodes slightly above or level with ship receive natural priority
      if (dy < -25) {
        directionFactor *= 1.25; // Below ship penalty
      } else if (dy > 0) {
        directionFactor *= 0.95; // Above ship bonus
      }

      const score = dist * directionFactor;
      if (score < bestScore) {
        bestScore = score;
        bestNode = node;
      }
    }

    // Fallback: if no node in maxReach, find nearest visible for faint visual cues
    if (!bestNode) {
      let closestDist = Infinity;
      for (const node of this.nodes) {
        if (node.isBroken || node.y < minVisibleY) continue;
        const d = Math.hypot(ship.x - node.x, ship.y - node.y);
        if (d < closestDist) {
          closestDist = d;
          bestNode = node;
        }
      }
    }

    return bestNode;
  }

  drawBackground(context, width, height, cameraY, now = 0, playerVy = 0) {
    const theme = this.currentTheme;

    // Fill only the viewport (plus a thin shake pad). A 50% pad used to paint 4× pixels.
    const pad = 16;
    const totalW = width + pad * 2;
    const totalH = height + pad * 2;

    // 1. Cached Atmospheric Deep-Space Gradient Fill (Pure pitch black void)
    if (!this._bgGrad || this._bgGradTheme !== theme.id || this._bgGradH !== totalH) {
      this._bgGrad = context.createLinearGradient(0, -pad, 0, height + pad);
      this._bgGrad.addColorStop(0, '#020306');
      this._bgGrad.addColorStop(0.5, '#010204');
      this._bgGrad.addColorStop(1, '#000000');
      this._bgGradTheme = theme.id;
      this._bgGradH = totalH;
    }
    context.fillStyle = this._bgGrad;
    context.fillRect(-pad, -pad, totalW, totalH);

    // 2. Parallax Cyber-Grid: DELETED per user request (pure cosmic void)
    // 3. Ambient Celestial Nebulae: DELETED per user request (eliminates white brush/lighting haze)

    // 4. Smooth Parallax Starfield (Pure vertical motion, zero horizontal drift)
    const isWarpSpeed = playerVy > 320;
    const warpFactor = isWarpSpeed ? Math.min(1.0, (playerVy - 320) / 750) : 0;

    if (warpFactor > 0.05) {
      // Hyperspace Warp Streaks: Clean vertical acceleration
      context.save();
      context.strokeStyle = theme.primary || '#00f0ff';
      context.lineWidth = 1.6;
      context.lineCap = 'round';
      context.globalAlpha = Math.min(0.9, 0.4 + warpFactor * 0.5);
      context.beginPath();

      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];
        const starY = (star.y + cameraY * star.layer) % height;
        const finalY = starY < 0 ? starY + height : starY;
        const finalX = star.x;
        const streakLength = warpFactor * 45 * star.layer;

        context.moveTo(finalX | 0, finalY | 0);
        context.lineTo(finalX | 0, (finalY - streakLength) | 0);
      }
      context.stroke();
      context.restore();
    } else {
      // Batched rectangles: one fillStyle/alpha per layer, no per-star paths
      context.fillStyle = '#ffffff';
      context.globalAlpha = 0.55;
      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];
        if (star.layer > 0.3) continue;
        const starY = (star.y + cameraY * star.layer) % height;
        const finalY = starY < 0 ? starY + height : starY;
        const s = Math.max(1, (star.size * 0.8) | 0);
        context.fillRect((star.x - s) | 0, (finalY - s) | 0, s + s, s + s);
      }

      context.globalAlpha = 0.88;
      context.fillStyle = '#ffffff';
      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];
        if (star.layer <= 0.3 || (i % 3 === 0)) continue;
        const starY = (star.y + cameraY * star.layer) % height;
        const finalY = starY < 0 ? starY + height : starY;
        const s = Math.max(1, star.size | 0);
        context.fillRect((star.x - s) | 0, (finalY - s) | 0, s + s, s + s);
      }
      context.fillStyle = theme.primary || '#00f0ff';
      for (let i = 0; i < this.stars.length; i++) {
        if (i % 3 !== 0) continue;
        const star = this.stars[i];
        if (star.layer <= 0.3) continue;
        const starY = (star.y + cameraY * star.layer) % height;
        const finalY = starY < 0 ? starY + height : starY;
        const s = Math.max(1, star.size | 0);
        context.fillRect((star.x - s) | 0, (finalY - s) | 0, s + s, s + s);
      }
      context.globalAlpha = 1.0;
    }
  }

  drawBottomDeathBoundary(context, timestamp, width, height) {
    const theme = this.currentTheme;
    const glowHeight = 48;
    const padX = 24;
    const drawWidth = width + padX * 2;
    const glowKey = height + '_' + (theme.id || '');

    if (!this._voidGrad || this._voidGradKey !== glowKey) {
      const gradient = context.createLinearGradient(0, height - glowHeight, 0, height + 36);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.45, theme.voidGlow || 'rgba(225, 29, 72, 0.42)');
      gradient.addColorStop(1, theme.voidColor || '#e11d48');
      this._voidGrad = gradient;
      this._voidGradKey = glowKey;
    }

    const pulse = 0.82 + Math.sin(timestamp * 0.004) * 0.18;
    context.globalAlpha = pulse;
    context.fillStyle = this._voidGrad;
    context.fillRect(-padX, height - glowHeight, drawWidth, glowHeight + 80);

    context.globalAlpha = 0.32 * pulse;
    context.strokeStyle = '#e11d48';
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(-padX, height - 2);
    context.lineTo(width + padX, height - 2);
    context.stroke();

    context.globalAlpha = 1;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-padX, height - 2);
    context.lineTo(width + padX, height - 2);
    context.stroke();
  }
}

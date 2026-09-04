/**
 * Sling Jump - WorldManager
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
    const numStars = Math.floor((width * height) / 4500);
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.6,
        layer: Math.random() < 0.65 ? 0.15 : 0.45,
        twinkleSpeed: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.5 + 0.25
      });
    }
  }

  reset(width, height) {
    this.nodes = [];
    this.energyOrbs = [];
    this.highestGeneratedY = 0;
    this.currentTheme = this.getActiveTheme();

    // 1. Fully Procedural Start (Randomized initial node around viewport center)
    const startY = Math.max(320, Math.floor(height * 0.48));
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
    while (this.highestGeneratedY < targetY) {
      const altitude = this.highestGeneratedY * CONSTANTS.PHYSICS.METERS_PER_PIXEL;

      // 1. EARLIER & PROGRESSIVE DIFFICULTY SCALING CURVE
      let minGap, maxGap;
      let typeProbabilities = { standard: 1.0, boost: 0.0, moving: 0.0, fragile: 0.0, decoy: 0.0 };
      let forkProbability = 0.0;

      if (altitude < 500) {
        // ZONE 1: START & KALIBRIERUNG (0m - 500m) -> 100% Solide Basis-Anker
        minGap = 140;
        maxGap = 180;
        typeProbabilities = { standard: 1.0, boost: 0.0, moving: 0.0, fragile: 0.0, decoy: 0.0 };
        forkProbability = 0.15;
      } else if (altitude < 1500) {
        // ZONE 2: STRATOSPHÄRE (500m - 1500m) -> Grüne Super-Boost Katapulte (~8%)
        minGap = 150;
        maxGap = 195;
        typeProbabilities = { standard: 0.92, boost: 0.08, moving: 0.0, fragile: 0.0, decoy: 0.0 };
        forkProbability = 0.15;
      } else if (altitude < 3500) {
        // ZONE 3: MESOSPHÄRE (1500m - 3500m) -> Erste horizontale Pendelknoten (20%)
        minGap = 165;
        maxGap = 215;
        typeProbabilities = { standard: 0.72, moving: 0.20, boost: 0.08, fragile: 0.0, decoy: 0.0 };
        forkProbability = 0.14;
      } else if (altitude < 6500) {
        // ZONE 4: THERMOSPHÄRE (3500m - 6500m) -> Zeituhr-Knoten mit Countdown (14%) + mehr Bewegliche (24%)
        minGap = 180;
        maxGap = 235;
        typeProbabilities = { standard: 0.54, moving: 0.24, fragile: 0.14, boost: 0.08, decoy: 0.0 };
        forkProbability = 0.12;
      } else if (altitude < 10000) {
        // ZONE 5: EXOSPHÄRE (6500m - 10000m) -> Zeituhr (18%) + Bewegliche (28%) + Köder-Fissuren (8%)
        minGap = 190;
        maxGap = 245;
        typeProbabilities = { standard: 0.40, moving: 0.28, fragile: 0.18, decoy: 0.08, boost: 0.06 };
        forkProbability = 0.10;
      } else if (altitude < 15000) {
        // ZONE 6: TIEFRAUM-GEFAHRENZONE (10000m - 15000m) -> Zeituhr (22%) + Bewegliche (32%) + Weltraum-Minen
        minGap = 195;
        maxGap = 250;
        typeProbabilities = { standard: 0.28, moving: 0.32, fragile: 0.22, decoy: 0.10, boost: 0.08 };
        forkProbability = 0.10;
      } else {
        // ZONE 7: MEISTER-KOSMOS (15000m+) -> Extreme Dynamik (26% Zeituhr + 36% Beweglich) + hohe Minendichte
        minGap = 200;
        maxGap = 260;
        typeProbabilities = { standard: 0.18, moving: 0.36, fragile: 0.26, decoy: 0.12, boost: 0.08 };
        forkProbability = 0.10;
      }

      // If previous node was a Super-Boost, grant an expansive catapult gap
      if (this.lastNodeType === 'BOOST') {
        minGap = 320;
        maxGap = 400;
        forkProbability = 0.0;
      }

      // If previous node was Fragile or Decoy, guarantee a very close, solid landing node
      if (this.lastNodeType === 'FRAGILE' || this.lastNodeType === 'DECOY') {
        minGap = 145;
        maxGap = 180;
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
        const rightType = Math.random() < 0.10 ? 'BOOST' : (Math.random() < 0.2 ? 'MOVING' : 'STANDARD');

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

        if (this.lastNodeType === 'BOOST') {
          type = Math.random() < 0.8 ? 'STANDARD' : 'MOVING';
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

      // 5. LETHAL HAZARD SPACE MINE SPAWN (Altitude >= 10,000m)
      const mineChance = altitude >= 15000 ? 0.22 : 0.14;
      if (altitude >= 10000 && Math.random() < mineChance) {
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

    // 1. Ultra-Rare Hyper-Kristall Spawn (~5% chance, strictly above 5,000m deep space altitude)
    const currentAltitudeMeters = this.lastNodeY * (CONSTANTS.PHYSICS.METERS_PER_PIXEL || 0.125);
    if (currentAltitudeMeters >= 5000 && Math.random() < 0.05) {
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

    // Expand drawing boundaries by 50% to prevent camera zoom-out pop-in glitches
    const padX = width * 0.5;
    const padY = height * 0.5;

    // Background Fill
    context.fillStyle = theme.background;
    context.fillRect(-padX, -padY, width + padX * 2, height + padY * 2);

    // Parallax Starfield & Hyperspace Warp Streaks
    context.save();
    const isWarpSpeed = playerVy > 320;
    const warpFactor = isWarpSpeed ? Math.min(1.0, (playerVy - 320) / 750) : 0;

    for (const star of this.stars) {
      // Physical parallax direction fix: as cameraY ascends, background stars move DOWN past ship
      const starY = (star.y + cameraY * star.layer) % height;
      const finalY = starY < 0 ? starY + height : starY;

      const driftX = (now * 0.005 * star.layer);
      const starX = (star.x + driftX) % width;
      const finalX = starX < 0 ? starX + width : starX;

      const twinkle = Math.sin((now * 0.001) * star.twinkleSpeed + star.x) * 0.2;
      context.globalAlpha = Math.max(0.15, Math.min(0.95, star.baseAlpha + twinkle + warpFactor * 0.3));
      const starColor = star.layer > 0.3 ? theme.primary : '#ffffff';
      context.fillStyle = starColor;
      context.strokeStyle = starColor;

      const streakLength = warpFactor * 42 * star.layer;

      if (streakLength > 2.5) {
        // Hyperspace / Warp Speed Laser Streaks streaming downwards
        context.lineWidth = Math.max(1, star.size * 0.85);
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(finalX, finalY);
        context.lineTo(finalX, finalY - streakLength);
        context.stroke();
      } else {
        // Classic Star Point
        context.beginPath();
        context.arc(finalX, finalY, star.size, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  drawBottomDeathBoundary(context, timestamp, width, height) {
    const theme = this.currentTheme;
    context.save();

    const time = timestamp * 0.005;
    const glowHeight = 42 + Math.sin(time) * 8;

    // Extend wide on X (-width to 2*width) to eliminate any gaps during camera zoom-out
    const padX = width * 1.5;
    const drawWidth = width + padX * 2;

    const gradient = context.createLinearGradient(0, height - glowHeight, 0, height + 50);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.4, theme.voidGlow);
    gradient.addColorStop(1, theme.voidColor);

    context.fillStyle = gradient;
    context.fillRect(-padX, height - glowHeight, drawWidth, glowHeight + 100);

    // Primary Laser Horizon
    context.strokeStyle = theme.danger;
    context.shadowColor = theme.danger;
    context.shadowBlur = 18;
    context.lineWidth = 3.5;

    context.beginPath();
    context.moveTo(-padX, height - 2);
    context.lineTo(width + padX, height - 2);
    context.stroke();

    // Secondary Electro-Wave
    context.strokeStyle = theme.primary;
    context.shadowColor = theme.primary;
    context.shadowBlur = 10;
    context.lineWidth = 1.5;

    context.beginPath();
    context.moveTo(-padX, height - 5);
    context.lineTo(width + padX, height - 5);
    context.stroke();

    context.restore();
  }
}

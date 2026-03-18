import type { PetMood, Position, PetSize } from "../shared/types";
import type { PetDefinition } from "../shared/types";

export function buildPetCSS(position: Position, size: PetSize): string {
  const sizeMap: Record<PetSize, number> = { sm: 48, md: 64, lg: 80 };
  const px = sizeMap[size];
  const posCSS = getPositionCSS(position);

  return `
    :host { all: initial; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .pet-root {
      position: fixed;
      ${posCSS}
      z-index: 2147483647;
      width: ${px}px;
      height: ${px}px;
      cursor: pointer;
      user-select: none;
      transition: transform 0.1s ease;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
    }

    .pet-root:hover {
      transform: scale(1.08);
    }

    .pet-root:active {
      transform: scale(0.95);
    }

    /* ── PET BODY ────────────────────── */
    .pet-body {
      position: relative;
      width: 100%;
      height: 80%;
      border-radius: 45% 45% 48% 48%;
      background: var(--body);
      border: 2px solid var(--outline);
      overflow: visible;
      transition: background 0.4s, border-color 0.4s;
    }

    /* ── AURA GLOW ───────────────────── */
    .pet-aura {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: var(--glow);
      filter: blur(12px);
      opacity: 0.6;
      z-index: -1;
      animation: auraPulse 3s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes auraPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.08); }
    }

    /* ── BELLY ───────────────────────── */
    .pet-belly {
      position: absolute;
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
      width: 55%;
      height: 45%;
      border-radius: 50%;
      background: var(--belly);
      opacity: 0.7;
    }

    /* ── EARS ─────────────────────────── */
    .pet-ears {
      position: absolute;
      top: -30%;
      left: 0;
      right: 0;
      height: 40%;
      pointer-events: none;
    }

    .pet-ear {
      position: absolute;
      background: var(--ear);
      transition: transform 0.3s ease;
    }

    .pet-ear-inner {
      position: absolute;
      background: var(--ear-inner);
    }

    /* Floppy ears (Dog) */
    .ear-floppy .pet-ear {
      width: 32%;
      height: 90%;
      border-radius: 50% 50% 45% 45%;
    }
    .ear-floppy .pet-ear.left {
      left: 2%;
      transform: rotate(-18deg);
      transform-origin: top center;
    }
    .ear-floppy .pet-ear.right {
      right: 2%;
      transform: rotate(18deg);
      transform-origin: top center;
    }
    .ear-floppy .pet-ear-inner {
      width: 55%;
      height: 60%;
      border-radius: 50%;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Pointed ears (Cat, Fox) */
    .ear-pointed .pet-ear {
      width: 28%;
      height: 100%;
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }
    .ear-pointed .pet-ear.left {
      left: 8%;
    }
    .ear-pointed .pet-ear.right {
      right: 8%;
    }
    .ear-pointed .pet-ear-inner {
      width: 50%;
      height: 55%;
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Round ears (Lion, Tiger, Panda) */
    .ear-round .pet-ear {
      width: 30%;
      height: 75%;
      border-radius: 50%;
    }
    .ear-round .pet-ear.left {
      left: 4%;
    }
    .ear-round .pet-ear.right {
      right: 4%;
    }
    .ear-round .pet-ear-inner {
      width: 55%;
      height: 55%;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    /* Long ears (Bunny) */
    .ear-long .pet-ear {
      width: 22%;
      height: 160%;
      border-radius: 50% 50% 40% 40%;
    }
    .ear-long .pet-ear.left {
      left: 12%;
      transform: rotate(-8deg);
    }
    .ear-long .pet-ear.right {
      right: 12%;
      transform: rotate(8deg);
    }
    .ear-long .pet-ear-inner {
      width: 55%;
      height: 80%;
      border-radius: 50%;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
    }

    /* ── FACE ─────────────────────────── */
    .pet-face {
      position: absolute;
      top: 18%;
      left: 50%;
      transform: translateX(-50%);
      width: 75%;
      height: 60%;
    }

    /* ── EYES ─────────────────────────── */
    .pet-eyes {
      display: flex;
      justify-content: space-between;
      padding: 0 8%;
      margin-top: 10%;
    }

    .pet-eye {
      width: 22%;
      aspect-ratio: 1;
      background: var(--eye);
      border-radius: 50%;
      position: relative;
      transition: all 0.3s ease;
    }

    .pet-eye .pupil {
      position: absolute;
      width: 45%;
      height: 45%;
      background: var(--pupil);
      border-radius: 50%;
      top: 25%;
      left: 30%;
      transition: all 0.15s ease;
    }

    .pet-eye .shine {
      position: absolute;
      width: 25%;
      height: 25%;
      background: #FFFFFF;
      border-radius: 50%;
      top: 15%;
      right: 18%;
    }

    /* ── NOSE ─────────────────────────── */
    .pet-nose {
      width: 16%;
      height: 14%;
      background: var(--nose);
      border-radius: 50% 50% 45% 45%;
      margin: 4% auto 0;
    }

    /* ── MOUTH ────────────────────────── */
    .pet-mouth {
      width: 30%;
      height: 8%;
      margin: 2% auto 0;
      border-bottom: 2px solid var(--outline);
      border-radius: 0 0 50% 50%;
      opacity: 0.5;
    }

    /* ── BLUSH ────────────────────────── */
    .pet-blush {
      position: absolute;
      bottom: 25%;
      width: 20%;
      height: 12%;
      border-radius: 50%;
      background: var(--blush);
      opacity: 0.5;
    }
    .pet-blush.left { left: 2%; }
    .pet-blush.right { right: 2%; }

    /* ── WHISKERS ─────────────────────── */
    .pet-whiskers {
      position: absolute;
      bottom: 28%;
      left: 0;
      right: 0;
    }
    .whisker {
      position: absolute;
      height: 1px;
      width: 35%;
      background: var(--outline);
      opacity: 0.4;
    }
    .whisker.tl { top: 0; left: -8%; transform: rotate(-8deg); }
    .whisker.bl { top: 4px; left: -6%; transform: rotate(5deg); }
    .whisker.tr { top: 0; right: -8%; transform: rotate(8deg); }
    .whisker.br { top: 4px; right: -6%; transform: rotate(-5deg); }

    /* ── MANE (Lion) ─────────────────── */
    .pet-mane {
      position: absolute;
      inset: -18%;
      border-radius: 50%;
      background: var(--special);
      z-index: -1;
      mask-image: radial-gradient(circle, transparent 52%, black 53%);
      -webkit-mask-image: radial-gradient(circle, transparent 52%, black 53%);
    }

    /* ── STRIPES (Tiger, Cat) ────────── */
    .pet-stripes {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
    }
    .stripe {
      position: absolute;
      background: var(--special);
      border-radius: 2px;
      opacity: 0.6;
    }
    .stripe-1 { width: 18%; height: 3px; top: 15%; left: 20%; transform: rotate(-15deg); }
    .stripe-2 { width: 18%; height: 3px; top: 15%; right: 20%; transform: rotate(15deg); }
    .stripe-3 { width: 22%; height: 3px; top: 35%; left: 10%; transform: rotate(-10deg); }
    .stripe-4 { width: 22%; height: 3px; top: 35%; right: 10%; transform: rotate(10deg); }
    .stripe-5 { width: 15%; height: 3px; top: 55%; left: 15%; transform: rotate(-5deg); }
    .stripe-6 { width: 15%; height: 3px; top: 55%; right: 15%; transform: rotate(5deg); }

    /* ── EYE PATCHES (Panda) ─────────── */
    .pet-patches .pet-eye {
      box-shadow: 0 0 0 3px var(--special), 0 0 0 5px var(--special);
      background: #FFFFFF;
    }

    /* ── TAIL ─────────────────────────── */
    .pet-tail {
      position: absolute;
      bottom: 15%;
      background: var(--tail);
      transition: transform 0.3s ease;
    }

    /* Curvy tail (Dog, Cat) */
    .tail-curvy .pet-tail {
      width: 12%;
      height: 30%;
      right: -10%;
      border-radius: 0 50% 50% 0;
      transform-origin: bottom left;
    }

    /* Bushy tail (Fox) */
    .tail-bushy .pet-tail {
      width: 28%;
      height: 28%;
      right: -18%;
      border-radius: 50%;
      background: var(--tail);
      box-shadow: inset -4px -2px 0 var(--special);
    }

    /* Thin tail (Lion) */
    .tail-thin .pet-tail {
      width: 6%;
      height: 35%;
      right: -8%;
      border-radius: 0 50% 50% 0;
      transform-origin: bottom left;
    }
    .tail-thin .pet-tail::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--special);
    }

    /* Puff tail (Bunny, Panda) */
    .tail-puff .pet-tail {
      width: 16%;
      height: 16%;
      right: -6%;
      border-radius: 50%;
    }

    /* Striped tail (Tiger) */
    .tail-striped .pet-tail {
      width: 10%;
      height: 32%;
      right: -10%;
      border-radius: 0 50% 50% 0;
      background: repeating-linear-gradient(
        0deg,
        var(--tail) 0px,
        var(--tail) 4px,
        var(--special) 4px,
        var(--special) 7px
      );
    }

    /* ── FOX WHITE FACE ──────────────── */
    .pet-fox-face {
      position: absolute;
      bottom: 5%;
      left: 50%;
      transform: translateX(-50%);
      width: 45%;
      height: 40%;
      background: var(--special);
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      opacity: 0.8;
    }

    /* ── SPEECH BUBBLE ───────────────── */
    .speech-bubble {
      position: absolute;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: rgba(255,255,255,0.95);
      color: #1a1a2e;
      padding: 6px 10px;
      border-radius: 12px;
      font: 11px/1.3 system-ui, sans-serif;
      white-space: nowrap;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      pointer-events: none;
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.3s ease;
    }
    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(255,255,255,0.95);
    }
    .speech-bubble.visible {
      transform: translateX(-50%) scale(1);
      opacity: 1;
    }

    /* ── ZZZ (Sleep) ─────────────────── */
    .zzz {
      position: absolute;
      top: -20%;
      right: -15%;
      font-size: 12px;
      opacity: 0;
      pointer-events: none;
    }
    .zzz span {
      display: inline-block;
      animation: zzzFloat 2s ease-in-out infinite;
      opacity: 0.7;
    }
    .zzz span:nth-child(2) { animation-delay: 0.3s; font-size: 10px; }
    .zzz span:nth-child(3) { animation-delay: 0.6s; font-size: 8px; }

    @keyframes zzzFloat {
      0%, 100% { transform: translateY(0); opacity: 0; }
      20% { opacity: 0.7; }
      80% { opacity: 0.7; }
      100% { transform: translateY(-14px); opacity: 0; }
    }

    /* ── MOOD ANIMATIONS ─────────────── */
    /* Idle: gentle float */
    .mood-idle .pet-body { animation: idleBob 3s ease-in-out infinite; }
    .mood-idle .tail-curvy .pet-tail { animation: tailSway 4s ease-in-out infinite; }

    @keyframes idleBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @keyframes tailSway {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(8deg); }
      75% { transform: rotate(-5deg); }
    }

    /* Happy: bouncy */
    .mood-happy .pet-body {
      animation: happyBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
    }
    .mood-happy .pet-eye {
      transform: scaleY(0.7);
    }
    .mood-happy .pet-blush { opacity: 0.8; }
    .mood-happy .pet-tail { animation: tailWag 0.3s ease-in-out infinite alternate !important; }

    @keyframes happyBounce {
      0%, 100% { transform: translateY(0) scaleX(1) scaleY(1); }
      30% { transform: translateY(-6px) scaleX(0.95) scaleY(1.06); }
      60% { transform: translateY(1px) scaleX(1.04) scaleY(0.96); }
    }

    @keyframes tailWag {
      from { transform: rotate(-15deg); }
      to { transform: rotate(15deg); }
    }

    /* Hungry: droopy */
    .mood-hungry .pet-body {
      animation: hungryDroop 4s ease-in-out infinite;
    }
    .mood-hungry .pet-eye {
      transform: scaleY(0.6);
      opacity: 0.7;
    }
    .mood-hungry .pet-blush { opacity: 0; }
    .mood-hungry .pet-mouth {
      border-radius: 50% 50% 0 0;
      border-bottom: none;
      border-top: 2px solid var(--outline);
    }

    @keyframes hungryDroop {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(2px) rotate(-2deg); }
    }

    /* Sleep: slow sway + closed eyes */
    .mood-sleep .pet-body {
      animation: sleepSway 5s ease-in-out infinite;
    }
    .mood-sleep .pet-eye {
      height: 2px !important;
      border-radius: 50%;
      margin-top: 15%;
    }
    .mood-sleep .pet-eye .pupil,
    .mood-sleep .pet-eye .shine { display: none; }
    .mood-sleep .pet-blush { opacity: 0.6; }
    .mood-sleep .zzz { opacity: 1; }

    @keyframes sleepSway {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(1px) rotate(2deg); }
    }

    /* Excited: rapid shake */
    .mood-excited .pet-body {
      animation: excitedShake 0.15s ease-in-out infinite alternate;
    }
    .mood-excited .pet-eye { transform: scale(1.15); }
    .mood-excited .pet-aura { animation: auraFlash 0.5s ease-in-out infinite; }

    @keyframes excitedShake {
      from { transform: translateX(-1px) rotate(-1deg); }
      to { transform: translateX(1px) rotate(1deg); }
    }

    @keyframes auraFlash {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; transform: scale(1.15); }
    }

    /* ── CLICK ANIMATION ─────────────── */
    .pet-root.clicked .pet-body {
      animation: clickSquash 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes clickSquash {
      0% { transform: scale(1); }
      20% { transform: scaleX(1.15) scaleY(0.85); }
      50% { transform: scaleX(0.9) scaleY(1.12); }
      100% { transform: scale(1); }
    }

    /* ── PARTICLES ────────────────────── */
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      pointer-events: none;
      animation: particleBurst 0.6s ease-out forwards;
    }

    @keyframes particleBurst {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); }
    }

    /* ── REDUCED MOTION ──────────────── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

function getPositionCSS(pos: Position): string {
  switch (pos) {
    case "bottom-right":
      return "bottom: 20px; right: 20px;";
    case "bottom-left":
      return "bottom: 20px; left: 20px;";
    case "top-right":
      return "top: 20px; right: 20px;";
    case "top-left":
      return "top: 20px; left: 20px;";
  }
}

export function buildPetHTML(def: PetDefinition, mood: PetMood): string {
  const c = def.colors;
  const vars = `
    --body: ${c.body}; --body-light: ${c.bodyLight}; --outline: ${c.outline};
    --ear: ${c.ear}; --ear-inner: ${c.earInner}; --eye: ${c.eye};
    --pupil: ${c.pupil}; --nose: ${c.nose}; --blush: ${c.blush};
    --belly: ${c.belly}; --tail: ${c.tail}; --special: ${c.special};
    --glow: ${c.glow};
  `.replace(/\n/g, " ");

  const earClass = `ear-${def.earStyle}`;
  const tailClass = `tail-${def.tailStyle}`;
  const patchClass = def.hasPatches ? "pet-patches" : "";

  return `
    <div class="pet-root mood-${mood}" style="${vars}">
      <div class="pet-aura"></div>
      <div class="pet-body ${tailClass}">
        ${def.hasMane ? '<div class="pet-mane"></div>' : ""}
        <div class="pet-belly"></div>
        ${def.id === "fox" ? '<div class="pet-fox-face"></div>' : ""}
        ${
          def.hasStripes
            ? `
          <div class="pet-stripes">
            <div class="stripe stripe-1"></div>
            <div class="stripe stripe-2"></div>
            <div class="stripe stripe-3"></div>
            <div class="stripe stripe-4"></div>
            <div class="stripe stripe-5"></div>
            <div class="stripe stripe-6"></div>
          </div>
        `
            : ""
        }
        <div class="pet-ears ${earClass}">
          <div class="pet-ear left"><div class="pet-ear-inner"></div></div>
          <div class="pet-ear right"><div class="pet-ear-inner"></div></div>
        </div>
        <div class="pet-face ${patchClass}">
          <div class="pet-eyes">
            <div class="pet-eye left">
              <div class="pupil"></div>
              <div class="shine"></div>
            </div>
            <div class="pet-eye right">
              <div class="pupil"></div>
              <div class="shine"></div>
            </div>
          </div>
          <div class="pet-nose"></div>
          <div class="pet-mouth"></div>
          <div class="pet-blush left"></div>
          <div class="pet-blush right"></div>
          ${
            def.hasWhiskers
              ? `
            <div class="pet-whiskers">
              <div class="whisker tl"></div>
              <div class="whisker bl"></div>
              <div class="whisker tr"></div>
              <div class="whisker br"></div>
            </div>
          `
              : ""
          }
        </div>
        <div class="pet-tail"></div>
      </div>
      <div class="zzz"><span>z</span><span>z</span><span>z</span></div>
      <div class="speech-bubble"></div>
    </div>
  `;
}

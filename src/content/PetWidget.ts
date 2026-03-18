import type {
  PetType,
  PetMood,
  Position,
  PetSize,
  EvolutionStage,
} from "../shared/types";
import { getPetDef } from "../shared/pets";
import {
  getStorageData,
  onStorageChange,
  computeEvolutionStage,
} from "../shared/storage";
import { SpringBody } from "./SpringBody";
import { HybridSoundEngine } from "./HybridSoundEngine";
import { buildPetCSS, buildPetHTML } from "./styles";

const BUBBLES: Record<string, string[]> = {
  feed: ["Yum! 🍖", "Tasty! ✨", "More! 🤤", "Delicious! 💫"],
  happy: ["Life is good! 😊", "Woohoo! 🎉", "Best day! ⭐"],
  hungry: ["I'm hungry... 😢", "Feed me? 🥺", "So empty... 💔"],
  sleep: ["zzz...", "So sleepy... 💤", "*yawn*"],
  levelup: ["LEVEL UP! 🚀", "I grew! ⬆️", "POWER UP! ⚡"],
  click: ["Hey! 👋", "That tickles! 😄", "Hehe! 🤭", "Hi there! 💕"],
};

export class PetWidget {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private styleEl: HTMLStyleElement;
  private contentEl: HTMLDivElement;
  private spring: SpringBody;
  private sound: HybridSoundEngine;
  private animFrame = 0;
  private currentType: PetType = "dog";
  private currentMood: PetMood = "idle";
  private currentPosition: Position = "bottom-right";
  private currentSize: PetSize = "md";
  private currentStage: EvolutionStage = 1;
  private bubbleTimer = 0;
  private unsubStorage: (() => void) | null = null;
  private destroyed = false;

  constructor() {
    this.host = document.createElement("div");
    this.host.id = "chotu-pet-host";
    this.shadow = this.host.attachShadow({ mode: "closed" });

    this.styleEl = document.createElement("style");
    this.contentEl = document.createElement("div");

    this.shadow.appendChild(this.styleEl);
    this.shadow.appendChild(this.contentEl);

    this.spring = new SpringBody();
    this.sound = new HybridSoundEngine();

    this.init();
  }

  private async init(): Promise<void> {
    const data = await getStorageData();
    const { petState, settings } = data;

    this.currentType = petState.type;
    this.currentMood = petState.mood;
    this.currentPosition = settings.position;
    this.currentSize = settings.petSize;

    // SOUND UPGRADE: set evolution stage and pet type
    this.currentStage =
      petState.evolutionStage ?? computeEvolutionStage(petState.level);
    this.sound.setStage(this.currentStage);
    this.sound.setPetType(this.currentType);
    this.sound.setEnabled(settings.soundEnabled);
    this.sound.setVolume(settings.volume);
    // Preload audio for current stage (non-blocking)
    this.sound.preloadProfile(this.currentStage);

    this.renderCSS();
    this.renderPet();

    document.body.appendChild(this.host);

    this.bindEvents();
    this.startAnimLoop();

    this.unsubStorage = onStorageChange((changes) => {
      if (changes.petState?.newValue) {
        const ps = changes.petState.newValue as {
          type?: PetType;
          mood?: PetMood;
          level?: number;
          evolutionStage?: EvolutionStage;
        };
        if (ps.type && ps.type !== this.currentType) {
          this.currentType = ps.type;
          // SOUND UPGRADE: update pet type on sound engine
          this.sound.setPetType(this.currentType);
          this.renderPet();
        }
        if (ps.mood && ps.mood !== this.currentMood) {
          const oldMood = this.currentMood;
          this.currentMood = ps.mood;
          this.updateMood();

          if (ps.mood === "happy" && oldMood !== "happy") {
            this.showBubble("feed");
            // SOUND UPGRADE: use hybrid engine play
            this.sound.play("feed");
          }
        }
        // SOUND UPGRADE: handle evolution stage changes
        const newStage =
          ps.evolutionStage ??
          (ps.level ? computeEvolutionStage(ps.level) : undefined);
        if (newStage && newStage !== this.currentStage) {
          this.currentStage = newStage;
          this.sound.setStage(newStage);
          this.sound.preloadProfile(newStage);
        }
      }

      if (changes.settings?.newValue) {
        const s = changes.settings.newValue as {
          position?: Position;
          petSize?: PetSize;
          soundEnabled?: boolean;
          volume?: number;
        };
        if (s.position && s.position !== this.currentPosition) {
          this.currentPosition = s.position;
          this.renderCSS();
        }
        if (s.petSize && s.petSize !== this.currentSize) {
          this.currentSize = s.petSize;
          this.renderCSS();
          this.renderPet();
        }
        if (s.soundEnabled !== undefined) this.sound.setEnabled(s.soundEnabled);
        if (s.volume !== undefined) this.sound.setVolume(s.volume);
      }
    });

    // SOUND UPGRADE: listen for sound preview messages from popup
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(
        (message: { type: string; event?: string; synthOnly?: boolean }) => {
          if (message.type === "PLAY_SOUND" && message.event) {
            this.sound.init();
            this.sound.resume();
            this.sound.play(
              message.event as import("../shared/types").SoundEvent,
            );
          }
        },
      );
    }
  }

  private renderCSS(): void {
    this.styleEl.textContent = buildPetCSS(
      this.currentPosition,
      this.currentSize,
    );
  }

  private renderPet(): void {
    const def = getPetDef(this.currentType);
    this.contentEl.innerHTML = buildPetHTML(def, this.currentMood);
  }

  private updateMood(): void {
    const root = this.shadow.querySelector(".pet-root");
    if (!root) return;
    root.className = root.className.replace(
      /mood-\w+/,
      `mood-${this.currentMood}`,
    );
  }

  private bindEvents(): void {
    this.contentEl.addEventListener("click", () => {
      this.sound.init();
      this.sound.resume();
      // SOUND UPGRADE: use hybrid engine play
      this.sound.play("click");
      this.showBubble("click");
      this.playClickAnim();
      this.spring.impulse(-0.8);
    });

    this.contentEl.addEventListener("mouseenter", () => {
      this.sound.init();
      this.sound.resume();
      // SOUND UPGRADE: play hover sound
      this.sound.play("hover");
    });
  }

  private playClickAnim(): void {
    const root = this.shadow.querySelector(".pet-root");
    if (!root) return;
    root.classList.add("clicked");
    this.emitParticles();
    setTimeout(() => root.classList.remove("clicked"), 400);
  }

  private emitParticles(): void {
    const root = this.shadow.querySelector(".pet-root");
    if (!root) return;
    const def = getPetDef(this.currentType);

    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const angle = (Math.PI * 2 * i) / 6;
      const dist = 20 + Math.random() * 15;
      p.style.setProperty("--px", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--py", `${Math.sin(angle) * dist}px`);
      p.style.background = def.colors.body;
      p.style.left = "50%";
      p.style.top = "40%";
      root.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  private showBubble(category: string): void {
    const bubble = this.shadow.querySelector(".speech-bubble");
    if (!bubble) return;

    const msgs = BUBBLES[category] ?? BUBBLES.click;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    bubble.textContent = msg;
    bubble.classList.add("visible");

    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = window.setTimeout(() => {
      bubble.classList.remove("visible");
    }, 2200);
  }

  private startAnimLoop(): void {
    const loop = () => {
      if (this.destroyed) return;
      const y = this.spring.tick();
      const root = this.shadow.querySelector(".pet-root") as HTMLElement | null;
      if (root) {
        root.style.transform = `translateY(${y}px)`;
      }
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.animFrame);
    clearTimeout(this.bubbleTimer);
    this.unsubStorage?.();
    this.sound.dispose();
    this.host.remove();
  }
}

import { useState, useEffect, type FC } from "react";
import logoUrl from "../assets/logo.png";
import type {
  PetType,
  PetMood,
  Position,
  PetSize,
  PetState,
  Settings,
} from "../shared/types";
import { STAGE_NAMES } from "../shared/types";
import { PET_TYPES, getPetDef } from "../shared/pets";
import {
  getStorageData,
  updatePetState,
  updateSettings,
  computeEvolutionStage,
} from "../shared/storage";
import SoundBoard from "./components/SoundBoard";

const SIZE_MAP: Record<PetSize, number> = { sm: 48, md: 64, lg: 80 };

const PetPreview: FC<{ type: PetType; mood: PetMood; size: number }> = ({
  type,
  mood,
}) => {
  const def = getPetDef(type);
  const c = def.colors;
  return (
    <div
      className={`preview-pet mood-${mood}`}
      style={
        {
          "--body": c.body,
          "--body-light": c.bodyLight,
          "--outline": c.outline,
          "--ear": c.ear,
          "--ear-inner": c.earInner,
          "--eye": c.eye,
          "--pupil": c.pupil,
          "--nose": c.nose,
          "--blush": c.blush,
          "--belly": c.belly,
          "--tail": c.tail,
          "--special": c.special,
          "--glow": c.glow,
        } as React.CSSProperties
      }
    >
      <div className="preview-aura" />
      <div className={`preview-body tail-${def.tailStyle}`}>
        {def.hasMane && <div className="preview-mane" />}
        <div className="preview-belly" />
        {def.id === "fox" && <div className="preview-fox-face" />}
        {def.hasStripes && (
          <div className="preview-stripes">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`stripe stripe-${i}`} />
            ))}
          </div>
        )}
        <div className={`preview-ears ear-${def.earStyle}`}>
          <div className="ear left">
            <div className="ear-inner" />
          </div>
          <div className="ear right">
            <div className="ear-inner" />
          </div>
        </div>
        <div className={`preview-face ${def.hasPatches ? "patches" : ""}`}>
          <div className="preview-eyes">
            <div className="eye">
              <div className="pupil" />
              <div className="shine" />
            </div>
            <div className="eye">
              <div className="pupil" />
              <div className="shine" />
            </div>
          </div>
          <div className="preview-nose" />
          <div className="preview-mouth" />
          <div className="preview-blush left" />
          <div className="preview-blush right" />
          {def.hasWhiskers && (
            <div className="preview-whiskers">
              <div className="whisker tl" />
              <div className="whisker bl" />
              <div className="whisker tr" />
              <div className="whisker br" />
            </div>
          )}
        </div>
        <div className="preview-tail" />
      </div>
    </div>
  );
};

const StatBar: FC<{
  label: string;
  icon: string;
  value: number;
  color: string;
}> = ({ label, icon, value, color }) => (
  <div className="stat-bar">
    <div className="stat-header">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{Math.round(value)}%</span>
    </div>
    <div className="stat-track">
      <div
        className="stat-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);

export default function App() {
  const [petState, setPetState] = useState<PetState | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getStorageData();
      if (!cancelled) {
        setPetState(data.petState);
        setSettings(data.settings);
      }
    }

    load();

    if (typeof chrome !== "undefined" && chrome.storage) {
      const handler = () => {
        load();
      };
      chrome.storage.onChanged.addListener(handler);
      return () => {
        cancelled = true;
        chrome.storage.onChanged.removeListener(handler);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const changePet = async (type: PetType) => {
    if (!petState) return;
    const def = getPetDef(type);
    const newState = await updatePetState({
      type,
      name: petState.type === type ? petState.name : def.defaultName,
    });
    setPetState(newState);
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;
    const cleaned = nameInput.trim().slice(0, 20);
    const newState = await updatePetState({ name: cleaned });
    setPetState(newState);
    setEditingName(false);
  };

  const changeSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    const newSettings = await updateSettings({ [key]: value });
    setSettings(newSettings);
  };

  if (!petState || !settings) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  const def = getPetDef(petState.type);
  const xpPercent =
    petState.xpToNext > 0 ? (petState.xp / petState.xpToNext) * 100 : 0;

  return (
    <div className="app-shell">
      {/* Header — outside scroll area so it's always visible */}
      <header className="popup-header">
        <div className="header-glow" />
        <img src={logoUrl} alt="Chotu Pet" className="header-logo" />
      </header>

      <div className="popup">
        {/* Pet Preview */}
        <section className="pet-stage glass-card">
          <PetPreview
            type={petState.type}
            mood={petState.mood}
            size={SIZE_MAP[settings.petSize]}
          />
          <div className="stage-badge">
            {
              STAGE_NAMES[
                petState.evolutionStage ?? computeEvolutionStage(petState.level)
              ]
            }
          </div>
          <div className="pet-name-row">
            {editingName ? (
              <div className="name-edit">
                <input
                  className="name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={20}
                  autoFocus
                />
                <button className="name-save" onClick={saveName}>
                  ✓
                </button>
                <button
                  className="name-cancel"
                  onClick={() => setEditingName(false)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                className="pet-name"
                onClick={() => {
                  setNameInput(petState.name);
                  setEditingName(true);
                }}
                title="Click to rename"
              >
                {def.emoji} {petState.name}
                <span className="edit-icon">✏️</span>
              </button>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="stats-panel glass-card">
          <StatBar
            label="Hunger"
            icon="🍖"
            value={petState.hunger}
            color="linear-gradient(90deg, #FF6B6B, #00FF87)"
          />
          <StatBar
            label="Happy"
            icon="😊"
            value={petState.happiness}
            color="linear-gradient(90deg, #BF5AF2, #00E5FF)"
          />
          <StatBar
            label="Energy"
            icon="⚡"
            value={petState.energy}
            color="linear-gradient(90deg, #FFD60A, #00E5FF)"
          />
          <div className="xp-row">
            <div className="xp-info">
              <span className="level-badge">Lv.{petState.level}</span>
              <span className="xp-text">
                {petState.xp} / {petState.xpToNext} XP
              </span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
          <div className="streak-row">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">{petState.streak} day streak</span>
            <span className="feeds-text">
              {petState.totalFeeds} sites visited
            </span>
          </div>
        </section>

        {/* Pet Selector */}
        <section className="pet-selector glass-card">
          <h2 className="section-title">Choose Your Pet</h2>
          <div className="pet-grid">
            {PET_TYPES.map((type) => {
              const p = getPetDef(type);
              return (
                <button
                  key={type}
                  className={`pet-option ${petState.type === type ? "active" : ""}`}
                  onClick={() => changePet(type)}
                  title={p.name}
                  style={
                    { "--pet-color": p.colors.body } as React.CSSProperties
                  }
                >
                  <span className="pet-emoji">{p.emoji}</span>
                  <span className="pet-label">{p.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SOUND UPGRADE: Sound Board */}
        {settings.soundEnabled && (
          <SoundBoard
            stage={
              petState.evolutionStage ?? computeEvolutionStage(petState.level)
            }
            volume={settings.volume}
            onVolumeChange={(v) => changeSetting("volume", v)}
          />
        )}

        {/* Settings */}
        <section className="settings-panel glass-card">
          <h2 className="section-title">Settings</h2>

          <div className="setting-row">
            <span className="setting-label">🔊 Sound</span>
            <button
              className={`toggle ${settings.soundEnabled ? "on" : ""}`}
              onClick={() =>
                changeSetting("soundEnabled", !settings.soundEnabled)
              }
            >
              <div className="toggle-thumb" />
            </button>
          </div>

          <div className="setting-row">
            <span className="setting-label">🔈 Volume</span>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="100"
              value={settings.volume * 100}
              onChange={(e) =>
                changeSetting("volume", Number(e.target.value) / 100)
              }
            />
          </div>

          <div className="setting-row">
            <span className="setting-label">📏 Size</span>
            <div className="size-group">
              {(["sm", "md", "lg"] as PetSize[]).map((s) => (
                <button
                  key={s}
                  className={`size-btn ${settings.petSize === s ? "active" : ""}`}
                  onClick={() => changeSetting("petSize", s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <span className="setting-label">📍 Corner</span>
            <div className="pos-grid">
              {(
                [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ] as Position[]
              ).map((p) => (
                <button
                  key={p}
                  className={`pos-btn ${settings.position === p ? "active" : ""}`}
                  onClick={() => changeSetting("position", p)}
                  title={p}
                >
                  <div className="pos-dot" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="popup-footer">
          <span>{def.description}</span>
        </footer>
      </div>
    </div>
  );
}

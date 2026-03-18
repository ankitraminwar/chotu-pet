import { useState, useCallback, useMemo, type FC } from "react";
import type { SoundEvent, EvolutionStage } from "../../shared/types";
import { STAGE_NAMES } from "../../shared/types";
import { getSoundProfiles } from "../../shared/soundProfiles";

// ── SOUND EVENT METADATA ─────────────────────────────────────
interface SoundEventMeta {
  event: SoundEvent;
  label: string;
  icon: string;
}

const SOUND_EVENT_LIST: SoundEventMeta[] = [
  { event: "feed", label: "Feed", icon: "🍖" },
  { event: "click", label: "Click", icon: "👆" },
  { event: "hover", label: "Hover", icon: "✋" },
  { event: "hungry", label: "Hungry", icon: "😢" },
  { event: "sleep", label: "Sleep", icon: "💤" },
  { event: "levelup", label: "Level Up", icon: "🚀" },
  { event: "streak", label: "Streak", icon: "🔥" },
  { event: "angry", label: "Angry", icon: "😡" },
  { event: "evolve", label: "Evolve", icon: "⭐" },
  { event: "wakeup", label: "Wake Up", icon: "☀️" },
  { event: "pop", label: "Pop", icon: "💫" },
  { event: "rename", label: "Rename", icon: "✏️" },
  { event: "curious", label: "Curious", icon: "🔍" },
];

interface SoundBoardProps {
  stage: EvolutionStage;
  volume: number;
  onVolumeChange: (v: number) => void;
}

const SoundBoard: FC<SoundBoardProps> = ({ stage, volume, onVolumeChange }) => {
  const [playingEvent, setPlayingEvent] = useState<SoundEvent | null>(null);
  const [synthMode, setSynthMode] = useState(false);

  const profiles = useMemo(() => getSoundProfiles(), []);
  const currentProfile = profiles[stage];

  const playSound = useCallback(
    (event: SoundEvent) => {
      setPlayingEvent(event);

      // Send message to content script to play the sound
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id;
          if (tabId) {
            chrome.tabs.sendMessage(tabId, {
              type: "PLAY_SOUND",
              event,
              synthOnly: synthMode,
            });
          }
        });
      }

      // Clear playing state after a short delay
      setTimeout(() => setPlayingEvent(null), 800);
    },
    [synthMode],
  );

  return (
    <div className="soundboard glass-card">
      <div className="soundboard-header">
        <h2 className="section-title">
          🎵 Stage {stage} Sounds — {STAGE_NAMES[stage]}
        </h2>
        <label className="soundboard-toggle">
          <span className="toggle-label">
            {synthMode ? "⚡ Synth" : "🎵 Audio"}
          </span>
          <button
            className={`toggle ${!synthMode ? "on" : ""}`}
            onClick={() => setSynthMode(!synthMode)}
          >
            <div className="toggle-thumb" />
          </button>
        </label>
      </div>

      <div className="soundboard-grid">
        {SOUND_EVENT_LIST.map(({ event, label, icon }) => {
          const entry = currentProfile[event];
          const hasAudio = !!entry.audio;
          const isPlaying = playingEvent === event;

          return (
            <button
              key={event}
              className={`sound-card ${isPlaying ? "playing" : ""}`}
              onClick={() => playSound(event)}
            >
              <span className="sound-icon">{icon}</span>
              <span className="sound-label">{label}</span>
              <span
                className={`sound-source ${hasAudio && !synthMode ? "audio" : "synth"}`}
              >
                {hasAudio && !synthMode ? "🎵" : "⚡"}
              </span>
              {isPlaying && (
                <div className="waveform">
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                  <div className="wave-bar" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="soundboard-footer">
        <span className="volume-label">🔈 Volume</span>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
        />
        <span className="volume-value">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default SoundBoard;

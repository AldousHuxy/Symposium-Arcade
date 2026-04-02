import type { Dispatch, SetStateAction } from 'react';
import mhfdLogo from '../assets/MHFD-Logo.svg';

export type FloodStage = {
  key: string;
  label: string;
  level: number;
  tagline: string;
  buttonColor: string;
  textColor: string;
  badgeColor: string;
}

export const FLOOD_STAGES: FloodStage[] = [
  {
    key: 'lowFlow',
    label: 'Low Flow',
    level: -1.7,
    tagline: 'Normal baseflow — stream confined to channel',
    buttonColor: '#2e7d9e',
    textColor: '#e8f4fb',
    badgeColor: 'bg-sky-600',
  },
  {
    key: 'tenYear',
    label: '10-Year',
    level: 0.2,
    tagline: '10% annual chance — minor bank overflow',
    buttonColor: '#1d6bc4',
    textColor: '#ddeeff',
    badgeColor: 'bg-blue-600',
  },
  {
    key: 'hundredYear',
    label: '100-Year',
    level: 0.8,
    tagline: '1% annual chance — FEMA regulatory flood (BFE)',
    buttonColor: '#7b3eb8',
    textColor: '#f0e0ff',
    badgeColor: 'bg-purple-700',
  },
  {
    key: 'fiveHundredYear',
    label: '500-Year',
    level: 1.6,
    tagline: '0.2% annual chance — extreme flood event',
    buttonColor: '#b82020',
    textColor: '#ffe0e0',
    badgeColor: 'bg-red-700',
  },
];

const MIN_LEVEL = -2.2;
const MAX_LEVEL = 2.2;

function levelToSlider(level: number): number {
  return ((level - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)) * 100;
}
function sliderToLevel(pct: number): number {
  return MIN_LEVEL + (pct / 100) * (MAX_LEVEL - MIN_LEVEL);
}

function atRisk(waterLevel: number): { zone100: number; zone500: number; safe: number } {
  // these match the HOUSES array in FloodplainScene.tsx
  const zone100Houses = 4;
  const zone100Ground = 0.42; // approximate worst case
  const zone500Houses = 4;
  const zone500Ground = 1.10;

  return {
    zone100: waterLevel > zone100Ground + 0.05 ? zone100Houses : waterLevel > 0.3 ? Math.round(((waterLevel - 0.3) / 0.5) * zone100Houses) : 0,
    zone500: waterLevel > zone500Ground + 0.05 ? zone500Houses : 0,
    safe: 4,
  };
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FloodHUDProps {
  waterLevel: number;
  setWaterLevel: Dispatch<SetStateAction<number>>;
  activeStage: string | null;
  setActiveStage: Dispatch<SetStateAction<string | null>>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FloodHUD({ waterLevel, setWaterLevel, activeStage, setActiveStage }: FloodHUDProps) {
  const sliderVal = levelToSlider(waterLevel);
  const risk = atRisk(waterLevel);
  const totalAtRisk = risk.zone100 + risk.zone500;

  const currentStage = FLOOD_STAGES.find(s => s.key === activeStage);

  function handleStageClick(stage: FloodStage) {
    setActiveStage(stage.key);
    setWaterLevel(stage.level);
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const level = sliderToLevel(Number(e.target.value));
    setWaterLevel(level);
    setActiveStage(null);
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center gap-4 px-5 py-3"
        style={{ background: 'rgba(0,38,77,0.92)', backdropFilter: 'blur(6px)', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
        {/* MHFD logo */}
        <div className="flex flex-col leading-tight">
          <img src={mhfdLogo} alt="Mile High Flood District" className="h-7 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="text-xs font-medium tracking-wide" style={{ color: '#7fc4e8' }}>
            Mile High Flood District
          </span>
        </div>
        <div className="h-8 w-px opacity-30" style={{ background: '#7fc4e8' }} />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-white" style={{ fontSize: 14 }}>
            Floodplain Visualization
          </span>
          <span className="text-xs" style={{ color: '#93c5d8' }}>
            FEMA Flood Hazard Analysis · Urban Drainage — Denver Metro
          </span>
        </div>
        <div className="flex-1" />
        {/* Current stage badge */}
        {currentStage && (
          <div className="rounded-full px-4 py-1 text-sm font-bold shadow-lg"
            style={{ background: currentStage.buttonColor, color: currentStage.textColor }}>
            {currentStage.label} Event
          </div>
        )}
      </div>

      {/* ── Main body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: stage controls ────────────────────────────────── */}
        <div className="pointer-events-auto m-3 flex w-64 flex-col gap-3 self-start rounded-xl p-4 shadow-2xl"
          style={{ background: 'rgba(0,20,50,0.85)', backdropFilter: 'blur(8px)' }}>

          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7fc4e8' }}>
            Flood Stage
          </div>

          {FLOOD_STAGES.map(stage => (
            <button
              key={stage.key}
              onClick={() => handleStageClick(stage)}
              className="group relative w-full cursor-pointer overflow-hidden rounded-lg px-3 py-2.5 text-left transition-all duration-200"
              style={{
                background: activeStage === stage.key ? stage.buttonColor : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${activeStage === stage.key ? stage.buttonColor : 'rgba(255,255,255,0.12)'}`,
                boxShadow: activeStage === stage.key ? `0 0 16px ${stage.buttonColor}66` : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: activeStage === stage.key ? stage.textColor : '#cce8f8', fontSize: 14 }}>
                  {stage.label}
                </span>
                <span className="rounded-full px-2 py-0.5 text-xs font-mono"
                  style={{
                    background: activeStage === stage.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                    color: '#a0d4e8',
                  }}>
                  {stage.level >= 0 ? '+' : ''}{stage.level.toFixed(1)} m
                </span>
              </div>
              {activeStage === stage.key && (
                <p className="mt-1 text-xs leading-snug" style={{ color: stage.textColor, opacity: 0.85 }}>
                  {stage.tagline}
                </p>
              )}
            </button>
          ))}

          {/* Continuous slider */}
          <div className="mt-1 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs" style={{ color: '#7fc4e8' }}>
              <span>Fine control</span>
              <span className="font-mono text-white">{waterLevel.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={sliderVal}
              onChange={handleSlider}
              className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
              style={{
                accentColor: '#1e90dd',
                background: `linear-gradient(to right, #1e90dd ${sliderVal}%, rgba(255,255,255,0.15) ${sliderVal}%)`,
              }}
            />
            <div className="flex justify-between text-xs" style={{ color: '#4a8aaa' }}>
              <span>Low Flow</span>
              <span>500-yr</span>
            </div>
          </div>
        </div>

        {/* ── Right panel: structures at risk ───────────────────────────── */}
        <div className="pointer-events-auto m-3 ml-auto flex w-52 flex-col gap-2 self-start rounded-xl p-4 shadow-2xl"
          style={{ background: 'rgba(0,20,50,0.85)', backdropFilter: 'blur(8px)' }}>

          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7fc4e8' }}>
            Structures at Risk
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {/* Total */}
            <div className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: totalAtRisk > 0 ? 'rgba(200,30,30,0.25)' : 'rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#d4e8f8' }}>Total flooded</span>
              <span className="font-bold text-xl" style={{ color: totalAtRisk > 0 ? '#ff7070' : '#60d090' }}>
                {totalAtRisk}
              </span>
            </div>

            {/* 100-yr zone */}
            <div className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'rgba(40,60,180,0.2)' }}>
              <div className="flex flex-col">
                <span className="font-medium" style={{ color: '#90b8e8' }}>100-yr zone</span>
                <span className="text-xs" style={{ color: '#6090b0' }}>FEMA Zone AE</span>
              </div>
              <span className="font-bold" style={{ color: risk.zone100 > 0 ? '#ff8888' : '#60d090' }}>
                {risk.zone100} / 4
              </span>
            </div>

            {/* 500-yr zone */}
            <div className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'rgba(160,80,0,0.2)' }}>
              <div className="flex flex-col">
                <span className="font-medium" style={{ color: '#d0a870' }}>500-yr zone</span>
                <span className="text-xs" style={{ color: '#a08050' }}>FEMA Zone X (shaded)</span>
              </div>
              <span className="font-bold" style={{ color: risk.zone500 > 0 ? '#ff8888' : '#60d090' }}>
                {risk.zone500} / 4
              </span>
            </div>

            {/* Safe */}
            <div className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'rgba(30,120,50,0.2)' }}>
              <div className="flex flex-col">
                <span className="font-medium" style={{ color: '#90d0a0' }}>Upland / safe</span>
                <span className="text-xs" style={{ color: '#60a070' }}>FEMA Zone X</span>
              </div>
              <span className="font-bold" style={{ color: '#60d090' }}>4 / 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom legend ────────────────────────────────────────────────── */}
      <div className="pointer-events-auto mx-3 mt-3 self-start rounded-xl px-4 py-2.5 shadow-xl"
        style={{ background: 'rgba(0,20,50,0.85)', backdropFilter: 'blur(8px)', marginBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7fc4e8' }}>
            Legend
          </span>
          {[
            { color: '#6b9fc4', label: 'River Channel' },
            { color: '#5c9e3a', label: 'Riparian Zone' },
            { color: 'rgba(34,85,204,0.5)', border: '#2255cc', label: '100-yr Zone (FEMA AE)', striped: true },
            { color: 'rgba(204,119,34,0.5)', border: '#cc7722', label: '500-yr Zone (FEMA X)', striped: true },
            { color: '#4a7a3a', label: 'Upland / Safe' },
            { color: '#cc2222', label: 'Flooded Structure' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="flex-shrink-0 rounded-sm"
                style={{
                  width: 14, height: 14,
                  background: item.color,
                  border: item.border ? `1.5px solid ${item.border}` : '1px solid rgba(255,255,255,0.2)',
                }}
              />
              <span className="text-xs" style={{ color: '#c0d8e8' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

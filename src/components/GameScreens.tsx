import type { GameState } from '../game/types';
import { formatCurrency } from '../game/types';

interface StormOverlayProps {
  state: GameState;
  onShowResults: () => void;
}

export function StormOverlay({ state, onShowResults }: StormOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">
      {/* Top bar */}
      <div className="pointer-events-auto flex items-center gap-4 px-4 py-3 md:px-5"
        style={{ background: 'rgba(0,38,77,0.92)', backdropFilter: 'blur(6px)' }}>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-black tracking-widest text-white md:text-xl">MHFD</span>
          <span className="text-[10px] font-medium tracking-wide md:text-xs" style={{ color: '#7fc4e8' }}>
            Save the Neighborhood
          </span>
        </div>
        <div className="flex-1" />
        {state.storm && (
          <div className="rounded-full px-4 py-1 text-sm font-bold shadow-lg"
            style={{ background: '#b82020', color: '#ffe0e0' }}>
            ⛈ {state.storm.name}
          </div>
        )}
      </div>

      {/* Center storm info */}
      <div className="flex flex-1 items-center justify-center">
        <div className="pointer-events-auto mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl p-6 text-center shadow-2xl"
          style={{ background: 'rgba(0,20,50,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="text-5xl">⛈</div>
          <h2 className="text-2xl font-bold text-white">{state.storm?.name}</h2>
          <p className="text-sm" style={{ color: '#8ab0c8' }}>
            {state.storm?.description}
          </p>
          <p className="text-xs" style={{ color: '#6090a8' }}>
            {state.storm?.probability}
          </p>

          <div className="my-2 h-px w-full" style={{ background: 'rgba(255,255,255,0.1)' }} />

          <div className="flex w-full justify-around text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: '#29C499' }}>{state.housesSaved}</div>
              <div className="text-xs" style={{ color: '#7fc4e8' }}>Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ff6060' }}>{state.housesFlooded}</div>
              <div className="text-xs" style={{ color: '#7fc4e8' }}>Flooded</div>
            </div>
          </div>

          <button
            onClick={onShowResults}
            className="mt-2 w-full rounded-xl px-6 py-3 text-base font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #80A7F7, #62b4cc)' }}
          >
            See Results →
          </button>
        </div>
      </div>
    </div>
  );
}

interface ResultsScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

export function ResultsScreen({ state, onPlayAgain }: ResultsScreenProps) {
  const totalActive = state.houses.filter(h => !h.removed).length;
  const pct = totalActive > 0 ? Math.round((state.housesSaved / totalActive) * 100) : 0;

  let grade = 'F';
  let gradeColor = '#ff4444';
  if (pct === 100) { grade = 'A+'; gradeColor = '#29C499'; }
  else if (pct >= 90) { grade = 'A'; gradeColor = '#29C499'; }
  else if (pct >= 75) { grade = 'B'; gradeColor = '#62b4cc'; }
  else if (pct >= 60) { grade = 'C'; gradeColor = '#FFDD00'; }
  else if (pct >= 40) { grade = 'D'; gradeColor = '#ff8844'; }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,36,45,0.95)' }}>

      <div className="mx-4 flex max-w-md flex-col items-center gap-5 text-center">
        {/* Grade */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full text-5xl font-black md:h-28 md:w-28 md:text-6xl"
          style={{ background: `${gradeColor}22`, color: gradeColor, border: `3px solid ${gradeColor}` }}>
          {grade}
        </div>

        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {pct === 100 ? 'Perfect Score!' : pct >= 75 ? 'Great Job!' : pct >= 50 ? 'Not Bad!' : 'Better Luck Next Time'}
        </h1>

        {/* Stats */}
        <div className="grid w-full grid-cols-2 gap-3">
          <StatCard label="Score" value={state.score.toLocaleString()} color="#80A7F7" />
          <StatCard label="Houses Saved" value={`${state.housesSaved} / ${totalActive}`} color="#29C499" />
          <StatCard label="Houses Flooded" value={String(state.housesFlooded)} color="#ff6060" />
          <StatCard label="Budget Remaining" value={formatCurrency(state.budget)} color="#FFDD00" />
          <StatCard label="Storm Event" value={state.storm?.name ?? '—'} color="#62b4cc" />
          <StatCard label="Assets Placed" value={String(state.placedAssets.length)} color="#66E0D5" />
        </div>

        {/* Trivia */}
        <div className="w-full rounded-xl p-3 text-left text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#80A7F7' }}>
            Did You Know?
          </span>
          <p className="mt-1" style={{ color: '#8ab0c8' }}>
            MHFD manages over 1,600 miles of waterways across the Denver metro area,
            working to reduce flood risk for 3 million residents through projects like the ones you just built.
          </p>
        </div>

        {/* Play again */}
        <button
          onClick={onPlayAgain}
          className="w-full rounded-xl px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #29C499, #1C8281)',
            boxShadow: '0 0 30px rgba(41,196,153,0.3)',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="text-lg font-bold md:text-xl" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: '#7fc4e8' }}>{label}</div>
    </div>
  );
}

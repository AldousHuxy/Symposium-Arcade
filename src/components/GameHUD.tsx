import type { GameState } from '../game/types';
import { ASSET_CATALOG, formatCurrency } from '../game/types';

interface GameHUDProps {
  state: GameState;
  onSelectAsset: (id: string | null) => void;
  onUndo: () => void;
  onTriggerStorm: () => void;
}

export default function GameHUD({ state, onSelectAsset, onUndo, onTriggerStorm }: GameHUDProps) {
  const timerPct = (state.timeRemaining / 45) * 100;
  const timerUrgent = state.timeRemaining <= 10;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 md:gap-4 md:px-5 md:py-3"
        style={{ background: 'rgba(0,38,77,0.92)', backdropFilter: 'blur(6px)' }}>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-black tracking-widest text-white md:text-xl">MHFD</span>
          <span className="text-[10px] font-medium tracking-wide md:text-xs" style={{ color: '#7fc4e8' }}>
            Save the Neighborhood
          </span>
        </div>

        <div className="h-6 w-px opacity-30 md:h-8" style={{ background: '#7fc4e8' }} />

        {/* Budget */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest md:text-xs" style={{ color: '#7fc4e8' }}>Budget</span>
          <span className="text-base font-bold text-white md:text-lg">
            {formatCurrency(state.budget)}
          </span>
        </div>

        <div className="flex-1" />

        {/* Timer */}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] uppercase tracking-widest md:text-xs" style={{ color: timerUrgent ? '#ff8888' : '#7fc4e8' }}>
            Time
          </span>
          <span className="text-base font-bold md:text-lg"
            style={{ color: timerUrgent ? '#ff6060' : '#ffffff' }}>
            {state.timeRemaining}s
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="pointer-events-none h-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${timerPct}%`,
            background: timerUrgent
              ? 'linear-gradient(90deg, #ff4444, #ff8844)'
              : 'linear-gradient(90deg, #80A7F7, #62b4cc)',
          }}
        />
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-end overflow-hidden">

        {/* ── Asset placement hint ──────────────────────────────────────── */}
        {state.selectedAssetId && (
          <div className="pointer-events-none mx-auto mb-2 rounded-lg px-4 py-2 text-center text-sm font-semibold text-white shadow-lg"
            style={{ background: 'rgba(0,38,77,0.85)' }}>
            Tap the terrain to place{' '}
            <span style={{ color: '#62b4cc' }}>
              {ASSET_CATALOG.find(a => a.id === state.selectedAssetId)?.name}
            </span>
          </div>
        )}

        {/* ── Bottom panel: asset shop ──────────────────────────────────── */}
        <div className="pointer-events-auto safe-bottom"
          style={{ background: 'rgba(0,20,50,0.9)', backdropFilter: 'blur(8px)' }}>

          {/* Action buttons */}
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <button
              onClick={onUndo}
              disabled={state.placedAssets.length === 0}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#cce8f8' }}
            >
              ↩ Undo
            </button>
            <div className="flex-1" />
            <span className="text-xs" style={{ color: '#7fc4e8' }}>
              {state.placedAssets.length} placed
            </span>
            <button
              onClick={onTriggerStorm}
              className="rounded-lg px-4 py-1.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #b82020, #cc4422)' }}
            >
              ⛈ Bring the Storm!
            </button>
          </div>

          {/* Asset cards — horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto p-3 scrollbar-none">
            {ASSET_CATALOG.map(asset => {
              const selected = state.selectedAssetId === asset.id;
              const canAfford = state.budget >= asset.cost;

              return (
                <button
                  key={asset.id}
                  onClick={() => onSelectAsset(selected ? null : asset.id)}
                  disabled={!canAfford}
                  className="flex-shrink-0 rounded-xl p-2.5 text-left transition-all active:scale-95 disabled:opacity-40 md:p-3"
                  style={{
                    width: 130,
                    background: selected ? 'rgba(98,180,204,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${selected ? '#62b4cc' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selected ? '0 0 16px rgba(98,180,204,0.3)' : 'none',
                  }}
                >
                  <div className="mb-1 text-2xl">{asset.icon}</div>
                  <div className="text-xs font-bold" style={{ color: selected ? '#62b4cc' : '#cce8f8' }}>
                    {asset.name}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight" style={{ color: '#8ab0c8' }}>
                    {asset.description}
                  </div>
                  <div className="mt-1.5 rounded-full px-2 py-0.5 text-center text-xs font-bold"
                    style={{
                      background: canAfford ? 'rgba(41,196,153,0.2)' : 'rgba(200,50,50,0.2)',
                      color: canAfford ? '#29C499' : '#ff6666',
                    }}>
                    {formatCurrency(asset.cost)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

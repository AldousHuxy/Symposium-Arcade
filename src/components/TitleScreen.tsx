interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #06242D 0%, #191533 50%, #251863 100%)' }}>

      <div className="mx-4 flex max-w-lg flex-col items-center gap-6 text-center">
        {/* MHFD Branding */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl font-black tracking-[0.25em] text-white md:text-5xl">
            MHFD
          </span>
          <span className="text-sm font-medium tracking-widest md:text-base" style={{ color: '#62b4cc' }}>
            Mile High Flood District
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-32" style={{ background: 'linear-gradient(90deg, transparent, #80A7F7, transparent)' }} />

        {/* Game title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white md:text-4xl">
            Save the <span style={{ color: '#62b4cc' }}>Neighborhood</span>
          </h1>
          <p className="text-sm leading-relaxed md:text-base" style={{ color: '#8ab0c8' }}>
            A storm is coming. You have <strong className="text-white">$5M</strong> and{' '}
            <strong className="text-white">45 seconds</strong> to protect your community.
            Place flood mitigation infrastructure wisely — every house counts.
          </p>
        </div>

        {/* How to play */}
        <div className="w-full rounded-xl p-4 text-left"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#80A7F7' }}>
            How to Play
          </h3>
          <div className="flex flex-col gap-1.5 text-sm" style={{ color: '#a0c0d8' }}>
            <p>1. Select a mitigation asset from the bottom panel</p>
            <p>2. Tap the terrain to place it on the map</p>
            <p>3. Hit <strong className="text-white">"Bring the Storm!"</strong> when ready</p>
            <p>4. Watch the flood and see how many houses you saved!</p>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full rounded-xl px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all active:scale-95 md:w-auto md:text-xl"
          style={{
            background: 'linear-gradient(135deg, #29C499, #1C8281)',
            boxShadow: '0 0 30px rgba(41,196,153,0.3)',
          }}
        >
          Start Game
        </button>

        {/* Symposium badge */}
        <span className="text-xs" style={{ color: '#4a6a7a' }}>
          Annual Symposium 2026
        </span>
      </div>
    </div>
  );
}

import { useTitleAnimation } from './useTitleAnimation';
import mhfdLogo from '../assets/MHFD-Logo.svg';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  useTitleAnimation();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #06242D 0%, #191533 50%, #251863 100%)', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      <div className="mx-4 flex max-w-lg flex-col items-center gap-6 text-center">
        {/* MHFD Branding */}
        <div id="title-mhfd" className="flex flex-col items-center gap-1">
          <img src={mhfdLogo} alt="Mile High Flood District" className="h-16 w-auto md:h-20" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Divider */}
        <div id="title-divider" className="h-px w-32" style={{ background: 'linear-gradient(90deg, transparent, #80A7F7, transparent)' }} />

        {/* Game title */}
        <div id="title-main" className="flex flex-col gap-2">
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
        <div id="instructions" className="w-full rounded-xl p-4 text-left"
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

        {/* Start Button */}
        <button
          id="start-button"
          onClick={onStart}
          className="cursor-pointer mt-2 rounded-full bg-green-500 px-12 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #29C499, #1C8281)',
            boxShadow: '0 0 30px rgba(41,196,153,0.3)',
          }}
        >
          Start
        </button>

        {/* Symposium Badge */}
        <span className="text-xs" style={{ color: '#4a6a7a' }}>
          Mile High Flood District Symposium 2026
        </span>
      </div>
    </div>
  );
}

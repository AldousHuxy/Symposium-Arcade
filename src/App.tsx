import GameScene from './components/GameScene';
import GameHUD from './components/GameHUD';
import TitleScreen from './components/TitleScreen';
import { StormOverlay, ResultsScreen } from './components/GameScreens';
import { useGameState } from './game/useGameState';

const App = () => {
  const {
    state,
    startGame,
    selectAsset,
    placeAsset,
    undoLastPlacement,
    triggerStorm,
    showResults,
    resetGame,
  } = useGameState();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 3D Canvas always renders behind everything */}
      <div className="absolute inset-0">
        <GameScene
          waterLevel={state.waterLevel}
          houses={state.houses}
          placedAssets={state.placedAssets}
          selectedAssetId={state.selectedAssetId}
          onTerrainClick={state.phase === 'planning' ? placeAsset : undefined}
        />
      </div>

      {/* Phase-specific overlays */}
      {state.phase === 'title' && (
        <TitleScreen onStart={startGame} />
      )}

      {state.phase === 'planning' && (
        <GameHUD
          state={state}
          onSelectAsset={selectAsset}
          onUndo={undoLastPlacement}
          onTriggerStorm={triggerStorm}
        />
      )}

      {state.phase === 'storm' && (
        <StormOverlay state={state} onShowResults={showResults} />
      )}

      {state.phase === 'results' && (
        <ResultsScreen state={state} onPlayAgain={resetGame} />
      )}
    </div>
  );
};

export default App;
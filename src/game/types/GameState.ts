import type { GamePhase } from './GamePhase';
import type { PlacedAsset } from './PlacedAsset';
import type { HouseState } from './HouseState';
import type { StormEvent } from './StormEvent';

export type GameState = {
  phase: GamePhase;
  budget: number;
  maxBudget: number;
  placedAssets: PlacedAsset[];
  selectedAssetId: string | null;
  houses: HouseState[];
  storm: StormEvent | null;
  waterLevel: number;
  targetWaterLevel: number;
  score: number;
  timeRemaining: number;
  housesSaved: number;
  housesFlooded: number;
}

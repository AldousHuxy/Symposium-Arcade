export type GamePhase = 'title' | 'planning' | 'storm' | 'results';

export type MitigationAsset = {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
  effect: AssetEffect;
}

export type AssetEffect =
  | { type: 'waterReduction'; amount: number }        // global water level reduction
  | { type: 'localProtection'; radius: number }       // protects houses within radius
  | { type: 'removeHouse' };                           // buyout — removes a house from risk

export type PlacedAsset = {
  assetId: string;
  x: number;
  z: number;
  id: string; // unique placement id
}

export type HouseState = {
  x: number;
  z: number;
  ground: number;
  zone: '100yr' | '500yr' | 'safe';
  flooded: boolean;
  protected: boolean;
  removed: boolean;
}

export type StormEvent = {
  name: string;
  level: number;
  description: string;
  probability: string;
}

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

// ─── Asset Catalog ───────────────────────────────────────────────────────────

export const ASSET_CATALOG: MitigationAsset[] = [
  {
    id: 'detention-pond',
    name: 'Detention Pond',
    cost: 1_500_000,
    description: 'Stores stormwater, lowering flood stage by 0.3m',
    icon: '🌊',
    effect: { type: 'waterReduction', amount: 0.3 },
  },
  {
    id: 'floodwall',
    name: 'Floodwall',
    cost: 1_000_000,
    description: 'Protects nearby houses within a 3-unit radius',
    icon: '🧱',
    effect: { type: 'localProtection', radius: 3.0 },
  },
  {
    id: 'channel-widening',
    name: 'Channel Widening',
    cost: 2_000_000,
    description: 'Increases channel capacity, lowering all stages by 0.4m',
    icon: '🏗️',
    effect: { type: 'waterReduction', amount: 0.4 },
  },
  {
    id: 'bioswale',
    name: 'Green Infrastructure',
    cost: 500_000,
    description: 'Bioswales and rain gardens, lowering stage by 0.15m',
    icon: '🌿',
    effect: { type: 'waterReduction', amount: 0.15 },
  },
  {
    id: 'buyout',
    name: 'Buyout & Relocate',
    cost: 750_000,
    description: 'Remove a house from the floodplain entirely',
    icon: '🏠',
    effect: { type: 'removeHouse' },
  },
];

export const STORM_EVENTS: StormEvent[] = [
  { name: '10-Year Storm', level: 0.2,  description: 'A moderate rainfall event',      probability: '10% annual chance' },
  { name: '50-Year Storm', level: 0.55, description: 'A significant rainfall event',    probability: '2% annual chance' },
  { name: '100-Year Storm', level: 0.8, description: 'The FEMA regulatory flood event', probability: '1% annual chance' },
  { name: '500-Year Storm', level: 1.6, description: 'A catastrophic flood event',      probability: '0.2% annual chance' },
];

export const INITIAL_HOUSES: HouseState[] = [
  { x: -3.5, z: -3,  ground: 0.42, zone: '100yr', flooded: false, protected: false, removed: false },
  { x:  3.8, z: -2,  ground: 0.38, zone: '100yr', flooded: false, protected: false, removed: false },
  { x: -3.2, z:  3,  ground: 0.40, zone: '100yr', flooded: false, protected: false, removed: false },
  { x:  4.1, z:  4,  ground: 0.45, zone: '100yr', flooded: false, protected: false, removed: false },
  { x: -7.2, z: -4,  ground: 1.10, zone: '500yr', flooded: false, protected: false, removed: false },
  { x:  7.0, z:  2,  ground: 1.05, zone: '500yr', flooded: false, protected: false, removed: false },
  { x: -7.5, z:  5,  ground: 1.15, zone: '500yr', flooded: false, protected: false, removed: false },
  { x:  7.3, z: -5,  ground: 1.08, zone: '500yr', flooded: false, protected: false, removed: false },
  { x: -12,  z: -4,  ground: 2.65, zone: 'safe',  flooded: false, protected: false, removed: false },
  { x:  12,  z:  3,  ground: 2.70, zone: 'safe',  flooded: false, protected: false, removed: false },
  { x: -11,  z:  5,  ground: 2.55, zone: 'safe',  flooded: false, protected: false, removed: false },
  { x:  11,  z: -3,  ground: 2.60, zone: 'safe',  flooded: false, protected: false, removed: false },
];

export const MAX_BUDGET = 5_000_000;
export const PLANNING_TIME = 45; // seconds

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

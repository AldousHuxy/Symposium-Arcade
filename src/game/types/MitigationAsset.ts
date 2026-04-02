import type { AssetEffect } from './AssetEffect';

export type MitigationAsset = {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
  effect: AssetEffect;
}

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

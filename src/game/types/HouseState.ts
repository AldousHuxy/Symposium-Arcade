export type HouseState = {
  x: number;
  z: number;
  ground: number;
  zone: '100yr' | '500yr' | 'safe';
  flooded: boolean;
  protected: boolean;
  removed: boolean;
}

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

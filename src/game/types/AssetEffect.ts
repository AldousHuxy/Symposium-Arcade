export type AssetEffect =
  | { type: 'waterReduction'; amount: number }
  | { type: 'localProtection'; radius: number }
  | { type: 'removeHouse' };

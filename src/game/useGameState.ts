import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, PlacedAsset } from './types';
import {
  ASSET_CATALOG,
  STORM_EVENTS,
  INITIAL_HOUSES,
  MAX_BUDGET,
  PLANNING_TIME,
} from './types';

let placementCounter = 0;

function createInitialState(): GameState {
  return {
    phase: 'title',
    budget: MAX_BUDGET,
    maxBudget: MAX_BUDGET,
    placedAssets: [],
    selectedAssetId: null,
    houses: INITIAL_HOUSES.map(h => ({ ...h })),
    storm: null,
    waterLevel: -1.7,
    targetWaterLevel: -1.7,
    score: 0,
    timeRemaining: PLANNING_TIME,
    housesSaved: 0,
    housesFlooded: 0,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Phase transitions ────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    placementCounter = 0;
    setState({
      ...createInitialState(),
      phase: 'planning',
      waterLevel: -1.7,
      targetWaterLevel: -1.7,
    });
  }, []);

  const selectAsset = useCallback((assetId: string | null) => {
    setState(prev => ({ ...prev, selectedAssetId: assetId }));
  }, []);

  const placeAsset = useCallback((x: number, z: number) => {
    setState(prev => {
      if (prev.phase !== 'planning' || !prev.selectedAssetId) return prev;

      const catalog = ASSET_CATALOG.find(a => a.id === prev.selectedAssetId);
      if (!catalog || prev.budget < catalog.cost) return prev;

      // For buyout, find nearest non-removed house
      if (catalog.effect.type === 'removeHouse') {
        const nearestIdx = prev.houses.reduce((bestIdx, h, idx) => {
          if (h.removed) return bestIdx;
          const dist = Math.hypot(h.x - x, h.z - z);
          const bestDist = bestIdx === -1 ? Infinity : Math.hypot(prev.houses[bestIdx].x - x, prev.houses[bestIdx].z - z);
          return dist < bestDist ? idx : bestIdx;
        }, -1);

        if (nearestIdx === -1) return prev;
        const nearestHouse = prev.houses[nearestIdx];
        const dist = Math.hypot(nearestHouse.x - x, nearestHouse.z - z);
        if (dist > 2.5) return prev; // must tap near a house

        const newHouses = prev.houses.map((h, i) =>
          i === nearestIdx ? { ...h, removed: true } : h
        );

        return {
          ...prev,
          budget: prev.budget - catalog.cost,
          houses: newHouses,
          placedAssets: [
            ...prev.placedAssets,
            { assetId: catalog.id, x: nearestHouse.x, z: nearestHouse.z, id: `p${++placementCounter}` },
          ],
        };
      }

      const placed: PlacedAsset = {
        assetId: catalog.id,
        x,
        z,
        id: `p${++placementCounter}`,
      };

      return {
        ...prev,
        budget: prev.budget - catalog.cost,
        placedAssets: [...prev.placedAssets, placed],
        selectedAssetId: prev.budget - catalog.cost >= catalog.cost ? prev.selectedAssetId : null,
      };
    });
  }, []);

  const undoLastPlacement = useCallback(() => {
    setState(prev => {
      if (prev.placedAssets.length === 0) return prev;
      const last = prev.placedAssets[prev.placedAssets.length - 1];
      const catalog = ASSET_CATALOG.find(a => a.id === last.assetId);
      if (!catalog) return prev;

      // If buyout, un-remove the house
      let newHouses = prev.houses;
      if (catalog.effect.type === 'removeHouse') {
        newHouses = prev.houses.map(h =>
          h.x === last.x && h.z === last.z ? { ...h, removed: false } : h
        );
      }

      return {
        ...prev,
        budget: prev.budget + catalog.cost,
        placedAssets: prev.placedAssets.slice(0, -1),
        houses: newHouses,
      };
    });
  }, []);

  const triggerStorm = useCallback(() => {
    // Pick a weighted-random storm (biased toward harder ones for excitement)
    const weights = [0.15, 0.25, 0.35, 0.25];
    const r = Math.random();
    let cumulative = 0;
    let stormIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (r <= cumulative) { stormIdx = i; break; }
    }
    const storm = STORM_EVENTS[stormIdx];

    setState(prev => {
      // Calculate water reduction from placed assets
      let waterReduction = 0;
      for (const placed of prev.placedAssets) {
        const catalog = ASSET_CATALOG.find(a => a.id === placed.assetId);
        if (catalog?.effect.type === 'waterReduction') {
          waterReduction += catalog.effect.amount;
        }
      }

      const effectiveLevel = Math.max(-1.7, storm.level - waterReduction);

      // Determine which houses are protected by floodwalls
      const houses = prev.houses.map(h => {
        if (h.removed) return { ...h, flooded: false, protected: false };

        let isProtected = false;
        for (const placed of prev.placedAssets) {
          const catalog = ASSET_CATALOG.find(a => a.id === placed.assetId);
          if (catalog?.effect.type === 'localProtection') {
            const dist = Math.hypot(h.x - placed.x, h.z - placed.z);
            if (dist <= catalog.effect.radius) {
              isProtected = true;
              break;
            }
          }
        }

        const flooded = !isProtected && effectiveLevel > h.ground + 0.05;
        return { ...h, flooded, protected: isProtected };
      });

      const activeHouses = houses.filter(h => !h.removed);
      const housesSaved = activeHouses.filter(h => !h.flooded).length;
      const housesFlooded = activeHouses.filter(h => h.flooded).length;

      // Score: 1000 per house saved + bonus for budget remaining
      const budgetBonus = Math.round((prev.budget / prev.maxBudget) * 2000);
      const score = housesSaved * 1000 + budgetBonus;

      return {
        ...prev,
        phase: 'storm',
        storm,
        houses,
        targetWaterLevel: effectiveLevel,
        housesSaved,
        housesFlooded,
        score,
        selectedAssetId: null,
      };
    });
  }, []);

  const showResults = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'results' }));
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  // ── Planning timer ───────────────────────────────────────────────────────

  useEffect(() => {
    if (state.phase === 'planning') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  // ── Auto-trigger storm when planning time runs out ───────────────────────

  useEffect(() => {
    if (state.phase === 'planning' && state.timeRemaining === 0) {
      triggerStorm();
    }
  }, [state.phase, state.timeRemaining, triggerStorm]);

  return {
    state,
    startGame,
    selectAsset,
    placeAsset,
    undoLastPlacement,
    triggerStorm,
    showResults,
    resetGame,
  };
}

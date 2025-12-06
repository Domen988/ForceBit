import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid'; 

export type HandType = 'Left' | 'Right' | 'Both';
export type GripType = 'Open' | 'Half Crimp' | 'Full Crimp' | 'Jug' | 'Pinch';

export interface Setup {
  id: string;
  hand: HandType;
  grip: GripType;
  holdName: string; 
  createdAt: number;
}

export interface TestResult {
  id: string;
  setupId: string; 
  peakForce: number;
  date: number;
}

interface ForceState {
  setups: Setup[];
  results: TestResult[];

  addSetup: (hand: HandType, grip: GripType, holdName: string) => void;
  deleteSetup: (id: string) => void;
  saveResult: (setupId: string, force: number) => void;
  getHistory: (setupId: string) => TestResult[];
  // NEW: Helper to get the single current max for a setup
  getLatestMax: (setupId: string) => number;
}

export const useForceStore = create<ForceState>()(
  persist(
    (set, get) => ({
      setups: [],
      results: [],

      addSetup: (hand, grip, holdName) => {
        const newSetup: Setup = {
          id: uuidv4(), 
          hand,
          grip,
          holdName,
          createdAt: Date.now(),
        };
        set((state) => ({ setups: [...state.setups, newSetup] }));
      },

      deleteSetup: (id) => {
        set((state) => ({
          setups: state.setups.filter((s) => s.id !== id),
          results: state.results.filter((r) => r.setupId !== id), 
        }));
      },

      saveResult: (setupId, force) => {
        console.log(`[STORE] Saving result: ${force}kg for setup: ${setupId}`);
        const newResult: TestResult = {
          id: uuidv4(),
          setupId,
          peakForce: force,
          date: Date.now(),
        };
        set((state) => ({ results: [...state.results, newResult] }));
      },

      getHistory: (setupId) => {
        return get().results
          .filter((r) => r.setupId === setupId)
          .sort((a, b) => a.date - b.date);
      },

      getLatestMax: (setupId) => {
        const history = get().results.filter((r) => r.setupId === setupId);
        if (history.length === 0) return 0;
        // Sort by date descending (newest first) and take the first one
        // OR: Sort by force if you want "All Time Best" instead of "Current Condition"
        // Let's use "All Time Best" for safety/training targets usually, 
        // but "Latest" is better for tracking current form. Let's do Max of all time.
        const max = Math.max(...history.map(r => r.peakForce));
        return max;
      }
    }),
    {
      name: 'force-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
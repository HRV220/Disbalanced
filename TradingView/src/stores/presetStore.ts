import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Preset, PresetCreateInput } from "@/types/preset";
import type { BidAskIndicatorConfig } from "@/types/indicator";

// SSR-safe storage - returns undefined on server
// const safeStorage = {
//   getItem: (name: string) => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem(name);
//   },
//   setItem: (name: string, value: string) => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem(name, value);
//     }
//   },
//   removeItem: (name: string) => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem(name);
//     }
//   },
// };

interface PresetStoreState {
  // List of presets
  presets: Preset[];

  // Currently active preset
  activePresetId: string | null;

  // Actions
  addPreset: (input: PresetCreateInput) => Preset;
  updatePreset: (id: string, updates: Partial<PresetCreateInput>) => void;
  deletePreset: (id: string) => void;
  duplicatePreset: (id: string) => Preset | null;
  renamePreset: (id: string, name: string) => void;

  // Active preset
  setActivePreset: (id: string | null) => void;
  loadPreset: (id: string) => Preset | null;

  // Bulk
  setPresets: (presets: Preset[]) => void;
  clearAll: () => void;
}

const initialState = {
  presets: [] as Preset[],
  activePresetId: null as string | null,
};

export const usePresetStore = create<PresetStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPreset: (input) => {
        const newPreset: Preset = {
          id: `preset-${Date.now()}`,
          userId: "local", // Will be replaced with actual userId when syncing with backend
          name: input.name,
          symbol: input.symbol,
          exchange: input.exchange,
          timeframe: input.timeframe,
          indicators: JSON.parse(JSON.stringify(input.indicators)),
          layout: input.layout,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          presets: [...state.presets, newPreset],
          activePresetId: newPreset.id,
        }));

        return newPreset;
      },

      updatePreset: (id, updates) => {
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id
              ? {
                  ...preset,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : preset
          ),
        }));
      },

      deletePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id),
          activePresetId:
            state.activePresetId === id ? null : state.activePresetId,
        }));
      },

      duplicatePreset: (id) => {
        const original = get().presets.find((p) => p.id === id);
        if (!original) return null;

        const duplicate: Preset = {
          ...original,
          id: `preset-${Date.now()}`,
          name: `${original.name} (копия)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          presets: [...state.presets, duplicate],
        }));

        return duplicate;
      },

      renamePreset: (id, name) => {
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id
              ? {
                  ...preset,
                  name,
                  updatedAt: new Date().toISOString(),
                }
              : preset
          ),
        }));
      },

      setActivePreset: (id) => {
        set({ activePresetId: id });
      },

      loadPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id);
        if (!preset) return null;

        set({ activePresetId: id });
        return JSON.parse(JSON.stringify(preset));
      },

      setPresets: (presets) => {
        set({ presets });
      },

      clearAll: () => {
        set(initialState);
      },
    }),
    {
      name: "disbalanced-presets",
      //storage: createJSONStorage(() => safeStorage),
      skipHydration: true, // Prevent hydration mismatch
    }
  )
);

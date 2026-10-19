import { create } from 'zustand';
import type { GraphMode } from '../types/network';

interface GraphState {
  query: string;
  categoryId: string | null;
  favoritesOnly: boolean;
  mode: GraphMode;
  selectedPersonId: string | null;
  focusRequest: { personId: string; revision: number } | null;
  focusRevision: number;
  setQuery: (query: string) => void;
  setCategory: (categoryId: string | null) => void;
  toggleFavorites: () => void;
  setMode: (mode: GraphMode) => void;
  selectPerson: (personId: string | null) => void;
  requestFocus: (personId: string) => void;
  consumeFocusRequest: (revision: number) => boolean;
  clearFilters: () => void;
}

// Only transient UI state. Demo contacts remain immutable; SQLite comes in MVP 1.
export const useGraphStore = create<GraphState>((set) => ({
  query: '', categoryId: null, favoritesOnly: false, mode: 'categories',
  selectedPersonId: null, focusRequest: null, focusRevision: 0,
  setQuery: (query) => set({ query }),
  setCategory: (categoryId) => set({ categoryId }),
  toggleFavorites: () => set((state) => ({ favoritesOnly: !state.favoritesOnly })),
  setMode: (mode) => set({ mode }),
  selectPerson: (selectedPersonId) => set({ selectedPersonId }),
  requestFocus: (personId) => set((state) => ({
    selectedPersonId: personId,
    focusRevision: state.focusRevision + 1,
    focusRequest: { personId, revision: state.focusRevision + 1 },
  })),
  consumeFocusRequest: (revision) => {
    let consumed = false;
    set((state) => {
      if (state.focusRequest?.revision !== revision) return state;
      consumed = true;
      return { focusRequest: null };
    });
    return consumed;
  },
  clearFilters: () => set({ query: '', categoryId: null, favoritesOnly: false }),
}));

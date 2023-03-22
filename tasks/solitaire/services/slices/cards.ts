import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MAX_CARD_VALUE } from "../../constants/card";
import { TCard, TCell, TGrid } from "../../types/card";
import { isValidStack } from "../../utils/isValidStack";
import { checkReadyDeck, getProgress, hasFullStack } from "../../utils/cardStack";

export interface IStats {
  isReady: boolean;
  length: number;
  steps: number;
  drops: number;
  progress: number;
}

interface SelectState {
  cards: TGrid | null;
  isFreeMode: boolean;
  dragCards: TCell | null;
  isShowEndModal: boolean;
  snapshots: TGrid[];
  statsSnapshots: IStats[];
  dragId: number | null;
  stats: IStats;
}

const initialState: SelectState = {
  // prettier-ignore
  cards: [],
  isFreeMode: false,
  isShowEndModal: false,
  dragCards: null,
  dragId: null,
  snapshots: [],
  statsSnapshots: [],
  stats: {
    isReady: false,
    length: 0,
    steps: 0,
    drops: 0,
    progress: 0,
  },
};

export const cardSlice = createSlice({
  name: "cards",
  initialState: initialState,
  reducers: {
    setDragMode(state, action: PayloadAction<boolean>) {
      state.isFreeMode = action.payload;
    },
    setCards(state, action: PayloadAction<TGrid | null>) {
      state.cards = action.payload;
      if (state.cards) state.stats.progress = getProgress(state.cards);
    },
    pushCard(state, action: PayloadAction<[number, TCard]>) {
      if (state.cards) state.cards[action.payload[0]].push(action.payload[1]);
    },
    setStats(state, action: PayloadAction<IStats>) {
      state.stats = action.payload;
      if (state.cards) state.stats.progress = getProgress(state.cards);
    },
    closeModal(state) {
      state.isShowEndModal = false;
    },
    setSnapshots(state, action: PayloadAction<TGrid[]>) {
      state.snapshots = action.payload;
    },
    setStatsHistory(state, action: PayloadAction<IStats[]>) {
      state.statsSnapshots = action.payload;
    },
    removeCardsInCell(state, action: PayloadAction<number[]>) {
      state.cards?.[action.payload[0]].splice(action.payload[1], 1);
      if (state.cards) state.stats.progress = getProgress(state.cards);
      state.isShowEndModal = !!state.cards?.every(cell => cell.length === 0);
    },
    setDragCards(state, action: PayloadAction<TCell>) {
      const dragIndex = state.cards?.findIndex(cell => cell.some(card => card.key === action.payload?.[0].key));
      state.dragCards = action.payload;
      state.dragId = dragIndex !== undefined ? dragIndex : -1;
    },
    checkFullStacks(state) {
      // const cards = state.cards;
      // if (!cards) return;
      // cards.forEach((cell, i) => {
      //   const findId = hasFullStack(cell);
      //   if (~findId) {
      //     for (let j = findId; j < findId + MAX_CARD_VALUE + 1; j++) cards[i][j].removed = true;
      //   }
      // });
      if (state.cards) state.stats.progress = getProgress(state.cards);
    },

    moveCards(state, action: PayloadAction<number>) {
      const toIndex = action.payload;
      const fromIndex = state.dragId; //? -1 if card not form {cards} (from constructor for example)
      const toCell = state.cards?.[toIndex];

      //? ts checks it have to be valid state
      if (fromIndex === null || toCell === undefined || !state.dragCards) return;

      const isValidMove =
        state.isFreeMode || !toCell.length || isValidStack([toCell[toCell.length - 1], ...state.dragCards]);
      if (!isValidMove) {
        state.snapshots?.pop();
        state.statsSnapshots?.pop();
        return;
      }

      const fromCardIndex = state.cards?.[+(fromIndex || 0)]?.findIndex(card => card.key === state.dragCards?.[0].key);

      if (fromCardIndex !== undefined) state.cards?.[+fromIndex].splice(fromCardIndex);
      state.cards?.splice(action.payload, 1, [...toCell, ...state.dragCards]);

      //? update stats
      if (state.isFreeMode) return;
      state.stats.drops += +!toCell.length;
      state.stats.steps++;
      state.stats.length += Math.abs(+fromIndex - toIndex);
      if (state.cards) state.stats.progress = getProgress(state.cards);

      //? Is ready set

      state.stats.isReady = checkReadyDeck(state.cards);
    },
    clearDrag(state) {
      state.dragCards = null;
      state.dragId = null;
    },
    storeSnapshot(state) {
      if (!state.cards) return;

      state.cards.forEach(cell => cell.map(card => ({ ...card, removed: undefined })));
      state.snapshots.push(state.cards);
      state.statsSnapshots.push(state.stats);
    },
    restoreSnapshot(state) {
      if (!state.snapshots?.length || !state.statsSnapshots?.length) return;
      state.cards = state.snapshots.pop() || null;
      state.stats = state.statsSnapshots.pop() || initialState.stats;
    },
  },
});

export const {
  setCards,
  setDragCards,
  clearDrag,
  storeSnapshot,
  restoreSnapshot,
  moveCards,
  checkFullStacks,
  removeCardsInCell,
  setDragMode,
  setSnapshots,
  setStats,
  closeModal,
  pushCard,
  setStatsHistory,
} = cardSlice.actions;
export const cardReducer = cardSlice.reducer;

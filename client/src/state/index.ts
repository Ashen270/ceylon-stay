import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "zod";

export interface FilterState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  avalableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
}

interface InitialStateTypes {
  filters: FilterState;
  isFiltersFullOpen: boolean;
  viewMode?: "list" | "grid";
}




export const initialState: InitialStateTypes = {
  filters: {
    location: "Colombo",
    beds: "any",
    baths: "any",
    propertyType: "any",
    amenities: [],
    avalableFrom: "nay",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [79.86, 6.93],
  },
  isFiltersFullOpen: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"list" | "grid">) => {
      state.viewMode = action.payload;
    },
  }
});

export const {
  setFilters,
  toggleFiltersFullOpen,
  setViewMode
 } = globalSlice.actions;

export default globalSlice.reducer;

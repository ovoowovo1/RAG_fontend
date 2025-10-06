import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../config';



const studioSlice = createSlice({
    name: 'studio',
    initialState: {
        isStudioCardCollapsed: false,
        isQuizReaderOpen: false,
    },
    reducers: {
        toggleStudioCardCollapse: (state) => {
            state.isStudioCardCollapsed = !state.isStudioCardCollapsed;
        },
        setQuizReaderOpen: (state, action) => {
            state.isQuizReaderOpen = action.payload;
        },
    },
});



export const { toggleStudioCardCollapse, setQuizReaderOpen } = studioSlice.actions;
export default studioSlice.reducer;
import { createSlice } from '@reduxjs/toolkit'

const boardSlice = createSlice({
    name: "board",
    initialState: {
        mines: 40,
        columns: 16,
        rows: 16,
        time: 0,
        minesLeft: 40,
        gameStatus: 'idle',
        resetBoardTrigger: false,
        mode: 'classic',
    },
    reducers: {
        setMines: (state, action) => {
            state.minesLeft = state.mines;
            state.mines = action.payload;
        },
        setColumns: (state, action) => {
            state.columns = action.payload;
        },
        setRows: (state, action) => {
            state.rows = action.payload;
        },
        incrementTime: (state) => {
            state.time++;
        },
        decrementTime: (state) => {
            state.time--;
        },
        setTime: (state, action) => {
            state.time = action.payload;
        },
        decrementMinesLeft: (state) => {
            state.minesLeft--;
        },
        incrementMinesLeft: (state) => {
            state.minesLeft++;
        },
        setGameStatus: (state, action) => {
            state.gameStatus = action.payload;
        },
        rebootBoardTrigger: (state) => {
            state.resetBoardTrigger = false;
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        },
        resetBoard: (state) => {
            state.time = 0;
            state.minesLeft = state.mines;
            state.gameStatus = 'idle';
            state.resetBoardTrigger = true;
        },
    }
});

export const {
    setMines,
    setColumns,
    setRows,
    incrementTime,
    decrementTime,
    setTime,
    decrementMinesLeft,
    incrementMinesLeft,
    setGameStatus,
    rebootBoardTrigger,
    setMode,
    resetBoard,
} = boardSlice.actions;

export default boardSlice.reducer;
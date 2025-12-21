import { useEffect, useState, useRef, useMemo } from 'react';
import './BoardStyle.css';
import { useSelector, useDispatch } from 'react-redux';
import { decrementMinesLeft, setGameStatus, incrementMinesLeft, rebootBoardTrigger, setTime } from '../boardSlice';

import bomb from '../assets/bomb.svg';
import flag from '../assets/flag.svg';

function Board() {
    const columns = useSelector(state => state.board.columns);
    const rows = useSelector(state => state.board.rows);
    const mines = useSelector(state => state.board.mines);
    const minesLeft = useSelector(state => state.board.minesLeft);
    const gameStatus = useSelector(state => state.board.gameStatus);
    const resetBoardTrigger = useSelector(state => state.board.resetBoardTrigger);
    const mode = useSelector(state => state.board.mode);
    const time = useSelector(state => state.board.time);
    const dispatch = useDispatch();

    const board = useRef([]); // Board uses useRef because first click needs to update immediatly to generate new board
    function setBoard(arr) { board.current = arr }
    const [clickBoard, setClickBoard] = useState([]);
    const tempClickBoard = useRef(null);
    const firstClick = useRef(null);
    const tilesSweeped = useRef(0);

    const cellColors = useMemo(() => ({
        1: "LightSkyBlue",
        2: "lime",
        3: "orange",
        4: "MediumTurquoise",
        5: "orangered",
        6: "aquamarine",
        7: "plum",
        8: "Gainsboro"
    }), []);

    const hotcoldColours = useMemo(() => ({
        0: "#010099",
        1: "#0497FD",
        2: "#A5FE58",
        3: "#FDF100",
        4: "#FF5900",
        5: "#C10302",
        6: "#840101",
        7: "#410A08",
        8: "#050102"
    }), []);

    useEffect(() => { // Create blank boards
        firstClick.current = null;
        tilesSweeped.current = 0;
        dispatch(rebootBoardTrigger()); // Reset Stats
        let arr = [];
        let arr2 = [];

        for (let i = 0; i < columns; i++) {
            arr[i] = [];
            arr2[i] = [];
            for (let j = 0; j < rows; j++) {
                arr[i][j] = 0;
                arr2[i][j] = false;
            }
        }
        setBoard(arr);
        setClickBoard(arr2);
    }, [columns, rows, mines, resetBoardTrigger])

    useEffect(() => {
        if (gameStatus == 'loss') handleLoss();
    }, [gameStatus])

    function generateMineBoard() { // Reset Mines
        let minesTemp = mines;
        let arr = [];

        for (let i = 0; i < columns; i++) {
            arr[i] = [];
            for (let j = 0; j < rows; j++) {
                arr[i][j] = 0;
            }
        }

        let usedMines = {};
        while (minesTemp > 0) {
            let i = Math.floor(Math.random() * columns);
            let j = Math.floor(Math.random() * rows);
            let key = [i, j];
            if (!(key in usedMines) && JSON.stringify(key) != JSON.stringify(firstClick.current)) {
                arr[i][j] = -1;
                usedMines[key] = true;
                minesTemp--;
            }
        }

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                if (arr[i][j] === 0) arr[i][j] = getCellNumber(i, j, arr);
            }
        }
        return arr;
    }

    let getCellNumber = (x, y, arr) => {
        let bombCount = 0;
        squareIteration(x, y, arr, (i, j) => {
            if (arr[x + i][y + j] == -1) bombCount++;
        });
        return bombCount;
    }

    let handleClick = (i, j) => { 
        if (mode == 'bullet') dispatch(setTime(5));

        if (firstClick.current == null) { // Check for first click
            let key = [i, j];
            firstClick.current = key;
            setBoard(generateMineBoard());
        } 
        if (gameStatus == 'idle') dispatch(setGameStatus('start'));

        if (gameStatus == 'win' || gameStatus == 'loss') return;
        if (clickBoard[i][j] === 'flagged') return;
        if (board.current[i][j] === -1) {
            handleLoss();
            return;
        } else if (clickBoard[i][j] == false) tilesSweeped.current++;
        
        if (minesLeft == 0) handleWin();
        
        tempClickBoard.current = structuredClone(clickBoard);
        if (clickBoard[i][j] === true) {
            let hitMine = chording(i, j, tempClickBoard.current);
            if (hitMine) return;
        };
        tempClickBoard.current[i][j] = true;
        
        if (board.current[i][j] === 0) burstClear(i, j, tempClickBoard.current);

        setClickBoard(tempClickBoard.current);
        if (tilesSweeped.current == columns*rows-mines)
            handleWin();
    }

    let chording = (x, y, tempClickBoard) => { 
        let skipChord = 0;
        squareIteration(x, y, board.current, (i, j) => { // Checks eligibility
            if (clickBoard[x+i][y+j] === 'flagged')
                skipChord++;
        });
        if (skipChord != board.current[x][y]) return;

        let hitMine = false;
        
        squareIteration(x, y, board.current, (i, j) => {
            if (clickBoard[x+i][y+j] !== 'flagged' && gameStatus == 'start') {
                if (board.current[x+i][y+j] == -1) {
                    handleLoss();
                    hitMine = true;
                    return;
                }
                if (!clickBoard[x+i][y+j] && !tempClickBoard[x+i][y+j]) tilesSweeped.current++;
                tempClickBoard[x+i][y+j] = true;
                if (board.current[x+i][y+j] === 0) burstClear(x+i, y+j, tempClickBoard);
            }
        });
        return hitMine;
    }

    let burstClear = (x, y, tempClickBoard) => {
        squareIteration(x, y, board.current, (i, j) => {
            // If neighbor is a 0 and not already revealed, recurse
            if (board.current[x + i][y + j] === 0 && !tempClickBoard[x + i][y + j]) {
                if (!clickBoard[x+i][y+j]) tilesSweeped.current++;
                tempClickBoard[x + i][y + j] = true;
                burstClear(x + i, y + j, tempClickBoard);
            }
            // Otherwise: expose it, but don't recurse further
            else if (!tempClickBoard[x + i][y + j]) {
                if (!clickBoard[x+i][y+j]) tilesSweeped.current++;
                tempClickBoard[x + i][y + j] = true;
            }
        });
    }

    let handleRightClick = (event, i, j) => {
        if (gameStatus != 'start') return;
        event.preventDefault();
        if (clickBoard[i][j] == true) return;

        tempClickBoard.current = structuredClone(clickBoard);
        if (clickBoard[i][j] === 'flagged') {
            tempClickBoard.current[i][j] = false;
            dispatch(incrementMinesLeft());
        }
        else {
            tempClickBoard.current[i][j] = 'flagged';
            dispatch(decrementMinesLeft());
        }

        setClickBoard(tempClickBoard.current);
    }

    function handleLoss() {
        dispatch(setGameStatus('loss'));
        console.log('loss');
        const revealed = clickBoard.map(col =>
            col.map(() => true)
        );
        setClickBoard(revealed);
    }

    function handleWin() {
        dispatch(setGameStatus('win'));
        console.log('win');
    }

    function squareIteration(x, y, arr, callback) {
        for (let i = -1; i <= 1; i++) { // Check to see if chording is allowed
            for (let j = -1; j <= 1; j++) {
                if (x + i < 0 || y + j < 0 || x + i >= arr.length || y + j >= arr[0].length)
                    continue;
                callback(i, j);
            }
        }
    }

    return (
        <>
            <div className='board-container'>
                {
                    board.current.map((column, colIndex) => {
                        return (
                            <div key={colIndex}>
                                {column.map((cell, rowIndex) => {
                                    return (
                                        <div key={[colIndex, rowIndex]}
                                            className={`cell ${(clickBoard[colIndex][rowIndex] == true) ? 'clear-cell' : ''} ${mode.replace('/', '')}`}
                                            style={{color: cellColors[cell]}}
                                            onClick={() => {
                                                handleClick(colIndex, rowIndex);
                                            }}
                                            onContextMenu={(e) => {
                                                handleRightClick(e, colIndex, rowIndex);
                                            }}
                                        >
                                            {((cellNumber) => {
                                                if (!clickBoard[colIndex][rowIndex]) {
                                                    return "";
                                                } else if (clickBoard[colIndex][rowIndex] === 'flagged') {
                                                    return <img src={flag} height="20px"></img>;
                                                }
                                                switch (cellNumber) {
                                                    case -1:
                                                        return <img src={bomb} height="25px"></img>;
                                                    case 0:
                                                        return (mode != 'hot/cold') ? '' : <div className='hotcold-tile' style={{backgroundColor: hotcoldColours[cell]}}></div>;
                                                    default:
                                                        return (mode != 'hot/cold') ? cellNumber : <div className='hotcold-tile' style={{backgroundColor: hotcoldColours[cell]}}></div>;
                                                }
                                            })(cell)}
                                        </div>
                                    );
                                })}
                                <br />
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Board
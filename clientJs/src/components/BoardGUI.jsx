import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { FaBomb, FaTemperatureLow } from "react-icons/fa";
import { PiDetective } from "react-icons/pi";
import { HiEyeOff } from "react-icons/hi";
import { GiSilverBullet } from "react-icons/gi";
import './BoardStyle.css'
import './TopPanel.css'
import { incrementTime, decrementTime, resetBoard, setGameStatus } from "../boardSlice";

function BoardGUI({children}) {
    return (
        <div className="gui-container">
            <div className="gui-box chizeled-out">
                <div className="top-panel chizeled-in">
                    <Timer />
                    <div className="centre">
                        <ResetButton />
                    </div>
                    <MineCounter/>
                </div>
                <div className="board chizeled-in">
                    {children}
                </div>
            </div>
        </div>
    )
}

function MineCounter() {
    const minesLeft = useSelector(state => state.board.minesLeft);
    return (
        <div className="digital-box">
            <div className="digital-text">
            {(minesLeft < 0) ? minesLeft :
            (minesLeft < 10) ? '00'+minesLeft :
            (minesLeft < 100) ? '0'+minesLeft : minesLeft}
            </div>
        </div>
    )
}

function Timer() {
    const time = useSelector(state => state.board.time);
    const mode = useSelector(state => state.board.mode);
    const gameStatus = useSelector(state => state.board.gameStatus);
    const dispatch = useDispatch();

    useEffect(() =>{
        if (gameStatus == 'start') {
            const timerId = setInterval(() => {
                if (mode != 'bullet') dispatch(incrementTime());
                else {
                    if (time <= 0) dispatch(setGameStatus('loss'));
                    else dispatch(decrementTime());
                }
            }, 1000); // Update every second
            return () => clearInterval(timerId);
        }
    },[time, gameStatus])

    let formatTime = (time) => {
        let timeString = '';
        if (time > 3600-1) time = 3600-1

        let minutes = 0;
        let seconds = '';

        minutes = Math.floor(time/60);
        seconds = time%60+'';
        if (seconds.length < 2) seconds = '0'+seconds;

        timeString = minutes+":"+seconds;

        return timeString
    }

    return(
        <div className="digital-box">
            <div className="digital-text">
                {formatTime(time)}
            </div>
        </div>
    )
}

function ResetButton() {
    const mode = useSelector(state => state.board.mode);
    const dispatch = useDispatch();
    return (
        <div className="chizeled-out clear-button"
            onClick={() => {
                dispatch(resetBoard());
            }}>
            {(mode == 'classic') ? <FaBomb /> : 
            (mode == 'blind') ? <HiEyeOff /> : 
            (mode == 'hot/cold') ? <FaTemperatureLow /> :
            (mode == 'bullet') ? <GiSilverBullet /> : 
            (mode == 'noir') ? <PiDetective /> : ''}
        </div>
    )
}

export default BoardGUI
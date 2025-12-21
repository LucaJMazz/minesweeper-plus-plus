import { useSelector, useDispatch } from 'react-redux';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GoZoomIn, GoZoomOut } from "react-icons/go";
import { useState, useEffect } from 'react';
import './App.css';
import Board from './components/Board.jsx';
import BoardGUI from './components/BoardGUI.jsx';
import { setMines, setColumns, setRows, resetBoard, setMode } from './boardSlice';

function App() {
  const mode = useSelector(state => state.board.mode);
  const [modeButtonToggle, setModeButtonToggle] = useState(false); 
  const [sizeButtonToggle, setSizeButtonToggle] = useState(false); 
  const [zoom, setZoom] = useState(1);


  /**
   * mouse tracker
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      const mx = document.getElementById('blind-mask');
      if (mx) {
        const rect = mx.getBoundingClientRect()
        mx.style.setProperty('--pos-x', `${e.clientX - rect.left}px`);
        mx.style.setProperty('--pos-y', `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); 

  return (
    <div className='app-container'>
      <h1 className="title">
        minesweeper
      </h1>

      <div className='input-container'>
        <button className='zoom-button' onClick={() => {
          if(zoom > 0.5) {
            let zoomTemp = zoom-.1;
            setZoom(zoomTemp);
            document.documentElement.style.setProperty('--zoom', zoomTemp);
          }
          }}> <GoZoomOut /> </button>
        <div 
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setModeButtonToggle(false);
          }
        }}>
          <button className='mode-dropdown' 
          onClick={() => {setModeButtonToggle(!modeButtonToggle)}}> 
            <p>{mode}</p> 
            {(!modeButtonToggle) ? <FaChevronDown /> : ''} 
            {(modeButtonToggle) ? <FaChevronUp /> : ''} 
          </button>
            {(modeButtonToggle) ? <DropdownMenu closeMenu={setModeButtonToggle}/> : ''}
        </div>
        
        <div
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setSizeButtonToggle(false);
          }
        }}>
          <button className='mode-dropdown' 
          onClick={() => {setSizeButtonToggle(!sizeButtonToggle)}}> 
            <p> size </p> 
            {(!sizeButtonToggle) ? <FaChevronDown /> : ''} 
            {(sizeButtonToggle) ? <FaChevronUp /> : ''} 
          </button>
            {(sizeButtonToggle) ? <SizeMenu closeMenu={setSizeButtonToggle}/> : ''}
        </div>
          <button className='zoom-button' onClick={() => {
            if(zoom < 1) {
            let zoomTemp = zoom+.1;
            setZoom(zoomTemp);
            document.documentElement.style.setProperty('--zoom', zoomTemp);
            }
          }}> <GoZoomIn /> </button>
        </div>
        
        <div className={`board-holder ${(modeButtonToggle || sizeButtonToggle) ? 'menu-blur' : 'menu-unblur'} ${(mode == 'noir') ? 'noir' : ''}`}> 
        <BoardGUI>
          <div id={'blind-mask'} className={`${(mode == 'blind') ? 'blind-mask' : ''}`}>
            <Board/>
          </div>
        </BoardGUI> 
        </div>
    </div>
  )
}

function SizeMenu({closeMenu}) {
  const columns = useSelector(state => state.board.columns);
  const rows = useSelector(state => state.board.rows);
  const mines = useSelector(state => state.board.mines);
  const maxLength = 50;
  const dispatch = useDispatch();
  return (
    <div className='dropdown-container'>

      <button className='dropdown-item' onClick={() => {
          dispatch(setMines(10));
          dispatch(setRows(9));
          dispatch(setColumns(9));
          dispatch(resetBoard());
          closeMenu(false);
        }}> Small </button>
        <button className='dropdown-item' onClick={() => {
          dispatch(setMines(40));
          dispatch(setRows(16));
          dispatch(setColumns(16));
          dispatch(resetBoard());
          closeMenu(false);
        }}> Medium </button>
        <button className='dropdown-item' onClick={() => {
          dispatch(setMines(99));
          dispatch(setRows(16));
          dispatch(setColumns(30));
          dispatch(resetBoard());
          closeMenu(false);
        }}> Large </button>

      <hr/>

      <span className='size-span'>
          <p>Columns</p>
          <input
            type="number"
            value={columns}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return;
              const val = Math.min(Math.max(1, Number(raw)), maxLength);
              dispatch(setColumns(val));
              dispatch(setMines(Math.min(rows * val - 1, mines)));
              dispatch(resetBoard());
            }}
          />
        </span>
        <span className='size-span'>
          <p>Rows</p>
          <input type="number" value={rows} onChange={(e)=>{
            const raw = e.target.value;
            if (raw === "") return;
            const val = Math.min(Math.max(1, Number(raw)), maxLength);
            dispatch(setRows(val));
            dispatch(setMines(Math.min(val * columns - 1, mines)));
            dispatch(resetBoard());
          }}> 
          </input>
        </span>
        <span className='size-span'>
          <p>Mines</p>
          <input type="number" value={mines} onChange={(e)=>{
            const raw = e.target.value;
            if (raw === "") return;
            const val = Math.max(1, Number(raw));
            val >= rows*columns ? dispatch(setMines(rows*columns - 1)) :
            dispatch(setMines(val))
            dispatch(resetBoard());
            }}> 
          </input>
        </span>
    </div>
  );
}

function DropdownMenu({closeMenu}) {
  const mode = useSelector(state => state.board.mode);
  return (
    <>
    <div className='dropdown-container'>
          <DropdownItemMode closeMenu={closeMenu} value={'classic'} checked={ (mode == 'classic') ? true : false }/>
          <DropdownItemMode closeMenu={closeMenu} value={'blind'} checked={ (mode == 'blind') ? true : false }/>
          <DropdownItemMode closeMenu={closeMenu} value={'hot/cold'} checked={ (mode == 'hot/cold') ? true : false }/>
          <DropdownItemMode closeMenu={closeMenu} value={'bullet'} checked={ (mode == 'bullet') ? true : false }/>
          <DropdownItemMode closeMenu={closeMenu} value={'noir'} checked={ (mode == 'noir') ? true : false }/>
      </div>
    </>
  )
}

function DropdownItemMode({value, checked, closeMenu}) {
  const dispatch = useDispatch();
  return (
    <>
      <button className={`dropdown-item ${(checked) ? 'checked' : ''}`} name='mode' value={value} onClick={(e) => {
        dispatch(setMode( (e.target.value) ));
        closeMenu(false);
        }}> {value} </button>
    </>
  )
}

export default App

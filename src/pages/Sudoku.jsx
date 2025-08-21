import React, { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Difficulty: fraction of cells kept filled initially (higher = easier)
 */
const DIFFICULTY_MAP = {
  Easy: 0.55,
  Medium: 0.4,
  Hard: 0.3,
};

const range9 = [...Array(9).keys()];

function deepCopy(board) {
  return board.map((r) => [...r]);
}

function generateSudoku(difficulty = "Easy") {
  // Very basic Sudoku generator (not fully unique solution guaranteed).
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isSafe(row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (solution[row][x] === num || solution[x][col] === num) return false;
    }
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (solution[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  }

  function fillGrid() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (solution[row][col] === 0) {
          const nums = range9.map((n) => n + 1).sort(() => Math.random() - 0.5);
          for (let num of nums) {
            if (isSafe(row, col, num)) {
              solution[row][col] = num;
              if (fillGrid()) return true;
              solution[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillGrid();

  const puzzle = deepCopy(solution);
  const keepFraction = DIFFICULTY_MAP[difficulty];
  for (let i = 0; i < 81; i++) {
    if (Math.random() > keepFraction) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      puzzle[r][c] = 0;
    }
  }
  return { puzzle, solution };
}

function Cell({ r, c, val, selected, setSelected, fixed, incorrect, board }) {
  const isSelected = selected[0] === r && selected[1] === c;
  const sameRow = selected[0] === r;
  const sameCol = selected[1] === c;
  const sameBlock =
    Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
    Math.floor(selected[1] / 3) === Math.floor(c / 3);

  const isHighlighted =
    (val !== 0 && val === board[selected[0]][selected[1]]) ||
    sameRow ||
    sameCol ||
    sameBlock;

  return (
    <div
      onClick={() => !fixed && setSelected([r, c])}
      className={`flex items-center justify-center border border-gray-600 text-lg sm:text-2xl
        ${fixed ? "bg-gray-800 font-bold text-blue-300" : "cursor-pointer"}
        ${isSelected ? "bg-yellow-600" : isHighlighted ? "bg-gray-700" : ""}
        ${incorrect ? "bg-red-500 text-white" : ""}`}
    >
      {val !== 0 ? val : ""}
    </div>
  );
}

function NumberPad({ onClick, onClear }) {
  return (
    <div className="grid grid-cols-5 gap-2 mt-2">
      {range9.map((i) => (
        <button
          key={i}
          onClick={() => onClick(i + 1)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={onClear}
        className="px-4 py-2 col-span-2 bg-gray-500 hover:bg-gray-600 rounded-lg"
      >
        Clear
      </button>
    </div>
  );
}

function TopBar({ lives, timer }) {
  return (
    <div className="flex justify-between items-center w-full px-2 mb-2 text-lg sm:text-xl">
      <span>❤️ {lives}</span>
      <span>⏱ {timer}s</span>
    </div>
  );
}

function Overlay({ message, timer, onRetry, onMenu }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-20 text-center">
      <h2 className="text-3xl sm:text-4xl mb-4">{message}</h2>
      {timer && <p className="text-lg mb-4">Time: {timer}s</p>}
      <div className="flex gap-2">
        <button onClick={onRetry} className="px-4 py-2 bg-blue-500 rounded-lg">
          Retry
        </button>
        <button onClick={onMenu} className="px-4 py-2 bg-gray-500 rounded-lg">
          Menu
        </button>
      </div>
    </div>
  );
}

export default function SudokuMain() {
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [selected, setSelected] = useState([0, 0]);
  const [incorrect, setIncorrect] = useState([]);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon && !gameOver) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon, gameOver]);

  const startNewGame = useCallback((diff) => {
    const { puzzle, solution } = generateSudoku(diff);
    setBoard(puzzle);
    setSolution(solution);
    setFixed(puzzle.map((r) => r.map((v) => v !== 0)));
    setIncorrect(Array.from({ length: 9 }, () => Array(9).fill(false)));
    setSelected([0, 0]);
    setLives(3);
    setTimer(0);
    setGameStarted(true);
    setGameWon(false);
    setGameOver(false);
  }, []);

  function attemptSetNumber(r, c, num) {
    if (fixed[r][c]) return;
    if (solution[r][c] === num) {
      const newBoard = deepCopy(board);
      newBoard[r][c] = num;
      setBoard(newBoard);
      const allFilled = newBoard.every((row) => row.every((v) => v !== 0));
      if (allFilled) setGameWon(true);
    } else {
      const newIncorrect = deepCopy(incorrect);
      newIncorrect[r][c] = true;
      setIncorrect(newIncorrect);
      setLives((l) => {
        if (l - 1 <= 0) setGameOver(true);
        return l - 1;
      });
    }
  }

  function clearCell(r, c) {
    if (!fixed[r][c]) {
      const newBoard = deepCopy(board);
      newBoard[r][c] = 0;
      setBoard(newBoard);
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gray-950 text-white px-2 relative">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-2">Sudoku</h1>

      {!difficulty && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-xl sm:text-2xl">Select Difficulty</h2>
          {Object.keys(DIFFICULTY_MAP).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                startNewGame(d);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {(gameStarted || gameWon || gameOver) && (
        <div className="flex flex-col justify-between h-full w-full max-w-md">
          <TopBar lives={lives} timer={timer} />

          {/* Sudoku Grid */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-9 aspect-square w-full">
              {board.map((row, r) =>
                row.map((val, c) => (
                  <Cell
                    key={`${r}-${c}`}
                    r={r}
                    c={c}
                    val={val}
                    selected={selected}
                    setSelected={setSelected}
                    fixed={fixed[r]?.[c]}
                    incorrect={incorrect[r]?.[c]}
                    board={board}
                  />
                ))
              )}
            </div>
          </div>

          {/* Number Pad */}
          <NumberPad
            onClick={(n) => attemptSetNumber(...selected, n)}
            onClear={() => clearCell(...selected)}
          />

          {/* Controls */}
          <div className="mt-2 mb-2 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => startNewGame(difficulty)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              New Game
            </button>
            <button
              onClick={() => {
                setDifficulty(null);
                setGameStarted(false);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Change Level
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        <Overlay
          message="🎉 You Won!"
          timer={timer}
          onRetry={() => startNewGame(difficulty)}
          onMenu={() => setDifficulty(null)}
        />
      )}
      {gameOver && (
        <Overlay
          message="💀 Game Over"
          onRetry={() => startNewGame(difficulty)}
          onMenu={() => setDifficulty(null)}
        />
      )}
    </div>
  );
}

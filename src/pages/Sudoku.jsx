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
  return board.map((r) => r.slice());
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

/**
 * Create a fully solved Sudoku board using backtracking.
 */
function generateSolvedBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (r, c, val) => {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === val || board[i][c] === val) return false;
    }
    const rs = Math.floor(r / 3) * 3;
    const cs = Math.floor(c / 3) * 3;
    for (let i = rs; i < rs + 3; i++) {
      for (let j = cs; j < cs + 3; j++) {
        if (board[i][j] === val) return false;
      }
    }
    return true;
  };

  // random order for 1..9
  const shuffled = () => range9.map((i) => i + 1).sort(() => Math.random() - 0.5);

  const fill = () => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (const n of shuffled()) {
            if (isValid(r, c, n)) {
              board[r][c] = n;
              if (fill()) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fill();
  return board;
}

/**
 * Create a puzzle by removing cells from a solved board according to difficulty.
 * keepFraction = fraction of cells that remain filled initially.
 */
function makePuzzleFromSolution(solution, keepFraction) {
  const puzzle = deepCopy(solution);
  // Randomly remove cells based on keepFraction
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (Math.random() > keepFraction) {
        puzzle[r][c] = ""; // empty
      }
    }
  }
  return puzzle;
}

const SudokuMain = () => {
  // UI / Game state
  const [difficulty, setDifficulty] = useState(null); // "Easy" | "Medium" | "Hard"
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Boards
  const [solution, setSolution] = useState([]); // numbers 1..9
  const [board, setBoard] = useState([]); // user state: numbers or ""
  const [fixed, setFixed] = useState([]); // true if cell is locked (pre-filled or correctly filled)
  const [incorrect, setIncorrect] = useState([]); // boolean map of wrong entries

  // Interaction
  const [selected, setSelected] = useState([0, 0]); // [row, col]
  const [lives, setLives] = useState(5);
  const [timer, setTimer] = useState(0);

  // Build boolean grids easily
  const emptyBoolGrid = () => Array.from({ length: 9 }, () => Array(9).fill(false));

  const startNewGame = useCallback(
    (level) => {
      const solved = generateSolvedBoard();
      const puzzle = makePuzzleFromSolution(solved, DIFFICULTY_MAP[level]);

      const initFixed = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => puzzle[r][c] !== "")
      );
      const initIncorrect = emptyBoolGrid();

      setSolution(solved);
      setBoard(puzzle);
      setFixed(initFixed);
      setIncorrect(initIncorrect);

      setSelected([0, 0]); // (0,0) selected at start
      setLives(5);
      setTimer(0);
      setGameWon(false);
      setGameOver(false);
      setGameStarted(true);
    },
    []
  );

  // Timer
  useEffect(() => {
    if (!gameStarted || gameWon || gameOver) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameStarted, gameWon, gameOver]);

  // Key handling (1..9 to set, backspace/delete/0 to clear)
  useEffect(() => {
    if (!gameStarted || gameWon || gameOver) return;

    const handler = (e) => {
      const [r, c] = selected;
      if (r == null || c == null) return;

      if (fixed[r][c]) return; // locked cells don't react

      if ("123456789".includes(e.key)) {
        attemptSetNumber(r, c, parseInt(e.key, 10));
      } else if (["Backspace", "Delete", "0"].includes(e.key)) {
        clearCell(r, c);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, fixed, gameStarted, gameWon, gameOver, board, solution]);

  // Place a number in a cell: lock if correct, mark red if wrong
  const attemptSetNumber = (r, c, val) => {
    if (fixed[r][c]) return; // no reaction

    const correctVal = solution[r][c];

    setBoard((prev) => {
      const next = deepCopy(prev);
      next[r][c] = val;
      return next;
    });

    if (val === correctVal) {
      // Correct: lock it and clear any incorrect flag
      setFixed((prev) => {
        const next = deepCopy(prev);
        next[r][c] = true;
        return next;
      });
      setIncorrect((prev) => {
        const next = deepCopy(prev);
        next[r][c] = false;
        return next;
      });
    } else {
      // Wrong: mark incorrect and lose a life
      setIncorrect((prev) => {
        const next = deepCopy(prev);
        next[r][c] = true;
        return next;
      });
      setLives((prev) => {
        const remaining = prev - 1;
        if (remaining <= 0) {
          setGameOver(true);
          setGameStarted(false);
        }
        return remaining;
      });
    }
  };

  // Clear a non-fixed cell (also clears incorrect state)
  const clearCell = (r, c) => {
    if (fixed[r][c]) return; // locked cells don't react
    setBoard((prev) => {
      const next = deepCopy(prev);
      next[r][c] = "";
      return next;
    });
    setIncorrect((prev) => {
      const next = deepCopy(prev);
      next[r][c] = false;
      return next;
    });
  };

  // Hint fills selected cell with the correct value and locks it
  const handleHint = () => {
    const [r, c] = selected;
    if (r == null || c == null) return;
    if (fixed[r][c]) return;

    const val = solution[r][c];
    setBoard((prev) => {
      const next = deepCopy(prev);
      next[r][c] = val;
      return next;
    });
    setIncorrect((prev) => {
      const next = deepCopy(prev);
      next[r][c] = false;
      return next;
    });
    setFixed((prev) => {
      const next = deepCopy(prev);
      next[r][c] = true;
      return next;
    });
  };

  // Win detection: all cells fixed
  useEffect(() => {
    if (!gameStarted) return;
    const allFixed =
      fixed.length &&
      fixed.every((row) => row.every((v) => v === true));
    if (allFixed) {
      setGameWon(true);
      setGameStarted(false);
    }
  }, [fixed, gameStarted]);

  // UI Parts

  const DifficultyPicker = () => (
    <div className="flex items-center justify-center gap-3">
      {Object.keys(DIFFICULTY_MAP).map((lvl) => (
        <button
          key={lvl}
          onClick={() => setDifficulty(lvl)}
          className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold shadow"
        >
          {lvl}
        </button>
      ))}
    </div>
  );

  const Controls = () => (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        onClick={handleHint}
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow"
      >
        Hint
      </button>
      <button
        onClick={() => startNewGame(difficulty)}
        className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold shadow"
      >
        New Game
      </button>
      <button
        onClick={() => {
          setDifficulty(null);
          setGameStarted(false);
          setGameWon(false);
          setGameOver(false);
        }}
        className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold shadow"
      >
        Change Difficulty
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-2  px-2 text-center select-none w-[80vw] ">
      <h1 className="text-4xl font-extrabold text-blue-400 mb-4 tracking-wide">
        SUDOKU
      </h1>

      {!gameStarted && !difficulty && (
        <>
          <p className="mb-4 text-gray-400">Choose difficulty to begin</p>
          <DifficultyPicker />
        </>
      )}

      {!gameStarted && difficulty && !gameWon && !gameOver && (
        <button
          onClick={() => startNewGame(difficulty)}
          className="mt-4 px-5 py-2.5 rounded-xl cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow"
        >
          Start Game
        </button>
      )}

      {(gameStarted || gameWon || gameOver) && (
        <>
          <TopBar lives={lives} timer={timer} />

          <div className="mt-2 grid grid-cols-9 border-4 border-gray-900 rounded-md overflow-hidden">
            {board.map((row, r) =>
              row.map((val, c) => (
                <Cell
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  val={val}
                  selected={selected}
                  setSelected={setSelected}
                  fixed={fixed[r]?.[c] ?? false}
                  incorrect={incorrect[r]?.[c] ?? false}
                />
              ))
            )}
          </div>

          <NumberPad onClick={(n) => attemptSetNumber(...selected, n)} onClear={() => clearCell(...selected)} />

          <Controls />
        </>
      )}

      {/* Win Overlay */}
      {gameWon && (
        <Overlay>
          <div className="bg-gray-800 text-white rounded-2xl p-6 shadow-xl w-80">
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              🎉 Congratulations!
            </h2>
            <p className="mb-4 text-gray-300">
              You solved it in <span className="font-semibold">{formatTime(timer)}</span>
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
                onClick={() => startNewGame(difficulty)}
              >
                New Game
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 font-semibold"
                onClick={() => {
                  setDifficulty(null);
                  setGameWon(false);
                  setGameOver(false);
                }}
              >
                Change Level
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <Overlay>
          <div className="bg-gray-800 text-white rounded-2xl p-6 shadow-xl w-80">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
            <p className="mb-4 text-gray-300">You ran out of lives.</p>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
                onClick={() => startNewGame(difficulty ?? "Easy")}
              >
                Try Again
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 font-semibold"
                onClick={() => {
                  setDifficulty(null);
                  setGameOver(false);
                }}
              >
                Change Level
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

/** Top bar with lives and timer */
const TopBar = ({ lives, timer }) => {
  return (
    <div className="flex items-center justify-between text-sm sm:text-base text-gray-200 bg-gray-900 rounded-lg px-4 py-2">
      <div className="font-semibold">
        Lives: <span className="text-red-400">{lives}</span> / 5
      </div>
      <div className="font-semibold">
        Time: <span className="text-blue-400">{formatTime(timer)}</span>
      </div>
    </div>
  );
};

/** Number pad */
const NumberPad = ({ onClick, onClear }) => {
  return (
    <div className="mt-4 grid grid-cols-10 gap-5 justify-center w-fit mx-auto">
      {range9.map((i) => (
        <button
          key={i + 1}
          onClick={() => onClick(i + 1)}
          className="px-4 flex items-center justify-center py-4 text-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold"
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={onClear}
        className=" py-4 px-4 text-center text-2xl relative rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold"
      >
        <span className="absolute top-1/2 left-1/2 -translate-1/2">❌</span>
      </button>
    </div>
  );
};

/** Full-screen overlay container */
const Overlay = ({ children }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    {children}
  </div>
);

/** A single cell */
const Cell = ({ r, c, val, selected, setSelected, fixed, incorrect }) => {
  const [sr, sc] = selected;
  const isSelected = sr === r && sc === c;

  // group highlight (same row/col/box as selected)
  const sameRow = sr === r;
  const sameCol = sc === c;
  const sameBox =
    Math.floor(sr / 3) === Math.floor(r / 3) &&
    Math.floor(sc / 3) === Math.floor(c / 3);
  const isRelevant = (sameRow || sameCol || sameBox) && !(sr === null || sc === null);

  // Borders for 3x3 boxes
  const borders = [
    r % 3 === 0 ? "border-t-4" : "border-t",
    r === 8 ? "border-b-4" : "border-b",
    c % 3 === 0 ? "border-l-4" : "border-l",
    c === 8 ? "border-r-4" : "border-r",
  ].join(" ");

  /**
   * Background color precedence:
   * 1) incorrect -> red
   * 2) selected  -> blue-700
   * 3) relevant  -> blue-500
   * 4) fixed     -> gray-600
   * 5) normal    -> gray-700
   */
  let bg = "bg-gray-700";
  if (fixed) bg = "bg-gray-600";
  if (isRelevant) bg = "bg-blue-500";
  if (isSelected) bg = "bg-blue-700";
  if (incorrect) bg = "bg-red-600";

  return (
    <div
      className={`flex items-center text-center justify-center w-10 h-10 sm:w-12 sm:h-12 cursor-pointer ${borders} border-gray-900 text-white ${bg} ${
        fixed ? "font-extrabold" : val ? "font-bold" : ""
      }`}
      onClick={() => setSelected([r, c])}
      title={`r${r + 1},c${c + 1}`}
    >
      {val}
    </div>
  );
};

export default SudokuMain;

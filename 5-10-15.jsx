// CoinFusion.jsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const coinImages = {
  5: 'https://monticello-www.s3.amazonaws.com/files/old/uploaded-content-images/1024px-Jefferson-Nickel-Unc-Obv.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Dime_Obverse_13.png',
  25: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/2022_Washington_quarter_obverse.jpeg/250px-2022_Washington_quarter_obverse.jpeg',
  50: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/US_Half_Dollar_Obverse_2015.png/500px-US_Half_Dollar_Obverse_2015.png',
  100: 'https://upload.wikimedia.org/wikipedia/commons/5/54/2003_Sacagawea_Rev.png'
};

const GRID_SIZE = 4;
const STARTING_COINS = [5, 10]; // nickels or dimes
const MERGE_RULES = {
  "5,5": 10,
  "25,25": 50,
  "50,50": 100
};

function deepCopy(board) {
  return board.map(row => [...row]);
}

function getEmptyCells(board) {
  const cells = [];
  board.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (!cell) cells.push([i, j]);
    })
  );
  return cells;
}

function spawnCoin(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const [i, j] = empty[Math.floor(Math.random() * empty.length)];
  board[i][j] = STARTING_COINS[Math.random() < 0.9 ? 0 : 1];
  return board;
}

function mergeRow(row) {
  const newRow = row.filter(v => v !== 0);
  const merged = [];
  let i = 0;
  while (i < newRow.length) {
    if (
      i + 1 < newRow.length &&
      MERGE_RULES[`${newRow[i]},${newRow[i + 1]}`]
    ) {
      merged.push(MERGE_RULES[`${newRow[i]},${newRow[i + 1]}`]);
      i += 2;
    } else if (
      newRow.slice(i, i + 5).every(v => v === 10)
    ) {
      merged.push(50);
      i += 5;
    } else {
      merged.push(newRow[i]);
      i++;
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return merged;
}

function transpose(board) {
  return board[0].map((_, i) => board.map(row => row[i]));
}

function reverse(board) {
  return board.map(row => [...row].reverse());
}

function moveBoard(board, dir) {
  let newBoard = deepCopy(board);
  if (dir === "left") {
    newBoard = newBoard.map(mergeRow);
  } else if (dir === "right") {
    newBoard = reverse(newBoard).map(mergeRow);
    newBoard = reverse(newBoard);
  } else if (dir === "up") {
    newBoard = transpose(newBoard).map(mergeRow);
    newBoard = transpose(newBoard);
  } else if (dir === "down") {
    newBoard = transpose(reverse(newBoard)).map(mergeRow);
    newBoard = reverse(transpose(newBoard));
  }
  return newBoard;
}

export default function CoinFusion() {
  const [board, setBoard] = useState(() => {
    const fresh = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    return spawnCoin(spawnCoin(fresh));
  });

  const handleKey = (e) => {
    const dirKeys = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    };
    const dir = dirKeys[e.key];
    if (dir) {
      e.preventDefault();
      const moved = moveBoard(board, dir);
      if (JSON.stringify(moved) !== JSON.stringify(board)) {
        setBoard(spawnCoin(moved));
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [board]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">💰 Coin Fusion</h1>
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((val, idx) => (
          <Card
            key={idx}
            className="w-20 h-20 flex items-center justify-center bg-zinc-100 shadow-inner rounded-2xl"
          >
            {val !== 0 && (
              <img src={coinImages[val]} alt={`${val}¢`} className="h-12 w-12" />
            )}
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">Use your arrow keys to merge coins!</p>
    </div>
  );
}

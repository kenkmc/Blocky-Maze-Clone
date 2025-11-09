const levels = [
  {
    id: 1,
    name: 'Straight Shot',
    rows: 3,
    cols: 7,
    start: { row: 1, col: 1 },
    startDirection: 'east',
    moves: 'EEEE',
    extraOpens: []
  },
  {
    id: 2,
    name: 'Corner Practice',
    rows: 6,
    cols: 7,
    start: { row: 1, col: 1 },
    startDirection: 'east',
    moves: 'SSEEEE',
    extraOpens: []
  },
  {
    id: 3,
    name: 'Left Alley',
    rows: 6,
    cols: 7,
    start: { row: 4, col: 1 },
    startDirection: 'east',
    moves: 'EENNNEE',
    extraOpens: []
  },
  {
    id: 4,
    name: 'Zig Trainer',
    rows: 7,
    cols: 7,
    start: { row: 5, col: 1 },
    startDirection: 'east',
    moves: 'EENNEENN',
    extraOpens: []
  },
  {
    id: 5,
    name: 'Tight Corridor',
    rows: 7,
    cols: 7,
    start: { row: 5, col: 5 },
    startDirection: 'west',
    moves: 'WWNNNEE',
    extraOpens: []
  },
  {
    id: 6,
    name: 'Step Ladder',
    rows: 8,
    cols: 8,
    start: { row: 6, col: 1 },
    startDirection: 'east',
    moves: 'EENENENEE',
    extraOpens: []
  },
  {
    id: 7,
    name: 'Loop Lane',
    rows: 8,
    cols: 8,
    start: { row: 6, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNWWNNNEEE',
    extraOpens: []
  },
  {
    id: 8,
    name: 'Spiral In',
    rows: 9,
    cols: 9,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEEEENNNNWWWWSSSSEEE',
    extraOpens: []
  },
  {
    id: 9,
    name: 'Spiral Out',
    rows: 9,
    cols: 9,
    start: { row: 1, col: 1 },
    startDirection: 'south',
    moves: 'SSSSSEEEEEE',
    extraOpens: []
  },
  {
    id: 10,
    name: 'Double Bend',
    rows: 9,
    cols: 9,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEENNNWWWNNNEEEE',
    extraOpens: []
  },
  {
    id: 11,
    name: 'Fork Intro',
    rows: 9,
    cols: 9,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEEEENNNNE',
    extraOpens: [
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 6, col: 6 }
    ]
  },
  {
    id: 12,
    name: 'Decision Alley',
    rows: 9,
    cols: 9,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNNEEE',
    extraOpens: [
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 6, col: 6 }
    ]
  },
  {
    id: 13,
    name: 'Side Streets',
    rows: 9,
    cols: 11,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNNNEEEE',
    extraOpens: [
      { row: 6, col: 2 },
      { row: 6, col: 3 },
      { row: 6, col: 7 },
      { row: 6, col: 8 },
      { row: 6, col: 9 }
    ]
  },
  {
    id: 14,
    name: 'Weave',
    rows: 9,
    cols: 11,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEENNEEENNEEE',
    extraOpens: [
      { row: 6, col: 4 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 4, col: 5 },
      { row: 4, col: 6 }
    ]
  },
  {
    id: 15,
    name: 'Backtrack Bay',
    rows: 9,
    cols: 11,
    start: { row: 7, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNNWWWNNEEEE',
    extraOpens: [
      { row: 6, col: 3 },
      { row: 6, col: 4 },
      { row: 5, col: 4 },
      { row: 4, col: 4 },
      { row: 4, col: 5 }
    ]
  },
  {
    id: 16,
    name: 'Switchback',
    rows: 11,
    cols: 11,
    start: { row: 9, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNWWNNWWNNNEEEE',
    extraOpens: []
  },
  {
    id: 17,
    name: 'Sensor Maze',
    rows: 11,
    cols: 11,
    start: { row: 9, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNNNEEEE',
    extraOpens: [
      { row: 8, col: 3 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
      { row: 8, col: 5 },
      { row: 6, col: 6 },
      { row: 7, col: 7 },
      { row: 8, col: 7 }
    ]
  },
  {
    id: 18,
    name: 'Barrier Run',
    rows: 11,
    cols: 11,
    start: { row: 9, col: 1 },
    startDirection: 'east',
    moves: 'EENNEENNNEEEE',
    extraOpens: [
      { row: 8, col: 2 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 4, col: 6 },
      { row: 4, col: 7 }
    ]
  },
  {
    id: 19,
    name: 'Gauntlet',
    rows: 11,
    cols: 13,
    start: { row: 9, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNNNWWWNNNNEEEEE',
    extraOpens: [
      { row: 8, col: 4 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
      { row: 7, col: 6 },
      { row: 6, col: 6 },
      { row: 6, col: 7 },
      { row: 5, col: 7 },
      { row: 5, col: 8 },
      { row: 4, col: 8 },
      { row: 4, col: 9 },
      { row: 3, col: 9 }
    ]
  },
  {
    id: 20,
    name: 'Grand Finale',
    rows: 13,
    cols: 13,
    start: { row: 11, col: 1 },
    startDirection: 'east',
    moves: 'EEEENNWWNNWWNNNEEEEEE',
    extraOpens: [
      { row: 10, col: 2 },
      { row: 9, col: 2 },
      { row: 8, col: 2 },
      { row: 8, col: 3 },
      { row: 8, col: 4 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
      { row: 6, col: 5 },
      { row: 6, col: 6 },
      { row: 5, col: 6 },
      { row: 5, col: 7 },
      { row: 4, col: 7 },
      { row: 4, col: 8 },
      { row: 3, col: 8 },
      { row: 3, col: 9 }
    ]
  }
];

const directionVectors = {
  north: { row: -1, col: 0 },
  south: { row: 1, col: 0 },
  east: { row: 0, col: 1 },
  west: { row: 0, col: -1 }
};

const moveVectors = {
  N: { row: -1, col: 0 },
  S: { row: 1, col: 0 },
  E: { row: 0, col: 1 },
  W: { row: 0, col: -1 }
};

function generateMap(def) {
  const grid = Array.from({ length: def.rows }, () => Array(def.cols).fill('#'));
  const path = [{ ...def.start }];
  let current = { ...def.start };
  for (const move of def.moves) {
    const delta = moveVectors[move];
    if (!delta) {
      throw new Error(`Unsupported move '${move}' in level ${def.id}`);
    }
    current = { row: current.row + delta.row, col: current.col + delta.col };
    if (current.row < 0 || current.row >= def.rows || current.col < 0 || current.col >= def.cols) {
      throw new Error(`Move '${move}' leaves the grid in level ${def.id}`);
    }
    path.push({ ...current });
  }

  for (const cell of path) {
    grid[cell.row][cell.col] = '.';
  }
  for (const extra of def.extraOpens ?? []) {
    grid[extra.row][extra.col] = '.';
  }

  const startCell = path[0];
  const goalCell = path[path.length - 1];
  grid[startCell.row][startCell.col] = 'S';
  grid[goalCell.row][goalCell.col] = 'G';

  return grid.map((row) => row.join(''));
}

for (const level of levels) {
  const map = generateMap(level);
  console.log(`Level ${level.id}:`);
  console.log(map.map((row) => `  '${row}',`).join('\n'));
  console.log(`Moves: ${level.moves.length}`);
  console.log();
}

import type { MazeLevel, MazeLevelDefinition, MazeTile } from './mazeTypes';

const toolboxForward = {
  kind: 'flyoutToolbox',
  contents: [{ kind: 'block', type: 'maze_move_forward' }]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxTurns = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxRepeat = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxCountLoops = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' },
    {
      kind: 'block',
      type: 'controls_repeat_ext',
      inputs: {
        TIMES: {
          block: {
            type: 'math_number',
            fields: { NUM: 4 }
          }
        }
      }
    }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxSensing = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' },
    {
      kind: 'block',
      type: 'controls_repeat_ext',
      inputs: {
        TIMES: {
          block: {
            type: 'math_number',
            fields: { NUM: 4 }
          }
        }
      }
    },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_if_path' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxBranching = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' },
    {
      kind: 'block',
      type: 'controls_repeat_ext',
      inputs: {
        TIMES: {
          block: {
            type: 'math_number',
            fields: { NUM: 4 }
          }
        }
      }
    },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_if_path' },
    { kind: 'block', type: 'maze_if_else_path' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxAdvanced = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' },
    {
      kind: 'block',
      type: 'controls_repeat_ext',
      inputs: {
        TIMES: {
          block: {
            type: 'math_number',
            fields: { NUM: 4 }
          }
        }
      }
    },
    { kind: 'block', type: 'maze_if_path' },
    { kind: 'block', type: 'maze_if_else_path' },
    { kind: 'sep' },
    { kind: 'block', type: 'logic_compare' },
    { kind: 'block', type: 'logic_operation' },
    { kind: 'block', type: 'logic_boolean' },
    { kind: 'block', type: 'math_number' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const rawLevels: MazeLevelDefinition[] = [
  {
    id: 1,
    name: 'Straight Shot',
    map: [
      '#######',
      '#S...G#',
      '#######'
    ],
    startDirection: 'east',
    maxBlocks: 4,
    intro: 'Drive straight to the goal with only forward moves.',
    toolbox: toolboxForward,
    solution: 'Move forward 4 times.'
  },
  {
    id: 2,
    name: 'Corner Practice',
    map: [
      '#######',
      '#S#####',
      '#.#####',
      '#....G#',
      '#######',
      '#######'
    ],
    startDirection: 'east',
    maxBlocks: 6,
    intro: 'Forward is blocked—turn downward before sweeping across to the finish.',
    toolbox: toolboxTurns,
    solution: 'Turn right, move forward twice, turn left, then move forward four times.'
  },
  {
    id: 3,
    name: 'Left Alley',
    map: [
      '#######',
      '###..G#',
      '###.###',
      '###.###',
      '#S..###',
      '#######'
    ],
    startDirection: 'east',
    maxBlocks: 7,
    intro: 'Climb the hallway, then turn left toward the beacon.',
    toolbox: toolboxTurns,
    solution: 'Move forward twice, turn left, move forward three times, turn right, move forward twice.'
  },
  {
    id: 4,
    name: 'Zig Trainer',
    map: [
      '#######',
      '#####G#',
      '#####.#',
      '###...#',
      '###.###',
      '#S..###',
      '#######'
    ],
    startDirection: 'east',
    maxBlocks: 9,
    intro: 'Alternate left and right to weave through the zig-zag corridor.',
    toolbox: toolboxTurns,
    solution: 'Move forward twice, turn left, move forward twice, turn right, move forward twice, turn left, move forward twice.'
  },
  {
    id: 5,
    name: 'Facing Backwards',
    map: [
      '#######',
      '#######',
      '###..G#',
      '###.###',
      '###.###',
      '###..S#',
      '#######'
    ],
    startDirection: 'west',
    maxBlocks: 8,
    intro: 'Start by turning around—escape the cul-de-sac and reach the goal.',
    toolbox: toolboxTurns,
    solution: 'Move forward twice, turn right, move forward three times, turn right, move forward twice.'
  },
  {
    id: 6,
    name: 'Square Route',
    map: [
      '#######',
      '#.....#',
      '#.###.#',
      '#.###.#',
      '#S...G#',
      '#######'
    ],
    startDirection: 'north',
    maxBlocks: 10,
    intro: 'A square path is perfect for a loop. Can you solve this with fewer blocks?',
    toolbox: toolboxRepeat,
    solution: 'Move forward 3 times, turn right, move forward 4 times, turn right, move forward 3 times. Or use a loop!'
  },
  {
    id: 7,
    name: 'Step Ladder',
    map: [
      '########',
      '########',
      '########',
      '#####..G',
      '####..##',
      '###..###',
      '#S..####',
      '########'
    ],
    startDirection: 'east',
    maxBlocks: 9,
    intro: 'Climb the step ladder—look for patterns you can repeat until you reach the goal.',
    toolbox: toolboxRepeat,
    solution: 'Move forward twice, turn left, move forward, turn right. Repeat this pattern to climb the ladder.'
  },
  {
    id: 8,
    name: 'The Staircase',
    map: [
      '#########',
      '#####G..#',
      '#####.###',
      '###...###',
      '###.#####',
      '#...#####',
      '#.#######',
      '#S#######',
      '#########'
    ],
    startDirection: 'north',
    maxBlocks: 12,
    intro: 'A repeating pattern of steps. Use the "repeat" block to climb it efficiently.',
    toolbox: toolboxCountLoops,
    solution: 'Repeat 3 times: Move forward 2, Turn Right, Move forward 2, Turn Left.'
  },
  {
    id: 9,
    name: 'Spiral In',
    map: [
      '#########',
      '#########',
      '#########',
      '##.....##',
      '##.###.##',
      '##.###.##',
      '##.###.##',
      '#S...G.##',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 16,
    intro: 'Follow the spiral inward without losing track of your heading.',
    toolbox: toolboxCountLoops,
    solution: 'Follow the spiral path to the center.'
  },
  {
    id: 10,
    name: 'Southbound Sweep',
    map: [
      '#########',
      '#S#######',
      '#.#######',
      '#.#######',
      '#.#######',
      '#.#######',
      '#......G#',
      '#########',
      '#########'
    ],
    startDirection: 'south',
    maxBlocks: 10,
    intro: 'Head south first, then cruise east across the warehouse floor.',
    toolbox: toolboxCountLoops,
    solution: 'Move forward 5 times, turn left, move forward 6 times.'
  },
  {
    id: 11,
    name: 'Double Bend',
    map: [
      '#########',
      '#....G###',
      '#.#######',
      '#.#######',
      '#....####',
      '####.####',
      '####.####',
      '#S...####',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 14,
    intro: 'Negotiate two tight bends in succession without wasting moves.',
    toolbox: toolboxCountLoops,
    solution: 'Move forward 3, turn left, move forward 3, turn left, move forward 3, turn right, move forward 3, turn right, move forward 4.'
  },
  {
    id: 12,
    name: 'Left Turn Loop',
    map: [
      '#########',
      '#.......#',
      '#.#####.#',
      '#.#####.#',
      '#.G####.#',
      '#######.#',
      '#S......#',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 6,
    intro: 'The path turns left at irregular intervals. Use "if path left" to detect the turns.',
    toolbox: toolboxSensing,
    solution: 'Repeat until goal: If path left, turn left. Move forward.'
  },
  {
    id: 13,
    name: 'Decision Alley',
    map: [
      '#########',
      '#########',
      '#########',
      '#########',
      '#####...G',
      '####...##',
      '#####..##',
      '#S....###',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 11,
    intro: 'Sensors help you ignore the tempting dead end halfway through.',
    toolbox: toolboxSensing,
    solution: 'Move forward 4, turn left, move forward, turn left, move forward, turn right, move forward, turn right, move forward 4.'
  },
  {
    id: 14,
    name: 'Side Streets',
    map: [
      '###########',
      '###########',
      '###########',
      '#####....G#',
      '#####.#####',
      '#####.#####',
      '##..#.#...#',
      '#S....#####',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 13,
    intro: 'Navigate side streets; checks keep you from wandering into traps.',
    toolbox: toolboxSensing,
    solution: 'Move forward 4, turn left, move forward 3, turn right, move forward 4.'
  },
  {
    id: 15,
    name: 'Weave',
    map: [
      '###########',
      '###########',
      '###########',
      '#######...G',
      '#####...###',
      '####....###',
      '####.######',
      '#S...######',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 14,
    intro: 'Weave through offset alleys using path checks to stay centered.',
    toolbox: toolboxSensing,
    solution: 'Move forward 3, turn left, move forward, turn right, move forward 3, turn left, move forward, turn right, move forward 3.'
  },
  {
    id: 16,
    name: 'Right Turn Box',
    map: [
      '#########',
      '#########',
      '#.G.....#',
      '#.#.....#',
      '#.#.....#',
      '#.#.....#',
      '#.#######',
      '#S......#',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 8,
    intro: 'Follow the path. If you hit a wall, turn right.',
    toolbox: toolboxBranching,
    solution: 'Repeat until goal: If path ahead, move forward. Else, turn right.'
  },
  {
    id: 17,
    name: 'Switchback',
    map: [
      '###########',
      '###########',
      '#....G#####',
      '#.#########',
      '#.#########',
      '#...#######',
      '###.#######',
      '###...#####',
      '#####.#####',
      '#S....#####',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 20,
    intro: 'Climb the extended switchbacks with careful branching logic.',
    toolbox: toolboxBranching,
    solution: 'Move forward 4, turn left, move forward, turn left, move forward 2, turn right, move forward 2, turn left, move forward 2, turn right, move forward 4, turn right, move forward 4.'
  },
  {
    id: 18,
    name: 'Sensor Maze',
    map: [
      '###########',
      '###########',
      '###########',
      '###########',
      '###########',
      '#####....G#',
      '#####..####',
      '###...#.###',
      '###.#.#.###',
      '#S....#####',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 13,
    intro: 'Use sensors to thread through pockets and avoid looping corridors.',
    toolbox: toolboxBranching,
    solution: 'Move forward 4, turn left, move forward 2, turn right, move forward 2, turn left, move forward 2, turn right, move forward 2.'
  },
  {
    id: 19,
    name: 'Barrier Run',
    map: [
      '###########',
      '###########',
      '###########',
      '###########',
      '#####....G#',
      '#####..####',
      '####..#####',
      '##....#####',
      '##..#######',
      '#S..#######',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 14,
    intro: 'Barriers offset in pairs—react to openings as they appear.',
    toolbox: toolboxAdvanced,
    solution: 'Move forward 2, turn left, move forward 2, turn right, move forward 2, turn left, move forward, turn right, move forward, turn left, move forward 2, turn right, move forward 3.'
  },
  {
    id: 20,
    name: 'Gauntlet',
    map: [
      '#############',
      '##.....G#####',
      '##.##########',
      '##.######.###',
      '##.#####..###',
      '##....#..####',
      '#####...#####',
      '####...######',
      '####..#######',
      '#S....#######',
      '#############'
    ],
    startDirection: 'east',
    maxBlocks: 22,
    intro: 'A gauntlet of false turns awaits—branch wisely at every fork.',
    toolbox: toolboxAdvanced,
    solution: 'Follow the path carefully, using sensors to detect walls and turns.'
  },
  {
    id: 21,
    name: 'Grand Finale',
    map: [
      '#############',
      '#############',
      '#############',
      '########..###',
      '#......G.####',
      '#.####..#####',
      '#.###..######',
      '#.....#######',
      '##...########',
      '##....#######',
      '##.##.#######',
      '#S....#######',
      '#############'
    ],
    startDirection: 'east',
    maxBlocks: 24,
    intro: 'Bring every technique together to conquer the grand finale.',
    toolbox: toolboxAdvanced,
    solution: 'Use all your skills! Follow the path, check for walls, and loop until you reach the goal.'
  }
];

function parseLevel(definition: MazeLevelDefinition): MazeLevel {
  if (definition.map.length === 0) {
    throw new Error(`Level ${definition.id} map may not be empty.`);
  }

  const width = definition.map[0].length;
  let start: { row: number; col: number } | null = null;
  let goal: { row: number; col: number } | null = null;

  const tiles: MazeTile[][] = definition.map.map((rawRow, rowIndex) => {
    if (rawRow.length !== width) {
      throw new Error(`Row ${rowIndex} in level ${definition.id} must be ${width} characters long.`);
    }

    return Array.from(rawRow).map((cell, colIndex) => {
      switch (cell) {
        case '#':
          return 'wall';
        case '.':
          return 'open';
        case 'S':
          if (start) {
            throw new Error(`Level ${definition.id} contains multiple start points.`);
          }
          start = { row: rowIndex, col: colIndex };
          return 'open';
        case 'G':
          if (goal) {
            throw new Error(`Level ${definition.id} contains multiple goals.`);
          }
          goal = { row: rowIndex, col: colIndex };
          return 'goal';
        case ' ': // treat spaces as open paths for readability
          return 'open';
        default:
          throw new Error(`Unsupported map character '${cell}' in level ${definition.id}.`);
      }
    });
  });

  if (!start) {
    throw new Error(`Level ${definition.id} is missing a start tile.`);
  }

  if (!goal) {
    throw new Error(`Level ${definition.id} is missing a goal tile.`);
  }

  return {
    id: definition.id,
    name: definition.name,
    tiles,
    start,
    goal,
    startHeading: definition.startDirection,
    maxBlocks: definition.maxBlocks,
    intro: definition.intro,
    toolbox: definition.toolbox,
    solution: definition.solution
  };
}

export const levels: MazeLevel[] = rawLevels.map(parseLevel);

export function getLevelById(id: number): MazeLevel {
  const level = levels.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}

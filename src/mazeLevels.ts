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
    toolbox: toolboxTurns
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
    toolbox: toolboxTurns
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
    toolbox: toolboxTurns
  },
  {
    id: 6,
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
    intro: 'Climb the step ladder—look for patterns you can repeat.',
    toolbox: toolboxRepeat
  },
  {
    id: 7,
    name: 'Loop Lane',
    map: [
      '########',
      '###...G#',
      '###.####',
      '###.####',
      '###...##',
      '#####.##',
      '#S....##',
      '########'
    ],
    startDirection: 'east',
    maxBlocks: 12,
    intro: 'Loop around the long lane; a repeat block keeps instructions short.',
    toolbox: toolboxCountLoops
  },
  {
    id: 8,
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
    toolbox: toolboxCountLoops
  },
  {
    id: 9,
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
    toolbox: toolboxCountLoops
  },
  {
    id: 10,
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
    toolbox: toolboxCountLoops
  },
  {
    id: 11,
    name: 'Fork Intro',
    map: [
      '#########',
      '#########',
      '#########',
      '######.G#',
      '######.##',
      '######.##',
      '####...##',
      '#S.....##',
      '#########'
    ],
    startDirection: 'east',
    maxBlocks: 11,
    intro: 'Choose the correct fork—the upper branch reaches the finish.',
    toolbox: toolboxSensing
  },
  {
    id: 12,
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
    toolbox: toolboxSensing
  },
  {
    id: 13,
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
    toolbox: toolboxSensing
  },
  {
    id: 14,
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
    toolbox: toolboxSensing
  },
  {
    id: 15,
    name: 'Backtrack Bay',
    map: [
      '###########',
      '###########',
      '##....G####',
      '##.########',
      '##....#####',
      '####..#####',
      '###...#####',
      '#S....#####',
      '###########'
    ],
    startDirection: 'east',
    maxBlocks: 17,
    intro: 'Backtrack around the bay without colliding with the seawall.',
    toolbox: toolboxBranching
  },
  {
    id: 16,
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
    toolbox: toolboxBranching
  },
  {
    id: 17,
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
    toolbox: toolboxBranching
  },
  {
    id: 18,
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
    toolbox: toolboxAdvanced
  },
  {
    id: 19,
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
    toolbox: toolboxAdvanced
  },
  {
    id: 20,
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
    toolbox: toolboxAdvanced
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

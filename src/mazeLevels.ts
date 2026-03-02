import type { MazeConcept, MazeHeading, MazeLevel, MazeLevelDefinition, MazePosition, MazeTile } from './mazeTypes';

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
    }
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
    }
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
    { kind: 'sep' },
    { kind: 'block', type: 'logic_compare' },
    { kind: 'block', type: 'logic_operation' },
    { kind: 'block', type: 'logic_boolean' },
    { kind: 'block', type: 'math_number' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

const toolboxVariables = {
  kind: 'flyoutToolbox',
  contents: [
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
    { kind: 'sep' },
    {
      kind: 'block',
      type: 'variables_set',
      fields: {
        VAR: 'steps'
      },
      inputs: {
        VALUE: {
          block: {
            type: 'math_number',
            fields: { NUM: 4 }
          }
        }
      }
    },
    { kind: 'block', type: 'variables_get', fields: { VAR: 'steps' } },
    { kind: 'block', type: 'math_arithmetic' },
    { kind: 'block', type: 'math_number' },
    { kind: 'block', type: 'logic_compare' },
    { kind: 'block', type: 'controls_whileUntil' },
    { kind: 'sep' },
    { kind: 'block', type: 'maze_repeat_until_goal' }
  ]
} satisfies import('blockly/core').utils.toolbox.ToolboxDefinition;

type ReferenceStep =
  | { kind: 'forward'; count?: number }
  | { kind: 'left'; count?: number }
  | { kind: 'right'; count?: number }
  | { kind: 'repeat'; times: number; steps: ReferenceStep[] }
  | { kind: 'repeatUntilGoal'; steps: ReferenceStep[]; maxIterations?: number }
  | { kind: 'setVar'; name: string; value: number }
  | { kind: 'addVar'; name: string; delta: number }
  | { kind: 'whileVarPositive'; name: string; steps: ReferenceStep[]; maxIterations?: number };

interface CurriculumEntry {
  learningFocus: string;
  requiredConcepts: MazeConcept[];
  answer: string;
  referenceProgram: ReferenceStep[];
  toolbox?: import('blockly/core').utils.toolbox.ToolboxDefinition;
}

const forward = (count = 1): ReferenceStep => ({ kind: 'forward', count });
const left = (count = 1): ReferenceStep => ({ kind: 'left', count });
const right = (count = 1): ReferenceStep => ({ kind: 'right', count });
const repeat = (times: number, steps: ReferenceStep[]): ReferenceStep => ({ kind: 'repeat', times, steps });
const setVar = (name: string, value: number): ReferenceStep => ({ kind: 'setVar', name, value });
const addVar = (name: string, delta: number): ReferenceStep => ({ kind: 'addVar', name, delta });
const whileVarPositive = (name: string, steps: ReferenceStep[], maxIterations = 200): ReferenceStep => ({
  kind: 'whileVarPositive',
  name,
  steps,
  maxIterations
});

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
      '#.##.##.#',
      '#.#####.#',
      '#.G####.#',
      '###.###.#',
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
      '#####G###',
      '###.#.###',
      '###.#.###',
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
      '#########',
      '#########',
      '#########',
      '#########',
      '##G...###',
      '#####..##',
      '####..###',
      '#S....###',
      '#########'
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
      '#########',
      '#########',
      '#########',
      '#########',
      '#.....###',
      '#.###.###',
      '#G###.###',
      '#S....###',
      '#########'
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
      '#.....G##',
      '#.#####.#',
      '#.#...#.#',
      '#.#.#.#.#',
      '#...#.#.#',
      '###.#.#.#',
      '#S..#...#',
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
      '##########',
      '#......G##',
      '#.######.#',
      '#.#....#.#',
      '#.#.##.#.#',
      '#...##.#.#',
      '###.##.#.#',
      '#...##...#',
      '#S.#######',
      '##########'
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
      '#.......G##',
      '#.#######.#',
      '#.#.....#.#',
      '#.#.###.#.#',
      '#...#.#.#.#',
      '###.#.#.#.#',
      '#...#...#.#',
      '#.#####.#.#',
      '#S......#.#',
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
      '############',
      '#........G##',
      '#.########.#',
      '#.#......#.#',
      '#.#.####.#.#',
      '#...#..#.#.#',
      '###.#.##.#.#',
      '#...#....#.#',
      '#.######.#.#',
      '#......#.#.#',
      '#S####...#.#',
      '############'
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
      '#.........G##',
      '#.#########.#',
      '#.#.......#.#',
      '#.#.#####.#.#',
      '#...#...#.#.#',
      '###.#.#.#.#.#',
      '#...#.#...#.#',
      '#.###.#####.#',
      '#.#...#.....#',
      '#.#.###.###.#',
      '#S..#...#...#',
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
      '#.......G...#',
      '#.#####.###.#',
      '#.#...#...#.#',
      '#.#.#.###.#.#',
      '#...#...#.#.#',
      '###.###.#.#.#',
      '#...#...#...#',
      '#.###.#####.#',
      '#.#...#...#.#',
      '#.#.###.#.#.#',
      '#S..#...#...#',
      '#############'
    ],
    startDirection: 'east',
    maxBlocks: 24,
    intro: 'Bring every technique together to conquer the grand finale.',
    toolbox: toolboxAdvanced,
    solution: 'Use all your skills! Follow the path, check for walls, and loop until you reach the goal.'
  }
];

const curriculumPlan: Record<number, CurriculumEntry> = {
  1: {
    learningFocus: '順序：建立前進步數概念',
    requiredConcepts: ['sequence'],
    answer: '向前移動 4 次。',
    referenceProgram: [forward(4)],
    toolbox: toolboxForward
  },
  2: {
    learningFocus: '順序：右轉後再直行',
    requiredConcepts: ['sequence'],
    answer: '右轉，向前 2 次，左轉，向前 4 次。',
    referenceProgram: [right(), forward(2), left(), forward(4)],
    toolbox: toolboxTurns
  },
  3: {
    learningFocus: '順序：路徑分段與方位轉換',
    requiredConcepts: ['sequence'],
    answer: '向前 2 次，左轉，向前 3 次，右轉，向前 2 次。',
    referenceProgram: [forward(2), left(), forward(3), right(), forward(2)],
    toolbox: toolboxTurns
  },
  4: {
    learningFocus: '順序：左右交錯控制',
    requiredConcepts: ['sequence'],
    answer: '向前 2 次，左轉，向前 2 次，右轉，向前 2 次，左轉，向前 2 次。',
    referenceProgram: [forward(2), left(), forward(2), right(), forward(2), left(), forward(2)],
    toolbox: toolboxTurns
  },
  5: {
    learningFocus: '順序：起始朝向與轉身',
    requiredConcepts: ['sequence'],
    answer: '向前 2 次，右轉，向前 3 次，右轉，向前 2 次。',
    referenceProgram: [forward(2), right(), forward(3), right(), forward(2)],
    toolbox: toolboxTurns
  },
  6: {
    learningFocus: '循環：固定次數重複（repeat）',
    requiredConcepts: ['loop'],
    answer: '右轉後重複 4 次向前移動。',
    referenceProgram: [right(), repeat(4, [forward()])],
    toolbox: toolboxRepeat
  },
  7: {
    learningFocus: '循環：抽取階梯的重複樣式',
    requiredConcepts: ['loop'],
    answer: '先向前 2 次，再重複 3 次「左轉、前進、右轉、前進」，最後前進 1 次。',
    referenceProgram: [forward(2), repeat(3, [left(), forward(), right(), forward()]), forward()],
    toolbox: toolboxRepeat
  },
  8: {
    learningFocus: '循環：計數迴圈控制段落',
    requiredConcepts: ['loop'],
    answer: '重複 3 次：向前 2、右轉、向前 2、左轉。',
    referenceProgram: [repeat(3, [forward(2), right(), forward(2), left()])],
    toolbox: toolboxCountLoops
  },
  9: {
    learningFocus: '循環：以最小步驟表達重複',
    requiredConcepts: ['loop'],
    answer: '重複 4 次向前移動。',
    referenceProgram: [repeat(4, [forward()])],
    toolbox: toolboxCountLoops
  },
  10: {
    learningFocus: '變量＋循環：用計步器驅動移動',
    requiredConcepts: ['variable', 'loop'],
    answer: '設定 steps=5，當 steps>0 時前進並遞減；左轉後設定 steps=6，再重複。',
    referenceProgram: [
      setVar('steps', 5),
      whileVarPositive('steps', [forward(), addVar('steps', -1)]),
      left(),
      setVar('steps', 6),
      whileVarPositive('steps', [forward(), addVar('steps', -1)])
    ],
    toolbox: toolboxVariables
  },
  11: {
    learningFocus: '變量：多段路徑的分段計數',
    requiredConcepts: ['variable', 'loop'],
    answer: '以 segment 變量依序控制 3、3、3、3、4 步，並在段落間轉向。',
    referenceProgram: [
      setVar('segment', 3),
      whileVarPositive('segment', [forward(), addVar('segment', -1)]),
      left(),
      setVar('segment', 3),
      whileVarPositive('segment', [forward(), addVar('segment', -1)]),
      left(),
      setVar('segment', 3),
      whileVarPositive('segment', [forward(), addVar('segment', -1)]),
      right(),
      setVar('segment', 3),
      whileVarPositive('segment', [forward(), addVar('segment', -1)]),
      right(),
      setVar('segment', 4),
      whileVarPositive('segment', [forward(), addVar('segment', -1)])
    ],
    toolbox: toolboxVariables
  },
  12: {
    learningFocus: '路徑規劃：長路徑分段執行',
    requiredConcepts: ['sequence', 'loop'],
    answer: '重複 2 次：前進 6、左轉；再前進 5、左轉、前進 6、左轉、前進 3、左轉、前進 1。',
    referenceProgram: [repeat(2, [forward(6), left()]), forward(5), left(), forward(6), left(), forward(3), left(), forward(1)],
    toolbox: toolboxSensing
  },
  13: {
    learningFocus: '路徑規劃：L 型路徑拆解',
    requiredConcepts: ['sequence'],
    answer: '前進 4、左轉、前進 3。',
    referenceProgram: [forward(4), left(), forward(3)],
    toolbox: toolboxSensing
  },
  14: {
    learningFocus: '路徑規劃：雙轉折路線',
    requiredConcepts: ['sequence'],
    answer: '前進 4、左轉、前進 3、左轉、前進 3。',
    referenceProgram: [forward(4), left(), forward(3), left(), forward(3)],
    toolbox: toolboxSensing
  },
  15: {
    learningFocus: '路徑規劃：起始朝向修正',
    requiredConcepts: ['sequence'],
    answer: '左轉，前進 1。',
    referenceProgram: [left(), forward(1)],
    toolbox: toolboxSensing
  },
  16: {
    learningFocus: '循環：重複轉角樣式',
    requiredConcepts: ['sequence', 'loop'],
    answer: '前進 2，重複 2 次（左轉、前進 2），再右轉、前進 4、右轉、前進 5。',
    referenceProgram: [forward(2), repeat(2, [left(), forward(2)]), right(), forward(4), right(), forward(5)],
    toolbox: toolboxBranching
  },
  17: {
    learningFocus: '循環：折返路徑的規律重複',
    requiredConcepts: ['sequence', 'loop'],
    answer: '左轉、前進 1、右轉，重複 2 次（前進 2、左轉），再前進 2、右轉、前進 4、右轉、前進 6。',
    referenceProgram: [left(), forward(1), right(), repeat(2, [forward(2), left()]), forward(2), right(), forward(4), right(), forward(6)],
    toolbox: toolboxBranching
  },
  18: {
    learningFocus: '循環：長迷宮分段策略',
    requiredConcepts: ['sequence', 'loop'],
    answer: '左轉、前進 2、右轉，重複 2 次（前進 2、左轉），再前進 2、右轉、前進 4、右轉、前進 7。',
    referenceProgram: [left(), forward(2), right(), repeat(2, [forward(2), left()]), forward(2), right(), forward(4), right(), forward(7)],
    toolbox: toolboxBranching
  },
  19: {
    learningFocus: '循環：障礙區段固定樣式',
    requiredConcepts: ['sequence', 'loop'],
    answer: '左轉、前進 3、右轉，重複 2 次（前進 2、左轉），再前進 2、右轉、前進 4、右轉、前進 8。',
    referenceProgram: [left(), forward(3), right(), repeat(2, [forward(2), left()]), forward(2), right(), forward(4), right(), forward(8)],
    toolbox: toolboxAdvanced
  },
  20: {
    learningFocus: '綜合：高密度路徑分段與重複',
    requiredConcepts: ['sequence', 'loop'],
    answer: '左轉、前進 4、右轉，重複 2 次（前進 2、左轉），再前進 2、右轉、前進 4、右轉、前進 9。',
    referenceProgram: [left(), forward(4), right(), repeat(2, [forward(2), left()]), forward(2), right(), forward(4), right(), forward(9)],
    toolbox: toolboxAdvanced
  },
  21: {
    learningFocus: '總整：變量控制長路徑執行',
    requiredConcepts: ['variable', 'loop', 'sequence'],
    answer: '設定 steps=7，先完成前段轉折，再用變量迴圈前進 7 步到終點。',
    referenceProgram: [
      left(),
      forward(4),
      right(),
      repeat(2, [forward(2), left()]),
      forward(2),
      right(),
      forward(4),
      right(),
      setVar('steps', 7),
      whileVarPositive('steps', [forward(), addVar('steps', -1)])
    ],
    toolbox: toolboxVariables
  }
};

interface ReferenceRuntimeState {
  row: number;
  col: number;
  heading: MazeHeading;
  goalReached: boolean;
  variables: Record<string, number>;
}

const headingOrder: MazeHeading[] = ['north', 'east', 'south', 'west'];

const headingVectors: Record<MazeHeading, { row: number; col: number }> = {
  north: { row: -1, col: 0 },
  east: { row: 0, col: 1 },
  south: { row: 1, col: 0 },
  west: { row: 0, col: -1 }
};

function verifyCurriculum(level: MazeLevel, entry: CurriculumEntry): void {
  const runtimeState: ReferenceRuntimeState = {
    row: level.start.row,
    col: level.start.col,
    heading: level.startHeading,
    goalReached: false,
    variables: {}
  };

  executeReferenceSteps(level, runtimeState, entry.referenceProgram);

  if (!runtimeState.goalReached) {
    throw new Error(`Level ${level.id} reference answer did not reach the goal.`);
  }

  const usedConcepts = collectConcepts(entry.referenceProgram);
  for (const concept of entry.requiredConcepts) {
    if (!usedConcepts.has(concept)) {
      throw new Error(`Level ${level.id} reference answer is missing required concept: ${concept}.`);
    }
  }
}

function collectConcepts(steps: ReferenceStep[]): Set<MazeConcept> {
  const concepts = new Set<MazeConcept>(['sequence']);

  const walk = (list: ReferenceStep[]) => {
    for (const step of list) {
      if (step.kind === 'repeat' || step.kind === 'repeatUntilGoal' || step.kind === 'whileVarPositive') {
        concepts.add('loop');
      }
      if (step.kind === 'setVar' || step.kind === 'addVar' || step.kind === 'whileVarPositive') {
        concepts.add('variable');
      }

      if (step.kind === 'repeat' || step.kind === 'repeatUntilGoal' || step.kind === 'whileVarPositive') {
        walk(step.steps);
      }
    }
  };

  walk(steps);
  return concepts;
}

function executeReferenceSteps(level: MazeLevel, state: ReferenceRuntimeState, steps: ReferenceStep[]): void {
  for (const step of steps) {
    if (state.goalReached) {
      return;
    }

    if (step.kind === 'forward') {
      const count = Math.max(1, Math.floor(step.count ?? 1));
      for (let index = 0; index < count; index += 1) {
        moveForward(level, state);
      }
      continue;
    }

    if (step.kind === 'left' || step.kind === 'right') {
      const count = Math.max(1, Math.floor(step.count ?? 1));
      for (let index = 0; index < count; index += 1) {
        rotate(state, step.kind);
      }
      continue;
    }

    if (step.kind === 'repeat') {
      const times = Math.max(0, Math.floor(step.times));
      for (let index = 0; index < times; index += 1) {
        executeReferenceSteps(level, state, step.steps);
      }
      continue;
    }

    if (step.kind === 'repeatUntilGoal') {
      const maxIterations = Math.max(1, Math.floor(step.maxIterations ?? 200));
      let iterations = 0;
      while (!state.goalReached && iterations < maxIterations) {
        executeReferenceSteps(level, state, step.steps);
        iterations += 1;
      }
      if (!state.goalReached) {
        throw new Error(`Level ${level.id} reference loop exceeded max iterations (${maxIterations}).`);
      }
      continue;
    }

    if (step.kind === 'setVar') {
      state.variables[step.name] = step.value;
      continue;
    }

    if (step.kind === 'addVar') {
      const current = state.variables[step.name] ?? 0;
      state.variables[step.name] = current + step.delta;
      continue;
    }

    const maxIterations = Math.max(1, Math.floor(step.maxIterations ?? 200));
    let iterations = 0;
    while ((state.variables[step.name] ?? 0) > 0 && iterations < maxIterations && !state.goalReached) {
      executeReferenceSteps(level, state, step.steps);
      iterations += 1;
    }
    if ((state.variables[step.name] ?? 0) > 0 && !state.goalReached) {
      throw new Error(`Level ${level.id} reference variable loop exceeded max iterations (${maxIterations}).`);
    }
  }
}

function rotate(state: ReferenceRuntimeState, direction: 'left' | 'right'): void {
  const currentIndex = headingOrder.indexOf(state.heading);
  const delta = direction === 'left' ? -1 : 1;
  const nextIndex = (currentIndex + delta + headingOrder.length) % headingOrder.length;
  state.heading = headingOrder[nextIndex];
}

function nextPosition(state: Pick<ReferenceRuntimeState, 'row' | 'col'>, heading: MazeHeading): MazePosition {
  const vector = headingVectors[heading];
  return {
    row: state.row + vector.row,
    col: state.col + vector.col
  };
}

function moveForward(level: MazeLevel, state: ReferenceRuntimeState): void {
  const next = nextPosition(state, state.heading);
  const tile = tileAt(level.tiles, next.row, next.col);
  if (tile === 'wall') {
    throw new Error(`Reference answer hit a wall at (${next.row}, ${next.col}).`);
  }
  state.row = next.row;
  state.col = next.col;
  state.goalReached = tile === 'goal';
}

function tileAt(tiles: MazeTile[][], row: number, col: number): MazeTile {
  if (row < 0 || col < 0 || row >= tiles.length || col >= tiles[0].length) {
    return 'wall';
  }
  return tiles[row][col];
}

function formatReferenceProgram(steps: ReferenceStep[], indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  for (const step of steps) {
    if (step.kind === 'forward') {
      const count = Math.max(1, Math.floor(step.count ?? 1));
      lines.push(`${indent}moveForward(${count});`);
      continue;
    }

    if (step.kind === 'left') {
      const count = Math.max(1, Math.floor(step.count ?? 1));
      lines.push(`${indent}turnLeft(${count});`);
      continue;
    }

    if (step.kind === 'right') {
      const count = Math.max(1, Math.floor(step.count ?? 1));
      lines.push(`${indent}turnRight(${count});`);
      continue;
    }

    if (step.kind === 'repeat') {
      lines.push(`${indent}repeat (${Math.max(0, Math.floor(step.times))}) {`);
      lines.push(formatReferenceProgram(step.steps, indentLevel + 1));
      lines.push(`${indent}}`);
      continue;
    }

    if (step.kind === 'repeatUntilGoal') {
      lines.push(`${indent}repeatUntilGoal {`);
      lines.push(formatReferenceProgram(step.steps, indentLevel + 1));
      lines.push(`${indent}}`);
      continue;
    }

    if (step.kind === 'setVar') {
      lines.push(`${indent}${step.name} = ${step.value};`);
      continue;
    }

    if (step.kind === 'addVar') {
      if (step.delta >= 0) {
        lines.push(`${indent}${step.name} += ${step.delta};`);
      } else {
        lines.push(`${indent}${step.name} -= ${Math.abs(step.delta)};`);
      }
      continue;
    }

    lines.push(`${indent}while (${step.name} > 0) {`);
    lines.push(formatReferenceProgram(step.steps, indentLevel + 1));
    lines.push(`${indent}}`);
  }

  return lines.join('\n');
}

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

  const curriculumEntry = curriculumPlan[definition.id];
  if (!curriculumEntry) {
    throw new Error(`Level ${definition.id} is missing curriculum metadata.`);
  }

  const level: MazeLevel = {
    id: definition.id,
    name: definition.name,
    tiles,
    start,
    goal,
    startHeading: definition.startDirection,
    maxBlocks: definition.maxBlocks,
    intro: definition.intro,
    learningFocus: curriculumEntry.learningFocus,
    requiredConcepts: [...curriculumEntry.requiredConcepts],
    toolbox: curriculumEntry.toolbox ?? definition.toolbox,
    solution: formatReferenceProgram(curriculumEntry.referenceProgram)
  };

  verifyCurriculum(level, curriculumEntry);
  return level;
}

export const levels: MazeLevel[] = rawLevels.flatMap((definition) => {
  try {
    return [parseLevel(definition)];
  } catch (error) {
    console.error(`Skipping invalid level ${definition.id}.`, error);
    return [];
  }
});

if (levels.length === 0) {
  throw new Error('No valid maze levels are available.');
}

export function getLevelById(id: number): MazeLevel {
  const level = levels.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}

import './style.css';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import type { WorkspaceSvg } from 'blockly/core';

import { levels } from './mazeLevels';
import { MazeRuntime } from './mazeRuntime';
import type { MazeLevel, MazeState } from './mazeTypes';

const STEP_DELAY_MS = 220;
const HIGHLIGHT_DELAY_MS = 120;
const STEP_LIMIT = 2000;

type DirectionKeyword = 'AHEAD' | 'LEFT' | 'RIGHT';

interface MazeApi {
  highlight(blockId: string): Promise<void>;
  checkTimeout(): void;
  moveForward(): Promise<void>;
  turnLeft(): Promise<void>;
  turnRight(): Promise<void>;
  isPath(direction: DirectionKeyword): boolean;
  isGoal(): boolean;
}

interface PlayerProfile {
  name: string;
  totalTimeMs: number;
  totalTrials: number;
  levelTrials: Record<number, number>;
}

interface BillboardEntry {
  id: string;
  player: string;
  levelId: number;
  levelName: string;
  timeMs: number;
  recordedAt: number;
}

const STORAGE_KEYS = {
  profile: 'blockly-maze.profile.v1',
  billboard: 'blockly-maze.billboard.v1'
} as const;

const TOTAL_LEVELS = levels.length;
const storageAvailable = isLocalStorageAvailable();

let inMemoryProfile: PlayerProfile | null = null;
let inMemoryBillboard: BillboardEntry[] | null = null;

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('Unable to locate the #app container.');
}

appRoot.innerHTML = `
  <div id="game-view" class="layout">
    <header class="layout__header">
      <div>
        <h1 class="title">Blockly Maze Clone</h1>
        <p class="subtitle">Arrange blocks to guide the runner through each maze.</p>
        <p class="player-label">Playing as <span id="player-name-display" class="player-name"></span></p>
      </div>
      <div class="controls">
        <label class="controls__group">
          <span>Level</span>
          <select id="level-select" class="controls__select"></select>
        </label>
        <div class="controls__nav">
          <button id="prev-button" class="button button--ghost" type="button" aria-label="Previous level">◀ Prev</button>
          <span class="controls__progress"><span id="current-level-number"></span>/<span id="total-levels"></span></span>
          <button id="next-button" class="button button--ghost" type="button" aria-label="Next level">Next ▶</button>
        </div>
        <button id="run-button" class="button button--primary" type="button">Run</button>
        <button id="reset-button" class="button" type="button">Reset</button>
        <button id="show-answer-button" class="button button--ghost" type="button">Show Answer</button>
        <button id="billboard-button" class="button button--ghost" type="button">Billboard</button>
        <span id="block-counter" class="counter"></span>
      </div>
    </header>
    <section class="layout__content">
      <div class="workspace-panel">
        <div id="blockly-area" class="workspace-panel__area"></div>
        <div id="blockly-div" class="workspace-panel__surface"></div>
      </div>
      <aside class="maze-panel">
        <div class="maze-panel__header">
          <h2 id="level-name" class="maze-panel__title"></h2>
          <p id="level-intro" class="maze-panel__intro"></p>
        </div>
        <div id="maze-grid" class="maze-grid"></div>
        <div class="metrics">
          <div class="metric">
            <span class="metric__label">Current Run</span>
            <span id="current-run-timer" class="metric__value">00:00</span>
          </div>
          <div class="metric">
            <span class="metric__label">Total Time</span>
            <span id="total-time" class="metric__value">00:00</span>
          </div>
          <div class="metric">
            <span class="metric__label">Trials (Level)</span>
            <span id="trial-count" class="metric__value">0</span>
          </div>
          <div class="metric">
            <span class="metric__label">Trials (All)</span>
            <span id="total-trials" class="metric__value">0</span>
          </div>
        </div>
        <div class="maze-panel__footer">
          <span id="status-text" class="status" data-state="idle">Configure your blocks, then press Run.</span>
        </div>
      </aside>
    </section>
  </div>
  <section id="billboard-view" class="billboard hidden">
    <header class="billboard__header">
      <div>
        <h2>Billboard</h2>
        <p class="billboard__subtitle">Fastest completions across all levels.</p>
      </div>
      <div class="billboard__actions">
        <button id="download-csv" class="button" type="button">Download CSV</button>
        <button id="billboard-back" class="button button--primary" type="button">Back to Maze</button>
      </div>
    </header>
    <p class="billboard__player">Signed in as <span id="billboard-player-name" class="player-name"></span></p>
    <div class="billboard__table-wrapper">
      <table class="billboard__table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Level</th>
            <th>Time</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id="billboard-body"></tbody>
      </table>
      <p id="billboard-empty" class="billboard__empty">No runs recorded yet. Finish a maze to appear here.</p>
    </div>
  </section>
  <div id="player-modal" class="modal hidden">
    <div class="modal__dialog">
      <h2>Welcome to Blockly Maze</h2>
      <p>Enter your name to join the billboard, or use the suggested guest name.</p>
      <div class="modal__form">
        <input id="player-name-input" class="modal__input" type="text" maxlength="24" />
        <button id="player-name-submit" class="button button--primary" type="button">Start Playing</button>
      </div>
    </div>
  </div>
`;
const levelSelect = requireElement<HTMLSelectElement>('#level-select');
const runButton = requireElement<HTMLButtonElement>('#run-button');
const resetButton = requireElement<HTMLButtonElement>('#reset-button');
const showAnswerButton = requireElement<HTMLButtonElement>('#show-answer-button');
const statusText = requireElement<HTMLSpanElement>('#status-text');
const blockCounter = requireElement<HTMLSpanElement>('#block-counter');
const levelName = requireElement<HTMLHeadingElement>('#level-name');
const levelIntro = requireElement<HTMLParagraphElement>('#level-intro');
const mazeGrid = requireElement<HTMLDivElement>('#maze-grid');
const blocklyArea = requireElement<HTMLDivElement>('#blockly-area');
const blocklyDiv = requireElement<HTMLDivElement>('#blockly-div');
const prevButton = requireElement<HTMLButtonElement>('#prev-button');
const nextButton = requireElement<HTMLButtonElement>('#next-button');
const currentLevelNumber = requireElement<HTMLSpanElement>('#current-level-number');
const totalLevelsDisplay = requireElement<HTMLSpanElement>('#total-levels');
const currentRunTimer = requireElement<HTMLSpanElement>('#current-run-timer');
const totalTimeDisplay = requireElement<HTMLSpanElement>('#total-time');
const levelTrialCountDisplay = requireElement<HTMLSpanElement>('#trial-count');
const totalTrialsDisplay = requireElement<HTMLSpanElement>('#total-trials');
const playerNameDisplay = requireElement<HTMLSpanElement>('#player-name-display');
const billboardButton = requireElement<HTMLButtonElement>('#billboard-button');
const billboardView = requireElement<HTMLElement>('#billboard-view');
const gameView = requireElement<HTMLDivElement>('#game-view');
const billboardBackButton = requireElement<HTMLButtonElement>('#billboard-back');
const downloadCsvButton = requireElement<HTMLButtonElement>('#download-csv');
const billboardBody = requireElement<HTMLTableSectionElement>('#billboard-body');
const billboardEmptyMessage = requireElement<HTMLParagraphElement>('#billboard-empty');
const billboardPlayerName = requireElement<HTMLSpanElement>('#billboard-player-name');
const playerModal = requireElement<HTMLDivElement>('#player-modal');
const playerNameInput = requireElement<HTMLInputElement>('#player-name-input');
const playerNameSubmit = requireElement<HTMLButtonElement>('#player-name-submit');

defineMazeBlocks();

const baseToolbox = createBaseToolbox();

const workspace = Blockly.inject(blocklyDiv, {
  toolbox: baseToolbox,
  trashcan: true,
  renderer: 'thrasos',
  move: {
    scrollbars: true,
    drag: true,
    wheel: true
  },
  maxBlocks: Infinity
}) as WorkspaceSvg;

const tileLookup = new Map<string, HTMLDivElement>();

// Cache the last block in the main statement stack so toolbox clicks can chain reliably.
let workspaceTail: Blockly.Block | null = null;

window.addEventListener('resize', () => resizeBlocklyWorkspace(blocklyArea, blocklyDiv));
resizeBlocklyWorkspace(blocklyArea, blocklyDiv);

let { profile: playerProfile, needsName: requiresNamePrompt } = loadPlayerProfile();
let billboardEntries = loadBillboardEntries();

let currentRunStart = 0;
let currentRunInterval: number | null = null;
let lastRunDurationMs = 0;

let currentLevel: MazeLevel = levels[0];
const runtime = new MazeRuntime(currentLevel, {
  onStateChange: (state) => updateMazeState(state)
});

populateLevelSelect(levelSelect, levels);
totalLevelsDisplay.textContent = String(TOTAL_LEVELS);
loadLevel(currentLevel);
updatePlayerDisplays();
updateTotalTimeDisplay();
updateBillboardTable();
if (requiresNamePrompt) {
  openPlayerModal();
}

workspace.addChangeListener((event) => {
  updateBlockCounter();

  if (!event) {
    refreshWorkspaceTail();
    return;
  }

  // Handle auto-append for create events first, before other processing
  if (event.type === 'create') {
    handleAutoAppend(event);
    return;
  }

  // Refresh tail after delete or move events
  if (event.type === 'delete' || event.type === 'move') {
    refreshWorkspaceTail();
  }
});

runButton.addEventListener('click', () => {
  void runProgram();
});

resetButton.addEventListener('click', () => {
  clearWorkspace();
  resetBlockCounter();
  runtime.reset();
  resetRunTimerDisplay();
  setStatus('idle', 'Workspace cleared. Configure your blocks and try again!');
});

levelSelect.addEventListener('change', () => {
  const selectedId = Number(levelSelect.value);
  const nextLevel = levels.find((entry) => entry.id === selectedId);
  if (nextLevel) {
    loadLevel(nextLevel);
  }
});

prevButton.addEventListener('click', () => {
  const previous = getAdjacentLevel(-1);
  if (previous) {
    loadLevel(previous);
  }
});

nextButton.addEventListener('click', () => {
  const next = getAdjacentLevel(1);
  if (next) {
    loadLevel(next);
  }
});

showAnswerButton.addEventListener('click', () => {
  showAnswer();
});

billboardButton.addEventListener('click', () => {
  showBillboard();
});

billboardBackButton.addEventListener('click', () => {
  hideBillboard();
});

downloadCsvButton.addEventListener('click', () => {
  downloadBillboardCsv();
});

playerNameSubmit.addEventListener('click', () => {
  handlePlayerNameSubmit();
});

playerNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handlePlayerNameSubmit();
  }
});

playerNameDisplay.addEventListener('click', () => {
  openPlayerModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!playerModal.classList.contains('hidden')) {
      closePlayerModal();
    } else if (!billboardView.classList.contains('hidden')) {
      hideBillboard();
    }
  }
});

async function runProgram(): Promise<void> {
  if (workspace.isDragging()) {
    return;
  }

  const blockCount = workspace.getAllBlocks(false).length;
  if (blockCount === 0) {
    setStatus('warning', 'Add blocks to the workspace before running.');
    return;
  }

  incrementTrialCounters(currentLevel.id);

  runButton.disabled = true;
  resetButton.disabled = true;
  levelSelect.disabled = true;
  prevButton.disabled = true;
  nextButton.disabled = true;

  setStatus('running', 'Executing your program...');
  runtime.reset();
  workspace.highlightBlock(null);

  startRunTimer();

  const mazeApi = createMazeApi(runtime, workspace);

  const previousPrefix = javascriptGenerator.STATEMENT_PREFIX ?? '';
  const previousSuffix = javascriptGenerator.STATEMENT_SUFFIX ?? '';
  const previousTrap = javascriptGenerator.INFINITE_LOOP_TRAP ?? null;

  javascriptGenerator.STATEMENT_PREFIX = 'await MazeAPI.highlight(%1);\n';
  javascriptGenerator.STATEMENT_SUFFIX = 'MazeAPI.checkTimeout();\n';
  javascriptGenerator.INFINITE_LOOP_TRAP = 'MazeAPI.checkTimeout();\n';

  javascriptGenerator.init(workspace);
  javascriptGenerator.addReservedWords('MazeAPI');

  let code = javascriptGenerator.workspaceToCode(workspace);
  code = javascriptGenerator.finish(code);

  javascriptGenerator.STATEMENT_PREFIX = previousPrefix;
  javascriptGenerator.STATEMENT_SUFFIX = previousSuffix;
  javascriptGenerator.INFINITE_LOOP_TRAP = previousTrap;

  let outcome: 'success' | 'incomplete' | 'error' = 'incomplete';
  let errorMessage = '';

  try {
    const runner = new Function('MazeAPI', `"use strict"; return (async () => {\n${code}\n})();`) as (api: MazeApi) => Promise<void>;
    await runner(mazeApi);
    outcome = runtime.isGoal() ? 'success' : 'incomplete';
  } catch (error) {
    outcome = 'error';
    errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    const elapsed = stopRunTimer();
    lastRunDurationMs = elapsed;
    recordRunTime(elapsed);
    workspace.highlightBlock(null);
    runButton.disabled = false;
    resetButton.disabled = false;
    levelSelect.disabled = false;
    updateNavigationState();
  }

  if (outcome === 'success') {
    setStatus('success', `Success! Goal reached in ${formatBillboardTime(lastRunDurationMs)}.`);
    recordBillboardEntry(playerProfile.name, currentLevel, lastRunDurationMs);
  } else if (outcome === 'incomplete') {
    setStatus('warning', 'Program finished, but the runner did not reach the goal.');
  } else {
    setStatus('error', errorMessage || 'Something went wrong while running the program.');
  }
}

function loadLevel(level: MazeLevel): void {
  currentLevel = level;
  levelSelect.value = String(level.id);
  levelName.textContent = `${level.id}. ${level.name}`;
  levelIntro.textContent = level.intro;
  setStatus('idle', 'Configure your blocks, then press Run.');
  updateLevelProgress();
  resetRunTimerDisplay();
  updateTrialDisplays();
  updateNavigationState();

  clearWorkspace();
  resetBlockCounter();

  const toolbox = level.toolbox ?? baseToolbox;
  workspace.updateToolbox(toolbox);
  workspace.options.maxBlocks = Infinity;

  renderMazeGrid(level);
  runtime.loadLevel(level);
  updateBlockCounter();
}

function updateMazeState(state: MazeState): void {
  const key = (row: number, col: number) => `${row}:${col}`;

  tileLookup.forEach((tile) => {
    tile.classList.remove('tile--agent');
    tile.classList.remove('tile--trail');
    tile.removeAttribute('data-heading');
  });

  state.trail.forEach((position) => {
    const tile = tileLookup.get(key(position.row, position.col));
    if (tile) {
      tile.classList.add('tile--trail');
    }
  });

  const agentTile = tileLookup.get(key(state.row, state.col));
  if (agentTile) {
    agentTile.classList.add('tile--agent');
    agentTile.setAttribute('data-heading', state.heading);
  }
}

function renderMazeGrid(level: MazeLevel): void {
  tileLookup.clear();
  mazeGrid.innerHTML = '';

  mazeGrid.style.setProperty('--rows', String(level.tiles.length));
  mazeGrid.style.setProperty('--cols', String(level.tiles[0]?.length ?? 0));

  const fragment = document.createDocumentFragment();

  for (let row = 0; row < level.tiles.length; row += 1) {
    for (let col = 0; col < level.tiles[row].length; col += 1) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = String(row);
      tile.dataset.col = String(col);

      const type = level.tiles[row][col];
      if (type === 'wall') {
        tile.classList.add('tile--wall');
      } else if (type === 'goal') {
        tile.classList.add('tile--goal');
      } else {
        tile.classList.add('tile--open');
      }

      fragment.appendChild(tile);
      tileLookup.set(`${row}:${col}`, tile);
    }
  }

  mazeGrid.appendChild(fragment);
}

function updateBlockCounter(): void {
  const count = workspace.getAllBlocks(false).length;
  setBlockCounter(count);
}

function setBlockCounter(count: number): void {
  blockCounter.textContent = `Blocks: ${count}`;
  blockCounter.classList.remove('counter--warning');
}

function resetBlockCounter(): void {
  setBlockCounter(0);
}

function clearWorkspace(): void {
  Blockly.Events.disable();
  try {
    workspace.clear();
    workspaceTail = null;
  } finally {
    Blockly.Events.enable();
  }
}


function handleAutoAppend(event?: Blockly.Events.Abstract): void {
  if (!event || event.type !== 'create') {
    return;
  }

  const createEvent = event as Blockly.Events.BlockCreate;
  
  // Only process blocks created in the main workspace, not the flyout
  if (createEvent.workspaceId !== workspace.id) {
    return;
  }

  const createdIds = Array.isArray(createEvent.ids) ? createEvent.ids : [];
  
  if (createdIds.length === 0) {
    return;
  }

  console.log('[AutoAppend] Scheduling auto-append for blocks:', createdIds.length);
  createdIds.forEach((id) => {
    const block = workspace.getBlockById(id);
    if (!block || block.isShadow() || block.workspace !== workspace) {
      console.log('[AutoAppend] Skipping block (not found, shadow, or wrong workspace):', id);
      return;
    }
    console.log('[AutoAppend] Queueing block for append:', block.type, 'id:', id);
    scheduleAutoAppend(block);
  });
}

function scheduleAutoAppend(block: Blockly.Block): void {
  let attempts = 0;

  const attempt = () => {
    if (block.isDisposed()) {
      console.log('[AutoAppend] Block disposed before append:', block.id);
      return;
    }

    if (workspace.isDragging()) {
      window.requestAnimationFrame(attempt);
      return;
    }

    if (block.getParent() || block.previousConnection?.isConnected() || block.nextConnection?.isConnected()) {
      console.log('[AutoAppend] Block already connected by user, refreshing tail');
      refreshWorkspaceTail(block.id);
      return;
    }

    if (attempts >= 60) {
      console.warn('[AutoAppend] Aborting auto-append after waiting ~1s for block:', block.id);
      refreshWorkspaceTail(block.id);
      return;
    }

    attempts += 1;
    autoAppendBlock(block);
  };

  window.requestAnimationFrame(attempt);
}

function autoAppendBlock(block: Blockly.Block): void {
  console.log('[AutoAppend] autoAppendBlock called for:', block.type, 'id:', block.id);
  
  if (block.isDisposed()) {
    console.log('[AutoAppend] Block disposed, skipping auto-append');
    return;
  }

  if (!block.previousConnection || block.isShadow()) {
    console.log('[AutoAppend] Block has no previousConnection or is shadow, skipping');
    return;
  }

  if (block.getParent()) {
    console.log('[AutoAppend] Block already has parent, refreshing tail');
    refreshWorkspaceTail();
    return;
  }

  if (block.previousConnection.isConnected()) {
    console.log('[AutoAppend] Block previous connection already linked, skipping');
    refreshWorkspaceTail();
    return;
  }

  if (block.nextConnection?.isConnected()) {
    console.log('[AutoAppend] Block next connection already linked, refreshing tail');
    refreshWorkspaceTail(block.id);
    return;
  }

  const targetTail = findAppendTarget(block);
  console.log('[AutoAppend] Found target tail:', targetTail?.type, 'id:', targetTail?.id);

  if (!targetTail) {
    if (hasAvailableNextConnection(block)) {
      console.log('[AutoAppend] No tail found, setting this block as new tail');
      workspaceTail = block;
    } else {
      console.log('[AutoAppend] No tail found, block cannot be tail');
      refreshWorkspaceTail();
    }
    return;
  }

  if (!targetTail.nextConnection || targetTail.nextConnection.isConnected()) {
    console.log('[AutoAppend] Target tail has no nextConnection or is already connected');
    refreshWorkspaceTail();
    return;
  }

  try {
    console.log('[AutoAppend] Attempting to connect:', targetTail.type, '→', block.type);
    targetTail.nextConnection.connect(block.previousConnection);
    console.log('[AutoAppend] Successfully connected!');
    workspaceTail = block;
  } catch (error) {
    console.error('[AutoAppend] Failed to auto-connect block:', error);
    refreshWorkspaceTail();
  }
}

function findAppendTarget(newBlock: Blockly.Block): Blockly.Block | null {
  const candidate = validateTailCandidate(workspaceTail, newBlock.id);
  if (candidate) {
    return candidate;
  }

  const fallback = selectTailCandidate(newBlock.id);
  if (fallback) {
    workspaceTail = fallback;
  }
  return fallback;
}

function hasAvailableNextConnection(block: Blockly.Block | null | undefined): block is Blockly.Block {
  return !!block && !!block.nextConnection && !block.nextConnection.isConnected();
}

function validateTailCandidate(candidate: Blockly.Block | null, excludeId?: string): Blockly.Block | null {
  if (!candidate || candidate.isDisposed() || !hasAvailableNextConnection(candidate)) {
    return null;
  }
  if (excludeId && candidate.id === excludeId) {
    return null;
  }
  return candidate;
}

function selectTailCandidate(excludeId?: string): Blockly.Block | null {
  const topBlocks = workspace.getTopBlocks(false).filter((block) => !block.isShadow() && block.id !== excludeId);
  console.log('[AutoAppend] selectTailCandidate - top blocks found:', topBlocks.length, topBlocks.map(b => b.type));
  
  let bestTail: Blockly.Block | null = null;
  let bestDepth = 0;
  let bestY = Number.POSITIVE_INFINITY;
  let bestX = Number.POSITIVE_INFINITY;

  for (const top of topBlocks) {
    const { tail, depth } = getStackTail(top);
    console.log('[AutoAppend] Stack from', top.type, '→ tail:', tail.type, 'depth:', depth, 'hasNext:', !!tail.nextConnection, 'connected:', tail.nextConnection?.isConnected());
    
    if (!tail.nextConnection || tail.nextConnection.isConnected()) {
      continue;
    }
    if (excludeId && tail.id === excludeId) {
      continue;
    }
    const { x, y } = tail.getRelativeToSurfaceXY();

    const isBetterDepth = depth > bestDepth;
    // Prefer higher blocks (lower Y values in SVG coordinates)
    const isBetterPosition = depth === bestDepth && (y < bestY || (y === bestY && x < bestX));

    if (!bestTail || isBetterDepth || isBetterPosition) {
      console.log('[AutoAppend] New best tail:', tail.type, 'depth:', depth, 'position: (', x, ',', y, ')');
      bestTail = tail;
      bestDepth = depth;
      bestY = y;
      bestX = x;
    }
  }

  console.log('[AutoAppend] Selected tail:', bestTail?.type, bestTail?.id);
  return bestTail;
}

function getStackTail(startBlock: Blockly.Block): { tail: Blockly.Block; depth: number } {
  let cursor: Blockly.Block = startBlock;
  let depth = 1;
  while (cursor.nextConnection) {
    const next = cursor.nextConnection.targetBlock();
    if (!next) {
      break;
    }
    cursor = next;
    depth += 1;
  }
  return { tail: cursor, depth };
}

function refreshWorkspaceTail(excludeId?: string): void {
  workspaceTail = selectTailCandidate(excludeId);
}

type StatusState = 'idle' | 'running' | 'success' | 'warning' | 'error';

function setStatus(state: StatusState, message: string): void {
  statusText.dataset.state = state;
  statusText.textContent = message;
}

function incrementTrialCounters(levelId: number): void {
  playerProfile.totalTrials += 1;
  playerProfile.levelTrials[levelId] = (playerProfile.levelTrials[levelId] ?? 0) + 1;
  updateTrialDisplays();
  savePlayerProfile();
}

function updateTrialDisplays(): void {
  const levelTrials = playerProfile.levelTrials[currentLevel.id] ?? 0;
  levelTrialCountDisplay.textContent = String(levelTrials);
  totalTrialsDisplay.textContent = String(playerProfile.totalTrials);
}

function startRunTimer(): void {
  resetRunTimerDisplay();
  currentRunStart = performance.now();
  currentRunInterval = window.setInterval(() => {
    updateCurrentRunTimerDisplay(performance.now() - currentRunStart);
  }, 100);
}

function stopRunTimer(): number {
  if (currentRunInterval !== null) {
    window.clearInterval(currentRunInterval);
    currentRunInterval = null;
  }
  if (currentRunStart === 0) {
    return lastRunDurationMs;
  }
  const elapsed = performance.now() - currentRunStart;
  updateCurrentRunTimerDisplay(elapsed);
  currentRunStart = 0;
  return elapsed;
}

function resetRunTimerDisplay(): void {
  if (currentRunInterval !== null) {
    window.clearInterval(currentRunInterval);
    currentRunInterval = null;
  }
  currentRunStart = 0;
  lastRunDurationMs = 0;
  updateCurrentRunTimerDisplay(0);
}

function updateCurrentRunTimerDisplay(ms: number): void {
  currentRunTimer.textContent = formatTimer(ms);
}

function recordRunTime(elapsedMs: number): void {
  if (elapsedMs <= 0) {
    return;
  }
  playerProfile.totalTimeMs += elapsedMs;
  updateTotalTimeDisplay();
  savePlayerProfile();
}

function updateTotalTimeDisplay(): void {
  totalTimeDisplay.textContent = formatTimer(playerProfile.totalTimeMs);
}

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatBillboardTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function updateLevelProgress(): void {
  currentLevelNumber.textContent = String(currentLevel.id);
  totalLevelsDisplay.textContent = String(TOTAL_LEVELS);
}

function updateNavigationState(): void {
  const index = levels.findIndex((entry) => entry.id === currentLevel.id);
  const isFirst = index <= 0;
  const isLast = index >= levels.length - 1;
  prevButton.disabled = levelSelect.disabled || isFirst;
  nextButton.disabled = levelSelect.disabled || isLast;
}

function getAdjacentLevel(offset: number): MazeLevel | undefined {
  const index = levels.findIndex((entry) => entry.id === currentLevel.id);
  if (index < 0) {
    return undefined;
  }
  return levels[index + offset];
}

function showBillboard(): void {
  gameView.classList.add('hidden');
  billboardView.classList.remove('hidden');
  updatePlayerDisplays();
  updateBillboardTable();
}

function hideBillboard(): void {
  billboardView.classList.add('hidden');
  gameView.classList.remove('hidden');
}

function showAnswer(): void {
  if (!currentLevel.solution) {
    setStatus('warning', 'No solution hint available for this level.');
    return;
  }
  setStatus('idle', `💡 Hint: ${currentLevel.solution}`);
}

function updateBillboardTable(): void {
  billboardEntries.sort((a, b) => {
    if (a.timeMs !== b.timeMs) {
      return a.timeMs - b.timeMs;
    }
    return a.recordedAt - b.recordedAt;
  });

  billboardBody.innerHTML = '';

  if (billboardEntries.length === 0) {
    billboardEmptyMessage.classList.remove('hidden');
    downloadCsvButton.disabled = true;
    return;
  }

  billboardEmptyMessage.classList.add('hidden');
  downloadCsvButton.disabled = false;

  const fragment = document.createDocumentFragment();
  billboardEntries.forEach((entry, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);
    row.appendChild(rankCell);

    const playerCell = document.createElement('td');
    playerCell.textContent = entry.player;
    row.appendChild(playerCell);

    const levelCell = document.createElement('td');
    levelCell.textContent = `Level ${entry.levelId}`;
    row.appendChild(levelCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = formatBillboardTime(entry.timeMs);
    row.appendChild(timeCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(entry.recordedAt);
    row.appendChild(dateCell);

    fragment.appendChild(row);
  });

  billboardBody.appendChild(fragment);
}

function recordBillboardEntry(player: string, level: MazeLevel, timeMs: number): void {
  if (!Number.isFinite(timeMs) || timeMs <= 0) {
    return;
  }

  const entry: BillboardEntry = {
    id:
      typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    player,
    levelId: level.id,
    levelName: level.name,
    timeMs,
    recordedAt: Date.now()
  };

  billboardEntries.push(entry);
  saveBillboardEntries(billboardEntries);
  updateBillboardTable();
}

function downloadBillboardCsv(): void {
  if (billboardEntries.length === 0) {
    setStatus('warning', 'No runs recorded yet. Play a level before exporting.');
    return;
  }

  const header = 'player,level_id,level_name,time_ms,time_display,date_iso';
  const sortedEntries = [...billboardEntries].sort((a, b) => {
    if (a.timeMs !== b.timeMs) {
      return a.timeMs - b.timeMs;
    }
    return a.recordedAt - b.recordedAt;
  });

  const rows = sortedEntries.map((entry) => {
    return [
      entry.player,
      String(entry.levelId),
      entry.levelName,
      String(Math.round(entry.timeMs)),
      formatBillboardTime(entry.timeMs),
      new Date(entry.recordedAt).toISOString()
    ].map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'maze-billboard.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function handlePlayerNameSubmit(): void {
  const proposed = playerNameInput.value.trim() || playerProfile.name || generateGuestName();
  playerProfile.name = proposed;
  savePlayerProfile();
  updatePlayerDisplays();
  closePlayerModal();
}

function updatePlayerDisplays(): void {
  playerNameDisplay.textContent = playerProfile.name;
  billboardPlayerName.textContent = playerProfile.name;
}

function openPlayerModal(): void {
  requiresNamePrompt = false;
  playerModal.classList.remove('hidden');
  playerNameInput.value = playerProfile.name || generateGuestName();
  window.setTimeout(() => {
    playerNameInput.focus();
  }, 0);
}

function closePlayerModal(): void {
  playerModal.classList.add('hidden');
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function loadPlayerProfile(): { profile: PlayerProfile; needsName: boolean } {
  if (!storageAvailable) {
    if (!inMemoryProfile) {
      inMemoryProfile = createDefaultProfile();
      return { profile: inMemoryProfile, needsName: true };
    }
    const needsName = inMemoryProfile.name.trim().length === 0;
    return { profile: inMemoryProfile, needsName };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) {
      const profile = createDefaultProfile();
      inMemoryProfile = profile;
      return { profile, needsName: true };
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const normalized = normalizeProfile(parsed);
    inMemoryProfile = normalized;
    const needsName = normalized.name.trim().length === 0;
    if (needsName) {
      const fallback = { ...normalized, name: generateGuestName() };
      inMemoryProfile = fallback;
      return { profile: fallback, needsName: true };
    }
    return { profile: normalized, needsName };
  } catch {
    const profile = createDefaultProfile();
    inMemoryProfile = profile;
    return { profile, needsName: true };
  }
}

function savePlayerProfile(): void {
  inMemoryProfile = { ...playerProfile, levelTrials: { ...playerProfile.levelTrials } };
  if (!storageAvailable) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(inMemoryProfile));
  } catch {
    // Ignore storage failures, rely on in-memory backup.
  }
}

function loadBillboardEntries(): BillboardEntry[] {
  if (!storageAvailable) {
    if (!inMemoryBillboard) {
      inMemoryBillboard = [];
    }
    return inMemoryBillboard;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.billboard);
    if (!raw) {
      inMemoryBillboard = [];
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      inMemoryBillboard = [];
      return [];
    }
    const normalized: BillboardEntry[] = parsed
      .map((entry) => normalizeBillboardEntry(entry))
      .filter((entry): entry is BillboardEntry => entry !== null);
    inMemoryBillboard = normalized;
    return normalized;
  } catch {
    inMemoryBillboard = [];
    return [];
  }
}

function saveBillboardEntries(entries: BillboardEntry[]): void {
  inMemoryBillboard = [...entries];
  if (!storageAvailable) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEYS.billboard, JSON.stringify(entries));
  } catch {
    // Ignore storage failures, rely on in-memory backup.
  }
}

function createDefaultProfile(): PlayerProfile {
  return {
    name: generateGuestName(),
    totalTimeMs: 0,
    totalTrials: 0,
    levelTrials: {}
  };
}

function normalizeProfile(raw: Partial<PlayerProfile> | null | undefined): PlayerProfile {
  const levelTrials: Record<number, number> = {};
  if (raw?.levelTrials && typeof raw.levelTrials === 'object') {
    Object.entries(raw.levelTrials).forEach(([key, value]) => {
      const id = Number(key);
      const trials = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      if (!Number.isNaN(id)) {
        levelTrials[id] = trials;
      }
    });
  }

  return {
    name: typeof raw?.name === 'string' ? raw.name : '',
    totalTimeMs: typeof raw?.totalTimeMs === 'number' && Number.isFinite(raw.totalTimeMs) ? Math.max(0, raw.totalTimeMs) : 0,
    totalTrials: typeof raw?.totalTrials === 'number' && Number.isFinite(raw.totalTrials) ? Math.max(0, Math.floor(raw.totalTrials)) : 0,
    levelTrials
  };
}

function normalizeBillboardEntry(raw: unknown): BillboardEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const candidate = raw as Partial<BillboardEntry>;
  const levelId = typeof candidate.levelId === 'number' ? candidate.levelId : Number(candidate.levelId);
  const timeMs = typeof candidate.timeMs === 'number' ? candidate.timeMs : Number(candidate.timeMs);
  const recordedAt = typeof candidate.recordedAt === 'number' ? candidate.recordedAt : Number(candidate.recordedAt);
  if (!Number.isFinite(levelId) || !Number.isFinite(timeMs) || timeMs <= 0 || !Number.isFinite(recordedAt)) {
    return null;
  }
  return {
    id: typeof candidate.id === 'string' && candidate.id.length > 0 ? candidate.id : `${recordedAt}-${Math.random().toString(16).slice(2)}`,
    player: typeof candidate.player === 'string' && candidate.player.length > 0 ? candidate.player : 'Unknown',
    levelId: Math.max(1, Math.round(levelId)),
    levelName: typeof candidate.levelName === 'string' ? candidate.levelName : `Level ${Math.max(1, Math.round(levelId))}`,
    timeMs,
    recordedAt
  };
}

function generateGuestName(): string {
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `Guest ${suffix}`;
}

function isLocalStorageAvailable(): boolean {
  try {
    const key = '__maze_game_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function populateLevelSelect(select: HTMLSelectElement, entries: MazeLevel[]): void {
  select.innerHTML = '';
  entries.forEach((entry) => {
    const option = document.createElement('option');
    option.value = String(entry.id);
    option.textContent = `${entry.id}. ${entry.name}`;
    if (entry.id === entries[0]?.id) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function createBaseToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'flyoutToolbox',
    contents: [
      { kind: 'block', type: 'maze_move_forward' },
      { kind: 'block', type: 'maze_turn_left' },
      { kind: 'block', type: 'maze_turn_right' },
      { kind: 'sep' },
      { kind: 'block', type: 'maze_repeat_until_goal' },
      { kind: 'block', type: 'maze_if_path' },
      { kind: 'block', type: 'maze_if_else_path' },
      { kind: 'sep' },
      { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: { block: { type: 'math_number', fields: { NUM: 5 } } } } },
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_boolean' },
      { kind: 'block', type: 'math_number' }
    ]
  } satisfies Blockly.utils.toolbox.ToolboxDefinition;
}

function defineMazeBlocks(): void {
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'maze_move_forward',
      message0: 'move forward',
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Move the runner forward one tile.',
      helpUrl: ''
    },
    {
      type: 'maze_turn_left',
      message0: 'turn left',
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Rotate the runner left.',
      helpUrl: ''
    },
    {
      type: 'maze_turn_right',
      message0: 'turn right',
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Rotate the runner right.',
      helpUrl: ''
    },
    {
      type: 'maze_repeat_until_goal',
      message0: 'repeat until goal',
      message1: 'do %1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Repeat the enclosed actions until the runner reaches the goal.',
      helpUrl: ''
    },
    {
      type: 'maze_if_path',
      message0: 'if path %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            ['ahead', 'AHEAD'],
            ['left', 'LEFT'],
            ['right', 'RIGHT']
          ]
        }
      ],
      message1: 'do %1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: 'Run the enclosed actions when there is an open path in the selected direction.',
      helpUrl: ''
    },
    {
      type: 'maze_if_else_path',
      message0: 'if path %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            ['ahead', 'AHEAD'],
            ['left', 'LEFT'],
            ['right', 'RIGHT']
          ]
        }
      ],
      message1: 'do %1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      message2: 'else %1',
      args2: [
        {
          type: 'input_statement',
          name: 'ELSE'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: 'Split execution based on whether a path exists in the selected direction.',
      helpUrl: ''
    }
  ]);

  javascriptGenerator.forBlock['maze_move_forward'] = () => 'await MazeAPI.moveForward();\n';
  javascriptGenerator.forBlock['maze_turn_left'] = () => 'await MazeAPI.turnLeft();\n';
  javascriptGenerator.forBlock['maze_turn_right'] = () => 'await MazeAPI.turnRight();\n';

  javascriptGenerator.forBlock['maze_repeat_until_goal'] = (block) => {
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    const branchWithLoopTrap = javascriptGenerator.addLoopTrap(branch, block as Blockly.Block);
    return `while (!MazeAPI.isGoal()) {\n${branchWithLoopTrap}}\n`;
  };

  javascriptGenerator.forBlock['maze_if_path'] = (block) => {
    const direction = block.getFieldValue('DIR') as DirectionKeyword;
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `if (MazeAPI.isPath('${direction}')) {\n${branch}}\n`;
  };

  javascriptGenerator.forBlock['maze_if_else_path'] = (block) => {
    const direction = block.getFieldValue('DIR') as DirectionKeyword;
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    const elseBranch = javascriptGenerator.statementToCode(block, 'ELSE');
    return `if (MazeAPI.isPath('${direction}')) {\n${branch}} else {\n${elseBranch}}\n`;
  };
}

function createMazeApi(runtimeInstance: MazeRuntime, workspaceInstance: WorkspaceSvg): MazeApi {
  let steps = 0;

  const delay = (ms: number) => new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

  return {
    async highlight(blockId: string) {
      if (blockId) {
        workspaceInstance.highlightBlock(blockId);
      }
      await delay(HIGHLIGHT_DELAY_MS);
    },
    checkTimeout() {
      steps += 1;
      if (steps > STEP_LIMIT) {
        throw new Error('Program exceeded the maximum number of steps.');
      }
    },
    async moveForward() {
      runtimeInstance.moveForward();
      await delay(STEP_DELAY_MS);
    },
    async turnLeft() {
      runtimeInstance.turnLeft();
      await delay(HIGHLIGHT_DELAY_MS);
    },
    async turnRight() {
      runtimeInstance.turnRight();
      await delay(HIGHLIGHT_DELAY_MS);
    },
    isPath(direction: DirectionKeyword) {
      switch (direction) {
        case 'AHEAD':
          return runtimeInstance.isPathForward();
        case 'LEFT':
          return runtimeInstance.isPathLeft();
        case 'RIGHT':
          return runtimeInstance.isPathRight();
        default:
          return false;
      }
    },
    isGoal() {
      return runtimeInstance.isGoal();
    }
  } satisfies MazeApi;
}

function resizeBlocklyWorkspace(area: HTMLDivElement, surface: HTMLDivElement): void {
  surface.style.left = '0';
  surface.style.top = '0';
  surface.style.width = `${area.clientWidth}px`;
  surface.style.height = `${area.clientHeight}px`;
  Blockly.svgResize(workspace);
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
}

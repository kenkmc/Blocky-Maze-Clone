import './style.css';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import type { WorkspaceSvg } from 'blockly/core';

import { levels } from './mazeLevels';
import { MazeRuntime } from './mazeRuntime';
import type { MazeLevel, MazeState } from './mazeTypes';
import { SoundManager } from './soundManager';
import { resources } from './i18n';
import {
  type BillboardEntry,
  loadPlayerProfile,
  savePlayerProfile,
  loadBillboardEntries,
  saveBillboardEntries,
  generateGuestName
} from './persistence';

const STEP_DELAY_MS = 220;
const HIGHLIGHT_DELAY_MS = 120;
const STEP_LIMIT = 2000;

let stepDelay = STEP_DELAY_MS;

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

const TOTAL_LEVELS = levels.length;

const soundManager = new SoundManager();

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('Unable to locate the #app container.');
}

// Language handling
type Language = 'en' | 'zh-Hant';
const currentLang = (localStorage.getItem('lang') as Language) || 'en';
const t = resources[currentLang];

// Dynamic import of Blockly locale
if (currentLang === 'zh-Hant') {
  await import('blockly/msg/zh-hant');
} else {
  await import('blockly/msg/en');
}

appRoot.innerHTML = `
  <div id="game-view" class="layout">
    <header class="layout__header">
      <div>
        <h1 class="title">${t.ui.title}</h1>
        <p class="subtitle">${t.ui.subtitle}</p>
        <p class="player-label">${t.ui.playingAs} <span id="player-name-display" class="player-name"></span></p>
      </div>
      <div class="controls">
        <label class="controls__group">
          <span>${t.ui.level}</span>
          <select id="level-select" class="controls__select"></select>
        </label>
        <div class="controls__nav">
          <button id="prev-button" class="button button--ghost" type="button" aria-label="Previous level">${t.ui.prev}</button>
          <span class="controls__progress"><span id="current-level-number"></span>/<span id="total-levels"></span></span>
          <button id="next-button" class="button button--ghost" type="button" aria-label="Next level">${t.ui.next}</button>
        </div>
        <label class="controls__group" title="Adjust execution speed">
          <span>${t.ui.speed}</span>
          <input id="speed-slider" type="range" min="50" max="500" step="50" value="220" class="controls__slider" />
        </label>
        <button id="run-button" class="button button--primary" type="button">${t.ui.run}</button>
        <button id="reset-button" class="button" type="button">${t.ui.reset}</button>
        <button id="show-answer-button" class="button button--ghost" type="button">${t.ui.showAnswer}</button>
        <button id="show-code-button" class="button button--ghost" type="button">${t.ui.showCode}</button>
        <button id="billboard-button" class="button button--ghost" type="button">${t.ui.billboard}</button>
        <button id="sound-button" class="button button--ghost" type="button" aria-label="Toggle sound">🔊</button>
        <button id="lang-button" class="button button--ghost" type="button">${t.ui.translate}</button>
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
            <span class="metric__label">${t.ui.metricRun}</span>
            <span id="current-run-timer" class="metric__value">00:00</span>
          </div>
          <div class="metric">
            <span class="metric__label">${t.ui.metricTotal}</span>
            <span id="total-time" class="metric__value">00:00</span>
          </div>
          <div class="metric">
            <span class="metric__label">${t.ui.metricTrialsLevel}</span>
            <span id="trial-count" class="metric__value">0</span>
          </div>
          <div class="metric">
            <span class="metric__label">${t.ui.metricTrialsAll}</span>
            <span id="total-trials" class="metric__value">0</span>
          </div>
        </div>
        <div class="maze-panel__footer">
          <span id="status-text" class="status" data-state="idle">${t.ui.statusIdle}</span>
        </div>
      </aside>
    </section>
  </div>
  <section id="billboard-view" class="billboard hidden">
    <header class="billboard__header">
      <div>
        <h2>${t.ui.billboardTitle}</h2>
        <p class="billboard__subtitle">${t.ui.billboardSubtitle}</p>
      </div>
      <div class="billboard__actions">
        <button id="download-csv" class="button" type="button">${t.ui.billboardDownload}</button>
        <button id="billboard-back" class="button button--primary" type="button">${t.ui.billboardBack}</button>
      </div>
    </header>
    <p class="billboard__player">${t.ui.playingAs} <span id="billboard-player-name" class="player-name"></span></p>
    <div class="billboard__table-wrapper">
      <table class="billboard__table">
        <thead>
          <tr>
            <th>${t.ui.billboardRank}</th>
            <th>${t.ui.billboardPlayer}</th>
            <th>${t.ui.billboardLevel}</th>
            <th>${t.ui.billboardTime}</th>
            <th>${t.ui.billboardDate}</th>
          </tr>
        </thead>
        <tbody id="billboard-body"></tbody>
      </table>
      <p id="billboard-empty" class="billboard__empty">${t.ui.billboardEmpty}</p>
    </div>
  </section>
  <div id="player-modal" class="modal hidden">
    <div class="modal__dialog">
      <h2>${t.ui.modalTitle}</h2>
      <p>${t.ui.modalText}</p>
      <div class="modal__form">
        <input id="player-name-input" class="modal__input" type="text" maxlength="24" />
        <button id="player-name-submit" class="button button--primary" type="button">${t.ui.modalStart}</button>
      </div>
    </div>
  </div>
`;
const levelSelect = requireElement<HTMLSelectElement>('#level-select');
const speedSlider = requireElement<HTMLInputElement>('#speed-slider');
const runButton = requireElement<HTMLButtonElement>('#run-button');
const resetButton = requireElement<HTMLButtonElement>('#reset-button');
const showAnswerButton = requireElement<HTMLButtonElement>('#show-answer-button');
const showCodeButton = requireElement<HTMLButtonElement>('#show-code-button');
const statusText = requireElement<HTMLSpanElement>('#status-text');
const blockCounter = requireElement<HTMLSpanElement>('#block-counter');
const levelName = requireElement<HTMLHeadingElement>('#level-name');
const levelIntro = requireElement<HTMLParagraphElement>('#level-intro');
const mazeGrid = requireElement<HTMLDivElement>('#maze-grid');
const mazePanel = requireElement<HTMLElement>('.maze-panel');
const mazePanelHeader = requireElement<HTMLElement>('.maze-panel__header');
const mazePanelFooter = requireElement<HTMLElement>('.maze-panel__footer');
const mazeMetrics = requireElement<HTMLElement>('.metrics');
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
const soundButton = requireElement<HTMLButtonElement>('#sound-button');
const langButton = requireElement<HTMLButtonElement>('#lang-button');
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

window.addEventListener('resize', () => {
  resizeBlocklyWorkspace(blocklyArea, blocklyDiv);
  fitMazeGrid(currentLevel);
});
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

speedSlider.addEventListener('input', () => {
  // Invert the value so higher slider = faster (lower delay)
  // Slider: 50 (fast) to 500 (slow).
  // Actually, let's just map directly: Left (50) is fast, Right (500) is slow?
  // Usually right is "more", so maybe "Speed" means faster?
  // Let's keep it simple: Slider value is delay in ms.
  // So Left (50ms) is fast, Right (500ms) is slow.
  stepDelay = Number(speedSlider.value);
});

resetButton.addEventListener('click', () => {
  clearWorkspace();
  resetBlockCounter();
  runtime.reset();
  resetRunTimerDisplay();
  setStatus('idle', t.ui.statusIdle);
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

showCodeButton.addEventListener('click', () => {
  showCode();
});

billboardButton.addEventListener('click', () => {
  showBillboard();
});

soundButton.addEventListener('click', () => {
  const enabled = !soundManager.isEnabled();
  soundManager.setEnabled(enabled);
  soundButton.textContent = enabled ? t.ui.soundOn : t.ui.soundOff;
});

langButton.addEventListener('click', () => {
  const nextLang = currentLang === 'en' ? 'zh-Hant' : 'en';
  localStorage.setItem('lang', nextLang);
  window.location.reload();
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

  setStatus('running', t.ui.statusRunning);
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
    setStatus('success', t.ui.statusSuccess.replace('{time}', formatBillboardTime(lastRunDurationMs)));
    recordBillboardEntry(playerProfile.name, currentLevel, lastRunDurationMs);
    soundManager.playWin();
  } else if (outcome === 'incomplete') {
    setStatus('warning', t.ui.statusIncomplete);
    soundManager.playFail();
  } else {
    setStatus('error', errorMessage || t.ui.statusError);
    soundManager.playFail();
  }
}

function loadLevel(level: MazeLevel): void {
  currentLevel = level;
  levelSelect.value = String(level.id);
  
  // Use translated name/intro if available
  const levelInfo = t.levels[level.id as keyof typeof t.levels];
  const displayName = levelInfo ? levelInfo.name : level.name;
  const displayIntro = levelInfo ? levelInfo.intro : level.intro;
  const focusLine = `${t.ui.learningFocusLabel} ${level.learningFocus}`;

  levelName.textContent = `${level.id}. ${displayName}`;
  levelIntro.textContent = `${displayIntro} ${focusLine}`;
  setStatus('idle', t.ui.statusIdle);
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
  fitMazeGrid(level);
}

function fitMazeGrid(level: MazeLevel): void {
  const rows = level.tiles.length;
  const cols = level.tiles[0]?.length ?? 1;
  if (rows <= 0 || cols <= 0) {
    return;
  }

  const panelRect = mazePanel.getBoundingClientRect();
  const headerHeight = mazePanelHeader.getBoundingClientRect().height;
  const metricsHeight = mazeMetrics.getBoundingClientRect().height;
  const footerHeight = mazePanelFooter.getBoundingClientRect().height;

  const panelStyles = window.getComputedStyle(mazePanel);
  const panelPaddingY = parseFloat(panelStyles.paddingTop) + parseFloat(panelStyles.paddingBottom);
  const panelGap = parseFloat(panelStyles.rowGap || panelStyles.gap || '0');

  const availableHeight = Math.max(160, panelRect.height - panelPaddingY - headerHeight - metricsHeight - footerHeight - panelGap * 3);
  const availableWidth = Math.max(220, panelRect.width - 8);

  const gridStyles = window.getComputedStyle(mazeGrid);
  const gridGap = parseFloat(gridStyles.columnGap || '0');
  const gridPaddingX = parseFloat(gridStyles.paddingLeft) + parseFloat(gridStyles.paddingRight);
  const gridPaddingY = parseFloat(gridStyles.paddingTop) + parseFloat(gridStyles.paddingBottom);

  const cellByWidth = (availableWidth - gridPaddingX - gridGap * (cols - 1)) / cols;
  const cellByHeight = (availableHeight - gridPaddingY - gridGap * (rows - 1)) / rows;
  const cellSize = Math.max(14, Math.floor(Math.min(cellByWidth, cellByHeight)));

  const fittedWidth = gridPaddingX + cellSize * cols + gridGap * (cols - 1);
  const fittedHeight = gridPaddingY + cellSize * rows + gridGap * (rows - 1);

  mazeGrid.style.setProperty('--cell-size', `${cellSize}px`);
  mazeGrid.style.width = `${Math.floor(fittedWidth)}px`;
  mazeGrid.style.height = `${Math.floor(fittedHeight)}px`;
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
  savePlayerProfile(playerProfile);
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
  savePlayerProfile(playerProfile);
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
  const solution = currentLevel.solution || (t.levels as any)[currentLevel.id]?.solution;
  if (!solution) {
    setStatus('warning', 'No solution hint available for this level.');
    return;
  }
  setStatus('idle', solution);
}

function showCode(): void {
  const code = javascriptGenerator.workspaceToCode(workspace);
  if (!code) {
    setStatus('warning', 'No code to show. Add some blocks first!');
    return;
  }
  alert(code);
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
  savePlayerProfile(playerProfile);
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



function populateLevelSelect(select: HTMLSelectElement, entries: MazeLevel[]): void {
  select.innerHTML = '';
  entries.forEach((entry) => {
    const option = document.createElement('option');
    option.value = String(entry.id);
    
    const levelInfo = t.levels[entry.id as keyof typeof t.levels];
    const displayName = levelInfo ? levelInfo.name : entry.name;
    
    option.textContent = `${entry.id}. ${displayName}`;
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
      message0: t.blocks.moveForward,
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: 'Move the runner forward one tile.',
      helpUrl: ''
    },
    {
      type: 'maze_turn_left',
      message0: t.blocks.turnLeft,
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Rotate the runner left.',
      helpUrl: ''
    },
    {
      type: 'maze_turn_right',
      message0: t.blocks.turnRight,
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Rotate the runner right.',
      helpUrl: ''
    },
    {
      type: 'maze_repeat_until_goal',
      message0: t.blocks.repeatUntil,
      message1: t.blocks.do,
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
      message0: t.blocks.ifPath,
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            [t.blocks.dirAhead, 'AHEAD'],
            [t.blocks.dirLeft, 'LEFT'],
            [t.blocks.dirRight, 'RIGHT']
          ]
        }
      ],
      message1: t.blocks.do,
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
      tooltip: 'Run the enclosed actions when there is an open path in the selected direction.',
      helpUrl: ''
    },
    {
      type: 'maze_if_else_path',
      message0: t.blocks.ifPath,
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            [t.blocks.dirAhead, 'AHEAD'],
            [t.blocks.dirLeft, 'LEFT'],
            [t.blocks.dirRight, 'RIGHT']
          ]
        }
      ],
      message1: t.blocks.do,
      args1: [
        {
          type: 'input_statement',
          name: 'DO'
        }
      ],
      message2: t.blocks.else,
      args2: [
        {
          type: 'input_statement',
          name: 'ELSE'
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
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
      try {
        runtimeInstance.moveForward();
        soundManager.playMove();
        await delay(stepDelay);
      } catch (e) {
        soundManager.playWallHit();
        throw e;
      }
    },
    async turnLeft() {
      runtimeInstance.turnLeft();
      soundManager.playTurn();
      await delay(Math.min(HIGHLIGHT_DELAY_MS, stepDelay));
    },
    async turnRight() {
      runtimeInstance.turnRight();
      soundManager.playTurn();
      await delay(Math.min(HIGHLIGHT_DELAY_MS, stepDelay));
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

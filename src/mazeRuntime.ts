import type { MazeHeading, MazeLevel, MazePosition, MazeState, MazeTile } from './mazeTypes';

type StateChangeListener = (state: MazeState) => void;

const headingOrder: MazeHeading[] = ['north', 'east', 'south', 'west'];

const headingVectors: Record<MazeHeading, { row: number; col: number }> = {
  north: { row: -1, col: 0 },
  east: { row: 0, col: 1 },
  south: { row: 1, col: 0 },
  west: { row: 0, col: -1 }
};

const clone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export interface MazeRuntimeOptions {
  onStateChange?: StateChangeListener;
}

export class MazeRuntime {
  private level: MazeLevel;
  private state: MazeState;
  private listener: StateChangeListener | null;

  constructor(level: MazeLevel, options: MazeRuntimeOptions = {}) {
    this.level = level;
    this.state = this.initialState(level);
    this.listener = options.onStateChange ?? null;
    this.notify();
  }

  public loadLevel(level: MazeLevel): void {
    this.level = level;
    this.state = this.initialState(level);
    this.notify();
  }

  public reset(): void {
    this.state = this.initialState(this.level);
    this.notify();
  }

  public getState(): MazeState {
    return clone(this.state);
  }

  public moveForward(): void {
    const next = this.nextPosition(this.state.heading);
    const tile = this.tileAt(next.row, next.col);
    if (tile === 'wall') {
      throw new Error('Bumped into a wall. Try sensing the maze before moving.');
    }
    this.state = {
      ...next,
      heading: this.state.heading,
      trail: [...this.state.trail, { row: next.row, col: next.col }],
      goalReached: this.state.goalReached || tile === 'goal'
    };
    this.notify();
  }

  public turnLeft(): void {
    const index = headingOrder.indexOf(this.state.heading);
    const heading = headingOrder[(index + 3) % 4];
    this.state = { ...this.state, heading };
    this.notify();
  }

  public turnRight(): void {
    const index = headingOrder.indexOf(this.state.heading);
    const heading = headingOrder[(index + 1) % 4];
    this.state = { ...this.state, heading };
    this.notify();
  }

  public isPathForward(): boolean {
    return this.isTileNavigable(this.nextPosition(this.state.heading));
  }

  public isPathLeft(): boolean {
    const index = headingOrder.indexOf(this.state.heading);
    const heading = headingOrder[(index + 3) % 4];
    return this.isTileNavigable(this.nextPosition(heading));
  }

  public isPathRight(): boolean {
    const index = headingOrder.indexOf(this.state.heading);
    const heading = headingOrder[(index + 1) % 4];
    return this.isTileNavigable(this.nextPosition(heading));
  }

  public isGoal(): boolean {
    return this.state.goalReached;
  }

  public setStateListener(listener: StateChangeListener | null): void {
    this.listener = listener;
    this.notify();
  }

  private notify(): void {
    if (this.listener) {
      this.listener(clone(this.state));
    }
  }

  private initialState(level: MazeLevel): MazeState {
    return {
      row: level.start.row,
      col: level.start.col,
      heading: level.startHeading,
      goalReached: false,
      trail: [clone(level.start)]
    };
  }

  private nextPosition(heading: MazeHeading): MazePosition {
    const vector = headingVectors[heading];
    return {
      row: this.state.row + vector.row,
      col: this.state.col + vector.col
    };
  }

  private isTileNavigable(position: MazePosition): boolean {
    const tile = this.tileAt(position.row, position.col);
    return tile === 'open' || tile === 'goal';
  }

  private tileAt(row: number, col: number): MazeTile {
    if (row < 0 || col < 0 || row >= this.level.tiles.length || col >= this.level.tiles[0].length) {
      return 'wall';
    }
    return this.level.tiles[row][col];
  }
}

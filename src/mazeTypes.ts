export type MazeHeading = 'north' | 'east' | 'south' | 'west';

export type MazeTile = 'wall' | 'open' | 'goal';

export type MazeConcept = 'sequence' | 'loop' | 'selection' | 'variable';

export interface MazePosition {
  row: number;
  col: number;
}

export interface MazeLevelDefinition {
  id: number;
  name: string;
  map: string[];
  startDirection: MazeHeading;
  maxBlocks: number;
  intro: string;
  learningFocus?: string;
  requiredConcepts?: MazeConcept[];
  toolbox?: import('blockly/core').utils.toolbox.ToolboxDefinition;
  solution?: string;
}

export interface MazeLevel {
  id: number;
  name: string;
  tiles: MazeTile[][];
  start: MazePosition;
  goal: MazePosition;
  startHeading: MazeHeading;
  maxBlocks: number;
  intro: string;
  learningFocus: string;
  requiredConcepts: MazeConcept[];
  toolbox?: import('blockly/core').utils.toolbox.ToolboxDefinition;
  solution?: string;
}

export interface MazeState extends MazePosition {
  heading: MazeHeading;
  goalReached: boolean;
  trail: MazePosition[];
}

# Blockly Maze Clone

A browser-based recreation of the Blockly Games Maze challenges built with Vite and TypeScript. Arrange Blockly blocks to guide a runner through tile-based mazes, practice control flow, and explore basic path-finding strategies.

## Features

- Blockly workspace with custom movement and sensing blocks tailored to the maze gameplay
- Twenty handcrafted levels that steadily introduce turns, loops, and sensor logic
- Animated runner with wall-following sensors and breadcrumb trail highlighting previous steps
- Responsive UI with live block count indicator and step guards to prevent infinite programs
- Session metrics with per-run timers plus per-level and global trial counters
- Player profiles with a lightweight local scoreboard to compare fastest completions
- Quick navigation controls to hop between levels without refreshing the page
- Optional solution hints with a “Show Answer” helper for each level

## Getting Started

### Prerequisites

- Node.js 18 or later (the LTS build is recommended)

### Installation

```powershell
npm install
```

### Development server

Launch Vite in watch mode:

```powershell
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`) in your browser.

### Production build

Generate an optimized build:

```powershell
npm run build
```

> ℹ️ Blockly is a large dependency, so Vite emits a chunk-size warning during bundling. This is expected and safe to ignore unless you plan to deploy to constrained environments.

### Preview build output

```powershell
npm run preview
```

## Project Structure

```
src/
  main.ts          # UI wiring, Blockly setup, runtime execution
  mazeLevels.ts    # Maze layouts and level metadata
  mazeRuntime.ts   # Runner state machine and maze interactions
  mazeTypes.ts     # Shared type definitions
  style.css        # Layout, workspace, and maze visuals
```

## Computational Thinking Progression

The level sequence now follows an explicit curriculum:

1. **Sequence** (Levels 1-5): movement order, turns, and orientation.
2. **Loops** (Levels 6-9): repeat patterns and counted repetition.
3. **Variables + Loops** (Levels 10-11): counter-based movement planning.
4. **Selection** (Levels 12-16): `if` / `if-else` path decisions.
5. **Integration** (Levels 17-21): combine variables, selection, and loops.

Each level includes a dedicated `learningFocus` and required concept tags in `src/mazeLevels.ts`.

## Customising Levels

Level definitions live in `src/mazeLevels.ts`. Each level specifies a grid map using characters:

- `#` – wall
- `.` or space – open tile
- `S` – starting tile (also records the runner’s entry point)
- `G` – goal tile

Adjust the `map`, `startDirection`, `maxBlocks`, `toolbox`, and `intro` fields to craft new challenges. A helper script (`scripts/generateLevels.js`) can be used to sketch new corridor layouts. Rebuild or restart the dev server after editing level data to ensure changes propagate.

### Answer-first level design workflow

For every level, authoring follows this order:

1. Define `learningFocus` and `requiredConcepts`.
2. Write a canonical `referenceProgram` that intentionally uses those concepts.
3. Run built-in validation (on app load/build) to confirm the answer reaches the goal and covers required concepts.
4. Only then finalize or redraw the maze layout.

If a canonical answer is incorrect (hits walls / never reaches goal / misses required concepts), startup/build fails early with a descriptive error.

## Troubleshooting

- **Blockly chunk-size warning**: The bundler can report that the JavaScript bundle exceeds 500 kB. This is normal for Blockly projects; consider dynamic imports only if you observe runtime issues.
- **Runner hits a wall immediately**: Ensure your block sequence begins with a movement only when `isPath('AHEAD')` returns true, or guard with the provided sensing blocks.
- **Infinite loops**: The runtime enforces a step limit (currently 2000 operations). If exceeded, execution halts with a descriptive error in the status area.

## License

This project is provided for educational purposes. Review and adapt the code to suit your needs.

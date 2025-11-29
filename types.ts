export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED'
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME_ATTACK = 'TIME_ATTACK',
  DAILY = 'DAILY',
  PVP = 'PVP' // Placeholder for future implementation
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  width: number;
  gapTop: number;
  gapHeight: number;
  passed: boolean;
  type: 'classic' | 'moving';
  movingDirection?: 1 | -1;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  date: number;
  mode: GameMode;
}

export interface GameConfig {
  gravity: number;
  jumpStrength: number;
  baseSpeed: number;
  gapSize: number;
  obstacleFrequency: number;
  isSoundEnabled: boolean;
  gameMode: GameMode;
  seed: number; // For procedural generation
  timeLimit?: number; // For Time Attack (in seconds)
}
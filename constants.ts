export const COLORS = {
  background: '#0f172a', // slate-900
  snake: '#22d3ee', // cyan-400
  snakeTrail: 'rgba(34, 211, 238, 0.4)',
  obstacle: '#334155', // slate-700
  obstacleBorder: '#475569', // slate-600
  text: '#f8fafc', // slate-50
  accent: '#f472b6', // pink-400
};

export const PHYSICS = {
  GRAVITY: 0.35, // Reduced from 0.5 for smoother fall
  LIFT: 0.8, // Upward force per frame when holding
  JUMP_STRENGTH: -5.5, // Deprecated in favor of LIFT, kept for ref
  TERMINAL_VELOCITY: 8,
  BASE_SPEED: 4.0,
  SPEED_INCREMENT: 0.002, // Speed increase per frame
  OBSTACLE_WIDTH: 50,
  OBSTACLE_GAP: 170, // Slightly wider for continuous movement
  OBSTACLE_SPAWN_DISTANCE: 350,
};

export const UI_Z_INDEX = {
  CANVAS: 0,
  HUD: 10,
  OVERLAY: 20,
};
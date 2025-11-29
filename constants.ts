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
  GRAVITY: 0.3, // Reduced to 0.3 for floatier feel
  LIFT: 0.5, // Reduced from 0.8 for more control
  JUMP_STRENGTH: -5.5, 
  TERMINAL_VELOCITY: 8,
  BASE_SPEED: 3.5, // Reduced from 4.0 for better reaction time
  SPEED_INCREMENT: 0.002, 
  OBSTACLE_WIDTH: 50,
  OBSTACLE_GAP: 190, // Increased from 170 for accessibility
  OBSTACLE_SPAWN_DISTANCE: 350,
};

export const UI_Z_INDEX = {
  CANVAS: 0,
  HUD: 10,
  OVERLAY: 20,
};
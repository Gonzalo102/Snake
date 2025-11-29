
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
  GRAVITY: 0.25, // Reduced further for very smooth floating
  LIFT: 0.35, // Reduced significantly to prevent shooting up too fast
  JUMP_STRENGTH: -5.5, 
  TERMINAL_VELOCITY: 6, // Cap max speed slightly lower
  BASE_SPEED: 3.0, // Slower base speed for better mobile reaction time
  SPEED_INCREMENT: 0.0015, // Slower acceleration
  OBSTACLE_WIDTH: 50,
  OBSTACLE_GAP: 200, // Very wide gap for accessibility
  OBSTACLE_SPAWN_DISTANCE: 350,
};

export const UI_Z_INDEX = {
  CANVAS: 0,
  HUD: 10,
  OVERLAY: 20,
};

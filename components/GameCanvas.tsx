import React, { useRef, useEffect, useCallback } from 'react';
import { GameStatus, GameConfig, Vector2, Obstacle, Particle, GameMode } from '../types';
import { PHYSICS, COLORS } from '../constants';
import { audioService } from '../services/audioService';
import { SeededRNG } from '../utils/rng';

interface GameCanvasProps {
  status: GameStatus;
  config: GameConfig;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onTimeUpdate?: (timeLeft: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  config, 
  onScoreUpdate, 
  onGameOver,
  onTimeUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Input state
  const isPressing = useRef<boolean>(false);
  
  // RNG Reference
  const rng = useRef<SeededRNG>(new SeededRNG(config.seed));

  // Mutable game state
  const state = useRef({
    snakeY: 0,
    velocity: 0,
    trail: [] as Vector2[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    score: 0, 
    rawScore: 0, 
    distanceTraveled: 0,
    currentSpeed: config.baseSpeed,
    width: 0,
    height: 0,
    frameCount: 0,
    timeLeft: config.timeLimit || 0,
  });

  const stars = useRef<Array<{x: number, y: number, size: number, speed: number}>>([]);

  // Initialize stars (visual only, can use Math.random)
  useEffect(() => {
    stars.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1
    }));
  }, []);

  // Use RNG for gameplay elements (obstacles)
  const spawnObstacle = useCallback((canvasWidth: number, canvasHeight: number) => {
    const minGap = 130;
    const difficultyMod = Math.min(60, Math.floor(state.current.score / 50));
    const gapHeight = Math.max(minGap, config.gapSize - difficultyMod); 
    
    const minGapY = 50;
    const maxGapY = canvasHeight - gapHeight - 50;
    
    // Use Seeded RNG
    const gapTop = rng.current.nextFloat() * (maxGapY - minGapY) + minGapY;
    const isMoving = rng.current.nextFloat() > 0.7; // 30% chance of moving
    const direction = rng.current.nextFloat() > 0.5 ? 1 : -1;

    const obstacle: Obstacle = {
      x: canvasWidth + 50,
      width: PHYSICS.OBSTACLE_WIDTH,
      gapTop,
      gapHeight,
      passed: false,
      type: isMoving ? 'moving' : 'classic',
      movingDirection: direction
    };

    state.current.obstacles.push(obstacle);
  }, [config.gapSize]);

  const createExplosion = (x: number, y: number) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2; // Visuals can be random
      const speed = Math.random() * 5 + 2;
      state.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: i % 2 === 0 ? COLORS.snake : COLORS.accent
      });
    }
  };

  const resetGame = useCallback(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    
    isPressing.current = false;
    
    // Reset RNG with the config seed for this run
    rng.current = new SeededRNG(config.seed);

    state.current = {
      snakeY: height / 2,
      velocity: 0,
      trail: [],
      obstacles: [],
      particles: [],
      score: 0,
      rawScore: 0,
      distanceTraveled: 0,
      currentSpeed: config.baseSpeed,
      width,
      height,
      frameCount: 0,
      timeLeft: config.timeLimit || 0
    };

    const headX = width * 0.3;
    for(let i = 0; i < 20; i++) {
      state.current.trail.push({ x: headX - (i * 5), y: height / 2 });
    }

    onScoreUpdate(0);
    if (onTimeUpdate && config.timeLimit) onTimeUpdate(config.timeLimit);
  }, [config, onScoreUpdate, onTimeUpdate]);

  // Handle Game Over internally
  const triggerGameOver = useCallback(() => {
    // Send the FINAL score to the parent
    onGameOver(state.current.score);
  }, [onGameOver]);

  // --- INPUT HANDLING ---
  const startInput = useCallback(() => {
    if (status === GameStatus.PLAYING) {
      isPressing.current = true;
    }
  }, [status]);

  const endInput = useCallback(() => {
    isPressing.current = false;
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); 
        if (!e.repeat) startInput();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        endInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startInput, endInput]);


  // --- MAIN GAME LOOP ---
  const update = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      state.current.width = canvas.width;
      state.current.height = canvas.height;
      if (status === GameStatus.MENU) {
        resetGame();
      }
    }

    const { width, height } = state.current;
    const headX = width * 0.3;

    if (status === GameStatus.PLAYING) {
      state.current.frameCount++;
      state.current.currentSpeed += PHYSICS.SPEED_INCREMENT;

      // Time Attack Logic
      if (config.gameMode === GameMode.TIME_ATTACK) {
        // Decrease time roughly by 1/60th of a second
        state.current.timeLeft -= 1/60;
        
        // Update HUD every ~0.5s or frame
        if (state.current.frameCount % 10 === 0 && onTimeUpdate) {
             onTimeUpdate(Math.ceil(state.current.timeLeft));
        }

        if (state.current.timeLeft <= 0) {
            state.current.timeLeft = 0;
            if (onTimeUpdate) onTimeUpdate(0);
            triggerGameOver();
            return;
        }
      }

      // 1. Physics
      state.current.velocity += config.gravity;
      
      if (isPressing.current) {
        state.current.velocity -= PHYSICS.LIFT;
      }

      if (state.current.velocity > PHYSICS.TERMINAL_VELOCITY) state.current.velocity = PHYSICS.TERMINAL_VELOCITY;
      if (state.current.velocity < -PHYSICS.TERMINAL_VELOCITY) state.current.velocity = -PHYSICS.TERMINAL_VELOCITY;

      state.current.snakeY += state.current.velocity;

      // 2. Score
      state.current.rawScore += state.current.currentSpeed * 0.05;
      const displayScore = Math.floor(state.current.rawScore);
      
      if (displayScore > state.current.score) {
        state.current.score = displayScore;
        onScoreUpdate(state.current.score);
      }

      // 3. Trail
      for (let i = 0; i < state.current.trail.length; i++) {
        state.current.trail[i].x -= state.current.currentSpeed;
      }
      state.current.trail = state.current.trail.filter(p => p.x > 0);
      state.current.trail.push({ x: headX, y: state.current.snakeY });

      // 4. Obstacles
      const lastObstacle = state.current.obstacles[state.current.obstacles.length - 1];
      if (!lastObstacle || (width - lastObstacle.x > PHYSICS.OBSTACLE_SPAWN_DISTANCE)) {
        spawnObstacle(width, height);
      }

      state.current.obstacles.forEach(obs => {
        obs.x -= state.current.currentSpeed;
        if (obs.type === 'moving') {
            obs.gapTop += (obs.movingDirection || 1) * 2;
            if (obs.gapTop < 50 || obs.gapTop > height - obs.gapHeight - 50) {
                obs.movingDirection = (obs.movingDirection || 1) * -1;
            }
        }
      });
      
      state.current.obstacles = state.current.obstacles.filter(obs => obs.x + obs.width > -100);

      // 5. Collision
      if (state.current.snakeY < 0 || state.current.snakeY > height) {
        audioService.playCrash();
        createExplosion(headX, state.current.snakeY);
        triggerGameOver();
        return; 
      }

      const snakeRadius = 4;
      let crashed = false;

      state.current.obstacles.forEach(obs => {
        if (headX + snakeRadius > obs.x && headX - snakeRadius < obs.x + obs.width) {
          const inGap = state.current.snakeY > obs.gapTop && state.current.snakeY < obs.gapTop + obs.gapHeight;
          if (!inGap) crashed = true;
        }

        if (!obs.passed && headX > obs.x + obs.width) {
          obs.passed = true;
          state.current.rawScore += 50; 
          audioService.playScore();
        }
      });

      if (crashed) {
        audioService.playCrash();
        createExplosion(headX, state.current.snakeY);
        triggerGameOver();
        return;
      }
    }

    // --- RENDER ---
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    stars.current.forEach(star => {
      if (status === GameStatus.PLAYING) {
        star.x -= star.speed;
        if (star.x < 0) star.x = width;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    state.current.obstacles.forEach(obs => {
      ctx.fillStyle = COLORS.obstacle;
      ctx.fillRect(obs.x, 0, obs.width, obs.gapTop);
      const bottomY = obs.gapTop + obs.gapHeight;
      ctx.fillRect(obs.x, bottomY, obs.width, height - bottomY);

      // Detail lines
      ctx.strokeStyle = COLORS.obstacleBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, 0, obs.width, obs.gapTop);
      ctx.strokeRect(obs.x, bottomY, obs.width, height - bottomY);
    });

    // Trail Render
    if (state.current.trail.length > 1) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = config.gameMode === GameMode.DAILY ? COLORS.accent : COLORS.snake; // Different color for Daily
      
      ctx.beginPath();
      ctx.moveTo(state.current.trail[0].x, state.current.trail[0].y);
      for (let i = 1; i < state.current.trail.length - 2; i++) {
        const xc = (state.current.trail[i].x + state.current.trail[i+1].x) / 2;
        const yc = (state.current.trail[i].y + state.current.trail[i+1].y) / 2;
        ctx.quadraticCurveTo(state.current.trail[i].x, state.current.trail[i].y, xc, yc);
      }
      if (state.current.trail.length > 2) {
         const last = state.current.trail[state.current.trail.length - 1];
         const secondLast = state.current.trail[state.current.trail.length - 2];
         ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
      }

      ctx.strokeStyle = config.gameMode === GameMode.DAILY ? COLORS.accent : COLORS.snake;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Particles
    state.current.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life > 0) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      } else {
        state.current.particles.splice(index, 1);
      }
    });

    requestRef.current = requestAnimationFrame(update);
  }, [status, config, onScoreUpdate, triggerGameOver, spawnObstacle, resetGame]);

  useEffect(() => {
    // Only reset if we are intentionally starting a new game (PLAYING)
    // or going back to MENU. If status is GAME_OVER, we want to freeze the state.
    if (status === GameStatus.PLAYING || status === GameStatus.MENU) {
      resetGame();
    }
    
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update, resetGame, status]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block cursor-pointer touch-none"
      onMouseDown={startInput}
      onMouseUp={endInput}
      onMouseLeave={endInput}
      onTouchStart={(e) => {
        startInput();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        endInput();
      }}
    />
  );
};
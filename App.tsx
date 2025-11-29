import React, { useState, useCallback, useMemo } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Overlay } from './components/Overlay';
import { GameStatus, GameConfig, GameMode } from './types';
import { PHYSICS } from './constants';
import { saveScore } from './services/storageService';
import { audioService } from './services/audioService';

const generateDailySeed = () => {
    const today = new Date();
    // Creates a number like 20231027
    return parseInt(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CLASSIC);
  const [seed, setSeed] = useState<number>(Date.now());

  // Use useMemo to prevent creating a new object on every render
  // This fixes the bug where the game would reset on every score update
  const config = useMemo<GameConfig>(() => {
      let limit = 0;
      if (gameMode === GameMode.TIME_ATTACK) limit = 60; // 60 seconds

      return {
        gravity: PHYSICS.GRAVITY,
        jumpStrength: PHYSICS.JUMP_STRENGTH,
        baseSpeed: PHYSICS.BASE_SPEED,
        gapSize: PHYSICS.OBSTACLE_GAP,
        obstacleFrequency: PHYSICS.OBSTACLE_SPAWN_DISTANCE,
        isSoundEnabled: soundEnabled,
        gameMode: gameMode,
        seed: seed,
        timeLimit: limit
      };
  }, [gameMode, seed, soundEnabled]);

  const handleStart = useCallback(() => {
    // Determine seed based on mode
    let newSeed = Date.now();
    if (gameMode === GameMode.DAILY) {
        newSeed = generateDailySeed();
    }
    setSeed(newSeed);
    
    setScore(0);
    setStatus(GameStatus.PLAYING);
    audioService.setEnabled(soundEnabled);
    if (soundEnabled) audioService.playJump(); // Warmup
  }, [gameMode, soundEnabled]);

  const handleGameOver = useCallback((finalScore: number) => {
    // CRITICAL FIX: Force update score state to match final canvas state
    setScore(finalScore);
    setStatus(GameStatus.GAME_OVER);
    saveScore('Player', finalScore, gameMode);
  }, [gameMode]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
      setTimeLeft(time);
  }, []);

  const handleMenu = useCallback(() => {
    setStatus(GameStatus.MENU);
    setScore(0);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
        const next = !prev;
        audioService.setEnabled(next);
        return next;
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none">
      <GameCanvas 
        status={status} 
        config={config}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
        onTimeUpdate={handleTimeUpdate}
      />
      <Overlay 
        status={status}
        currentScore={score}
        gameMode={gameMode}
        timeLeft={timeLeft}
        onStart={handleStart}
        onRestart={handleStart}
        onModeSelect={setGameMode}
        onMenu={handleMenu}
        toggleSound={toggleSound}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

export default App;
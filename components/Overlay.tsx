import React, { useState } from 'react';
import { GameStatus, GameMode } from '../types';
import { Button } from './Button';
import { Play, RotateCcw, Share2, Trophy, Music, Volume2, X, Clock, Calendar, Zap, Ghost, Home } from 'lucide-react';
import { getBestScore, getLeaderboard } from '../services/storageService';

interface OverlayProps {
  status: GameStatus;
  currentScore: number;
  gameMode: GameMode;
  timeLeft: number;
  onStart: () => void;
  onRestart: () => void;
  onModeSelect: (mode: GameMode) => void;
  onMenu: () => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md z-20 animate-fade-in">
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full mx-4 text-center relative">
      {children}
    </div>
  </div>
);

export const Overlay: React.FC<OverlayProps> = ({
  status,
  currentScore,
  gameMode,
  timeLeft,
  onStart,
  onRestart,
  onModeSelect,
  onMenu,
  toggleSound,
  soundEnabled
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const bestScore = getBestScore();
  const leaderboard = getLeaderboard();

  const handleShare = async () => {
    const text = `I scored ${currentScore} in Neon Serpent (${gameMode})! Can you beat me? ${window.location.href}`;
    
    // 1. Try Mobile Native Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neon Serpent',
          text: text,
        });
        return;
      } catch (err) {
        console.log('Native share failed or dismissed', err);
      }
    }

    // 2. Try Clipboard API
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
        return;
      }
    } catch (err) {
       console.log('Clipboard API failed', err);
    }

    // 3. Fallback to simple Prompt
    prompt('Copy your result:', text);
  };

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start z-10">
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {currentScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">SCORE</span>
          </div>
          
          {gameMode === GameMode.TIME_ATTACK && (
             <div className="mt-2 flex items-center gap-2 text-pink-400">
               <Clock size={16} />
               <span className="text-2xl font-bold font-mono">{timeLeft}s</span>
             </div>
          )}
          
          {gameMode === GameMode.DAILY && (
             <div className="mt-1 flex items-center gap-2 text-cyan-400 text-xs tracking-widest border border-cyan-400/30 px-2 py-1 rounded bg-cyan-950/50">
               <Calendar size={12} />
               DAILY CHALLENGE
             </div>
          )}
        </div>

        <button 
          onClick={toggleSound}
          className="pointer-events-auto p-2 bg-slate-800/50 rounded-full text-white backdrop-blur-sm hover:bg-slate-700 transition-colors"
        >
           {soundEnabled ? <Volume2 size={20} /> : <Music size={20} className="opacity-50" />}
        </button>
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <Modal>
        <button 
          onClick={() => setShowLeaderboard(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center justify-center gap-2">
          <Trophy /> Leaderboard
        </h2>
        <div className="max-h-60 overflow-y-auto mb-6 text-left space-y-2 pr-2">
          {leaderboard.length === 0 ? (
            <p className="text-slate-500 text-center">No scores yet. Be the first!</p>
          ) : (
            leaderboard.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                    <span className={`font-mono w-6 text-center font-bold ${idx < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>#{idx + 1}</span>
                    <span className="text-white truncate max-w-[120px]">{entry.name}</span>
                </div>
                <span className="text-cyan-400 font-bold font-mono">{entry.score}</span>
              </div>
            ))
          )}
        </div>
        <Button variant="secondary" className="w-full" onClick={() => setShowLeaderboard(false)}>
          Back
        </Button>
      </Modal>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <Modal>
        <h2 className="text-3xl font-black text-white mb-2 tracking-wider">GAME OVER</h2>
        <div className="mb-2 text-slate-400 text-sm tracking-widest uppercase">
            {gameMode.replace('_', ' ')} MODE
        </div>
        <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <div className="text-6xl font-bold text-cyan-400 mb-2 drop-shadow-glow">{currentScore}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest flex justify-center gap-4">
              <span>Best: <span className="text-white">{Math.max(currentScore, bestScore)}</span></span>
            </div>
        </div>
        
        <div className="space-y-3">
          <Button onClick={onRestart} className="w-full animate-pulse" icon={<RotateCcw size={20} />}>
            TRY AGAIN
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleShare} className="flex-1" icon={<Share2 size={18} />}>
              Share
            </Button>
            <Button variant="secondary" onClick={() => setShowLeaderboard(true)} className="flex-1" icon={<Trophy size={18} />}>
              Ranks
            </Button>
          </div>
          <Button variant="secondary" onClick={onMenu} className="w-full mt-2" icon={<Home size={18} />}>
             Main Menu
          </Button>
        </div>
      </Modal>
    );
  }

  // MENU STATUS
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/50 to-slate-900 pointer-events-none" />
      
      <div className="z-10 text-center animate-bounce-slow mb-8">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-2 drop-shadow-2xl filter tracking-tighter">
          NEON<br/>SERPENT
        </h1>
        <p className="text-slate-400 tracking-[0.3em] text-xs md:text-sm">
          SURVIVE THE VOID
        </p>
      </div>

      <div className="z-10 w-full max-w-sm space-y-6">
        
        {/* Game Mode Selector */}
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => onModeSelect(GameMode.CLASSIC)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${gameMode === GameMode.CLASSIC ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'}`}
            >
                <Zap size={24} />
                <span className="font-bold text-sm">CLASSIC</span>
            </button>
            <button 
                onClick={() => onModeSelect(GameMode.TIME_ATTACK)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${gameMode === GameMode.TIME_ATTACK ? 'bg-pink-500/20 border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'}`}
            >
                <Clock size={24} />
                <span className="font-bold text-sm">TIME ATTACK</span>
            </button>
            <button 
                onClick={() => onModeSelect(GameMode.DAILY)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${gameMode === GameMode.DAILY ? 'bg-purple-500/20 border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'}`}
            >
                <Calendar size={24} />
                <span className="font-bold text-sm">DAILY RUN</span>
            </button>
            <button 
                onClick={() => onModeSelect(GameMode.PVP)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${gameMode === GameMode.PVP ? 'bg-green-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'}`}
            >
                <Ghost size={24} />
                <span className="font-bold text-sm">PVP GHOST</span>
            </button>
        </div>

        <Button onClick={onStart} className="w-full text-lg shadow-lg" icon={<Play size={24} />}>
          PLAY {gameMode.replace('_', ' ')}
        </Button>
        
        <div className="flex gap-3">
             <Button variant="secondary" onClick={() => setShowLeaderboard(true)} className="flex-1" icon={<Trophy size={18} />}>
                 Ranks
             </Button>
             <Button variant="secondary" onClick={toggleSound} className="w-14 flex items-center justify-center">
                 {soundEnabled ? <Volume2 size={20} /> : <Music size={20} className="opacity-50" />}
             </Button>
        </div>

      </div>
      
      <div className="absolute bottom-6 text-slate-600 text-xs text-center z-10 font-mono">
        HOLD TO FLY UP &bull; RELEASE TO DIVE
      </div>
    </div>
  );
};
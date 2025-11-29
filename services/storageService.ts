import { ScoreEntry, GameMode } from '../types';

const STORAGE_KEY = 'neon_serpent_leaderboard';
const BEST_SCORE_KEY = 'neon_serpent_best_score';

export const saveScore = (name: string, score: number, mode: GameMode) => {
  const currentScores = getLeaderboard();
  const newEntry: ScoreEntry = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    score,
    date: Date.now(),
    mode
  };
  
  const updatedScores = [...currentScores, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Keep top 50

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
  
  // Update best score logic
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem(BEST_SCORE_KEY, score.toString());
  }
};

export const getLeaderboard = (): ScoreEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getBestScore = (): number => {
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};
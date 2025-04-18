import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { Level } from '../types';

interface PointsContextType {
  totalPoints: number;
  levels: Level[];
  loading: boolean;
  error: string | null;
  isLevelUnlocked: (level: Level) => boolean;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch levels data first
        const levelsResponse = await api.levels.getAll(token);
        if (levelsResponse.success && levelsResponse.data) {
          setLevels(levelsResponse.data);
          
          // Calculate points from completed levels
          let completedLevelsPoints = 0;
          levelsResponse.data.forEach(level => {
            if (level.isCompleted && level.points) {
              completedLevelsPoints += level.points;
            }
          });
          
          // Now fetch user data to get base points
          const userResponse = await api.auth.validateToken(token);
          if (userResponse.success && userResponse.data) {
            // Get base points from user profile
            const basePoints = userResponse.data.user?.points || 0;
            
            // Set total points as base points + completed levels points
            console.log('Base points:', basePoints);
            console.log('Completed levels points:', completedLevelsPoints);
            console.log('Total points:', basePoints + completedLevelsPoints);
            
            setTotalPoints(basePoints + completedLevelsPoints);
          } else {
            // If user fetch fails, just use completed levels points
            setTotalPoints(completedLevelsPoints);
          }
        } else {
          // If levels fetch fails, try to get just user points
          const userResponse = await api.auth.validateToken(token);
          if (userResponse.success && userResponse.data) {
            setTotalPoints(userResponse.data.user?.points || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Helper function to check if a level is unlocked based on user's total points
  const isLevelUnlocked = (level: Level): boolean => {
    return totalPoints >= level.requiredPoints;
  };

  const value = {
    totalPoints,
    levels,
    loading,
    error,
    isLevelUnlocked
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}; 
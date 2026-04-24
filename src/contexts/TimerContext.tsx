import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  setTime: (seconds: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider = ({ children }: TimerProviderProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      alert('Time up!');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const setTime = (seconds: number) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const value: TimerContextType = {
    timeLeft,
    isRunning,
    setTime,
    start,
    pause,
    reset,
    isActive,
    setIsActive,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
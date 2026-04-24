import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimer } from '../contexts/TimerContext';
import { X, Plus } from 'lucide-react';

function FloatingTimer() {
  const { timeLeft, isRunning, start, pause, reset, isActive, setIsActive } = useTimer();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  // Only show floating timer if we came from home page and timer is active
  if (!isActive || location.pathname === '/timer' || location.pathname === '/home' || previousPathRef.current !== '/home') {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsActive(false);
  };

  const handleNewTimer = () => {
    navigate('/timer');
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="rounded-2xl border border-white/12 bg-white/4 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">Timer Active:</div>
          <div className="text-2xl font-bold text-slate-50">{formatTime(timeLeft)}</div>
          <div className="flex gap-2">
            <button
              onClick={start}
              disabled={isRunning}
              className="rounded-[8px] bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:bg-green-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start
            </button>
            <button
              onClick={pause}
              disabled={!isRunning}
              className="rounded-[8px] bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:bg-yellow-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pause
            </button>
            <button
              onClick={reset}
              className="rounded-[8px] bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-400 active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={handleNewTimer}
              className="rounded-[8px] bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-400 active:scale-95 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
            <button
              onClick={handleClose}
              className="rounded-[8px] bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-gray-600/30 transition-all duration-200 hover:bg-gray-500 active:scale-95 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingTimer;
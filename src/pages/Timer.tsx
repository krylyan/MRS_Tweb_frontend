import { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';

function Timer() {
  const { timeLeft, isRunning, setTime, start, pause, reset } = useTimer();
  const [customTime, setCustomTime] = useState<string>('');
  const [unit, setUnit] = useState<string>('minutes');
  const [timerReady, setTimerReady] = useState<boolean>(false);

  useEffect(() => {
    // Check if timer is ready to start
    const hasCustomTime = customTime.trim() !== '' && !isNaN(parseInt(customTime)) && parseInt(customTime) > 0;
    const hasTimeLeft = timeLeft > 0;
    setTimerReady(hasCustomTime || hasTimeLeft);
  }, [customTime, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetTime = (minutes: number) => {
    setTime(minutes * 60);
  };

  const handleStart = () => {
    // If there's custom time in input, set it first
    if (customTime.trim() !== '') {
      const num = parseInt(customTime);
      if (!isNaN(num) && num > 0) {
        const seconds = unit === 'minutes' ? num * 60 : num;
        setTime(seconds);
      }
    }
    start();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/12 bg-white/4 p-8 shadow-[0_18px_36px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
        {/* Timer Display */}
        <div className="mb-8 text-center">
          <div className="text-6xl font-bold text-slate-50">{formatTime(timeLeft)}</div>
        </div>

        {/* Preset Buttons */}
        <div className="mb-6 flex justify-center gap-3">
          <button
            onClick={() => handleSetTime(1)}
            className="rounded-[10px] bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:bg-emerald-400 active:scale-95"
          >
            1 min
          </button>
          <button
            onClick={() => handleSetTime(5)}
            className="rounded-[10px] bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-400 active:scale-95"
          >
            5 min
          </button>
          <button
            onClick={() => handleSetTime(10)}
            className="rounded-[10px] bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:bg-purple-400 active:scale-95"
          >
            10 min
          </button>
        </div>

        {/* Custom Time Input */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            placeholder="Enter time"
            className="rounded-[10px] border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-slate-50 placeholder-slate-400 focus:border-emerald-400/60 focus:outline-none"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-[10px] border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-slate-50 focus:border-emerald-400/60 focus:outline-none"
          >
            <option value="minutes">minutes</option>
            <option value="seconds">seconds</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleStart}
            disabled={!timerReady || isRunning}
            className="rounded-[10px] bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:bg-green-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start
          </button>
          <button
            onClick={pause}
            disabled={!isRunning}
            className="rounded-[10px] bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:bg-yellow-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pause
          </button>
          <button
            onClick={reset}
            className="rounded-[10px] bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-400 active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default Timer;
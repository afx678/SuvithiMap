import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Database } from 'lucide-react';
import { api } from '../../services/api';
import { SimulationState } from '../../types';

interface TopBarProps {
  onSimStateChange?: (state: SimulationState) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSimStateChange }) => {
  const [time, setTime] = useState<string>('');
  const [simState, setSimState] = useState<SimulationState>({
    is_running: false,
    scenario: 'normal',
    speed_multiplier: 1.0,
    tick_count: 0,
    active_buses: 10,
    open_incidents: 4
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSimState = async () => {
    try {
      const s = await api.getSimulationState();
      setSimState(s);
      if (onSimStateChange) onSimStateChange(s);
    } catch (e) {
      // Backend not running yet
    }
  };

  useEffect(() => {
    fetchSimState();
    const interval = setInterval(fetchSimState, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSim = async () => {
    try {
      if (simState.is_running) {
        await api.pauseSimulation();
      } else {
        await api.startSimulation();
      }
      await fetchSimState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      await fetchSimState();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 bg-[#191917] border-b border-[#34332F] px-6 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Quick Simulation Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#11110F] border border-[#34332F] rounded px-1 py-1">
          <button
            onClick={handleToggleSim}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
              simState.is_running
                ? 'bg-[#D99A3D] text-[#11110F] shadow-sm'
                : 'bg-[#22221F] text-[#F2EFE8] hover:bg-[#34332F]'
            }`}
          >
            {simState.is_running ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE SIM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START SIM</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset Simulation"
            className="p-1.5 text-[#96938B] hover:text-[#F2EFE8] transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Scenario Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#22221F] border border-[#34332F] text-xs font-mono text-[#96938B]">
          <Activity className="w-3.5 h-3.5 text-[#F1C46A]" />
          <span>SCENARIO:</span>
          <span className="text-[#F1C46A] uppercase font-bold">{simState.scenario.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Right: Live Clock, Database Status, Telemetry Pill */}
      <div className="flex items-center gap-4">
        {/* Supabase / Local DB Connection status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#22221F] border border-[#34332F] text-xs font-mono text-[#96938B]">
          <Database className="w-3.5 h-3.5 text-[#6F9B87]" />
          <span className="hidden md:inline">STORAGE:</span>
          <span className="text-[#6F9B87] font-medium">ONLINE (SUPABASE/SYNC)</span>
        </div>

        {/* Real-time UTC/Local Clock */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#11110F] border border-[#34332F] text-xs font-mono text-[#F1C46A]">
          <span className="w-2 h-2 rounded-full bg-[#D99A3D] animate-ping" />
          <span>{time || '00:00:00'}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[#96938B] border-l border-[#34332F] pl-4">
          <ShieldCheck className="w-4 h-4 text-[#D99A3D]" />
          <span>CMD CENTER v1.0</span>
        </div>
      </div>
    </header>
  );
};

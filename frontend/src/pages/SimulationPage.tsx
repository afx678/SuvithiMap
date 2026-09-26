import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SimulationState, Bus } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  Sliders,
  CloudRain,
  Car,
  AlertTriangle,
  Bus as BusIcon,
  CheckCircle,
  Clock
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    is_running: false,
    scenario: 'normal',
    speed_multiplier: 1.0,
    tick_count: 0,
    active_buses: 10,
    open_incidents: 4
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [lastEvent, setLastEvent] = useState<string>('Simulation standby');

  const fetchStatus = async () => {
    try {
      const [s, b] = await Promise.all([
        api.getSimulationState(),
        api.getBuses()
      ]);
      setState(s);
      setBuses(b);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    try {
      if (state.is_running) {
        await api.pauseSimulation();
        setLastEvent('Simulation paused by operator');
      } else {
        await api.startSimulation();
        setLastEvent('Simulation engine active — 10 buses progressing on corridors');
      }
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      setLastEvent('Simulation state reset to origin waypoints');
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStep = async () => {
    try {
      const res = await api.stepSimulation();
      setLastEvent(`Manual step tick #${res.state.tick_count}: ${res.step_result?.new_detections_count || 0} detections generated`);
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleScenario = async (scenario: string) => {
    try {
      await api.setScenario(scenario);
      setLastEvent(`Applied scenario profile: ${scenario.toUpperCase()}`);
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeed = async (speed: number) => {
    try {
      await api.setSpeed(speed);
      setLastEvent(`Simulation speed throttled to ${speed}x`);
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const scenarios = [
    {
      id: 'normal',
      title: 'Normal Transit Patrol',
      description: 'Standard daily bus route sweeps with baseline traffic and scattered minor surface defects.',
      icon: Activity,
      color: '#6F9B87'
    },
    {
      id: 'monsoon',
      title: 'Monsoon Deluge & Waterlogging',
      description: 'Heavy precipitation triggering flash ponding at underpasses and subway slip roads.',
      icon: CloudRain,
      color: '#F1C46A'
    },
    {
      id: 'rush_hour',
      title: 'Peak Hour Gridlock',
      description: 'Massive vehicle density on Ring Road and Janpath. Bus cruising speed throttled to 12 km/h.',
      icon: Car,
      color: '#D99A3D'
    },
    {
      id: 'hazard_surge',
      title: 'Pothole & Subgrade Surge',
      description: 'Rapid emergence of severe craters and alligator cracks across active transit lanes.',
      icon: AlertTriangle,
      color: '#D96B55'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">SIMULATION CONTROL SANDBOX</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${state.is_running ? 'bg-[#6F9B87]/20 text-[#6F9B87] border border-[#6F9B87]/30' : 'bg-[#D96B55]/20 text-[#D96B55] border border-[#D96B55]/30'}`}>
              {state.is_running ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Autonomous Multi-Bus Geographic Progression & Urban Incident Synthesis Engine
          </p>
        </div>

        {/* Live Event Ticker */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F1C46A]">
          <Clock className="w-3.5 h-3.5 text-[#D99A3D]" />
          <span>TICK #{state.tick_count}: {lastEvent}</span>
        </div>
      </div>

      {/* Primary Simulation Controls Strip */}
      <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono font-bold transition-all shadow-md ${
                state.is_running
                  ? 'bg-[#D99A3D] text-[#11110F] hover:bg-[#F1C46A]'
                  : 'bg-[#6F9B87] text-[#11110F] hover:bg-[#6F9B87]/90'
              }`}
            >
              {state.is_running ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>PAUSE SIMULATION</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START SIMULATION</span>
                </>
              )}
            </button>

            <button
              onClick={handleStep}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#22221F] hover:bg-[#34332F] border border-[#34332F] text-xs font-mono text-[#F2EFE8] rounded transition-colors"
            >
              <FastForward className="w-4 h-4 text-[#F1C46A]" />
              <span>STEP 1 TICK</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#22221F] hover:bg-[#34332F] border border-[#34332F] text-xs font-mono text-[#96938B] hover:text-[#D96B55] rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET</span>
            </button>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#96938B]">ENGINE SPEED:</span>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeed(s)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  state.speed_multiplier === s
                    ? 'bg-[#D99A3D] text-[#11110F]'
                    : 'bg-[#22221F] text-[#96938B] hover:text-[#F2EFE8] border border-[#34332F]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#96938B] mb-3">
          Select Simulation Scenario Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => {
            const isSelected = state.scenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleScenario(sc.id)}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#22221F] border-[#D99A3D] shadow-lg'
                    : 'bg-[#191917] border-[#34332F] hover:border-[#96938B]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: `${sc.color}20`, color: sc.color }}
                  >
                    <sc.icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold text-[#F1C46A] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold font-mono text-[#F2EFE8] mt-3">{sc.title}</h3>
                <p className="text-[11px] text-[#96938B] mt-1 leading-relaxed">
                  {sc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Bus Fleet Waypoint Progress */}
      <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#96938B] flex items-center gap-2">
          <BusIcon className="w-4 h-4 text-[#D99A3D]" />
          Real-Time Bus Sensing Unit Progression (10 Units)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {buses.map((bus) => (
            <div key={bus.id} className="p-3 bg-[#11110F] border border-[#34332F] rounded text-xs font-mono space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#F1C46A]">{bus.id}</span>
                <span className={bus.speed < 15 ? 'text-[#D96B55]' : 'text-[#6F9B87]'}>
                  {bus.speed} km/h
                </span>
              </div>
              <div className="text-[10px] text-[#96938B] truncate">{bus.route}</div>
              <div className="text-[10px] text-[#96938B]">
                {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { LiveBus } from './pages/LiveBus';
import { MapPage } from './pages/MapPage';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { RoadCondition } from './pages/RoadCondition';
import { Traffic } from './pages/Traffic';
import { Analytics } from './pages/Analytics';
import { Evidence } from './pages/Evidence';
import { SimulationPage } from './pages/SimulationPage';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#11110F] text-[#F2EFE8]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#11110F]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/live" element={<LiveBus />} />
            <Route path="/live-bus" element={<LiveBus />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/road-condition" element={<RoadCondition />} />
            <Route path="/traffic" element={<Traffic />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

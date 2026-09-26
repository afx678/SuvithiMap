# SuVithiMap (सुवीथि-मानचित्र)
### *“Mapping Every Journey. Understanding Every Street.”*

**Smart India Hackathon 2026 (SIH26124)**  
**Category**: Smart Vehicles & Urban Infrastructure  
**Problem Statement**: AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet

---

## 🚌 Overview

**SuVithiMap** transforms existing public municipal bus fleets into real-time **Mobile Urban Sensing Units**. As buses traverse city streets, forward-facing cameras and GNSS receivers continuously audit and map road conditions, traffic density, and safety hazards.

### Detected Conditions & Events:
* **Potholes**: Location, depth estimation, multi-pass confidence scoring.
* **Road Damage**: Longitudinal cracks, transverse cracks, and structural alligator cracking (ASTM D6433 standard).
* **Traffic Signs**: Recognition of regulatory/warning signs & comparative GIS baseline auditing to identify **missing infrastructure**.
* **Vehicles & Pedestrians**: Real-time object tracking (YOLO + ByteTrack) to compute traffic density and velocity.
* **Waterlogging**: Surface ponding depth estimation with transparently labeled simulation fallbacks.
* **Municipal Incidents**: Spatial-temporal clustering merges repeated sightings into actionable, geo-tagged work orders.

---

## 🎨 Stitch Design Specification Compliance

The entire user interface is built to the strict Stitch municipal command specification:
- **Obsidian Dark (Base Background)**: `#11110F`
- **Surface Dark (Cards & Panels)**: `#191917`
- **Secondary Surface (Borders & Inputs)**: `#22221F`
- **Amber Gold (Primary Accent & Brand)**: `#D99A3D`
- **Light Gold (Active Badges & Alerts)**: `#F1C46A`
- **Terracotta (Critical Road Hazards)**: `#D96B55`
- **Sage Green (Resolved & Normal Status)**: `#6F9B87`
- **High-Contrast Cream (Primary Text)**: `#F2EFE8`
- **Sandstone (Muted Secondary Text)**: `#96938B`
- **Divider Gray (Dividers & Outlines)**: `#34332F`
- **Strictly NO Blue primary buttons or generic AI styling.**

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet GIS (Carto Dark matter basemap), Recharts, Lucide Icons, Framer Motion.
- **Backend**: Python 3.11, FastAPI, Uvicorn, WebSockets.
- **Database**: Supabase PostgreSQL (PostGIS & RLS enabled) + zero-latency local in-memory/SQLite persistence fallback.
- **AI Engine**: Modular Python inference services with standardized `DetectionResult` models and transparent DEMO fallback watermarking (`is_simulated = true`).
- **Open Data & Mapping**: OpenStreetMap, CartoDB Dark, Leaflet (no paid map APIs).

---

## 📂 Project Structure

```
SuVithiMap/
├── frontend/                     # React + TypeScript + Tailwind + Leaflet frontend
│   ├── src/
│   │   ├── components/common/    # Sidebar, TopBar, MetricCard, StatusBadge, AlertToast
│   │   ├── components/map/       # MapView, BusMarker, IncidentMarker, IncidentPanel
│   │   ├── components/live/      # LiveFeed (Dashcam HUD), DetectionCard
│   │   ├── pages/                # All 12 requested routes
│   │   ├── services/             # API client & WebSocket adapters
│   │   └── types/                # Standardized TypeScript schemas
├── backend/                      # FastAPI Command Center Backend
│   ├── routes/                   # Fleet, Incidents, Detections, Analytics, Simulation
│   ├── database.py               # Supabase client + local in-memory persistence fallback
│   ├── simulation.py             # 10-Bus Delhi corridor simulation engine
│   ├── config.py                 # Configuration & environment loader
│   └── main.py                   # FastAPI entrypoint, WebSockets, background simulation
├── ai/                           # Modular Computer Vision Pipeline
│   ├── common/                   # BaseDetector contract, DetectionResult, spatial clustering
│   ├── pothole/                  # Pothole detector + depth estimator + demo fallback
│   ├── road_damage/              # Cracks (longitudinal, transverse, alligator)
│   ├── vehicle/                  # Vehicle detection & ByteTrack density counter
│   ├── traffic_sign/             # Traffic sign detection & comparative missing sign audit
│   ├── waterlogging/             # Waterlogging detector (transparent DEMO mode)
│   └── pipeline.py               # Unified multi-modal orchestrator
├── database/
│   ├── schema.sql                # Supabase PostgreSQL DDL, PostGIS & RLS policies
│   └── seed.sql                  # 10 buses, Delhi routes, initial clustered incidents
├── demo/
│   └── images/                   # Sample evidence captures with SIMULATED EVIDENCE watermarks
├── docs/
│   ├── architecture.md           # System design & edge processing math
│   └── licenses.md               # Open-source license attribution
├── start.bat                     # One-click Windows runner
├── requirements.txt              # Backend dependencies
└── README.md
```

---

## 🚀 Running the Prototype

### 1. Launch with One Click
Double-click `start.bat` or run:
```bash
start.bat
```

### 2. Manual Startup
**Backend**:
```bash
.venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at `http://localhost:8000/docs`.

**Frontend**:
```bash
cd frontend
..\.tools\node\npm.cmd run dev
```
Dashboard available at `http://localhost:5173`.

---

## 🧭 Live Demo Flow

1. **Open Command Center** (`/dashboard`): View 5 key municipal KPIs, the live GIS Leaflet map with 10 buses moving on Delhi corridors, and the live incident feed.
2. **Start Simulation**: Click **START SIM** on the top bar or navigate to `/simulation` to select scenarios (*Monsoon Deluge*, *Peak Hour Gridlock*, *Hazard Surge*) and speed up to 5x.
3. **Inspect Live Sensing Feed** (`/live-bus`): Select any bus unit (e.g. `DL-101`) to view the dashcam HUD with telemetry overlays (GPS, speed, heading) and dynamic AI bounding boxes.
4. **Trigger Hazard**: Click `+ Pothole` or switch to the *Hazard Surge* scenario to generate a high-severity detection.
5. **High-Severity Alert**: An animated terracotta alert toast appears with coordinates and severity rating.
6. **GIS Map Focus** (`/map`): Click any hazard marker to open the incident panel with clustered evidence and fleet pass counts.
7. **Inspect Evidence** (`/evidence` or `/incidents/:id`): Notice the forensic `SIMULATED EVIDENCE` stamp and telemetry metadata.
8. **Resolve Incident**: Enter repair notes and click **RESOLVE INCIDENT**. The status updates to `Resolved` and the badge turns Sage Green (`#6F9B87`).
9. **Urban Analytics** (`/road-condition`, `/traffic`, `/analytics`): View real-time Pavement Condition Index (PCI), corridor speed bottlenecks, and hourly defect trends.

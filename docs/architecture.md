# SuVithiMap: Technical Architecture & System Design

**Project**: SuVithiMap — Smart Urban Vision & Intelligence Through Mobility  
**SIH Problem Statement**: SIH26124 (AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet)  
**Tagline**: *“Mapping Every Journey. Understanding Every Street.”*

---

## 1. Executive Summary

Municipal transport fleets traverse every arterial road and suburban street daily. Traditional manual road inspection methods (pavement profiling vans, citizen complaint hotlines) are costly, infrequent, and reactive.

**SuVithiMap** transforms municipal public buses into autonomous, continuous **Mobile Urban Sensing Units**. Forward-facing cameras coupled with GPS receivers analyze the urban corridor in real time to detect:
- Potholes and road craters
- Pavement cracks (longitudinal, transverse, and structural alligator cracking)
- Waterlogging and flash puddle depth
- Traffic density, congestion bottlenecks, and moving fleet velocity
- Regulatory traffic signage presence and comparative missing sign audits

---

## 2. High-Level Data Flow

```
+-------------------------------------------------------------------+
|               Public Bus Fleet (10+ Mobile Sensing Units)          |
|  - Dashcam 1080p Stream                                           |
|  - GPS / GNSS Receiver (1 Hz telemetry)                           |
|  - CAN / Speedometer Bus Telemetry                                |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Modular AI Vision Pipeline (ai/)                     |
|  - BaseDetector Contract (Standardized DetectionResult)           |
|  - PotholeDetector (Depth estimation + Demo fallback)             |
|  - RoadDamageDetector (ASTM D6433 Pavement Distress Classifier)   |
|  - VehicleTracker (YOLO + ByteTrack + Traffic Density)            |
|  - TrafficSignDetector & Missing Infrastructure Auditor           |
|  - WaterloggingDetector (Submerged lane estimation)               |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Spatial-Temporal Clustering Engine                   |
|  - Haversine Proximity Clustering (30m radius)                    |
|  - Multi-Pass Fleeting Confidence Aggregator                      |
|  - Automatic Incident Promotion & Severity Aggravation            |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Hybrid Storage Layer                                |
|  - Primary: Supabase PostgreSQL (PostGIS & RLS Enabled)           |
|  - Fallback: Local In-Memory Persistence Engine (Zero Downtime)   |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               FastAPI Command Center (backend/)                   |
|  - REST Endpoints (/api/fleet, /api/incidents, /api/analytics)    |
|  - WebSocket Streaming (/ws/telemetry)                            |
|  - Background Multi-Bus Simulation Engine                         |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Stitch UI Command Center (frontend/)                |
|  - Obsidian & Amber Gold Design Specification                     |
|  - Leaflet GIS Live Spatial Mapping                               |
|  - Real-Time Camera HUD & Telemetry Overlay                       |
|  - Incident Lifecycle & One-Click Municipal Resolution            |
|  - Pavement Condition Index (PCI) & Urban Analytics               |
+-------------------------------------------------------------------+
```

---

## 3. Stitch Design Specification Compliance

The frontend follows strict municipal command aesthetics:
- **Base Background**: `#11110F` (Obsidian)
- **Cards & Surfaces**: `#191917`
- **Elevated Surfaces**: `#22221F`
- **Primary Accent / Brand**: `#D99A3D` (Amber Gold)
- **Active Elements**: `#F1C46A` (Light Gold)
- **Critical Alerts**: `#D96B55` (Terracotta)
- **Healthy / Resolved**: `#6F9B87` (Sage Green)
- **Primary Text**: `#F2EFE8` (High-contrast Cream)
- **Secondary Labels**: `#96938B` (Sandstone)
- **Dividers & Borders**: `#34332F`

Strictly avoids generic AI visuals, neon cyan/blue buttons, and excessive padding.

---

## 4. AI Detector Modularity & Transparent Reporting

All detectors inherit from `BaseDetector` and return standard `DetectionResult` models. If deep learning model weights are missing or hardware is non-GPU:
1. Detectors switch to a transparent DEMO fallback.
2. Every output is stamped with `is_simulated = true`.
3. The UI prominently badges the output as `SIMULATED EVIDENCE (DEMO INFERENCE)`.
4. Never falsely pretends synthetic results are real model inferences.

---

## 5. Missing Infrastructure Logic

Detecting a traffic sign is not sufficient to prove that a sign is missing. SuVithiMap introduces an **Infrastructure Baseline Inventory** in GIS coordinates:
- If a bus passes within 40m of an expected sign waypoint (e.g. `SIGN-DEL-01`, expected `stop` sign) and the optical detector sighted no matching sign across successive sweeps, the system flags a **Missing Sign Alert**.

---

## 6. Incident Resolution Workflow

1. Incident detected and validated across multi-pass fleet sweeps.
2. Authority dispatched with exact GPS coordinates and photographic evidence.
3. Municipal engineer enters work order notes and clicks **"Resolve Incident"**.
4. Status transitions to `resolved`, badge turns Sage Green (`#6F9B87`), and the citywide Pavement Condition Index (PCI) updates dynamically.

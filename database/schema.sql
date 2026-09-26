-- ==========================================================
-- SuVithiMap: AI-Powered Mobile Urban Intelligence Platform
-- Smart India Hackathon 2026 (SIH26124)
-- Database Schema: Supabase PostgreSQL (PostGIS enabled)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. PUBLIC TRANSPORT BUSES (Mobile Urban Sensing Units)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buses (
    id VARCHAR(64) PRIMARY KEY,                   -- e.g. 'DL-101'
    bus_number VARCHAR(64) NOT NULL UNIQUE,       -- e.g. 'DL 1P B 4190'
    route VARCHAR(64) NOT NULL,                   -- e.g. 'Route 419 (CP to AIIMS)'
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- active, idle, maintenance, offline
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- in km/h
    heading DOUBLE PRECISION DEFAULT 0.0,         -- compass bearing in degrees
    camera_status VARCHAR(32) NOT NULL DEFAULT 'online', -- online, degraded, offline
    gps_status VARCHAR(32) NOT NULL DEFAULT 'online',    -- online, weak, offline
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 2. PUBLIC TRANSIT ROUTES
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routes (
    id VARCHAR(64) PRIMARY KEY,                   -- e.g. 'ROUTE-419'
    route_number VARCHAR(32) NOT NULL,            -- e.g. '419'
    route_name VARCHAR(128) NOT NULL,             -- e.g. 'Connaught Place - AIIMS Corridor'
    geometry JSONB NOT NULL,                      -- GeoJSON LineString / Array of [lat, lng]
    length_km DOUBLE PRECISION DEFAULT 12.5,
    status VARCHAR(32) NOT NULL DEFAULT 'normal', -- normal, congested, detour, hazard_alert
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3. RAW CAMERA AI DETECTIONS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id VARCHAR(64) NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    detection_type VARCHAR(64) NOT NULL,          -- pothole, road_damage, vehicle, traffic_sign, waterlogging
    class_name VARCHAR(64) NOT NULL,              -- pothole, alligator_crack, car, speed_limit_sign, etc.
    confidence DOUBLE PRECISION NOT NULL,         -- 0.0 to 1.0
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity VARCHAR(32) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    track_id VARCHAR(64),                         -- tracker ID (e.g. ByteTrack vehicle #14)
    bbox JSONB,                                   -- [x1, y1, x2, y2]
    evidence_url TEXT,                            -- Supabase storage or local path
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,  -- True if generated in demo/simulation
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4. PERSISTENT MUNICIPAL INCIDENTS (Spatially Clustered)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id UUID REFERENCES public.detections(id) ON DELETE SET NULL,
    incident_type VARCHAR(64) NOT NULL,          -- pothole, road_damage, waterlogging, missing_sign, high_congestion
    title VARCHAR(160) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(32) NOT NULL DEFAULT 'open',  -- open, in_progress, resolved
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),                  -- e.g. 'Ring Road near Moolchand Flyover'
    detection_count INTEGER NOT NULL DEFAULT 1,  -- Times sensed by fleet
    first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_to VARCHAR(128) DEFAULT 'Municipal Road & Works Dept',
    description TEXT,
    evidence_url TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 5. TRAFFIC MOBILITY EVENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.traffic_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id VARCHAR(64) NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    vehicle_count INTEGER NOT NULL DEFAULT 0,
    average_speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    congestion_level VARCHAR(32) NOT NULL DEFAULT 'moderate', -- low, moderate, heavy, gridlock
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 6. EXPECTED INFRASTRUCTURE (For Missing Sign Analysis)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.infrastructure_signs (
    id VARCHAR(64) PRIMARY KEY,
    sign_type VARCHAR(64) NOT NULL,              -- stop, speed_limit_50, school_zone, no_entry
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    expected_direction VARCHAR(32),
    last_verified_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'verified' -- verified, missing, obscured, damaged
);

-- ----------------------------------------------------------
-- INDEXES FOR FAST SPATIAL & TEMPORAL QUERIES
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_buses_status ON public.buses(status);
CREATE INDEX IF NOT EXISTS idx_detections_bus_id ON public.detections(bus_id);
CREATE INDEX IF NOT EXISTS idx_detections_type ON public.detections(detection_type);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON public.detections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_traffic_timestamp ON public.traffic_events(timestamp DESC);

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_signs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read buses" ON public.buses;
CREATE POLICY "Public can read buses" ON public.buses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read routes" ON public.routes;
CREATE POLICY "Public can read routes" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read detections" ON public.detections;
CREATE POLICY "Public can read detections" ON public.detections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read incidents" ON public.incidents;
CREATE POLICY "Public can read incidents" ON public.incidents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read traffic" ON public.traffic_events;
CREATE POLICY "Public can read traffic" ON public.traffic_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read signs" ON public.infrastructure_signs;
CREATE POLICY "Public can read signs" ON public.infrastructure_signs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth can modify incidents" ON public.incidents;
CREATE POLICY "Auth can modify incidents" ON public.incidents FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can modify all" ON public.detections;
CREATE POLICY "Service role can modify all" ON public.detections FOR ALL USING (auth.role() = 'service_role');

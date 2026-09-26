-- ==========================================================
-- SuVithiMap: Seed Data
-- 10 Active Public Transit Buses, Real Delhi Corridor Routes,
-- Initial Road Damage, Pothole Incidents, and Infrastructure
-- ==========================================================

-- ----------------------------------------------------------
-- 1. ROUTES (Delhi Major Transit Corridors)
-- ----------------------------------------------------------
INSERT INTO public.routes (id, route_number, route_name, length_km, status, geometry) VALUES
('ROUTE-419', '419', 'Connaught Place to AIIMS Corridor', 11.8, 'congested', 
 '[
   {"lat": 28.6315, "lng": 77.2167, "name": "Connaught Place"},
   {"lat": 28.6139, "lng": 77.2090, "name": "Janpath / Patel Chowk"},
   {"lat": 28.5983, "lng": 77.2144, "name": "Safdarjung Tomb"},
   {"lat": 28.5830, "lng": 77.2100, "name": "INA Market"},
   {"lat": 28.5672, "lng": 77.2100, "name": "AIIMS Central Hospital"}
 ]'::jsonb),

('ROUTE-502', '502', 'Mehrauli to Kashmiri Gate via Ring Road', 22.4, 'normal',
 '[
   {"lat": 28.5204, "lng": 77.1855, "name": "Mehrauli Terminal"},
   {"lat": 28.5494, "lng": 77.2001, "name": "IIT Delhi Flyover"},
   {"lat": 28.5721, "lng": 77.2382, "name": "Lajpat Nagar Ring Road"},
   {"lat": 28.6189, "lng": 77.2450, "name": "Pragati Maidan"},
   {"lat": 28.6675, "lng": 77.2285, "name": "Kashmiri Gate ISBT"}
 ]'::jsonb),

('ROUTE-717', '717', 'Aerocity to Nehru Place Express', 16.2, 'hazard_alert',
 '[
   {"lat": 28.5528, "lng": 77.1216, "name": "IGI Airport T3 / Aerocity"},
   {"lat": 28.5684, "lng": 77.1605, "name": "Dhaula Kuan Interchange"},
   {"lat": 28.5744, "lng": 77.1950, "name": "Moti Bagh"},
   {"lat": 28.5504, "lng": 77.2505, "name": "Nehru Place Bus Terminal"}
 ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 2. 10 PUBLIC SENSING BUSES
-- ----------------------------------------------------------
INSERT INTO public.buses (id, bus_number, route, status, latitude, longitude, speed, heading, camera_status, gps_status) VALUES
('DL-101', 'DL 1P B 4190', 'Route 419 (CP to AIIMS)', 'active', 28.6139, 77.2090, 32.5, 175.0, 'online', 'online'),
('DL-102', 'DL 1P B 4192', 'Route 419 (CP to AIIMS)', 'active', 28.5830, 77.2100, 24.0, 180.0, 'online', 'online'),
('DL-201', 'DL 1P C 5021', 'Route 502 (Mehrauli-ISBT)', 'active', 28.5721, 77.2382, 18.0, 25.0, 'online', 'online'),
('DL-202', 'DL 1P C 5025', 'Route 502 (Mehrauli-ISBT)', 'active', 28.6189, 77.2450, 41.2, 340.0, 'online', 'online'),
('DL-301', 'DL 1P D 7170', 'Route 717 (Aerocity-Nehru Pl)', 'active', 28.5684, 77.1605, 12.0, 95.0, 'online', 'online'),
('DL-302', 'DL 1P D 7174', 'Route 717 (Aerocity-Nehru Pl)', 'active', 28.5528, 77.1216, 38.5, 70.0, 'online', 'online'),
('DL-401', 'DL 1P E 8011', 'Route 801 (Outer Ring Feeder)', 'active', 28.5355, 77.2088, 29.0, 85.0, 'online', 'online'),
('DL-402', 'DL 1P E 8015', 'Route 801 (Outer Ring Feeder)', 'active', 28.5420, 77.2600, 34.0, 260.0, 'online', 'online'),
('DL-501', 'DL 1P F 9210', 'Route 921 (Dwarka Express)', 'active', 28.5800, 77.0600, 44.0, 130.0, 'online', 'online'),
('DL-502', 'DL 1P F 9218', 'Route 921 (Dwarka Express)', 'active', 28.6010, 77.0900, 21.0, 145.0, 'online', 'online')
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    speed = EXCLUDED.speed,
    camera_status = EXCLUDED.camera_status,
    gps_status = EXCLUDED.gps_status;

-- ----------------------------------------------------------
-- 3. INITIAL CLUSTERED ROAD HAZARD & INCIDENT DOSSIERS
-- ----------------------------------------------------------
INSERT INTO public.incidents (id, incident_type, title, severity, status, latitude, longitude, location_name, detection_count, assigned_to, description, is_simulated) VALUES
('b1010000-0000-0000-0000-000000000001', 'pothole', 'Severe Pothole Cluster (0.4m depth)', 'critical', 'open', 28.5728, 77.2390, 'Lajpat Nagar Underpass Outer Ring Road', 6, 'PWD South Zone', 'Multiple deep potholes detected by 3 consecutive bus passes. Risk of vehicular damage and motorcycle destabilization.', true),
('b1010000-0000-0000-0000-000000000002', 'road_damage', 'Severe Alligator Cracking on Bus Lane', 'high', 'in_progress', 28.5834, 77.2104, 'Aurobindo Marg near INA Market', 4, 'Delhi Transport Infrastructure Corp', 'Extensive interconnected alligator cracking indicating base subgrade fatigue. Scheduled for milling and resurfacing.', true),
('b1010000-0000-0000-0000-000000000003', 'waterlogging', 'Monsoon Flash Waterlogging (15cm depth)', 'critical', 'open', 28.5689, 77.1610, 'Dhaula Kuan Subway Slip Road', 8, 'Flood Control Dept & NDMC', 'Drain blockage causing severe water pooling spanning two active lanes. Bus speed reduced to 8 km/h.', true),
('b1010000-0000-0000-0000-000000000004', 'missing_sign', 'Missing Regulatory Stop Sign at Junction', 'medium', 'open', 28.6135, 77.2085, 'Patel Chowk Intersection', 2, 'Traffic Police Engineering Wing', 'Expected STOP sign missing from roadside infrastructure inventory. Sensed by Bus DL-101 camera.', true),
('b1010000-0000-0000-0000-000000000005', 'road_damage', 'Longitudinal Joint Crack (12m length)', 'low', 'resolved', 28.6310, 77.2170, 'Connaught Circus Inner Ring', 3, 'NDMC Road Maintenance', 'Sealed with hot-pour bituminous compound following automated sensor alert.', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 4. TRAFFIC MOBILITY EVENTS
-- ----------------------------------------------------------
INSERT INTO public.traffic_events (id, bus_id, vehicle_count, average_speed, congestion_level, latitude, longitude) VALUES
('c1010000-0000-0000-0000-000000000001', 'DL-101', 48, 14.5, 'heavy', 28.6139, 77.2090),
('c1010000-0000-0000-0000-000000000002', 'DL-201', 65, 11.2, 'gridlock', 28.5721, 77.2382),
('c1010000-0000-0000-0000-000000000003', 'DL-301', 32, 28.0, 'moderate', 28.5684, 77.1605),
('c1010000-0000-0000-0000-000000000004', 'DL-501', 18, 44.0, 'low', 28.5800, 77.0600)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------
-- 5. EXPECTED INFRASTRUCTURE (Missing Sign Analysis Baseline)
-- ----------------------------------------------------------
INSERT INTO public.infrastructure_signs (id, sign_type, latitude, longitude, expected_direction, status) VALUES
('SIGN-DEL-01', 'stop', 28.6135, 77.2085, 'Northbound', 'missing'),
('SIGN-DEL-02', 'speed_limit_50', 28.5830, 77.2100, 'Southbound', 'verified'),
('SIGN-DEL-03', 'school_zone', 28.5720, 77.2380, 'Eastbound', 'verified'),
('SIGN-DEL-04', 'no_entry', 28.6318, 77.2165, 'Clockwise', 'verified')
ON CONFLICT (id) DO NOTHING;

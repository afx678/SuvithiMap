"""
Script to generate demo SVG evidence images with clear SIMULATED EVIDENCE watermarks.
"""
import os

os.makedirs("demo/images", exist_ok=True)
os.makedirs("demo/simulated_data", exist_ok=True)
os.makedirs("demo/videos", exist_ok=True)

svg_pothole = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <rect width="640" height="360" fill="#1c1c1a"/>
  <!-- Road Surface Perspective -->
  <polygon points="260,120 380,120 640,360 0,360" fill="#2b2b27"/>
  <polygon points="295,120 345,120 420,360 220,360" fill="#242420"/>
  <!-- Road markings -->
  <line x1="320" y1="140" x2="320" y2="180" stroke="#F1C46A" stroke-width="4" stroke-dasharray="15,10"/>
  <line x1="320" y1="210" x2="320" y2="270" stroke="#F1C46A" stroke-width="6" stroke-dasharray="25,15"/>
  <line x1="320" y1="300" x2="320" y2="360" stroke="#F1C46A" stroke-width="8" stroke-dasharray="30,20"/>
  <!-- Severe Pothole -->
  <ellipse cx="360" cy="280" rx="65" ry="28" fill="#0d0d0c" stroke="#D96B55" stroke-width="3"/>
  <ellipse cx="365" cy="283" rx="45" ry="18" fill="#050504"/>
  <path d="M310,270 Q360,255 415,275 Q425,295 385,305 Q325,300 310,270" fill="none" stroke="#D99A3D" stroke-width="2" stroke-dasharray="4,4"/>
  <!-- Detection Bounding Box -->
  <rect x="285" y="245" width="150" height="75" fill="none" stroke="#D96B55" stroke-width="2.5" stroke-dasharray="6,3"/>
  <rect x="285" y="222" width="125" height="22" fill="#D96B55"/>
  <text x="290" y="238" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">POTHOLE 92%</text>
  <!-- Telemetry Watermark -->
  <rect x="10" y="10" width="370" height="52" fill="#11110F" rx="4" stroke="#34332F"/>
  <text x="20" y="28" fill="#F2EFE8" font-family="monospace" font-size="12">UNIT: BUS DL-101 (R-419) | 28.5728 N, 77.2390 E</text>
  <text x="20" y="48" fill="#F1C46A" font-family="monospace" font-size="11">SIMULATED EVIDENCE (MUNICIPAL VERIFICATION)</text>
</svg>"""

svg_crack = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <rect width="640" height="360" fill="#1c1c1a"/>
  <polygon points="260,120 380,120 640,360 0,360" fill="#292925"/>
  <!-- Alligator Cracks -->
  <path d="M220,240 L260,250 L280,230 L310,255 L350,235 L390,260 L350,280 L290,270 L250,290 L220,270 Z" fill="#171715" stroke="#D99A3D" stroke-width="2.5"/>
  <line x1="260" y1="250" x2="290" y2="270" stroke="#D99A3D" stroke-width="2"/>
  <line x1="280" y1="230" x2="350" y2="280" stroke="#D99A3D" stroke-width="1.5"/>
  <line x1="310" y1="255" x2="250" y2="290" stroke="#D99A3D" stroke-width="2"/>
  <rect x="210" y="220" width="190" height="80" fill="none" stroke="#D99A3D" stroke-width="2" stroke-dasharray="5,3"/>
  <rect x="210" y="198" width="160" height="22" fill="#D99A3D"/>
  <text x="216" y="214" fill="#11110F" font-family="monospace" font-size="12" font-weight="bold">ALLIGATOR CRACK 88%</text>
  <rect x="10" y="10" width="370" height="52" fill="#11110F" rx="4" stroke="#34332F"/>
  <text x="20" y="28" fill="#F2EFE8" font-family="monospace" font-size="12">UNIT: BUS DL-201 (R-502) | 28.5834 N, 77.2104 E</text>
  <text x="20" y="48" fill="#F1C46A" font-family="monospace" font-size="11">SIMULATED EVIDENCE (MUNICIPAL VERIFICATION)</text>
</svg>"""

svg_water = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <rect width="640" height="360" fill="#1c1c1a"/>
  <polygon points="260,120 380,120 640,360 0,360" fill="#222524"/>
  <!-- Water Ponding Area -->
  <polygon points="120,320 540,320 480,240 180,240" fill="#182a2f" opacity="0.85" stroke="#6F9B87" stroke-width="3"/>
  <ellipse cx="320" cy="280" rx="160" ry="30" fill="#1d3c45" opacity="0.9" stroke="#F1C46A" stroke-width="2" stroke-dasharray="6,4"/>
  <rect x="110" y="230" width="440" height="100" fill="none" stroke="#D96B55" stroke-width="2.5" stroke-dasharray="6,3"/>
  <rect x="110" y="206" width="180" height="24" fill="#D96B55"/>
  <text x="118" y="223" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold">WATERLOGGING (18cm) 94%</text>
  <rect x="10" y="10" width="370" height="52" fill="#11110F" rx="4" stroke="#34332F"/>
  <text x="20" y="28" fill="#F2EFE8" font-family="monospace" font-size="12">UNIT: BUS DL-301 (R-717) | 28.5689 N, 77.1610 E</text>
  <text x="20" y="48" fill="#F1C46A" font-family="monospace" font-size="11">SIMULATED EVIDENCE (MUNICIPAL VERIFICATION)</text>
</svg>"""

svg_sign = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <rect width="640" height="360" fill="#1c1c1a"/>
  <polygon points="260,120 380,120 640,360 0,360" fill="#2b2b27"/>
  <!-- Empty Sign Post -->
  <line x1="490" y1="160" x2="490" y2="310" stroke="#706e68" stroke-width="6"/>
  <circle cx="490" cy="150" r="32" fill="none" stroke="#D96B55" stroke-width="3" stroke-dasharray="6,4"/>
  <line x1="468" y1="150" x2="512" y2="150" stroke="#D96B55" stroke-width="3"/>
  <rect x="445" y="105" width="90" height="85" fill="none" stroke="#D96B55" stroke-width="2"/>
  <rect x="410" y="80" width="170" height="22" fill="#D96B55"/>
  <text x="416" y="96" fill="#FFFFFF" font-family="monospace" font-size="11" font-weight="bold">MISSING STOP SIGN</text>
  <rect x="10" y="10" width="370" height="52" fill="#11110F" rx="4" stroke="#34332F"/>
  <text x="20" y="28" fill="#F2EFE8" font-family="monospace" font-size="12">UNIT: BUS DL-101 (R-419) | 28.6135 N, 77.2085 E</text>
  <text x="20" y="48" fill="#F1C46A" font-family="monospace" font-size="11">SIMULATED EVIDENCE (INFRASTRUCTURE AUDIT)</text>
</svg>"""

svg_vehicle = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <rect width="640" height="360" fill="#1c1c1a"/>
  <polygon points="260,120 380,120 640,360 0,360" fill="#2b2b27"/>
  <!-- Traffic Vehicles -->
  <rect x="220" y="200" width="70" height="55" rx="4" fill="#383733" stroke="#F1C46A" stroke-width="2"/>
  <text x="225" y="192" fill="#F1C46A" font-family="monospace" font-size="10">CAR #014 [92%]</text>
  <rect x="340" y="210" width="110" height="75" rx="5" fill="#34332F" stroke="#6F9B87" stroke-width="2"/>
  <text x="345" y="202" fill="#6F9B87" font-family="monospace" font-size="10">BUS #009 [96%]</text>
  <rect x="150" y="240" width="40" height="45" rx="2" fill="#302f2b" stroke="#D99A3D" stroke-width="1.5"/>
  <text x="145" y="234" fill="#D99A3D" font-family="monospace" font-size="10">M/C #021 [88%]</text>
  <rect x="10" y="10" width="370" height="52" fill="#11110F" rx="4" stroke="#34332F"/>
  <text x="20" y="28" fill="#F2EFE8" font-family="monospace" font-size="12">UNIT: BUS DL-201 (R-502) | DENSITY: HEAVY</text>
  <text x="20" y="48" fill="#F1C46A" font-family="monospace" font-size="11">SIMULATED EVIDENCE (BYTETRACK STREAM)</text>
</svg>"""

files = [
    ("demo/images/pothole_evidence_sample.jpg", svg_pothole),
    ("demo/images/pothole_evidence_sample.svg", svg_pothole),
    ("demo/images/road_crack_sample.jpg", svg_crack),
    ("demo/images/road_crack_sample.svg", svg_crack),
    ("demo/images/waterlogging_sample.jpg", svg_water),
    ("demo/images/waterlogging_sample.svg", svg_water),
    ("demo/images/missing_sign_sample.jpg", svg_sign),
    ("demo/images/missing_sign_sample.svg", svg_sign),
    ("demo/images/vehicle_traffic_sample.jpg", svg_vehicle),
    ("demo/images/vehicle_traffic_sample.svg", svg_vehicle),
]

for path, content in files:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("All demo visual evidence assets generated successfully!")

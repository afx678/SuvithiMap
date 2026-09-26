# Open Source Licenses & Attributions (SuVithiMap)

SuVithiMap is built exclusively using permissive open-source frameworks, open computer vision models, open mapping data, and publicly licensed road footage. No commercial API keys (Google Maps, Mapbox, HERE, Bing) are required.

---

## 1. Core Frameworks & UI Dependencies

| Library / Tool | License | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | MIT License | High-performance Python ASGI backend API framework |
| **Uvicorn** | BSD 3-Clause | ASGI production web server |
| **Pydantic** | MIT License | Data validation and common DetectionResult schemas |
| **Supabase-py** | MIT License | PostgreSQL client adapter with hybrid offline fallback |
| **React & React-DOM** | MIT License | Frontend user interface framework |
| **Vite** | MIT License | High-speed frontend build and dev server |
| **Tailwind CSS** | MIT License | Utility-first design tokens and responsive layout |
| **Leaflet & React-Leaflet** | BSD 2-Clause / Hippocratic | Interactive open GIS web mapping without API keys |
| **OpenStreetMap** | ODbL (Open Database License) | Global geographic tile server and road network mapping |
| **Recharts** | MIT License | Composable charting library for React analytics |
| **Lucide React** | ISC License | Scalable interface iconography |
| **Framer Motion** | MIT License | High-performance motion design and UI micro-interactions |

---

## 2. Computer Vision Models & Checkpoints

### A. Road Damage & Pothole Detection
- **Repository**: [Tanvir-Pandit/Road-Damage-with-YOLOv8](https://github.com/Tanvir-Pandit/Road-Damage-with-YOLOv8)
- **Model**: YOLOv8s custom fine-tuned checkpoint (`models/pothole_road_damage.pt`, 22.5 MB)
- **Classes**: `Cracks`, `pothole`
- **License**: MIT License
- **Dataset**: Crowdsourced road surface anomalies dataset
- **Attribution**: Tanvir Pandit (2024)

### B. Dedicated Pothole Detector
- **Repository**: [MuhammadSafian/YOLO-Pothole-Detection-Model](https://github.com/MuhammadSafian/YOLO-Pothole-Detection-Model)
- **Reference Repo**: [Rajarshisaha10/Pothole_detection_YOLO](https://github.com/Rajarshisaha10/Pothole_detection_YOLO)
- **Model**: YOLOv8n fine-tuned checkpoint (`models/pothole_yolov8.pt`, 6.25 MB)
- **Classes**: `pothole`
- **License**: Apache 2.0 License
- **Dataset**: Kaggle Annotated Potholes Image Dataset (`chitholian/annotated-potholes-dataset`)
- **Attribution**: Muhammad Safian (2024), Rajarshi Saha (2024)

### C. Traffic Vehicle Detection & ByteTrack
- **Repository**: [yelaman1x9/car-tracking](https://github.com/yelaman1x9/car-tracking) & [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- **Model**: Pretrained YOLOv8n COCO weights (`yolov8n.pt`, 6.2 MB) + ByteTrack (`bytetrack.yaml`)
- **Classes**: `car`, `motorcycle`, `bus`, `truck`
- **License**: AGPL-3.0 / MIT
- **Dataset**: Microsoft COCO 2017 Dataset
- **Attribution**: Yelaman, Ultralytics Team

### D. Traffic Sign Detection
- **Repository**: [Namith-19/Road_assistant](https://github.com/Namith-19/Road_assistant)
- **Model**: YOLOv8n traffic sign checkpoint (`models/traffic_signs_yolov8.pt`, 6.38 MB)
- **Classes**: Regulatory and warning traffic signs (`speed_limit_50`, `stop`, `pedestrian_crossing`, `give_way`, `no_parking`, etc.)
- **License**: MIT License
- **Dataset**: Indian Traffic Signs Detection Dataset
- **Attribution**: Namith (2024)

### E. Road Accident Detection
- **Repository**: [amritauji/AI-Accident-Detection-Using-YOLOv8](https://github.com/amritauji/AI-Accident-Detection-Using-YOLOv8)
- **Model**: YOLOv8s accident detection checkpoint (`models/accident_yolov8.pt`, 22.5 MB)
- **Classes**: `Accident`
- **License**: CC BY 4.0 / MIT
- **Dataset**: Roboflow Universe Accident Detection Model Dataset
- **Attribution**: Amrita Uji (2024)

### F. Flooded Road / Waterlogging Detection
- **Repository**: [Faizanras00l/yolo-cctv-object-detection](https://github.com/Faizanras00l/yolo-cctv-object-detection)
- **Model**: YOLOv8s checkpoint (`models/cctv_flood_accident.pt`, 22.5 MB)
- **Classes**: `Flood`, `Accident`, `Car`, `Large Car`
- **License**: Apache 2.0 License
- **Status Evaluation**: Evaluated on road footage; if verified: `AI VERIFIED`, otherwise fallback to `SIMULATION ONLY`.
- **Attribution**: Faizan Rasool (2024)

---

## 3. Real Roadway & Dashcam Video Footage

| Footage File | Source Repository | Creator / Contributor | License | Description |
| :--- | :--- | :--- | :--- | :--- |
| `demo/videos/cracks_road.mp4` | [Tanvir-Pandit/Road-Damage-with-YOLOv8](https://github.com/Tanvir-Pandit/Road-Damage-with-YOLOv8) | Tanvir Pandit | MIT | Genuine roadway dashcam footage displaying road surface cracks and potholes |
| `demo/videos/potholes_road.mp4` | [Rajarshisaha10/Pothole_detection_YOLO](https://github.com/Rajarshisaha10/Pothole_detection_YOLO) | Rajarshi Saha | Apache 2.0 | Real road footage showing multiple pavement potholes along the vehicular path |
| `demo/videos/accident_scene.mp4` | [amritauji/AI-Accident-Detection-Using-YOLOv8](https://github.com/amritauji/AI-Accident-Detection-Using-YOLOv8) | Amrita Uji | CC BY 4.0 | Real recorded roadway incident scene footage with vehicle collision |

---

## 4. Map Tiles Attribution

- **OpenStreetMap**: `© OpenStreetMap contributors`
- **Tile Usage**: Distributed under the Open Database License (ODbL) by the OpenStreetMap Foundation.
- **Strict Compliance**: Zero API keys or commercial tokens are stored, queried, or required by SuVithiMap.


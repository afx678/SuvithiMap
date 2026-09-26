# SuVithiMap Model Weights & Video Assets Downloader
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$models = @(
    @{
        Name = "Tanvir-Pandit Road Damage & Pothole YOLOv8"
        Url  = "https://raw.githubusercontent.com/Tanvir-Pandit/Road-Damage-with-YOLOv8/main/model/best.pt"
        Dest = "models\pothole_road_damage.pt"
    },
    @{
        Name = "MuhammadSafian Pothole YOLOv8"
        Url  = "https://raw.githubusercontent.com/MuhammadSafian/YOLO-Pothole-Detection-Model/main/best.pt"
        Dest = "models\pothole_yolov8.pt"
    },
    @{
        Name = "Amritauji Accident Detection YOLOv8"
        Url  = "https://raw.githubusercontent.com/amritauji/AI-Accident-Detection-Using-YOLOv8/main/best.pt"
        Dest = "models\accident_yolov8.pt"
    },
    @{
        Name = "Namith-19 Traffic Signs YOLOv8"
        Url  = "https://raw.githubusercontent.com/Namith-19/Road_assistant/main/road_signs_detection/augmented-signs3/weights/best.pt"
        Dest = "models\traffic_signs_yolov8.pt"
    },
    @{
        Name = "Faizanras00l CCTV Flood & Accidents YOLOv8"
        Url  = "https://raw.githubusercontent.com/Faizanras00l/yolo-cctv-object-detection/main/weights/best_Weights.pt"
        Dest = "models\cctv_flood_accident.pt"
    }
)

$videos = @(
    @{
        Name = "Tanvir-Pandit Real Road Cracks Footage"
        Url  = "https://raw.githubusercontent.com/Tanvir-Pandit/Road-Damage-with-YOLOv8/main/videos/crack%202.mp4"
        Dest = "demo\videos\cracks_road.mp4"
    },
    @{
        Name = "Rajarshisaha10 Real Road Potholes Footage"
        Url  = "https://raw.githubusercontent.com/Rajarshisaha10/Pothole_detection_YOLO/main/assets/sample_video_before.mp4"
        Dest = "demo\videos\potholes_road.mp4"
    },
    @{
        Name = "Amritauji Real Road Accident Scene Footage"
        Url  = "https://raw.githubusercontent.com/amritauji/AI-Accident-Detection-Using-YOLOv8/main/Accident%20detection%20demo%20(1).mp4"
        Dest = "demo\videos\accident_scene.mp4"
    }
)

Write-Host "=== Downloading Model Weights ===" -ForegroundColor Cyan
foreach ($m in $models) {
    if (Test-Path $m.Dest) {
        Write-Host "[OK] $($m.Name) already exists at $($m.Dest)" -ForegroundColor Green
    } else {
        Write-Host "Downloading $($m.Name) -> $($m.Dest)..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $m.Url -OutFile $m.Dest -UseBasicParsing
        $f = Get-Item $m.Dest
        Write-Host "[DONE] Saved $($f.Length) bytes to $($m.Dest)" -ForegroundColor Green
    }
}

Write-Host "=== Downloading Video Assets ===" -ForegroundColor Cyan
foreach ($v in $videos) {
    if (Test-Path $v.Dest) {
        Write-Host "[OK] $($v.Name) already exists at $($v.Dest)" -ForegroundColor Green
    } else {
        Write-Host "Downloading $($v.Name) -> $($v.Dest)..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $v.Url -OutFile $v.Dest -UseBasicParsing
        $f = Get-Item $v.Dest
        Write-Host "[DONE] Saved $($f.Length) bytes to $($v.Dest)" -ForegroundColor Green
    }
}

Write-Host "=== Assets Download Completed ===" -ForegroundColor Cyan

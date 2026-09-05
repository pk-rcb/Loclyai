"""
LoclyAI — FastAPI ML Inference Service
=======================================
Loads the YOLOv8 model (best.pt) and exposes a /predict endpoint
that accepts image uploads and returns classification results.

Run with:
    cd mlmodel
    uvicorn main:app --reload --port 8000
"""

import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

# ─── APP SETUP ───────────────────────────────────────────────
app = FastAPI(
    title="LoclyAI ML Service",
    description="YOLOv8 civic issue classification API",
    version="1.0.0",
)

# Allow requests from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── LOAD MODEL ──────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best (1).pt")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

print(f"🔄 Loading YOLOv8 model from {MODEL_PATH} ...")
model = YOLO(MODEL_PATH)
print(f"✅ Model loaded successfully! Classes: {model.names}")

# ─── EMOJI MAPPING ───────────────────────────────────────────
# Maps common civic issue class names to emojis.
# The model's actual class names are used as keys (case-insensitive lookup).
# If a class isn't found, a default emoji is used.
EMOJI_MAP = {
    "pothole": "🕳️",
    "garbage": "🗑️",
    "garbage pile": "🗑️",
    "trash": "🗑️",
    "litter": "🗑️",
    "broken streetlight": "💡",
    "streetlight": "💡",
    "street light": "💡",
    "manhole": "⚠️",
    "open manhole": "⚠️",
    "crack": "🔨",
    "road crack": "🔨",
    "fallen tree": "🌳",
    "tree": "🌳",
    "flooding": "🌊",
    "flood": "🌊",
    "water logging": "🌊",
    "waterlogging": "🌊",
    "graffiti": "🎨",
    "damaged sign": "🪧",
    "sign": "🪧",
    "abandoned vehicle": "🚗",
    "stray animal": "🐕",
    "broken bench": "🪑",
    "illegal dumping": "🚯",
    "sewage": "🚰",
    "damaged road": "🛣️",
    "construction debris": "🧱",
    "overflowing bin": "🗑️",
    "damaged pavement": "🧱",
    "electric hazard": "⚡",
    "wire": "⚡",
    "exposed wire": "⚡",
}

DEFAULT_EMOJI = "📸"


def get_emoji(class_name: str) -> str:
    """Return an emoji for a class name, with fuzzy case-insensitive matching."""
    lower = class_name.lower().strip()
    # Exact match
    if lower in EMOJI_MAP:
        return EMOJI_MAP[lower]
    # Partial match — check if any key is contained in the class name
    for key, emoji in EMOJI_MAP.items():
        if key in lower or lower in key:
            return emoji
    return DEFAULT_EMOJI


# ─── HEALTH CHECK ────────────────────────────────────────────
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": "YOLOv8",
        "model_path": MODEL_PATH,
        "classes": model.names,
    }


# ─── PREDICTION ENDPOINT ────────────────────────────────────
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accept an image upload, run YOLOv8 inference, and return detections.

    Returns:
        {
            "success": true,
            "detections": [
                {
                    "class_name": "Pothole",
                    "confidence": 94.5,
                    "emoji": "🕳️",
                    "bbox": { "x1": 0.12, "y1": 0.18, "x2": 0.72, "y2": 0.73 }
                }
            ],
            "best_detection": { ... } | null,
            "total_detections": 1
        }
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Please upload an image.",
        )

    try:
        # Read image bytes and open with PIL
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read image: {str(e)}")

    try:
        # Run YOLOv8 inference
        results = model.predict(source=image, conf=0.6, verbose=False)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Model inference failed: {str(e)}"
        )

    # Parse results
    detections = []
    result = results[0]  # First (and only) image

    if result.boxes is not None and len(result.boxes) > 0:
        img_w, img_h = image.size

        for box in result.boxes:
            # Get coordinates (xyxy format) — normalized to 0-1 range
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0]) * 100  # Convert to percentage
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            detections.append(
                {
                    "class_name": class_name,
                    "confidence": round(confidence, 1),
                    "emoji": get_emoji(class_name),
                    "bbox": {
                        "x1": round(x1 / img_w, 4),
                        "y1": round(y1 / img_h, 4),
                        "x2": round(x2 / img_w, 4),
                        "y2": round(y2 / img_h, 4),
                    },
                }
            )

    # Sort by confidence descending
    detections.sort(key=lambda d: d["confidence"], reverse=True)

    return {
        "success": True,
        "detections": detections,
        "best_detection": detections[0] if detections else None,
        "total_detections": len(detections),
    }


# ─── RUN SERVER ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

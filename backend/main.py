from fastapi import FastAPI, Query, HTTPException
from pymongo import MongoClient
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import datetime

app = FastAPI(
    title="Profile Labeling Backend",
    version="4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONFIG ----------------

MONGO_URI = "mongodb://myuser:mypassword@48.217.49.77:27017/"
DB_NAME = "face-attributes-matrimony-matches"

COLLECTIONS = [
    "Indian",
    "face_attributes_2026_02_23",
    "face_attributes_2026_03_09"
]

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

PAGE_SIZE = 40

# ---------------- HELPERS ----------------

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ---------------- BASE MATCH ----------------

BASE_MATCH = {
    "country": "India",
    "gender": "Female",
    "name": {"$exists": True, "$ne": ""},
    "image_url": {"$exists": True, "$ne": ""},
    "changes_required": True
}

# ---------------- VALID USERS ----------------

VALID_USERS = [
    "Aravinth", "Daniel", "Manish", "Afjal", 
    "Praveen", "Uday", "Venu", "Vinod"
]

# ---------------- AGGREGATION BUILDER ----------------

def build_pipeline(skip, limit):

    pipeline = [
        {"$match": BASE_MATCH},
        {"$addFields": {"_collection": COLLECTIONS[0]}}
    ]

    for col_name in COLLECTIONS[1:]:
        pipeline.append({
            "$unionWith": {
                "coll": col_name,
                "pipeline": [
                    {"$match": BASE_MATCH},
                    {"$addFields": {"_collection": col_name}}
                ]
            }
        })

    pipeline.extend([
        {"$sort": {"_id": 1}},
        {"$skip": skip},
        {"$limit": limit}
    ])

    return pipeline

# ---------------- PAGINATION API ----------------

@app.get("/profiles/page")
def get_profiles_by_page(
    page: int = Query(..., ge=1),
    page_size: int = Query(PAGE_SIZE, ge=1)
):

    skip = (page - 1) * page_size

    pipeline = build_pipeline(skip, page_size)

    cursor = db[COLLECTIONS[0]].aggregate(pipeline)

    data = [serialize(doc) for doc in cursor]

    return {
        "page": page,
        "page_size": page_size,
        "count": len(data),
        "data": data
    }

# ---------------- VALID VALUES ----------------

VALID_VALUES = {
    "ethnicity": ["white", "black", "asian", "brown"],
    "hair_color": ["black", "blonde", "white", "grey", "others"],
    "eye_color": ["blue", "green", "grey", "black"],
    "face_shape": ["oval", "round", "square", "diamond"],
    "head_hair": ["present", "absent"],
    "beard": ["stubble", "full", "goatee", "none"],
    "mustache": ["thin", "thick", "handlebar", "none"],
    "hair_style": ["straight", "curly"],
    "eyewear": ["prescription_glasses", "sunglasses", "none"],
    "headwear": ["hat", "cap", "turban", "none"],
    "eyebrow": ["present", "absent", "normal"],
    "attire": ["casual", "western", "traditional", "formal"],
    "body_shape": ["fit", "slim", "fat", "none"],
    "skin_color": ["white", "black", "brown", "none"],
    "eye_size": ["normal", "large", "small", "none"],
    "face_size": ["large", "medium", "small"],
    "face_structure": ["symmetric", "asymmetric"],
    "hair_length": ["long", "medium", "short"]
}

# ---------------- NORMALIZATION ----------------

def normalize_value(value: str):
    if not value: return value
    return value.lower().replace("-", "").strip()

def validate(field, value):
    if field not in VALID_VALUES:
        return value

    if value not in VALID_VALUES[field]:
        # Log or handle invalid value but here we just return it or raise
        pass

    return value

# ---------------- UPDATE API ----------------

@app.post("/profiles/update")
def update_profile(payload: dict):

    if "_id" not in payload or "_collection" not in payload:
        raise HTTPException(400, "_id or _collection missing")

    if "updated_by" not in payload:
        raise HTTPException(400, "updated_by is required")

    try:
        oid = ObjectId(payload["_id"])
    except:
        raise HTTPException(400, "Invalid _id")

    collection = db[payload["_collection"]]

    update_data = {}

    # ----------- FLAT FIELDS -----------

    field_mapping = {
        "face_shape": "image_attributes.face_shape",
        "head_hair": "image_attributes.head_hair",
        "beard": "image_attributes.beard",
        "mustache": "image_attributes.mustache",
        "ethnicity": "image_attributes.ethnicity",
        "eye_color": "image_attributes.eye_color",
        "attire": "image_attributes.attire",
        "body_shape": "image_attributes.body_shape",
        "skin_color": "image_attributes.skin_color",
        "eye_size": "image_attributes.eye_size",
        "face_size": "image_attributes.face_size",
        "face_structure": "image_attributes.face_structure",
        "hair_length": "image_attributes.hair_length"
    }

    for key, db_path in field_mapping.items():
        if key in payload:
            val = normalize_value(payload[key])
            val = validate(key, val)
            update_data[db_path] = val

    # ----------- NESTED FIELDS -----------

    if "hair_color" in payload:
        val = validate("hair_color", normalize_value(payload["hair_color"]))
        update_data["image_attributes.hair.hair_color"] = val

    if "hair_style" in payload:
        val = validate("hair_style", normalize_value(payload["hair_style"]))
        update_data["image_attributes.hair.hair_style"] = val

    if "eyewear" in payload:
        val = validate("eyewear", normalize_value(payload["eyewear"]))
        update_data["image_attributes.accessories.eyewear"] = val

    if "headwear" in payload:
        val = validate("headwear", normalize_value(payload["headwear"]))
        update_data["image_attributes.accessories.headwear"] = val

    if "eyebrow" in payload:
        val = validate("eyebrow", normalize_value(payload["eyebrow"]))
        update_data["image_attributes.facial_features.Eyebrow"] = val

    # ----------- TRACKING -----------

    update_data["updated_by"] = payload["updated_by"]
    update_data["updated_at"] = datetime.datetime.utcnow()
    update_data["changes_required"] = False

    if not update_data:
        raise HTTPException(400, "No valid fields to update")

    res = collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )

    if res.matched_count == 0:
        raise HTTPException(404, "Profile not found")

    return {
        "status": "success",
        "updated_by": payload["updated_by"],
        "id": payload["_id"]
    }

# ---------------- STATS API ----------------

@app.get("/stats")
def get_stats():

    total = 0
    completed = 0

    for col_name in COLLECTIONS:
        collection = db[col_name]

        total += collection.count_documents({
            "country": "India",
            "gender": "Female"
        })

        completed += collection.count_documents({
            "country": "India",
            "gender": "Female",
            "changes_required": False
        })

    pending = total - completed
    percent = round((completed / total) * 100, 2) if total else 0

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "percent": percent
    }

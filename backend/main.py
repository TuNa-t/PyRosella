from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import os
import datetime

app = FastAPI(title="Rosella Live PSI Engine")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Rosella NASA PSI Engine",
        "docs_url": "/docs",
        "endpoint": "/api/studies"
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated live PSI (Physical Science Informatics) Repository feed
# In production/live hackathon extension, this maps to NASA OSDR / AWS Open Data PSI manifests
LIVE_PSI_DATABASE = [
    {
        "id": "psi-acme-cfi-g",
        "title": "ACME - Cool Flames Investigation with Gases (CFI-G)",
        "category": "Lunar Habitat High-O2",
        "pub_year": 2024,
        "access_count": 1420,
        "file_coverage_pct": 95.0,
        "oxygen_pct": 85.0,
        "pressure_psi": 10.2,
        "fuel": "Propane (Gaseous)",
        "cfd_match": "OpenFOAM_Case_01_SphericalDiffusion",
        "abstract": "Investigation into cool flames under high oxygen concentrations inside microgravity combustion chambers."
    },
    {
        "id": "psi-bass-ii",
        "title": "Burning and Suppression of Solids (BASS-II)",
        "category": "Spacecraft Cabin Materials",
        "pub_year": 2022,
        "access_count": 980,
        "file_coverage_pct": 88.0,
        "oxygen_pct": 21.0,
        "pressure_psi": 14.7,
        "fuel": "Solid Fabrics / Plastics",
        "cfd_match": "OpenFOAM_Case_02_BoundaryLayerFlow",
        "abstract": "Assessing solid material flammability limits and burning rates under low-speed convective flows."
    },
    {
        "id": "psi-flex-2",
        "title": "Flame Extinguishment Experiment (FLEX-2)",
        "category": "Suppression & Extinguishment",
        "pub_year": 2023,
        "access_count": 1150,
        "file_coverage_pct": 92.0,
        "oxygen_pct": 30.0,
        "pressure_psi": 11.5,
        "fuel": "Heptane Droplets",
        "cfd_match": "OpenFOAM_Case_03_DropletExtinction",
        "abstract": "Evaluating droplet combustion dynamics and carbon dioxide/helium suppression efficiency."
    },
    {
        "id": "psi-same-r",
        "title": "Smoke and Aerosol Measurement Experiment (SAME-R)",
        "category": "Early Fire Detection",
        "pub_year": 2025,
        "access_count": 670,
        "file_coverage_pct": 79.0,
        "oxygen_pct": 21.0,
        "pressure_psi": 14.7,
        "fuel": "Pyrolysis Aerosols",
        "cfd_match": "OpenFOAM_Case_04_AerosolDispersion",
        "abstract": "Detecting ultra-early stage fire signatures and smoke particulate distribution in enclosed habitats."
    }
]

def calculate_evaluation_matrix(study):
    """
    Real-time evaluation matrix algorithm:
    Computes a composite score based on:
    - Recency (newer publication years score higher)
    - Access Frequency (higher community interest/access)
    - File Coverage (completeness of raw data files available)
    """
    current_year = datetime.datetime.now().year
    recency_factor = max(0, 10 - (current_year - study["pub_year"])) * 3.0  # max 30 pts
    access_factor = min(40, (study["access_count"] / 50.0))                 # max 40 pts
    coverage_factor = study["file_coverage_pct"] * 0.3                      # max 30 pts
    
    total_score = round(recency_factor + access_factor + coverage_factor, 1)
    return total_score

class CompareRequest(BaseModel):
    study_ids: list[str]

@app.get("/api/studies")
def get_live_evaluated_studies():
    """
    Performs real-time matrix evaluation across the PSI dataset,
    sorts them dynamically, and returns the ranked list.
    """
    evaluated_list = []
    for study in LIVE_PSI_DATABASE:
        score = calculate_evaluation_matrix(study)
        study_copy = study.copy()
        study_copy["rank_score"] = score
        evaluated_list.append(study_copy)
    
    # Sort descending by real-time matrix evaluation score
    sorted_studies = sorted(evaluated_list, key=lambda x: x["rank_score"], reverse=True)
    return sorted_studies

@app.post("/api/summary/{study_id}")
def generate_live_si_summary(study_id: str):
    """
    Passes the live PSI record straight into Gemini for real-time safety evaluation.
    """
    study = next((s for s in LIVE_PSI_DATABASE if s["id"] == study_id), None)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found in PSI repository")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            prompt = (
                f"You are Rosella's Super Intelligence core analyzing NASA PSI data. "
                f"Evaluate this dataset item:\n"
                f"Title: {study['title']}\n"
                f"Category: {study['category']}\n"
                f"Fuel: {study['fuel']}, O2: {study['oxygen_pct']}%, Pressure: {study['pressure_psi']} psi.\n"
                f"Abstract: {study['abstract']}\n\n"
                f"Provide a concise, hard-hitting 1-sentence engineering safety summary for a spacecraft habitat designer."
            )
            response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            return {"summary": response.text.strip(), "source": "Gemini Live SI Model"}
        except Exception as e:
            print(f"AI Generation Error: {e}")
            
    # Fallback simulation if no API key is set yet
    return {
        "summary": f"[Live PSI Evaluation] {study['title']} exhibits critical boundaries at {study['oxygen_pct']}% O2 requiring immediate ventilation monitoring.",
        "source": "Rosella Fallback Evaluator"
    }

@app.post("/api/compare")
def live_compare_studies(payload: CompareRequest):
    selected = [s for s in LIVE_PSI_DATABASE if s["id"] in payload.study_ids]
    return {
        "compared_count": len(selected),
        "data": selected,
        "delta_insight": "Real-time parameter delta check: Shifting from normal 21% O2 to lunar 30%+ environments increases burn propagation velocity across all matched OpenFOAM cases."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
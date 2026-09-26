"""
SuVithiMap - Simulation Control Routes
Exposes controls for the multi-bus simulation sandbox:
Start, Pause, Reset, Step, Scenario selector, Simulation speed.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.simulation import engine

router = APIRouter(prefix="/api/simulation", tags=["Fleet Simulation"])


class ScenarioRequest(BaseModel):
    scenario: str  # normal | monsoon | rush_hour | hazard_surge


class SpeedRequest(BaseModel):
    speed: float  # 0.5, 1.0, 2.0, 5.0


@router.get("/state")
def get_simulation_state():
    return engine.get_state()


@router.post("/start")
def start_simulation():
    engine.start()
    return {"success": True, "state": engine.get_state()}


@router.post("/pause")
def pause_simulation():
    engine.pause()
    return {"success": True, "state": engine.get_state()}


@router.post("/reset")
def reset_simulation():
    engine.reset()
    return {"success": True, "state": engine.get_state()}


@router.post("/step")
def step_simulation():
    result = engine.step()
    return {"success": True, "step_result": result, "state": engine.get_state()}


@router.post("/scenario")
def set_scenario(req: ScenarioRequest):
    engine.set_scenario(req.scenario)
    return {"success": True, "scenario": engine.current_scenario, "state": engine.get_state()}


@router.post("/speed")
def set_speed(req: SpeedRequest):
    engine.set_speed(req.speed)
    return {"success": True, "speed": engine.speed_multiplier, "state": engine.get_state()}

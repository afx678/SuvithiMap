import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/telemetry"
    async with websockets.connect(uri) as ws:
        msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
        data = json.loads(msg)
        assert "buses" in data
        assert len(data["buses"]) == 10
        print(f"[PASS] WebSocket telemetry streaming active. Buses in stream: {len(data['buses'])}")

asyncio.run(test_ws())

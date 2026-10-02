"""Optional helper for the ZentixSoft OzCart QA assignment.

IMPORTANT:
- This script does NOT replace the required Postman work or screenshots.
- It is only a Python helper to execute the same API flow and save actual
  request/response data for reference.

Run:
    python python_api_helper.py

Requires:
    pip install requests
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import requests

BASE_URL = "https://petstore.swagger.io/v2"
OUTPUT = Path(__file__).with_name("python_api_results.json")
TIMEOUT = 30


def record(results: list[dict[str, Any]], name: str, method: str, url: str,
           body: Any, response: requests.Response) -> None:
    try:
        response_body: Any = response.json()
    except ValueError:
        response_body = response.text

    results.append({
        "name": name,
        "request": {
            "method": method,
            "url": url,
            "body": body,
        },
        "response": {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "body": response_body,
        },
    })


def main() -> None:
    results: list[dict[str, Any]] = []
    pet_id = int(time.time() * 1000)

    session = requests.Session()
    session.headers.update({
        "Accept": "application/json",
        "Content-Type": "application/json",
    })

    create_body = {
        "id": pet_id,
        "category": {"id": 1001, "name": "zentixsoft-category"},
        "name": "ZentixSoft Test Pet",
        "photoUrls": ["https://example.com/zentixsoft-pet.jpg"],
        "tags": [
            {"id": 1, "name": "qa"},
            {"id": 2, "name": "assignment"},
        ],
        "status": "available",
    }

    response = session.post(f"{BASE_URL}/pet", json=create_body, timeout=TIMEOUT)
    record(results, "Create Pet - valid", "POST", f"{BASE_URL}/pet", create_body, response)

    response = session.post(
        f"{BASE_URL}/pet",
        json={"id": pet_id, "status": "available"},
        timeout=TIMEOUT,
    )
    record(results, "Create Pet - missing required fields", "POST", f"{BASE_URL}/pet",
           {"id": pet_id, "status": "available"}, response)

    response = session.get(f"{BASE_URL}/pet/{pet_id}", timeout=TIMEOUT)
    record(results, "Retrieve Pet - valid", "GET", f"{BASE_URL}/pet/{pet_id}", None, response)

    response = session.get(f"{BASE_URL}/pet/999999999", timeout=TIMEOUT)
    record(results, "Retrieve Pet - nonexistent", "GET", f"{BASE_URL}/pet/999999999", None, response)

    update_body = {
        **create_body,
        "name": "ZentixSoft Updated Pet",
        "status": "sold",
    }
    response = session.put(f"{BASE_URL}/pet", json=update_body, timeout=TIMEOUT)
    record(results, "Update Pet - valid", "PUT", f"{BASE_URL}/pet", update_body, response)

    response = session.put(f"{BASE_URL}/pet", json={}, timeout=TIMEOUT)
    record(results, "Update Pet - empty body", "PUT", f"{BASE_URL}/pet", {}, response)

    response = session.get(f"{BASE_URL}/pet/findByStatus", params={"status": "available"}, timeout=TIMEOUT)
    record(results, "Find Pets - available", "GET",
           f"{BASE_URL}/pet/findByStatus?status=available", None, response)

    response = session.get(f"{BASE_URL}/pet/findByStatus", params={"status": "invalid-status"}, timeout=TIMEOUT)
    record(results, "Find Pets - invalid status", "GET",
           f"{BASE_URL}/pet/findByStatus?status=invalid-status", None, response)

    response = session.delete(f"{BASE_URL}/pet/{pet_id}", timeout=TIMEOUT)
    record(results, "Delete Pet - valid", "DELETE", f"{BASE_URL}/pet/{pet_id}", None, response)

    response = session.get(f"{BASE_URL}/pet/{pet_id}", timeout=TIMEOUT)
    record(results, "Verify deleted Pet", "GET", f"{BASE_URL}/pet/{pet_id}", None, response)

    OUTPUT.write_text(json.dumps({
        "pet_id": pet_id,
        "results": results,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Saved API results to: {OUTPUT}")
    print(f"petId used: {pet_id}")
    for item in results:
        print(f"{item['name']}: HTTP {item['response']['status_code']}")


if __name__ == "__main__":
    main()

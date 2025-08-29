# actions/utils.py
import json
from pathlib import Path
from typing import List, Dict, Optional

# pins storage inside the actions app folder
DATA_PATH = Path(__file__).resolve().parent / "data.json"

#calls to avoid FileNotFoundError if data.json doesn't exist, creates an empty list
def _ensure_file() --> None:
    """Create an empty JSON array file if missing."""
    if not DATA_PATH.exists():
        DATA_PATH.write_text("[]", encoding="utf-8")

#reads the entire file and returns a list of each dict which is 1 action
def read_actions() -> List[Dict]:
    """Return the full list of actions from disk."""
    _ensure_file()
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        #corrupted file; reset to empty array
        DATA_PATH.write_text("[]", encoding="utf-8")
        return []

#writes the whole list back to disk with pretty indentation
def write_actions(items: List[Dict]) -> None:
    """Persist the full list of actions to disk."""
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

#generates a new integer primary key so IDs are not reused
def next_id(items: List[Dict]) -> int:
    """Compute the next integer id."""
    if not items:
        return 1
    return max(int(x.get("id", 0)) for x in items) + 1

#linear search to find one item by id, time complexity is o(n)
def find_action(items: List[Dict], action_id: int) -> Optional[Dict]:
    """Find an action by id."""
    for item in items:
        if int(item.get("id")) == int(action_id):
            return item
    return None
from django.shortcuts import render
from typing import Any, Dict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ActionSerializer
from .utils import read_actions, write_actions, next_id, find_action
from datetime import date

def _to_storage(d: dict) -> dict:
    """Convert validated data into JSON-serializable storage form."""
    out = dict(d)
    if isinstance(out.get("date"), date):
        out["date"] = out["date"].isoformat()  # 'YYYY-MM-DD'
    return out

# maps HTTP methods to behavior and implements the exact endpoints
class ActionList(APIView):
    """
    GET /api/actions/ -> list all actions
    POST /api/actions/ -> create a new action
    """
    def get(self, request):
        """
        Reads the entire list from data.json via read_actions and returns is as a JSON

        Retrieves a list of all sustainability actions.
        """
        items = read_actions()
        return Response(items, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        Validates body with ActionSerializer and appends to in-memory list

        Add a new sustainability action
        """
        serializer = ActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        items = read_actions()
        payload = _to_storage(serializer.validated_data)
        payload['id'] = next_id(items)
        items.append(payload)
        write_actions(items)
        return Response(payload, status=status.HTTP_201_CREATED)

class ActionDetail(APIView):
    """
    PUT/PATCH/DELETE /api/actions/<id>/
    """
    
    def get_object(self, action_id: int):
        """
        Returns a single record of 404 if it doesn't exist
        """
        items = read_actions()
        item = find_action(items, action_id)
        return items, item
    
    def get(self, request, action_id: int):
        """
        Returns a single record or 404 if it doesn't exist
        """
        items, item = self.get_object(action_id)
        if item is None:
            return Response({"detail": "Not found."}, status = status.HTTP_404_NOT_FOUND)
        return Response(item, status=status.HTTP_200_OK)

    def put(self, request, action_id: int):
        """
        Client must send all fields except id
        """
        items, item = self.get_object(action_id)
        if item is None:
            return Response({"detail": "Not Found."}, status=status.HTTP_404_NOT_FOUND)
        
        # full update requires all fields
        serializer = ActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # replace fields but keep id
        idx = items.index(item)
        new_item = _to_storage(serializer.validated_data)
        new_item["id"] = item["id"]
        items[idx] = new_item
        write_actions(items)
        return Response(new_item, status=status.HTTP_200_OK)

    def patch(self, request, action_id: int):
        """
        Only changed fields are required we merge into original item and write back
        """
        items, item = self.get_object(action_id)
        if item is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActionSerializer(item, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        idx = items.index(item)
        updated = dict(item)
        changes = _to_storage(serializer.validated_data)
        updated.update(changes)
        items[idx] = updated
        write_actions(items)
        return Response(updated, status=status.HTTP_200_OK)

    def delete(self, request, action_id: int):
        """
        Removes the items and saves
        """
        items, item = self.get_object(action_id)
        if item is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        items.remove(item)
        write_actions(items)
        return Response(status=status.HTTP_204_NO_CONTENT)


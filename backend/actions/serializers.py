from rest_framework import serializers
# validate and normalize incoming JSON so the API can safely read/write the JSON file with the exact fields required, using serializer because it gives explicit field definitions and validation without tying us to the ORM
class ActionSerializer(serializers.Serializer):
    """
    Serializer for a single sustainability action.

    Fields
    -------
    id : int (read-only)
        Server-assigned primary key. Not accepted on create/update.
    action : str (max length 255, required)
        Readable description of the action (e.g., "Recycling").
    date : date (required)
        Action date in ISO-8601 format YYYY-MM-DD.
    points : int (required, >= 0)
        Non-negative integer score for the action.

    Validation
    ----------
    - `action` is required and must be <= 255 characters.
    - `date` must parse as a valid ISO date; invalid formats raise a 400 with a DRF error.
    - `points` must be an integer and >= 0 (enforced by `validate_points`).

    Usage
    -----
    >>> s = ActionSerializer(data={"action": "Recycling", "date": "2025-01-08", "points": 25})
    >>> s.is_valid()
    True
    >>> s.validated_data
    {'action': 'Recycling', 'date': datetime.date(2025, 1, 8), 'points': 25}

    Notes
    -----
    - The view sets `id` after validation (read-only on the API).
    - When writing to a JSON file, convert `validated_data["date"]` to a string
      (e.g., `date.isoformat()`) before `json.dump`, since `datetime.date` is
      not JSON-serializable by default.
    """

    id = serializers.IntegerField(read_only=True)
    action = serializers.CharField(max_length=255)
    date = serializers.DateField()
    points = serializers.IntegerField()

    def validate_points(self, value: int) -> int:
        """
        Ensure `points` in a non-negative integer.

        Args:
            value: The candidate points value from the request payload.

        Returns:
            serializers.ValidationError: If `value` is negative.
        """      
        if value < 0:
            raise serializers.ValidationError("points must be >= 0")
        return value

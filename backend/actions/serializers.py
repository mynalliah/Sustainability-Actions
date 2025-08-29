from rest_framework import serializers
# validate and normalize incoming JSON so the API can safely read/write the JSON file with the exact fields required, using serializer because it
# gives explicit field definitions and validation without tying us to the ORM
class ActionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    action = serializers.CharField(max_length=255)
    date = serializers.DateField()
    points = serializers.IntegerField()

    def validate_points(self, value: int) -> int:
        if value < 0:
            raise serializers.ValidationError("points must be >= 0")
        return value
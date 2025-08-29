from django.test import TestCase

# Create your tests here.
from .serializers import ActionSerializer

class ActionSerializerTest(TestCase):
    def test_valid_payload(self):
        s = ActionSerializer(data={"action": "Recycling", "date": "2025-01-08", "points": 25})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["points"], 25)

    def test_points_negative(self):
        s = ActionSerializer(data={"action": "Recycling", "date": "2025-01-08", "points": -1})
        self.assertFalse(s.is_valid())
        self.assertIn("points", s.errors)

    def test_action_too_long(self):
        s = ActionSerializer(data={"action": "x" * 256, "date": "2025-01-08", "points": 1})
        self.assertFalse(s.is_valid())
        self.assertIn("action", s.errors)

    def test_bad_date(self):
        s = ActionSerializer(data={"action": "Recycling", "date": "2025-13-40", "points": 1})
        self.assertFalse(s.is_valid())
        self.assertIn("date", s.errors)


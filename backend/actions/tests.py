from django.test import TestCase

# Create your tests here.
# actions/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .utils import write_actions

class ActionsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Reset data file to a known state
        write_actions([])

    def test_create_and_list(self):
        resp = self.client.post(
            reverse("action-list"),
            {"action": "Recycling", "date": "2025-01-08", "points": 25},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        created = resp.json()
        self.assertIn("id", created)

        resp2 = self.client.get(reverse("action-list"))
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(len(resp2.json()), 1)

    def test_put_patch_delete(self):
        # create
        r = self.client.post(
            reverse("action-list"),
            {"action": "Composting", "date": "2025-01-09", "points": 10},
            format="json",
        )
        item_id = r.json()["id"]

        # put
        r2 = self.client.put(
            reverse("action-detail", args=[item_id]),
            {"action": "Composting", "date": "2025-01-10", "points": 20},
            format="json",
        )
        self.assertEqual(r2.status_code, 200)

        # patch
        r3 = self.client.patch(
            reverse("action-detail", args=[item_id]),
            {"points": 30},
            format="json",
        )
        self.assertEqual(r3.status_code, 200)
        self.assertEqual(r3.json()["points"], 30)

        # delete
        r4 = self.client.delete(reverse("action-detail", args=[item_id]))
        self.assertEqual(r4.status_code, 204)
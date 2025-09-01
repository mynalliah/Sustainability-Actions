from django.test import TestCase

# actions/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .utils import write_actions
from rest_framework import status


class ActionsAPITest(TestCase):
    # Reset data file to a known state
    """End-to-end API tests for the file-backed Actions endpoints."""
    def setUp(self):
        """
        Sets a clean environment for every test. Resets the JSON data store to an empty list so tests don't leak state.
        """
        self.client = APIClient()
        write_actions([])

    def test_create_and_list(self):
        """Create a single action, then list all actions.

        Verifies:
        - POST /api/actions/ returns 201 and includes a server-assigned `id`.
        - GET /api/actions/ returns a collection with exactly one item.
        """
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
        """Create → PUT (full update) → PATCH (partial update) → DELETE.

        - POST creates an item and we capture its `id`.
        - PUT replaces the resource (200 OK).
        - PATCH updates a subset of fields (points -> 30) and returns 200 with new value.
        - DELETE removes the item and returns 204 (No Content).
        """
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

    def test_delete_twice_and_edit_deleted_item(self):
        """Deleting an item twice should return 404 on the second delete;
        editing (PUT/PATCH) a deleted item should also return 404."""
        # Create an item
        r = self.client.post(
            reverse("action-list"),
            {"action": "Bike to work", "date": "2025-02-01", "points": 5},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        item_id = r.json()["id"]

        # First delete succeeds
        d1 = self.client.delete(reverse("action-detail", args=[item_id]))
        self.assertEqual(d1.status_code, status.HTTP_204_NO_CONTENT)

        # Second delete -> 404
        d2 = self.client.delete(reverse("action-detail", args=[item_id]))
        self.assertEqual(d2.status_code, status.HTTP_404_NOT_FOUND)

        # PUT on deleted -> 404
        put = self.client.put(
            reverse("action-detail", args=[item_id]),
            {"action": "Bike to work", "date": "2025-02-02", "points": 8},
            format="json",
        )
        self.assertEqual(put.status_code, status.HTTP_404_NOT_FOUND)

        # PATCH on deleted -> 404
        patch = self.client.patch(
            reverse("action-detail", args=[item_id]),
            {"points": 9},
            format="json",
        )
        self.assertEqual(patch.status_code, status.HTTP_404_NOT_FOUND)


    def test_validation_rejects_empty_action_incomplete_date_negative_points(self):
        """Server-side validation:
        - empty action string rejected
        - incomplete/malformed date rejected
        - negative points rejected
        """
        # Empty action (after trim this should be blank) -> 400
        r1 = self.client.post(
            reverse("action-list"),
            {"action": "   ", "date": "2025-03-01", "points": 1},
            format="json",
        )
        self.assertEqual(r1.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("action", r1.json())

        # Incomplete date (YYYY-MM only) -> 400
        r2 = self.client.post(
            reverse("action-list"),
            {"action": "Plant a tree", "date": "2025-03", "points": 10},
            format="json",
        )
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", r2.json())

        # Negative points -> 400
        r3 = self.client.post(
            reverse("action-list"),
            {"action": "Reusable bag", "date": "2025-03-02", "points": -1},
            format="json",
        )
        self.assertEqual(r3.status_code, status.HTTP_400_BAD_REQUEST)
        body = r3.json()
        self.assertIn("points", body)
        # If your serializer uses the custom message:
        # self.assertIn("points must be >= 0", body["points"][0])

    def test_post_empty_payload_returns_field_errors(self):
        """Posting empty data returns 400 with required-field errors for action/date/points."""
        r = self.client.post(reverse("action-list"), {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        errors = r.json()
        # All required fields should be present in error response
        self.assertIn("action", errors)
        self.assertIn("date", errors)
        self.assertIn("points", errors)

    def test_list_returns_empty_when_no_data(self):
        """GET list should return an empty array when the data file is empty."""
        r = self.client.get(reverse("action-list"))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.json(), [])

        
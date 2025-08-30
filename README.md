# Sustainability-Actions
## Backend (Django + DRF)

### Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver
API
* GET /api/actions/
* POST /api/actions/ body: { "action": "Recycling", "date": "2025-01-08", "points": 25 }
* PUT /api/actions/<id>/
* PATCH /api/actions/<id>/
* DELETE /api/actions/<id>/


## Postman
Import `postman/SustainabilityActions.postman_collection.json` and
(optional) `postman/Local.postman_environment.json` into Postman.
Select the `local` environment (base_url = http://127.0.0.1:8000) and run the
requests top-to-bottom.
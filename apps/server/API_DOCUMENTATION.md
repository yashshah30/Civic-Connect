# Civic Connect API Documentation

## Authentication

### POST /api/auth/signup
Registers a new citizen.

Body:
{
  "name": "",
  "mobile": "",
  "email": "",
  "password": "",
  "address": ""
}

---

### POST /api/auth/login

Body:
{
  "mobile": "",
  "password": ""
}

---

## Complaints

### GET /api/complaints

Returns all complaints.

---

### POST /api/complaints

Body:
{
  "title": "",
  "description": "",
  "category": "",
  "latitude": "",
  "longitude": ""
}

---

### GET /api/complaints/:id

Returns a single complaint.

---

### PATCH /api/complaints/:id

Updates a complaint.

---

### DELETE /api/complaints/:id

Deletes a complaint.
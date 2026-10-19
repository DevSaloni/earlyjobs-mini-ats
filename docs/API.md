# EarlyJobs ATS — REST API Documentation

Base URL: `/api`

All responses follow standard HTTP status codes and return JSON payloads.

---

## 1. System Health & Diagnostics

### `GET /api/health`
Returns server operational health, uptime, and database connection status.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-18T21:00:00.000Z",
  "uptime": "124s",
  "database": {
    "connected": true,
    "readyState": 1,
    "readyStateText": "Connected",
    "uriConfigured": true,
    "error": null,
    "activeEngine": "MongoDB Atlas (Mongoose)"
  },
  "service": "EarlyJobs ATS Mini API",
  "version": "1.0.0"
}
```

---

## 2. Dashboard Analytics

### `GET /api/dashboard/stats`
Calculates aggregated recruiter KPIs, stage counts, 7-day inflows, and recent applicant lists directly from database records.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 10,
    "newApplicantsLast7Days": 9,
    "stageCounts": {
      "Applied": 2,
      "Screening": 2,
      "Interview": 3,
      "Offer": 1,
      "Hired": 1,
      "Rejected": 1
    },
    "dailyApplicationsLast7Days": [
      { "date": "2026-10-12", "label": "Mon, Oct 12", "count": 1 },
      { "date": "2026-10-13", "label": "Tue, Oct 13", "count": 2 }
    ],
    "recentApplicants": [ ... ]
  }
}
```

---

## 3. Candidates

### `GET /api/candidates`
Query candidate records with search, filter, sort, and pagination.

**Query Parameters:**
- `search` (string, optional): Search keyword matched against `name`, `email`, and `jobTitle`.
- `stage` (string, optional): One of `Applied`, `Screening`, `Interview`, `Offer`, `Hired`, `Rejected`.
- `jobTitle` (string, optional): Filter by exact job position.
- `sortBy` (string, optional): Default `appliedAt`. Other values: `experience`, `name`.
- `sortOrder` (string, optional): `asc` or `desc` (default `desc`).
- `page` (number, optional): Page number (default `1`).
- `limit` (number, optional): Records per page (default `50`).

**Response `200 OK`:**
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "6714...78a",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.test",
      "phone": "+91 98765 43210",
      "jobTitle": "Full Stack Developer Intern",
      "experience": 1,
      "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
      "resumeUrl": "https://example.test/resumes/aarav.pdf",
      "stage": "Interview",
      "appliedAt": "2026-10-13T17:14:00.000Z",
      "notes": "Strong understanding of MERN stack.",
      "stageHistory": [
        { "stage": "Applied", "timestamp": "2026-10-13T17:14:00.000Z", "notes": "Application submitted" },
        { "stage": "Screening", "timestamp": "2026-10-15T19:14:00.000Z", "notes": "HR screening call" },
        { "stage": "Interview", "timestamp": "2026-10-17T20:14:00.000Z", "notes": "Technical round" }
      ]
    }
  ]
}
```

### `GET /api/candidates/:id`
Retrieves a single candidate profile.

**Response `200 OK` or `404 Not Found`**

### `POST /api/candidates`
Creates a new candidate in the ATS.

**Request Body:**
```json
{
  "name": "Rohan Patel",
  "email": "rohan.patel@example.test",
  "phone": "+91 98765 00000",
  "jobTitle": "Frontend Engineer",
  "experience": 2,
  "skills": ["React", "TypeScript", "Tailwind CSS"],
  "resumeUrl": "https://example.test/rohan-cv.pdf",
  "stage": "Applied",
  "notes": "Portfolio shows great responsive UI projects."
}
```

**Response `201 Created`** or `400 Bad Request` (Validation error) or `409 Conflict` (Duplicate email).

### `PUT /api/candidates/:id`
Updates candidate information. If the stage is modified, it automatically appends a record to `stageHistory`.

**Response `200 OK`** or `404 Not Found`.

### `PATCH /api/candidates/:id/stage`
Dedicated stage transition endpoint for Kanban drag-and-drop and fast stage updates.

**Request Body:**
```json
{
  "stage": "Interview",
  "notes": "Moved to Interview after technical screening"
}
```

**Response `200 OK`**

### `DELETE /api/candidates/:id`
Deletes candidate record.

**Response `200 OK`**

---

## 4. Jobs

### `GET /api/jobs`
Returns all distinct active job titles.

**Response `200 OK`:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    "Backend Engineer",
    "DevOps Engineer",
    "Frontend Engineer",
    "Full Stack Developer Intern",
    "Product Designer"
  ]
}
```

---

## 5. Demo Seeding

### `POST /api/seed`
Idempotent or forced seeding of 10 fictional candidate records.

**Query Parameter:**
- `reset=true` (optional): Clears current collection before seeding.

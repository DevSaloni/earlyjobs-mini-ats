# EarlyJobs ATS — Mini Applicant Tracking System

A full-stack Mini Applicant Tracking System (ATS) for recruiters to manage candidate pipelines, evaluate applicant profiles, and monitor recruitment analytics. Built as a technical assignment for the Full Stack Developer Intern position at EarlyJobs.ai.

---

## Key Features

- **Recruiter Dashboard**: Displays dynamic KPI metrics (Total Candidates, Applied, In Interview, Offers, Hired, Rejected) computed directly from candidate records. Includes a 6-stage pipeline distribution chart (Recharts), a 7-day inbound application inflow chart, and a recent applicants table.
- **Candidate Directory**: Tabular candidate overview with name, contact email, job role, years of experience, hiring stage, and application date. Supports full-text search, stage filtering, job role filtering, date sorting, and pagination.
- **Add & Edit Candidate Modal**: Validated form with inline error messaging (Zod on backend) covering full name, email (with duplicate detection), phone, job title, experience, skills, resume link, stage, and recruiter notes.
- **Candidate Profile Drawer**: Slide-over drawer with applicant contact details, resume link, tech stack tags, evaluation notes, and a timestamped stage transition audit timeline.
- **Hiring Pipeline (Kanban)**: Six-stage recruitment board (Applied, Screening, Interview, Offer, Hired, Rejected) with drag-and-drop interaction, in-card stage dropdown selector, in-pipeline search, and role filtering. Updates persist to MongoDB via REST API.
- **Delete Confirmation**: Modal dialog requiring explicit confirmation before removing applicant records.
- **Responsive Interface**: Desktop tabular views convert to structured cards on mobile screens; the Kanban board provides smooth horizontal scrolling and mobile stage tabs.

---

## Technology Stack

- **Frontend**: React 19, Vite, React Router v7
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Charts**: Recharts
- **HTTP Client & Notifications**: Axios, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Validation**: Zod
- **Language**: TypeScript across both client and server

---

## Project Structure

```
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore configuration
├── index.html                       # HTML application entry point
├── metadata.json                    # Application metadata
├── package.json                     # Project scripts and dependencies
├── README.md                        # Project documentation
├── server.ts                        # Express server entry point with Vite middleware
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration
│
├── docs/
│   └── API.md                       # Complete REST API reference documentation
│
├── server/                          # Backend source code
│   ├── config/
│   │   └── db.ts                    # MongoDB connection manager and fallback store
│   ├── controllers/
│   │   ├── candidateController.ts   # Candidate CRUD, search, filter, and pagination
│   │   ├── dashboardController.ts   # Live recruitment statistics aggregation
│   │   └── jobController.ts         # Distinct job positions query
│   ├── models/
│   │   └── Candidate.ts             # Mongoose schema, validation, and indexes
│   ├── routes/
│   │   └── api.ts                   # Express REST endpoints
│   ├── validation/
│   │   └── candidateValidation.ts   # Zod request validation schemas
│   ├── seed.ts                      # Standalone database seed CLI script
│   ├── seedData.ts                  # Fictional seed dataset (10 candidates)
│   └── types.ts                     # Backend TypeScript interfaces
│
└── src/                             # Frontend React source code
    ├── api/
    │   ├── candidateApi.ts          # Candidate CRUD API client functions
    │   ├── client.ts                # Axios instance configuration and error interceptors
    │   └── dashboardApi.ts          # Dashboard metrics API client
    ├── assets/
    │   └── images/                  # Static image assets
    ├── components/
    │   ├── candidates/              # Candidate table, cards, filter bar, modals, drawer
    │   ├── common/                  # Loading skeleton, empty state, error state
    │   ├── dashboard/               # Metric cards, pipeline chart, activity chart
    │   ├── layout/                  # Sidebar navigation, top header, layout shell
    │   └── pipeline/                # Kanban board and card components
    ├── pages/
    │   ├── CandidatesPage.tsx       # Candidate directory and search/filter page
    │   ├── DashboardPage.tsx        # Recruiter overview and metrics page
    │   └── PipelinePage.tsx         # Kanban hiring pipeline page
    ├── types/
    │   └── candidate.ts             # Frontend TypeScript interfaces
    ├── utils/
    │   └── formatters.ts            # Date, stage style, and initial helpers
    ├── App.tsx                      # Client-side router and route definitions
    ├── index.css                    # Tailwind CSS imports and base styles
    └── main.tsx                     # React DOM entry point
```

---

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm (version 9 or higher)
- A MongoDB Atlas cluster (or a local MongoDB instance)

---

## Environment Configuration

Create a `.env` file in the root directory using `.env.example` as a template:

```bash
# Server port (defaults to 3000)
PORT=3000

# MongoDB connection string
# Obtain from MongoDB Atlas: Database -> Connect -> Drivers (Node.js)
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/earlyjobs_ats?retryWrites=true&w=majority"
```

*Note: In development, if `MONGODB_URI` is not configured, the server operates using a local fallback repository seeded with demo candidates so all features can be evaluated without immediate database provisioning.*

---

## Installation & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Seed demo candidates (optional)**:
   ```bash
   npm run seed
   ```
   *Seeds 10 fictional candidates across different stages and job roles using reserved `@example.test` email addresses.*

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The Express server boots on `http://localhost:3000` and automatically attaches Vite development middleware. Both the API and the React frontend run from this single command.

---

## Available API Endpoints

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, uptime, and database connection status |
| `GET` | `/api/candidates` | List candidates with query parameters (`search`, `stage`, `jobTitle`, `sortBy`, `sortOrder`, `page`, `limit`) |
| `GET` | `/api/candidates/:id` | Get single candidate by ID |
| `POST` | `/api/candidates` | Create candidate (validates required fields, rejects duplicates) |
| `PUT` | `/api/candidates/:id` | Update candidate details and record stage changes |
| `PATCH` | `/api/candidates/:id/stage` | Transition candidate hiring stage and append to audit history |
| `DELETE` | `/api/candidates/:id` | Delete candidate record |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard metrics, stage counts, and 7-day inflows |
| `GET` | `/api/jobs` | Retrieve distinct job positions |
| `POST` | `/api/seed` | Seed or reset demo candidate records (`?reset=true`) |

Detailed request/response payloads are documented in `docs/API.md`.

---

## Production Build & Deployment

1. **Typecheck**:
   ```bash
   npm run lint
   ```

2. **Build the production client bundle**:
   ```bash
   npm run build
   ```
   Compiles static assets into the `dist/` directory.

3. **Start the production server**:
   ```bash
   npm start
   ```
   Runs `server.ts`, which serves the production build from `dist/` and routes API requests to the Express endpoints.

# AutoApply AI

An automated job application and outreach management platform built on the Full stack. It streamlines candidate outreach with AI-generated emails, role-specific resume management, HR contact tracking, and an application pipeline CRM.

---

## Features

- **Resume Management & Builder**: Create, version, and manage role-specific resumes with a live preview builder and automated PDF export.
- **HR & Recruiter Directory**: Manage company recruiter contacts with single entry and bulk import options.
- **AI Cold Outreach Generator**: Generate personalized, job-specific outreach emails using OpenAI or Gemini models, supported by custom templates.
- **Application Pipeline (CRM)**: Track the status of job applications across stages (`DRAFT`, `SENT`, `FOLLOW_UP_DUE`, `REPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`).
- **One-Click Follow-Up**: Dispatch personalized follow-up emails with attached resumes directly from the tracker.
- **Email Delivery Integration**: Supports SMTP (e.g., Gmail App Passwords), Resend, and local mock testing mode.
- **Analytics Dashboard**: Overview of response rates, interview conversion metrics, and 7-day outreach activity trends.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Axios, React Router Dom
- **Backend**: Node.js, Express.js (ES Modules), Mongoose, Nodemailer, PDFKit, JWT, bcryptjs
- **Database**: MongoDB (Local or MongoDB Atlas)
- **AI Providers**: OpenAI API, Google Gemini API

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas URI)

### Installation

1. Clone the repository and install root dependencies:
   ```bash
   git clone <repository-url>
   cd <Folder-Name>
   npm install
   ```

2. Install dependencies for both client and server:
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/job_automation
   JWT_SECRET=your_jwt_secret_key

   # AI Configuration (OpenAI / Gemini)
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # Email Configuration (smtp / resend / mock)
   EMAIL_PROVIDER=smtp
   EMAIL_FROM=Your Name <your_email@example.com>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_SECURE=false
   ```

### Running the Application

From the project root:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new candidate user |
| POST | `/api/auth/login` | Authenticate user and receive JWT |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/profile` | Update profile and credentials |
| GET | `/api/resumes` | List saved resumes |
| POST | `/api/resumes/upload` | Upload a PDF resume |
| POST | `/api/resumes/builder` | Save structured resume and compile PDF |
| GET | `/api/resumes/:id/download` | Download resume PDF |
| GET | `/api/contacts` | List recruiter contacts |
| POST | `/api/contacts` | Add recruiter contact |
| POST | `/api/contacts/bulk` | Bulk import recruiter contacts |
| POST | `/api/ai/generate-email` | Generate personalized outreach email |
| POST | `/api/applications/send-batch` | Dispatch application emails with resume attached |
| PATCH | `/api/applications/:id/status` | Update application status |
| POST | `/api/applications/:id/follow-up` | Send follow-up email |
| GET | `/api/dashboard/summary` | Get analytics and outreach statistics |

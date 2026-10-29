# InterviewAI — Full-Stack AI Interview Preparation Platform

An end-to-end, production-oriented AI Interview Preparation Platform that provides tailored mock interviews, real-time voice and text evaluations, resume-aware question generation, in-depth rubric scoring, and historical skill analytics.

Designed to faithfully reproduce the modern SaaS dashboard interface with pixel-conscious layout, generous spacing, subtle cards, and interactive visualizations.

---

## 1. Project Overview

**InterviewAI** is built to bridge the gap between passive resume writing and active technical/behavioral interview performance. Candidates can upload their real resumes (PDF or DOCX), receive structured AI extraction of their projects and skills, configure custom or role-based interview simulations, answer via text or browser voice recognition, and obtain immediate actionable feedback across objective rubrics.

---

## 2. Key Features

- **Pixel-Conscious SaaS Dashboard**: Recreates the reference InterviewAI dashboard with purple/indigo welcome banner, 4 core stat cards, recent interviews table, skill breakdown donut & progress charts, recommended practice modules, and top skills progress bars.
- **Resume Processing & ATS Extraction**: Parses PDF & DOCX resumes server-side using `pdf-parse` and `mammoth`, extracts tech stack, career progression, and strengths/gaps with AI, and stores authenticated files via Cloudinary.
- **Configurable Mock Interviews**: Select target role, difficulty (Easy, Medium, Hard), duration (15–60 mins), question counts (5–20), category (Technical, HR, Behavioral, System Design, Coding, Mixed), and answer mode (Text or Voice).
- **Voice & Speech Support**: Native browser Speech Recognition for dictation and Speech Synthesis for speaking interview questions aloud, with seamless text fallbacks for universal browser support.
- **Category-Specific Rubric Engine**: Answers are evaluated against distinct rubrics:
  - *Technical*: Correctness, conceptual depth, trade-off clarity.
  - *Behavioral*: STAR method (Situation, Task, Action, Result) structure and reflection.
  - *System Design*: Architectural soundness, scalability, data modeling, trade-offs.
  - *Coding*: Algorithmic approach, edge cases, complexity analysis.
- **Comprehensive Reports**: Question-by-question scoring, user answer review, model answers, identified gaps, and study recommendations.
- **Analytics & History**: MongoDB aggregations for score progression over time, category-specific averages, and skill mastery trends.
- **Enterprise-Grade Security**: JWT authentication in secure HttpOnly cookies, bcrypt hashing (cost factor 12), Helmet security headers, rate limiting, MongoDB sanitization, and IDOR protection.

---

## 3. Technology Stack

### Frontend
- **React.js 18** & **Vite**
- **Tailwind CSS** with custom design tokens
- **Lucide React** icons
- **Recharts** (Donut Charts, Area Progress Charts, Bar Charts)
- **React Router DOM 6**
- **Axios** (centralized API client with interceptors)
- **Framer Motion**

### Backend
- **Node.js** & **Express.js** (REST API architecture)
- **Mongoose** & **MongoDB Atlas**
- **JWT (JSON Web Tokens)** & **bcryptjs**
- **Google Generative AI SDK (`@google/generative-ai`)** / **OpenAI SDK**
- **Multer** & **Cloudinary**
- **pdf-parse** & **mammoth** (PDF/DOCX text extraction)
- **Zod** (Schema validation of AI outputs)
- **Helmet**, **express-rate-limit**, **cookie-parser**, **cors**, **express-mongo-sanitize**

---

## 4. Architecture

```
                       ┌─────────────────────────┐
                       │   React + Vite Client   │
                       │   (Tailwind CSS + UI)   │
                       └────────────┬────────────┘
                                    │ HttpOnly Cookie + REST
                                    ▼
                       ┌─────────────────────────┐
                       │   Express.js Backend    │
                       │    (Security + API)     │
                       └─────┬───────────┬───────┘
                             │           │
                 Mongoose ORM│           │ AI Abstraction Layer
                             ▼           ▼
                   ┌──────────────┐   ┌───────────────────────────┐
                   │MongoDB Atlas │   │  Gemini / OpenAI API      │
                   └──────────────┘   └───────────────────────────┘
```

---

## 5. Folder Structure

```
ACADEMIC PROJECT/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js               # Express application configuration & security
│       ├── server.js            # Server entry point & graceful shutdown
│       ├── config/
│       │   ├── db.js            # MongoDB Mongoose connection
│       │   ├── aiProvider.js    # AI provider abstraction (Gemini / OpenAI)
│       │   ├── cloudinary.js    # Cloudinary integration & fallback
│       │   └── validateEnv.js   # Environment variable validation
│       ├── controllers/         # Thin request handlers
│       ├── middleware/          # Auth, authorization, validation, rateLimiters
│       ├── models/              # User, Resume, Interview, Question, Answer, Report, Notification
│       ├── routes/              # Express API route modules
│       ├── services/            # Core business logic, AI calls, parsing, analytics
│       └── __tests__/           # Unit and integration tests
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx              # Client router with public & protected routes
│   │   ├── main.jsx
│   │   ├── index.css            # Design tokens & component classes
│   │   ├── api/                 # Centralized Axios client and domain API modules
│   │   ├── context/             # AuthContext and NotificationContext
│   │   ├── components/
│   │   │   ├── common/          # Sidebar, Navbar, ProtectedRoute, DashboardLayout
│   │   │   └── dashboard/       # WelcomeBanner, StatCards, RecentInterviews, SkillBreakdown, etc.
│   │   └── pages/               # Landing, Login, Register, Dashboard, Resumes, Interview, Report, etc.
└── README.md
```

---

## 6. Prerequisites

- **Node.js**: v18.0.0 or later (tested on v20+ and v25.x)
- **npm**: v9.0.0 or later
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas cluster
- **AI API Key** *(Optional for basic exploration, required for live AI generation)*: Google Gemini API key or OpenAI API key.

---

## 7. Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd "ACADEMIC PROJECT"
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 8. Frontend Setup

1. Check or create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`.

---

## 9. Backend Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Fill in your database and environment settings in `backend/.env`.

---

## 10. MongoDB Atlas Configuration

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for cloud deployment).
4. Copy the connection string into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interviewai?retryWrites=true&w=majority
   ```

---

## 11. AI Provider Configuration

InterviewAI features a modular provider abstraction supporting both Google Gemini and OpenAI:

### Using Google Gemini (Default)
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```
Get a key from [Google AI Studio](https://aistudio.google.com/).

### Using OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key_here
```

---

## 12. Cloudinary Configuration

For cloud storage of PDF/DOCX resumes:
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. In `backend/.env`, set:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
*Note: If unconfigured, the system automatically runs in local parsing mode without failing.*

---

## 13. Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `NODE_ENV` | Environment mode (`development`/`production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/interviewai` |
| `JWT_SECRET` | Secret key for signing session tokens | Required |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `AI_PROVIDER` | `gemini` or `openai` | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |

---

## 14. Running the Project Locally

### Option A: Running Frontend and Backend in Separate Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# or npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 15. API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /register`: Create a new user account with hashed password.
- `POST /login`: Authenticate and set HttpOnly session cookie.
- `POST /logout`: Invalidate session cookie.
- `GET /me`: Return currently authenticated user profile.
- `POST /forgot-password`: Generate single-use expiring reset token.
- `POST /reset-password`: Reset password using verified token.
- `POST /change-password`: Update password for logged-in user.

### Resumes (`/api/resumes`)
- `POST /upload`: Upload PDF/DOCX, parse text, and trigger background AI analysis.
- `GET /`: List all uploaded resumes for candidate.
- `GET /:id/analysis`: Retrieve parsed skills, strengths, gaps, and roles.
- `POST /:id/analyze`: Re-trigger AI analysis.
- `PATCH /:id/activate`: Designate active resume for interview context.
- `DELETE /:id`: Delete resume document and Cloudinary asset.

### Interviews (`/api/interviews`)
- `POST /`: Initialize a new interview session.
- `GET /`: Search, filter, and paginate previous interviews.
- `GET /:id`: Get interview details and question list.
- `POST /:id/start`: Generate AI questions and start session.
- `POST /:id/next-question`: Move to subsequent question.
- `POST /:id/answers`: Idempotent answer submission.
- `POST /:id/complete`: Complete interview and generate report.
- `POST /:id/retry`: Clone configuration into a new session.
- `GET /:id/report`: Fetch completed report for interview.

### Analytics (`/api/analytics`)
- `GET /overview`: Total interviews, average score, practice hours, and improvement.
- `GET /score-trends`: Aggregated score progression over 1M, 3M, or 6M.
- `GET /skill-breakdown`: Competency percentages (Technical, Problem Solving, Communication, Confidence).
- `GET /category-performance`: Average scores grouped by interview type.
- `GET /recommendations`: Personalized practice recommendations.

---

## 16. Testing Instructions

Run backend tests using Jest & Supertest:
```bash
cd backend
npm test
```

Test coverage includes:
- Account registration & input validation
- Duplicate account prevention
- Password format enforcement
- Session login & authentication rejection
- Health endpoint status verification

---

## 17. Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, import the `frontend/` directory.
3. Set Environment Variable:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://interviewai-api.onrender.com`).
4. Build command: `npm run build`, Output directory: `dist`.

### Backend (Render)
1. In Render, create a **Web Service** connected to your repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `AI_PROVIDER`, etc.).

---

## 18. Troubleshooting

- **CORS Errors**: Ensure `CLIENT_URL` in `backend/.env` exactly matches your frontend URL (e.g. `http://localhost:5173`).
- **AI Questions Not Generating**: Verify that `GEMINI_API_KEY` or `OPENAI_API_KEY` is set in `backend/.env`. If unset, the backend will report that the AI provider is unconfigured.
- **Port 5000 in use**: Change `PORT=5001` in `backend/.env` and update `frontend/vite.config.js` proxy or `VITE_API_URL`.

---

## 19. Security Considerations

- **HttpOnly Cookies**: Prevents client-side scripts from reading authentication tokens (mitigating XSS theft).
- **Password Security**: Passwords are salted and hashed using `bcrypt` with 12 rounds.
- **NoSQL Injection Prevention**: Requests are sanitized via `express-mongo-sanitize`.
- **Resource Ownership (IDOR Prevention)**: All database queries verify `userId === req.user._id`.
- **Prompt Injection Defense**: Resume text passed to AI models is bounded and wrapped with strict system directives preventing override of evaluation rubrics.

---

## 20. Known Limitations

- **Browser Speech Recognition**: Voice dictation relies on Web Speech API, natively supported in Chrome, Edge, and Safari. Browsers without speech recognition fall back seamlessly to text mode.
- **Payment Processing**: The Pro upgrade interface is configured for informational and tier limitation purposes. Live checkout requires connecting a Stripe or PayPal secret key.

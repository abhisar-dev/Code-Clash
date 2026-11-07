# CodeClash — Real-Time 1v1 Competitive Coding & Campus Placement Arena

<div align="center">
  <img src="public/codeclash-dashboard.png" alt="CodeClash Campus Platform — Real-Time 1v1 Coding Arena and Placement Leaderboard" width="100%" />
</div>

<div align="center">

[![Live Production](https://img.shields.io/badge/Vercel-Deployed_Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://codeclash-in.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E699?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

**CodeClash** is a full-stack, real-time 1v1 competitive coding platform built for **Invertis University** students to practice Data Structures & Algorithms under actual placement exam pressure. It matches students head-to-head in timed coding duels, executes submissions across 4 programming languages inside an isolated runner, and maintains campus-wide ELO ratings, streaks, and department leaderboards.

---

## 🌐 Live Production Deployment

| Portal / Route | Public URL | Description |
| :--- | :--- | :--- |
| **Live Web App & Dashboard** | [codeclash-in.vercel.app](https://codeclash-in.vercel.app) | Real-time student hub with contest feeds, quick matchmaking, and stats |
| **1v1 Battle Arena** | [codeclash-in.vercel.app](https://codeclash-in.vercel.app) *(1v1 Arena Tab)* | Split-screen Monaco editor with live opponent timer and testcase runner |
| **Placement Problem Bank** | [codeclash-in.vercel.app](https://codeclash-in.vercel.app) *(Problems Tab)* | 150+ categorized DSA challenges with hints, test cases, and company tags |
| **Campus ELO Leaderboard** | [codeclash-in.vercel.app](https://codeclash-in.vercel.app) *(Leaderboard Tab)* | Real-time department rankings across CSE, BCA, and MCA cohorts |
| **Admin Audit Terminal** | [codeclash-in.vercel.app/admin](https://codeclash-in.vercel.app/admin) | Real-time duel traffic telemetry, active room monitor, and system metrics |

---

## 💡 Why I Built This

Grinding LeetCode alone at 2 AM is fine for picking up algorithmic patterns, but it misses the actual reality of campus recruitment drives: tight clocks, adrenaline, competing against peers, and needing to write clean, working code without unlimited second chances.

At **Invertis University**, students across CSE, BCA, and MCA regularly prepare for technical screening rounds (TCS NQT, Infosys, Wipro, and product-tier startups), but previously had no common arena to test their speed against their actual classmates.

I built **CodeClash** to bridge that gap. Instead of passive problem-solving:
- Two students enter a duel room simultaneously.
- A 5-question contest or single problem duel begins with a synchronized countdown.
- Each coder writes, debugs, and runs code against automated test cases in real time.
- Opponent progress is broadcast live (test cases passed, submission status), creating healthy pressure.
- Matches dynamically recalculate campus ELO ratings and update departmental standing.

---

## ⚔️ The 1v1 Battle Arena

<div align="center">
  <img src="public/codeclash-arena.png" alt="CodeClash 1v1 Coding Arena — Monaco Editor, Split-Screen Problem View, and Live Test Runner" width="100%" />
</div>

The battle arena is built from the ground up for focused, distraction-free competitive coding:
- **Dual-Pane IDE Layout**: Left pane provides the full problem specification, examples, constraints, hints, and company tags. Right pane hosts a full-featured Monaco code editor.
- **Polyglot Execution**: Instant language toggling between **Python 3**, **C++ 17**, **Java 21**, and **JavaScript (Node.js)** with pre-populated boilerplate signatures.
- **Interactive Test Suite**: Run code against visible test cases (`Case 1`, `Case 2`, `Case 3`) with detailed stdout/stderr inspection, or hit **Submit** to evaluate against hidden edge cases.
- **Live Match Synchronization**: Shows the opponent's live solve count (`0/5`), connection status, and remaining time without revealing their code until match completion.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router (Client)                    │
│      Monaco Editor · Tailwind CSS v4 · Framer Motion · Dark/Light      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / SSE Streams
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Vercel Edge & Serverless Core                       │
│    /api/matchmaking  ·  /api/rooms  ·  /api/run-code  ·  /api/presence │
├───────────────────────────────────┬────────────────────────────────────┤
│       Duel State Synchronizer     │      Sandboxed Code Executor       │
│  - In-Memory LRU Cache            │  - Language Harness Injection      │
│  - Conflict-Free Atomic Updates   │  - Subprocess Spawn Isolation      │
│  - Presence & Disconnect Tracker  │  - 7s CPU Execution Timeout Gate   │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
┌─────────────────▼─────────────────┐   ┌──────────────▼─────────────────┐
│     Neon Serverless PostgreSQL    │   │      Language Execution VM     │
│   active_rooms · users · matches  │   │   Python · C++ · Java · Node   │
└───────────────────────────────────┘   └────────────────────────────────┘
```

---

## ⚡ Engineering Deep-Dive

### 1. Ephemeral Serverless State Synchronization
Deploying real-time multiplayer features on serverless infrastructure (Vercel) presents a classic challenge: serverless functions are stateless and do not share in-memory heap across execution instances.
- CodeClash implements a **hybrid state model**: an in-memory hot cache coupled with an atomic upsert layer backed by **Neon Serverless PostgreSQL**.
- Room state changes (code submissions, test case passes, timer updates) execute atomic queries:
  ```sql
  INSERT INTO active_rooms (id, data, updated_at) 
  VALUES ($1, $2, NOW())
  ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
  ```
- Lightweight heartbeat endpoints monitor client presence, cleanly handling sudden tab closes or network disconnects during an active duel.

### 2. Multi-Language Code Runner & Test Harness
Code submitted by students runs through an automated evaluation pipeline (`/api/run-code`):
- **Harness Generation**: User-written functions are wrapped inside an automated test harness (`wrapCodeWithTestRunner`) that injects structured test vectors, deserializes inputs, and captures standard output.
- **Resource Limits & Timeouts**: Subprocesses are spawned with strict 5–7 second timeout limits to guard against infinite loops and excessive resource consumption.
- **Input Sanitization**: Submissions pass through AST/pattern inspection to prevent access to unauthorized system binaries or unsafe process commands.

### 3. ELO Rating & Gamification Engine
Rating adjustments are calculated dynamically based on relative opponent skill:

$$\Delta R = K \times (S - E)$$

Where $E$ represents the expected match outcome and $K$ is tuned based on student placement tier:
- **Novice** ($< 1200$)
- **Specialist** ($1200 - 1499$)
- **Expert** ($1500 - 1799$)
- **Master** ($1800 - 2099$)
- **Grandmaster** ($2100+$)

Includes streak tracking, departmental filters (CSE vs. BCA vs. MCA), and unlockable achievement badges.

### 4. Curated Placement Curriculum
Includes 150+ problems categorized by core recruitment topics:
- Arrays & Hashing (Two Sum, Kadane's Algorithm, Trapping Rain Water)
- Strings & Two Pointers (Valid Palindrome, Longest Substring Without Repeating Characters)
- Trees & Graphs (Level Order Traversal, Number of Islands, Dijkstra)
- Dynamic Programming (0/1 Knapsack, Coin Change, Longest Common Subsequence)

Each problem features comprehensive test cases, time/space complexity notes, and company interview tags (TCS, Infosys, Amazon, Wipro).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.4.3](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`) |
| **Database** | [Neon](https://neon.tech/) Serverless PostgreSQL (`@neondatabase/serverless`, `pg`) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), Canvas Confetti |
| **Email & Transports** | [Nodemailer](https://nodemailer.com/) |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) (Automated Git deployments) |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm** or **pnpm**
- (Optional) Local compilers: `python3`, `g++`, `javac` if running local multi-language test scripts

### 1. Clone the Repository
```bash
git clone https://github.com/abhisar-dev/Code-Clash.git
cd Code-Clash
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# (Optional) Admin Secret Key
ADMIN_SECRET_KEY=your_secure_admin_key
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Database Diagnostics
To test and inspect the Neon PostgreSQL connection directly:
```bash
npm run db:terminal
```

---

## 📁 Repository Structure

```text
codeclash/
├── app/
│   ├── admin/                # Admin monitoring & system telemetry dashboard
│   ├── api/
│   │   ├── admin/            # Admin metrics & telemetry endpoints
│   │   ├── auth/             # Authentication & session handlers
│   │   ├── leaderboard/      # Campus ELO ranking queries
│   │   ├── matchmaking/      # 1v1 queue matching & room allocation
│   │   ├── presence/         # Live user activity & heartbeat tracker
│   │   ├── rooms/            # Contest room state retrieval & sync
│   │   └── run-code/         # Sandboxed code compilation & test evaluation
│   ├── globals.css           # Tailwind CSS v4 styling & dark mode definitions
│   ├── layout.tsx            # Root HTML metadata & analytics provider wrapper
│   └── page.tsx              # Single-page client hub (Dashboard, Arena, Problems, Ranks)
├── components/
│   ├── ArenaHeader.tsx       # Live duel score header & countdown timer
│   ├── CodeEditor.tsx        # Monaco editor integration with language picker
│   ├── ContestBar.tsx        # 5-problem contest switcher tab bar
│   ├── DashboardView.tsx     # Student home view, stats, and match launcher
│   ├── LeaderboardView.tsx   # Campus ELO rankings & department filters
│   ├── Navbar.tsx            # Institutional nav with theme and sound toggles
│   ├── ProblemPanel.tsx      # Problem statement, constraints, hints & editorial
│   └── TestResultPanel.tsx   # Multi-case test results & stdout inspector
├── lib/
│   ├── auth.ts               # Student credentials & local session store
│   ├── code-wrapper.ts       # Test runner harness injector for Py/C++/Java/JS
│   ├── gamification.ts       # ELO calculator, badges, and streaks engine
│   ├── postgres.ts           # Neon serverless pool connection manager
│   ├── problems.ts           # 150+ placement questions and test suites
│   ├── room-store.ts         # Hybrid in-memory + PostgreSQL contest room manager
│   └── security.ts           # Code sanitization, rate-limiter & audit logger
└── public/
    ├── codeclash-dashboard.png # Main platform dashboard screenshot
    ├── codeclash-arena.png     # 1v1 split-screen duel arena screenshot
    └── invertis-campus.jpg     # Campus portal background asset
```

---

## 👨‍💻 Author

**Abhisar Kumar**
- Degree: Bachelor of Computer Applications — AI & ML (BCA AI & ML)
- Institution: Invertis University, Bareilly
- GitHub: [@abhisar-dev](https://github.com/abhisar-dev)
- Project Repository: [Code-Clash](https://github.com/abhisar-dev/Code-Clash)
- Production Web App: [codeclash-in.vercel.app](https://codeclash-in.vercel.app)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

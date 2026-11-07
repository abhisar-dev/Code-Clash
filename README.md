# CodeClash

<div align="center">
  <p align="center">
    <strong>Real-Time 1v1 Competitive Coding & DSA Battle Arena</strong>
  </p>
  <p align="center">
    Built for students and developers to practice Data Structures & Algorithms under actual placement exam pressure.
  </p>
  
  <p align="center">
    <a href="https://codeclash-in.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-codeclash--in.vercel.app-blue?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E699?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
  </p>
</div>

<br />

<div align="center">
  <a href="https://codeclash-in.vercel.app">
    <img src="./public/codeclash-dashboard.png" alt="CodeClash Platform Dashboard" width="100%" />
  </a>
</div>

---

## ⚡ Try It Live

> **Live Website**: [**https://codeclash-in.vercel.app**](https://codeclash-in.vercel.app)

| Section | What it does | Direct Access |
| :--- | :--- | :--- |
| **1v1 Arena** | Real-time duel with live opponent timer and test runner | [Launch Arena](https://codeclash-in.vercel.app) *(1v1 Arena tab)* |
| **Practice Bank** | 150+ curated placement questions with hints and test cases | [Browse Problems](https://codeclash-in.vercel.app) *(Problems tab)* |
| **Leaderboard** | Live ELO rankings and department standings | [View Standings](https://codeclash-in.vercel.app) *(Leaderboard tab)* |
| **System Status** | Live platform telemetry and database connection health | [Check Status](https://codeclash-in.vercel.app/api/system) |

---

## 💡 The Story: Why I Built CodeClash

Solving DSA problems on LeetCode or HackerRank at your own pace is great for learning patterns, but campus placement drives are a completely different ballgame. 

During technical screening rounds (like TCS NQT, Infosys, Wipro, and product startups), you don't have unlimited time to ponder. You're up against the ticking clock, nerves, and your peers sitting right next to you.

I wanted to recreate that exact adrenaline rush for myself and my batchmates at **Invertis University**. 

Instead of passive coding, **CodeClash** turns DSA practice into a sport:
- You hit **Find Match** or invite a friend via a unique **Room Code**.
- Both coders enter the split-screen duel arena simultaneously.
- A synchronized countdown begins, and you race to implement the optimal solution.
- You see your opponent's live progress (e.g. `2/3 test cases passed`) as it happens.
- Winning updates your campus **ELO rating**, boosts your win-streak, and climbs the department leaderboard.

---

## ⚔️ The 1v1 Battle Arena

<div align="center">
  <a href="https://codeclash-in.vercel.app">
    <img src="./public/codeclash-arena.png" alt="CodeClash Split-Screen 1v1 Duel Arena" width="100%" />
  </a>
</div>

- **Dual-Pane IDE**: Left pane displays problem statement, constraints, input/output samples, and hints. Right pane is a customized Monaco editor.
- **Multi-Language Support**: Write and test code in **Python 3**, **C++ 17**, **Java 21**, or **JavaScript (Node.js)** with automatic starter boilerplate.
- **Instant Test Suite**: Run against sample test cases with full stdout / stderr inspection, then hit **Submit** for hidden test validation.
- **Zero-Friction Multiplayer**: Create private lobbies with random 6-character room codes or hop into public matchmaking.

---

## 🧠 How It Works Under the Hood

### 1. Real-Time State Without Heavy Server Costs
Running dedicated WebSocket servers on VPS instances can be costly and prone to dropping connections on free tiers. 
CodeClash uses an efficient **hybrid state model**:
- Ultra-low latency edge endpoints with smart polling intervals (800ms during active duels).
- State transitions (submitting code, passing test cases, round completions) use atomic SQL upserts backed by **Neon Serverless PostgreSQL connection pooling**:
  ```sql
  INSERT INTO active_rooms (id, data, updated_at) 
  VALUES ($1, $2, NOW())
  ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
  ```
- Instant room cleanup and heartbeat monitoring ensure abandoned duels don't leave zombie state.

### 2. Multi-Language Sandboxed Test Runner
When a user hits "Run Code" or "Submit", the backend wraps their solution inside an automated evaluation harness:
- Injects structured test vectors directly into memory.
- Captures runtime errors, execution time, and stdout/stderr output.
- Enforces strict process timeouts (5-7 seconds) to protect against infinite loops and resource starvation.

### 3. Dynamic ELO Rating Algorithm
After every 1v1 match, ratings recalculate using a standard chess ELO model:

$$R_{\text{new}} = R_{\text{old}} + K \times (S - E)$$

Where $S$ is the match score (1 for win, 0 for loss) and $E$ is the expected probability of victory. Players progress through tiers:
- **Novice** (< 1200)
- **Specialist** (1200 - 1499)
- **Expert** (1500 - 1799)
- **Master** (1800 - 2099)
- **Grandmaster** (2100+)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Hosting & CI/CD**: Vercel Serverless Edge
- **Email & Notifications**: Nodemailer (welcome & verification alerts)

---

## 🚀 Quickstart (Run Locally)

### Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm
- (Optional) Local compilers (`python`, `g++`, `javac`) if testing code runner scripts locally

### 1. Clone the repo
```bash
git clone https://github.com/abhisar-dev/Code-Clash.git
cd Code-Clash
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env.local` file in the root folder:
```env
# Neon Serverless PostgreSQL connection URL
DATABASE_URL=postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# (Optional) Admin Secret Key
ADMIN_SECRET_KEY=your_admin_secret_key
```

### 4. Start the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
codeclash/
├── app/
│   ├── admin/                # Admin control center & live traffic metrics
│   ├── api/
│   │   ├── admin/            # Telemetry & system administration endpoints
│   │   ├── auth/             # Login, signup & student session handling
│   │   ├── leaderboard/      # Campus ELO ranking and stats queries
│   │   ├── matchmaking/      # 1v1 queue matching & room allocator
│   │   ├── presence/         # Live heartbeat & active coders tracker
│   │   ├── rooms/            # Duel lobby synchronization
│   │   └── run-code/         # Sandboxed multi-language code evaluator
│   ├── layout.tsx            # Metadata, SEO JSON-LD schema & root layout
│   └── page.tsx              # Main single-page interactive hub
├── components/
│   ├── ArenaHeader.tsx       # Live duel score header & countdown timer
│   ├── CodeEditor.tsx        # Monaco editor component with syntax themes
│   ├── DashboardView.tsx     # Student home view, stats, and match launcher
│   ├── LeaderboardView.tsx   # Campus ELO rankings & department filters
│   ├── Navbar.tsx            # Navigation bar with sound & theme toggles
│   ├── ProblemPanel.tsx      # Problem statement, test samples & hints
│   └── TestResultPanel.tsx   # Test case pass/fail summary & stdout log
├── lib/
│   ├── auth.ts               # Local authentication & session helper
│   ├── code-wrapper.ts       # Test runner harness injector (Python, C++, Java, JS)
│   ├── gamification.ts       # ELO calculator, streak engine & badges
│   ├── postgres.ts           # Neon serverless pool connection manager
│   ├── problems.ts           # 150+ placement questions and test suites
│   ├── room-store.ts         # Hybrid in-memory + PostgreSQL contest room manager
│   └── security.ts           # Code sanitization & rate limiting
└── public/
    ├── codeclash-dashboard.png # Platform dashboard preview
    ├── codeclash-arena.png     # 1v1 duel arena preview
    └── codeclash-logo.svg      # CodeClash brand mark
```

---

## 👨‍💻 Author

**Abhisar Kumar**
- BCA (AI & ML) — Invertis University, Bareilly
- GitHub: [@abhisar-dev](https://github.com/abhisar-dev)
- Email: abhisarkumar70@gmail.com
- Live Project: [https://codeclash-in.vercel.app](https://codeclash-in.vercel.app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

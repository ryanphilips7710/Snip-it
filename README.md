# SnipIt ✂️

> **Precision URL Shortener — Clean, Fast, Shareable.**

Turn any long, ugly URL into a clean short link in one click. Built from scratch with a modern stack, deployed globally, and designed to look like it costs money.

**Live Demo → [snip-it-navy.vercel.app](https://snip-it-navy.vercel.app)**

---

## Preview

```
Your URL,
SNIP IT.
─────────────────────────────────────────────────────
  URL  │  Paste your long URL here…          │  SNIP
─────────────────────────────────────────────────────
  ✦ Sniped                        Ready to share
  https://snip-it-ny2l.onrender.com/x7kP2q   [Copy]
  ⏳ This link expires in 7 days
  ┌──────────────┐
  │   QR CODE    │   ← scannable, right-click to save
  └──────────────┘

  RECENT SNIPS
  01  snip-it.../x7kP2q   https://google.com   [Copy] [QR]
  02  snip-it.../abc123   https://github.com   [Copy] [QR]
```

---

## Features

- **Instant URL shortening** — paste any URL, get a clean short link in milliseconds
- **One-click copy** — copy short links to clipboard instantly
- **QR code generation** — every sniped link gets an instant scannable QR code
- **History QR codes** — expand a QR code for any of your last 20 links on demand
- **Recent Snips history** — your last 20 links saved locally in the browser
- **Auto link expiry** — all links automatically deleted after 7 days to save storage
- **Expiry notice** — users are clearly told their link expires in 7 days
- **Rate limiting** — 10 requests per minute per IP to prevent abuse
- **URL validation** — invalid URLs are rejected before saving
- **Click tracking** — every redirect increments a click counter in the database
- **Auto cleanup** — server deletes expired links every 24 hours automatically
- **Vercel Analytics** — page views, visitors, and country breakdown
- **Custom cursor** — dual-cursor dot with lagging ring animation
- **Fully responsive** — works on mobile and desktop
- **Dark navy + neon green** — a UI that actually looks good

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Plain HTML, CSS, JavaScript |
| **Backend** | Node.js + Hono |
| **Database** | PostgreSQL (Neon) |
| **QR Codes** | qrcodejs (browser-side) |
| **Analytics** | Vercel Analytics |
| **Frontend Host** | Vercel |
| **Backend Host** | Render |
| **Fonts** | Barlow + DM Mono (Google Fonts) |

---

## Project Structure

```
Snip-it/
├── src/
│   └── index.js          # Hono backend — all API routes + cleanup
├── frontend/
│   └── index.html        # Complete frontend — single file
├── .env                  # Environment variables (never commit this)
├── .gitignore
└── package.json
```

---

## API Endpoints

### `POST /shorten`
Shortens a URL and returns a short link.

**Request:**
```json
{ "url": "https://your-very-long-url.com/goes/here" }
```

**Response:**
```json
{
  "short": "https://snip-it-ny2l.onrender.com/x7kP2q",
  "code": "x7kP2q"
}
```

**Errors:**
```json
{ "error": "Invalid URL" }                          // 400
{ "error": "Too many requests. Please slow down." } // 429
```

---

### `GET /:code`
Redirects to the original URL and increments click count.

```
GET /x7kP2q → 301 Redirect → https://your-very-long-url.com/goes/here
```

---

### `GET /api/links`
Returns all links with click counts, sorted by most clicked.

**Response:**
```json
[
  {
    "code": "x7kP2q",
    "original_url": "https://google.com",
    "clicks": 42,
    "created_at": "2026-03-06T..."
  }
]
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) account (free Postgres)

### 1. Clone the repo
```bash
git clone https://github.com/ryanphilips7710/Snip-it.git
cd Snip-it
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```
DATABASE_URL=your_neon_connection_string
PORT=3000
BASE_URL=http://localhost:3000
```

### 4. Create the database table
Go to your Neon SQL Editor and run:
```sql
CREATE TABLE links (
  code         TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  clicks       INT DEFAULT 0
);
```

### 5. Run the server
```bash
node src/index.js
```

Server running at `http://localhost:3000`

### 6. Open the frontend
Open `frontend/index.html` directly in your browser. Paste any URL and hit **Snip**.

---

## Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set build command: `npm install`
5. Set start command: `node src/index.js`
6. Add environment variables: `DATABASE_URL`, `PORT`, `BASE_URL`

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Deploy — done in 30 seconds

---

## How It Works

```
User pastes URL → POST /shorten
                      ↓
              Validate URL format
                      ↓
              Rate limit check (10 req/min per IP)
                      ↓
              Generate 6-char base62 code
              e.g. "x7kP2q"
                      ↓
              Check DB for collision → retry if taken
                      ↓
              INSERT into links table
                      ↓
              Return short URL + generate QR code

User visits short link → GET /x7kP2q
                              ↓
                    SELECT from links table
                              ↓
                    UPDATE clicks = clicks + 1
                              ↓
                    301 Redirect → original URL

Auto cleanup (runs on server start + every 24hrs)
                      ↓
              DELETE WHERE created_at < NOW() - 7 days
```

---

## Security

- **Rate limiting** — 10 requests/minute per IP using in-memory tracking, no package needed
- **URL validation** — rejects malformed URLs before processing
- **Environment variables** — all secrets stored in `.env`, never committed to Git
- **CORS** — configured to allow frontend-to-backend communication
- **Auto cleanup** — links older than 7 days deleted automatically every 24 hours
- **Expiry notice** — users are clearly warned links expire, preventing false expectations

---

## Database Schema

```sql
CREATE TABLE links (
  code         TEXT PRIMARY KEY,     -- short code e.g. "x7kP2q"
  original_url TEXT NOT NULL,        -- the original long URL
  created_at   TIMESTAMP DEFAULT NOW(),
  clicks       INT DEFAULT 0         -- incremented on every redirect
);
```

---

## What I Learned Building This

- REST API design with HTTP methods (GET, POST)
- Node.js backend with the Hono framework
- PostgreSQL database design and SQL queries
- Environment variables and secrets management
- CORS and why browsers enforce cross-origin restrictions
- Rate limiting to prevent API abuse
- In-browser QR code generation with qrcodejs
- Git, GitHub, and version control workflows
- Deploying a full-stack app across Render + Vercel
- DNS, custom domains, and environment-based config
- Vercel Analytics for tracking real user traffic

---

## Roadmap

- [x] URL shortening with 6-char base62 codes
- [x] Click tracking per link
- [x] Rate limiting
- [x] Auto link expiry every 7 days
- [x] QR code generation for every link
- [x] QR codes for history items
- [x] Vercel Analytics
- [ ] Analytics dashboard — visualize click counts per link
- [ ] Custom aliases — let users pick their own slug
- [ ] User accounts — manage and delete your own links
- [ ] Custom domain — `snipit.link/x7kP2q`
- [ ] Google Safe Browsing API — block malicious URLs
- [ ] Link previews — OG metadata for social sharing
- [ ] QR code download button

---

## License

MIT — do whatever you want with it.

---

<div align="center">
  Built by <a href="https://github.com/ryanphilips7710">Ryan Thomas Philips</a>
  <br/>
  <sub>From zero to deployed — one snip at a time.</sub>
</div>
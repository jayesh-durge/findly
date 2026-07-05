# 🔍 Findly — Smart QR Lost & Found

> A modern lost-and-found platform that lets you tag your belongings with QR codes. When someone finds your item, they scan the QR code and can instantly contact you — no app download required.

**🔗 Hosted Live Site:** [https://findly-pi.vercel.app/](https://findly-pi.vercel.app/)

---

## ✨ Features

- 🏷️ **QR Code Generation** — Register items and get a unique, printable QR code for each
- 📱 **Guest Scanning** — Finders can scan and send a message without creating an account
- 💬 **Real-time Messaging** — Threaded chat between item owners and finders
- 🪙 **Coin Rewards System** — Thank finders by sending them Findly coins
- 🔐 **Auth** — Simple email/password signup & login
- 📊 **Dashboard** — Manage all your registered items in one place
- 🔔 **Message Notifications** — Unread badge counts on incoming messages

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| MUI (Material UI v9) | Component library |
| Framer Motion | Animations |
| React Router v7 | Client-side routing |
| Supabase JS | Auth & realtime DB client |
| Axios | HTTP requests to backend |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Supabase | PostgreSQL database |
| `python-qrcode` | QR code generation |
| `python-dotenv` | Environment variable management |
| Pydantic | Request/response validation |

---

## 📁 Project Structure

```
findly/
├── backend/
│   ├── main.py                # FastAPI app entry point
│   ├── .env                   # Environment variables
│   ├── database/
│   │   └── schema.sql         # Supabase PostgreSQL schema
│   ├── routes/
│   │   ├── items.py           # Item CRUD endpoints
│   │   ├── qr.py              # QR code generation endpoint
│   │   ├── messages.py        # Messaging endpoints
│   │   └── rewards.py         # Coin rewards endpoints
│   ├── qr/
│   │   └── generator.py       # QR code generation utility
│   └── utils/
│       └── deps.py            # Shared dependencies
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx             # Root component & routing
        ├── theme.ts            # MUI theme configuration
        ├── pages/
        │   ├── Home.tsx        # Landing page
        │   ├── Login.tsx       # Login page
        │   ├── Signup.tsx      # Signup page
        │   ├── Dashboard.tsx   # User item dashboard
        │   ├── CreateItem.tsx  # Register a new item
        │   ├── ScanItem.tsx    # Public QR scan page
        │   ├── Messages.tsx    # Message inbox
        │   ├── Chat.tsx        # Individual chat thread
        │   └── Rewards.tsx     # Coins & transactions
        ├── components/
        │   ├── Navbar.tsx
        │   └── ProtectedRoute.tsx
        ├── hooks/              # Custom React hooks
        └── services/           # API service functions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- A **Supabase** project ([supabase.com](https://supabase.com))

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/findly.git
cd findly
```

---

### 2. Set Up the Database

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard).
2. Copy and run the contents of `backend/database/schema.sql`.

This creates the following tables:
- `users` — user accounts with coin balances
- `items` — registered items with unique QR IDs
- `messages` — messages from finders to owners
- `scan_reports` — location/message logs when an item is scanned
- `coin_transactions` — reward coin transfer history

---

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install fastapi uvicorn supabase python-dotenv qrcode[pil] pillow
```

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
VITE_FRONTEND_URL=http://localhost:5173
```

Start the API server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Reference

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/items/create` | Register a new item |
| `GET` | `/items/{qr_id}` | Get item by QR ID (used on scan) |
| `GET` | `/items/user/{user_id}` | Get all items owned by a user |
| `PATCH` | `/items/{item_id}/status` | Toggle lost/found status |
| `DELETE` | `/items/{item_id}` | Delete an item |

### QR Codes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/qr/generate` | Generate a QR code image (base64) for an item |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/messages/send` | Send a message to item owner |
| `GET` | `/messages/user/{user_id}` | Get all messages for a user |
| `GET` | `/messages/thread/{user1}/{user2}/{item_id}` | Get chat thread between two users |
| `PUT` | `/messages/read/{user1}/{user2}/{item_id}` | Mark messages as read |
| `DELETE` | `/messages/thread/{user1}/{user2}/{item_id}` | Delete a chat thread |
| `DELETE` | `/messages/guest/{item_id}/{sender_name}` | Delete a guest chat |

### Rewards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rewards/send` | Send coins to another user |
| `GET` | `/rewards/balance/{user_id}` | Get a user's coin balance |
| `GET` | `/rewards/transactions/{user_id}` | Get coin transaction history |

---

## 🗺️ App Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing / home page |
| `/login` | Public | Login |
| `/signup` | Public | Create account |
| `/scan/:qrId` | Public | QR scan page (for finders) |
| `/dashboard` | Protected | Manage your items |
| `/create-item` | Protected | Register a new item |
| `/messages` | Protected | Message inbox |
| `/chat/:userId/:itemId` | Protected | Chat thread |
| `/rewards` | Protected | Coins & transaction history |

---

## 🪙 Rewards System

Every new user starts with **50 Findly coins**. When someone returns your lost item, you can send them coins as a thank-you gesture. Coin transfers (1–100 coins) are logged in the `coin_transactions` table and visible in the Rewards page.

---

## 📝 Notes

> **Hackathon Demo**: This project was built for a hackathon. Authentication uses simple password storage and fully open Row Level Security (RLS) policies — **do not use in production** without proper hardening.

- QR codes encode a URL pointing to `/scan/:qrId` on your frontend, allowing anyone with a camera to contact the owner instantly — no app download needed.
- Guest users (no account) can still scan items and send messages to owners.

---

## 📄 License

MIT License — feel free to fork, extend, and build on top of Findly.

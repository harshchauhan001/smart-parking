# 🅿️ ParkSmart — Smart Parking Management System

ParkSmart is a full-stack web application that connects **parking space owners (Partners)** with **drivers (Users)** looking for a place to park. Partners can list and manage their parking centres in real time, while users can search nearby parking, check live slot availability, reserve a specific slot, and complete payment — all from the browser.

## 🌐 Live Demo

| | Link |
|---|---|
| **Frontend (User/Partner App)** | [https://your-project.vercel.app](https://your-project.vercel.app) |
| **Backend API** | [https://smart-parking-ob1t.onrender.com](https://smart-parking-ob1t.onrender.com) |

> ⚠️ The backend is hosted on Render's free tier, which spins down after inactivity. The **first request after a period of idle time may take 30–60 seconds** to respond while the server wakes up — this is expected behaviour, not a bug.

## 📖 About the Project

Finding and managing parking is often manual and inefficient — drivers circle blocks looking for space, and parking operators have no easy way to track occupancy or bookings digitally. ParkSmart solves this with two dedicated experiences:

- **Users** register their vehicle, search for nearby parking centres, view real-time slot availability, pick a specific slot on a visual layout, and reserve it with a simulated payment flow.
- **Partners** register their parking business, list one or more parking centres with pricing and operating hours, monitor live occupancy, manually adjust slot availability, and view all reservations made by users at their centres.

## ✨ Features

**For Users**
- Register and log in with vehicle & license details
- Browse all registered parking centres with live availability
- Visual slot-selection grid (available vs. occupied)
- Choose between Cash or (simulated) Online payment
- Digital parking pass generated on successful reservation

**For Partners**
- Register and log in as a parking space owner
- Add, edit, and delete parking centres
- Set total slots, pricing, contact info, and operating hours
- Manually increase/decrease available slots
- View all user reservations made at their centres, with live dashboard stats (total centres, total slots, available, occupied)

**Platform**
- JWT-based authentication with role-based access (`user` / `partner`)
- Passwords hashed with bcrypt
- Transactional, race-condition-safe slot booking (row locking prevents double-booking the same slot)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), plain CSS |
| Backend | Node.js, Express |
| Database | MySQL-compatible — [TiDB Serverless](https://www.pingcap.com/tidb-serverless/) |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Frontend hosting | [Vercel](https://vercel.com) |
| Backend hosting | [Render](https://render.com) |

## 🏗️ Architecture

```
┌─────────────────┐        HTTPS         ┌──────────────────┐        MySQL Protocol        ┌──────────────────┐
│  React Frontend  │ ───────────────────► │  Express Backend  │ ────────────────────────────► │  TiDB Serverless  │
│    (Vercel)      │ ◄─────────────────── │     (Render)       │ ◄──────────────────────────── │     (Database)     │
└─────────────────┘      JSON / REST      └──────────────────┘                                └──────────────────┘
```

## 📁 Project Structure

```
smart-parking/
├── backend/
│   ├── server.js          # Express app & all API routes
│   ├── db.js               # MySQL/TiDB connection pool
│   ├── package.json
│   └── .env                # Local environment variables (not committed)
│
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── user/
│   │   │   └── UserDashboard.jsx
│   │   └── partner/
│   │       └── PartnerDashboard.jsx
│   ├── services/
│   │   └── api.js          # Centralised API helper functions
│   ├── App.jsx
│   └── main.jsx
│
├── .env.development         # VITE_API_URL for local dev
├── .env.production           # VITE_API_URL for the deployed backend
└── package.json
```

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A MySQL-compatible database (local MySQL, or a free [TiDB Serverless](https://www.pingcap.com/tidb-serverless/) / [PlanetScale](https://planetscale.com/) cluster)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following:
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=4000
JWT_SECRET=your-own-secret-key
```

Create the required tables by running the SQL statements in [`schema.sql`](#-database-schema) (see below) against your database.

Start the backend:
```bash
node server.js
```
The API will be available at `http://localhost:3000`.

### 3. Set up the frontend
From the project root:
```bash
npm install
```

Create a `.env.development` file at the project root:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','partner') NOT NULL,
  vehicle_number VARCHAR(50),
  license_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parking_centers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  partner_id INT,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  total_slots INT NOT NULL,
  available_slots INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  contact VARCHAR(50),
  opening_time VARCHAR(20),
  closing_time VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id)
);

CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  parking_id INT NOT NULL,
  slot_number INT NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','online') NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Confirmed',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parking_id) REFERENCES parking_centers(id)
);
```

## 🔑 Environment Variables Reference

**Backend (`backend/.env`)**
| Variable | Description |
|---|---|
| `DB_HOST` | Database host address |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DB_PORT` | Database port (`4000` for TiDB Serverless) |
| `JWT_SECRET` | Secret key used to sign authentication tokens |

**Frontend (`.env.development` / `.env.production`)**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (no trailing slash) |

## 📡 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/register-partner` | Public | Register a new partner |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/parking` | Public | List all parking centres |
| GET | `/api/parking/my` | Partner | List the logged-in partner's centres |
| POST | `/api/parking` | Partner | Add a new parking centre |
| PUT | `/api/parking/:id` | Partner | Update a parking centre |
| DELETE | `/api/parking/:id` | Partner | Delete a parking centre |
| PATCH | `/api/parking/:id/slots` | Partner | Update available slot count |
| POST | `/api/reservations` | User | Create a reservation |
| GET | `/api/reservations/my` | User | List the logged-in user's reservations |
| GET | `/api/partner/reservations` | Partner | List reservations made at the partner's centres |

## 🧭 How to Use the App

1. **Register** as either a **User** or a **Partner** from the sign-up page.
2. **Partners**: log in → add a parking centre with its name, location, slots, price, and timings.
3. **Users**: log in → enter your vehicle & license number → browse available parking centres → select one → pick a free slot → choose a payment method → confirm.
4. Both roles can log out and back in at any time; sessions persist across page refreshes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋 Contact

Have questions or feedback? Feel free to reach out or open an issue on this repository.

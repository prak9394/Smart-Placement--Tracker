# Smart Placement Tracker

A full-stack MERN web application to track job applications, interviews, offers, and rejections.

## Tech Stack
- **Database:** MongoDB
- **Backend:** Node.js, Express.js, Mongoose, JWT Auth
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios

## Prerequisites
- Node.js installed
- MongoDB running locally (or adjust the `MONGO_URI` in `backend/.env` to your MongoDB Atlas cluster).

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```
- Ensure your local MongoDB instance is running on `mongodb://127.0.0.1:27017` or edit `.env` inside `backend/` with your custom connection string.

Run the backend server:
```bash
node server.js
# Or use nodemon if preferred
```
*(Server will start on port 5000)*

### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Run the React app:
```bash
npm run dev
```
*(Frontend will start on port 5173 typically. Open `http://localhost:5173` in your browser)*

## Features
- **Authentication**: JWT-based secure login and register.
- **Dashboard Overview**: Metrics tracking your total applications, interviews, offers, and rejections.
- **Application Management**: Add, Edit, Delete tracking cards.
- **Responsive Modern UI**: Premium dark mode design with Tailwind CSS v4.

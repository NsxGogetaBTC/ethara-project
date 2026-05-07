# Project Manager

A simple project management application with separate backend and frontend directories.

## Repository Structure

- `backend/` - Express API server
- `frontend/` - React / Vite frontend app

## Backend

### Requirements

- Node.js
- MongoDB connection string

### Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with at least:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Developer Mode

```bash
npm run dev
```

## Frontend

### Requirements

- Node.js

### Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Usage

- Register as a new user via the frontend.
- Admin users can create projects, edit project details, delete projects, and manage tasks.
- Member users can only view tasks assigned to them and cannot create tasks.

## Notes

- The backend API runs on `http://localhost:5000` by default.
- The frontend runs on the port configured by Vite.
- Environment-sensitive files and generated directories are ignored by `.gitignore`.

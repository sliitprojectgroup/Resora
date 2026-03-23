# Resora Project

A full-stack web application with a React frontend and Node.js/Express backend, integrated with MongoDB Atlas.

## Architecture

- **Frontend**: React 19 + Vite, runs on port 5000
- **Backend**: Node.js + Express 5, runs on port 3000
- **Database**: MongoDB Atlas (via Mongoose)

## Project Structure

```
Resora/
├── backend/
│   ├── server.js          # Express server with CORS and MongoDB connection
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── assets/
│   ├── vite.config.js     # Vite config: host 0.0.0.0, port 5000, allowedHosts: true
│   ├── index.html
│   └── package.json
├── .env                   # MONGODB_URI (root level, loaded by backend dotenv)
└── replit.md
```

## Environment Variables

- `PORT`: Backend port (set to 3000 via Replit env vars)
- `MONGODB_URI`: MongoDB Atlas connection string (in `.env` file at root)

## Workflows

- **Start application**: `cd frontend && npm run dev` (port 5000, webview)
- **Backend API**: `node backend/server.js` (port 3000, console)

## Key Configuration

- Vite is configured with `host: '0.0.0.0'`, `port: 5000`, `allowedHosts: true` to work behind Replit's proxy
- Backend uses `dotenv` with `path: '../.env'` to load the root-level `.env` file
- Backend runs on port 3000 to avoid conflict with frontend on port 5000

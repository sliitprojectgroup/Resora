# Resora Project

A full-stack web application with a React frontend and Node.js/Express backend, integrated with MongoDB database.

## Project Structure

After restructuring, the project follows this layout:

```
Resora/
├── backend/
│   ├── server.js          # Main server file with Express, CORS, and MongoDB connection
│   └── ...                # Other backend files
├── frontend/              # All frontend files moved from frontend/Resora/
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   ├── package-lock.json
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js     # Vite configuration
│   ├── eslint.config.js   # ESLint configuration
│   └── README.md          # Frontend-specific documentation
├── .env                   # Environment variables (not committed to version control)
└── README.md              # This file
```

## Features

- **Frontend**: Built with React and Vite
- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ODM
- **Security**: Environment variables for sensitive data
- **CORS**: Cross-Origin Resource Sharing enabled
- **JSON Parsing**: Middleware for handling JSON requests

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB access (cloud or local)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Resora
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Return to the project root:
   ```bash
   cd ..
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=5000
```

**Note**: Never commit actual credentials to version control. Keep your `.env` file in `.gitignore`.

## Running the Application

### Backend Server

To start the backend server:

```bash
cd backend
npm start
# Or directly with node
node server.js
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

### Frontend Development Server

To start the frontend development server:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).

## Scripts

### Backend Scripts

- `node server.js`: Starts the backend server

### Frontend Scripts

From the `frontend/` directory:

- `npm run dev`: Starts development server (typically on port 5173)
- `npm run build`: Builds the production-ready app
- `npm run lint`: Lints the code
- `npm run preview`: Locally previews the production build

## API Endpoints

The backend server currently has:

- `GET /` - Returns a simple JSON response confirming the server is running

More endpoints can be added as needed in `backend/server.js`.

## Database Connection

The application connects to MongoDB using Mongoose. The connection string is loaded from the environment variables in the `.env` file.

## Security Considerations

- Database credentials and other sensitive information are stored in the `.env` file
- CORS is configured to handle cross-origin requests appropriately
- Input validation should be implemented for any user-provided data

## Development

### Adding New Routes

To add new API routes, modify `backend/server.js`:

```javascript
app.get("/api/new-endpoint", (req, res) => {
  // Handle the request
  res.json({ message: "New endpoint response" });
});
```

### Environment Variables

Always use environment variables for sensitive data like database URIs, API keys, etc. Never hardcode these values in the source code.

## Deployment

For deployment:

1. Ensure all dependencies are properly listed in package.json files
2. Configure environment variables in your hosting environment
3. Build the frontend for production (`npm run build` in frontend directory)
4. Serve the backend server with appropriate environment configurations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

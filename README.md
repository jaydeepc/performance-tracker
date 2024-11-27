# Performance Tracker

A full-stack performance management system built with React.js and Node.js that allows managers to evaluate their team members' performance across different competencies.

## Features

- User Authentication with role-based access (Admin, Manager, Reportee)
- Monthly performance evaluations
- Evaluation tracking and history
- Dashboard views for different roles
- Prevent duplicate evaluations for the same month
- Edit capabilities for existing evaluations

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios for API calls
- JWT for authentication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- CORS enabled

## Project Structure

```
performance-tracker/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   └── services/      # API services
│   └── package.json
│
└── backend/               # Node.js backend
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Custom middleware
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    └── server.js        # Entry point
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jaydeepc/performance-tracker.git
cd performance-tracker
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5001
```

4. Start the servers:
```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd frontend
npm start
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- POST /api/auth/login - Login user

### Users
- GET /api/users - Get all users (Admin only)
- POST /api/users - Create new user (Admin only)
- GET /api/users/managers/:managerId/reportees - Get manager's reportees

### Evaluations
- POST /api/evaluations - Create evaluation
- GET /api/evaluations/user/:userId - Get user's evaluations
- GET /api/evaluations/:id - Get evaluation by ID
- PUT /api/evaluations/:id - Update evaluation
- GET /api/evaluations/status/:userId - Get evaluation status

## License

MIT License

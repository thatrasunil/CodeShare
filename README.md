# CodeConnect

CodeConnect is a real-time collaborative code editing platform that enables multiple users to code together seamlessly. Built with React, Node.js, Express, and Socket.IO, it provides an intuitive interface for pair programming and team collaboration.

## Features

- **Real-time Code Synchronization**: Edit code with others in real-time, seeing changes instantly.
- **Live Chat**: Communicate with team members through an integrated chat system.
- **Participant Management**: View active participants and manage room access.
- **Cursor Tracking**: See where other users are editing with live cursor indicators.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.
- **Multi-language Support**: Supports various programming languages with syntax highlighting.

## Tech Stack

- **Frontend**: React, Monaco Editor, Socket.IO Client, Framer Motion
- **Backend**: Node.js, Express, Socket.IO, MongoDB
- **Real-time Communication**: Socket.IO

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thatrasunil/CodeShare-Rooms.git
   cd CodeShare-Rooms
   ```

2. Install backend dependencies:
   ```bash
   cd CodeConnect/backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables (adjust for your deployment environment):

   ```
   # Database
   MONGODB_URI=your_mongodb_connection_string  # e.g., mongodb+srv://username:password@cluster.mongodb.net/codeconnect?retryWrites=true&w=majority (for MongoDB Atlas)

   # Server
   PORT=5000  # Port for the backend server (use 80/443 for production without proxy)

   # Frontend
   FRONTEND_URL=http://localhost:3000  # Update to your production frontend URL for CORS (e.g., https://yourdomain.com)

   # Environment
   NODE_ENV=development  # Set to 'production' for deployment

   # Optional: For production security
   SESSION_SECRET=your_session_secret  # If implementing sessions
   JWT_SECRET=your_jwt_secret  # If using JWT authentication
   ```

   **Deployment Notes:**
   - For production, use a secure MongoDB URI (e.g., MongoDB Atlas) and ensure your IP is whitelisted.
   - Update `FRONTEND_URL` in the backend's Socket.IO CORS configuration to match your deployed frontend.
   - Use HTTPS in production for secure WebSocket connections.
   - For platforms like Heroku, Vercel, or Render, set these as environment variables in the dashboard instead of a local .env file.
   - Ensure `NODE_ENV=production` to disable development features like verbose logging.

5. Start the backend:
   ```bash
   npm run dev
   ```

6. Start the frontend (in a new terminal):
   ```bash
   cd ../frontend
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

- Create a new room or join an existing one using the room ID.
- Start coding collaboratively with real-time updates.
- Use the chat to communicate with other participants.
- View active participants and their cursors in the editor.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

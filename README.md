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
   Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

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

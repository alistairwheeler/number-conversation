# NumberVerse 🔢

A full-stack discussion platform where people communicate through numbers. Users can start discussions with a number and reply to existing discussions with their own numbers, creating threaded conversation trees.

## 🌐 Live Demo

**[https://alistairwheeler.github.io/number-conversation/](https://alistairwheeler.github.io/number-conversation/)**

## 📋 Features

- **User Authentication**: Register and login to participate in discussions
- **Number-Based Discussions**: Start conversations with numbers
- **Threaded Replies**: Reply to any discussion with your own number
- **Discussion Tree View**: Visualize conversation threads
- **Real-time Updates**: See all discussions and replies dynamically

## 🛠️ Tech Stack

### Frontend
- **React** (TypeScript)
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Custom styling

### Backend
- **Node.js** with **Express** (TypeScript)
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **GitHub Pages** - Frontend deployment
- **Jest** & **Supertest** - Testing

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:alistairwheeler/number-conversation.git
   cd number-conversation
   ```

2. **Install dependencies**

   For the client:
   ```bash
   cd client
   npm install
   ```

   For the server:
   ```bash
   cd ../server
   npm install
   ```

## 💻 Running Locally

### Option 1: Using Docker Compose (Recommended)

Run both frontend and backend together:

```bash
docker-compose up
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

To stop:
```bash
docker-compose down
```

### Option 2: Running Separately

**Start the backend server:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:3001

**Start the frontend client:**
```bash
cd client
npm run dev
```
Client runs on http://localhost:5173

## 🧪 Testing

Run backend tests:
```bash
cd server
npm test
```

## 📦 Building for Production

Build the frontend:
```bash
cd client
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 🌍 Deployment

### Deploy to GitHub Pages

The project is configured for easy deployment to GitHub Pages:

```bash
cd client
npm run deploy
```

This will:
1. Build the production bundle
2. Deploy to the `gh-pages` branch
3. Make the app available at your GitHub Pages URL

**Note**: The `.nojekyll` file in `client/public/` ensures GitHub Pages doesn't process files with Jekyll.

## 📁 Project Structure

```
number-conversation/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── api.ts         # API client
│   │   └── App.tsx        # Main app component
│   ├── public/
│   │   └── .nojekyll      # Disable Jekyll on GitHub Pages
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   └── server.ts      # Main server file
│   ├── tests/             # Jest tests
│   └── package.json
└── docker-compose.yml     # Docker orchestration
```

## 🔧 Configuration

### Environment Variables

**Client** (`.env` in `client/` directory):
```env
VITE_API_URL=http://localhost:3001
```

**Server** (environment variables in `docker-compose.yml` or set manually):
```env
PORT=3001
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all discussions
- `POST /api/posts` - Create a new discussion (requires auth)
- `POST /api/posts/:id/reply` - Reply to a discussion (requires auth)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Alistair Wheeler**
- GitHub: [@alistairwheeler](https://github.com/alistairwheeler)

## 🙏 Acknowledgments

- Built as a demonstration of full-stack TypeScript development
- Inspired by the concept of number-based communication

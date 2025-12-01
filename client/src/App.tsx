import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import DiscussionTree from './components/DiscussionTree';
import api from './api';
import './index.css';

const Home = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [startValue, setStartValue] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleStartDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/posts', { value: parseFloat(startValue) });
      setStartValue('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to start discussion', err);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NumberVerse</h1>
        <nav>
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.username}</span>
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {isAuthenticated && (
          <section className="start-discussion">
            <h3>Start a New Discussion</h3>
            <form onSubmit={handleStartDiscussion}>
              <input
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                placeholder="Enter a starting number"
                required
              />
              <button type="submit">Start</button>
            </form>
          </section>
        )}

        <section className="discussion-feed">
          <h3>Discussions</h3>
          <DiscussionTree posts={posts} refreshPosts={fetchPosts} />
        </section>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

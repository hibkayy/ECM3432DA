import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom'

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import axios from 'axios';
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from 'react';

function App() {

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        setError("Failed to fetch user data");
        localStorage.removeItem("token");
      });
    }
  }, []);


  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App

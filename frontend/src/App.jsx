import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom'
import {use, useEffect, useState} from 'react'
import './index.css'

function App() {
  const [user,setUser] = useState(null);
  const [error,setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        setError("Failed to fetch user data");
        localStorage.removeItem("token");
      });
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App

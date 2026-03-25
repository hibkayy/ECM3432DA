import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <h2 className="navbar-logo">CTS</h2>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/places">Places</Link>

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
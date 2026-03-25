import { useState } from 'react';
import '../styles/Login.css';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('/api/users/login', {
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('isAdmin', res.data.isAdmin);

            window.location.href = "/";
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="login">
            <div className="border">
                <h2>Login</h2>

                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-container">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
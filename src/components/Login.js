// src/components/Login.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const history = useHistory();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = isRegister
        ? await api.register({ username, password, privilege_level: 'student' })
        : await api.login({ username, password });
      const token = isRegister ? (await api.login({ username, password })).data.token : res.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', res.data.user.id);
      alert(isRegister ? 'Registration successful, logged in' : 'Login successful');
      history.push('/booking');
    } catch (error) {
      alert('Authentication failed: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </form>
    </div>
  );
};

export default Login;
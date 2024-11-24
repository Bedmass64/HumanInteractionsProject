import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve saved credentials from local storage
    const savedCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};

    if (savedCredentials[email] && savedCredentials[email].password === password) {
      alert('Login successful!');
      localStorage.setItem('isLoggedIn', 'true');

      // Navigate to the intended page
      const from = location.state?.from || '/tasks';
      navigate(from);
    } else {
      alert('Invalid email or password. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#b3cde3', minHeight: '100vh', padding: '40px 0', color: '#000' }}>
      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          padding: '30px',
          backgroundColor: '#ffffffcc',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1
          style={{
            color: '#005b96',
            textAlign: 'center',
            fontSize: '2em',
            fontWeight: 'bold',
            marginBottom: '20px',
          }}
        >
          Log In
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '94.5%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #005b96',
              borderRadius: '5px',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '94.5%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #005b96',
              borderRadius: '5px',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#005b96',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1em',
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Don't have an account?</p>
          <button
            type="button"
            onClick={() =>
              navigate('/create-account', { state: { from: location.state?.from } })
            }
            style={{
                width: '100%',
                padding: '12px',
                marginTop: '15px',
                backgroundColor: '#005b96',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1em',
                cursor: 'pointer',
            }}
          >
            Create an Account
          </button>
        </div>
        <button
          type="button"
          onClick={handleGoBack}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '15px',
            backgroundColor: '#ccc',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1em',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

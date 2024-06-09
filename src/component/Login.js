import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';



const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState(''); // State for login error message

  const navigate = useNavigate(); // Get the navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      setError('Invalid email format');
      return;
    }

    // Attempt login
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, formData);
      console.log(response.data);
      // Redirect to Input page after successful login
      navigate('/input');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid credential');
    }
  };

  return (
    <div id="lg">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} /> <br></br>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} /> <br></br>
        <button type="submit">Login</button> <br></br>
        {error && <p className="error">{error}</p>} {/* Display error message if login fails */}
      </form>
      <p>Not Registered Yet? <a href="/register" style={{color:'black'}}>Register</a></p>
    </div>
  );
};

export default Login;

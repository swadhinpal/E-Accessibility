import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({}); // State for validation errors

  const navigate = useNavigate(); // Get the navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    // Perform validation
    if (formData.name.length > 15) {
      validationErrors.name = 'Name must be 15 characters or less';
    }

    if (formData.country.length > 15) {
      validationErrors.country = 'Country must be 15 characters or less';
    }

    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      validationErrors.email = 'Invalid email format';
    }

    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,50}/.test(formData.password)) {
      validationErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character, and be between 8 and 50 characters long';
    }

    // Set errors state
    setErrors(validationErrors);

    // If there are no validation errors, submit the form
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, formData);
        console.log(response.data);
        // Redirect to login page after successful registration
        navigate('/login');
      } catch (error) {
        console.error('Error registering user:', error);
      }
    }
  };

  return (
    <div id="reg">
      <h2>Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} /> <br /> <br />
        {errors.name && <p className="error">{errors.name}</p>}
        <input type="text" name="country" placeholder="Country" onChange={handleChange} /> <br /> <br />
        {errors.country && <p className="error">{errors.country}</p>}
        <input type="email" name="email" placeholder="Email" onChange={handleChange} /> <br /> <br />
        {errors.email && <p className="error">{errors.email}</p>}
        <input type="password" name="password" placeholder="Password" onChange={handleChange} /> <br /> <br />
        {errors.password && <p className="error">{errors.password}</p>}
        <button type="submit">Register</button> <br /> <br />
      </form>
      <p>Already have an account? <a href="/login" style={{color:'black'}}>Login</a></p>
    </div>
  );
}

export default Register;

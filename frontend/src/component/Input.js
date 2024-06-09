import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './input.css';



function Input() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate(); // Get the navigate function

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const sendDataToBackend = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputValue }),
      });

      if (response.ok) {
        console.log('URL sent to the backend successfully');
        setInputValue('');
        // Redirect to Output page after sending URL to backend
        navigate('/output');
      } else {
        console.error('Failed to send URL to the backend');
      }
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

  const handleLogout = () => {
    // Redirect to home page on logout
    navigate('/');
  };

  return (
    <div id="input">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type a URL..."
      /> <br></br>
      <button onClick={sendDataToBackend}>Generate Report</button> <br /> <br />
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
      <p>You typed: {inputValue}</p>
    </div>
  );
}

export default Input;

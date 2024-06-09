import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './output.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Output() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Get the navigate function

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('/output'); // Send a GET request to fetch logs
            console.log('Received Logs from backend:', response.data);
            setLogs(response.data); // Set the received logs data
            setLoading(false);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Redirect to home page on logout
        navigate('/');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (logs.length === 0) {
        return <div>Report Loading....</div>;
    }

    return (
        <div id="out">
            <h2>Accessibility Report:</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log}<br /></li>
                ))}
            </ul>
            <button onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>
    );
}

export default Output;

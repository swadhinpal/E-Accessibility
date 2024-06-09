import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Tweet() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/tweet');
            console.log('Received data from backend:', response.data); // Log received data
            setItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (items.length === 0) {
        return <div>No data found</div>;
    }

    return (
        <div>
            {items.map((item, index) => (
                <div key={index}>
                    <p>{item.name}</p>
                    <p>{item.roll}</p>
                    <p>{item.batch}</p>
                </div>
            ))}
        </div>
    );
}

export default Tweet;

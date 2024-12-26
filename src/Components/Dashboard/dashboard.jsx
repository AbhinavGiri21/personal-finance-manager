import React, { useState, useEffect } from 'react';
import './dashboard.css';
import axios from 'axios';

const Dashboard = () => {
    const [username, setUsername] = useState('');

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('User is not logged in');
                return;
            }

            const response = await axios.get("http://localhost:5000/get-username", {
                headers: { Authorization: token },
            });

            setUsername(response.data.username);
        } catch (error) {
            console.error('Error fetching user details:', error);
            alert('Error fetching user details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <div className="dashboard-wrapper">

        </div>
    );
};

export default Dashboard;

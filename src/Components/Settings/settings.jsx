import React, { useState } from 'react';
import axios from 'axios';
import './settings.css';

const Settings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateUsername = async () => {
        try {
            const token = localStorage.getItem('token'); // Make sure the token key is correct
            const response = await axios.put('http://localhost:5000/api/update-settings', { username }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            alert(response.data.message);
            // Reload the page after successful update
            window.location.reload();
        } catch (err) {
            console.error("Error updating username:", err.response ? err.response.data : err);
            alert("An error occurred while updating username");
        }
    };

    const handleUpdateEmail = async () => {
        try {
            const token = localStorage.getItem('token'); // Make sure the token key is correct
            const response = await axios.put('http://localhost:5000/api/update-settings', { email }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            alert(response.data.message);
            // Reload the page after successful update
            window.location.reload();
        } catch (err) {
            console.error("Error updating email:", err.response ? err.response.data : err);
            alert("An error occurred while updating email");
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match");
            return;
        }

        if (!password) {
            alert("Please enter your current password");
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Make sure the token key is correct
            const response = await axios.put('http://localhost:5000/api/update-settings', { password, newPassword, confirmPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            alert(response.data.message);
            // Reload the page after successful update
            window.location.reload();
        } catch (err) {
            console.error("Error updating password:", err.response ? err.response.data : err);
            alert("An error occurred while updating password");
        }
    };

    return (
        <div className='settings-container'>
            <h1>Settings</h1>
            <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
                <div className="row-group">
                    <div className="settings-item">
                        <label htmlFor="username">Username:</label>
                        <div className="input-button-group">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button type="button" onClick={handleUpdateUsername}>UPDATE</button>
                        </div>
                    </div>

                    <div className="settings-item">
                        <label htmlFor="email">Email:</label>
                        <div className="input-button-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="button" onClick={handleUpdateEmail}>UPDATE</button>
                        </div>
                    </div>
                </div>

                <div className="settings-item">
                    <label htmlFor="password">Current Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="settings-item">
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div className="settings-item">
                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                    <div className="input-button-group">
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" onClick={handleUpdatePassword}>UPDATE</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;

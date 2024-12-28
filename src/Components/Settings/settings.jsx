import React, { useState } from 'react';
import './settings.css';

const Settings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Current password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateUsername = async () => {
        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch('/api/update-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.message || "An error occurred");
            }
        } catch (err) {
            console.error("Error updating username:", err);
            alert("An error occurred while updating username");
        }
    };

    const handleUpdateEmail = async () => {
        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch('/api/update-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.message || "An error occurred");
            }
        } catch (err) {
            console.error("Error updating email:", err);
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
            const token = localStorage.getItem('authToken');

            const response = await fetch('/api/update-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.message || "An error occurred");
            }
        } catch (err) {
            console.error("Error updating password:", err);
            alert("An error occurred while updating password");
        }
    };

    return (
        <div className='settings-container'>
            <h1>Settings</h1>
            <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
                {/* Row for Username and Email */}
                <div className="row-group">
                    {/* Username Update Section */}
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

                    {/* Email Update Section */}
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

                {/* Password Update Section */}
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

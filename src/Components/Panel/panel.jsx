import React, { useState, useEffect } from "react";
import "./panel.css";
import axios from "axios";
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import the hamburger and close icons

const Panel = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("User is not logged in");
                return;
            }

            const response = await axios.get("http://localhost:5000/get-username", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsername(response.data.username);
            setProfilePic(response.data.profilePic);
        } catch (error) {
            console.error("Error fetching user details:", error);
            alert("Error fetching user details. Please try again later.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out successfully");
        navigate("/");
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const openFilePicker = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                setFile(selectedFile);
                uploadProfilePic(selectedFile);
            }
        };
        fileInput.click();
    };

    const uploadProfilePic = async (selectedFile) => {
        const token = localStorage.getItem("token");
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("profilePic", selectedFile);

        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:5000/upload-profile-pic",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setProfilePic(response.data.filePath);
            alert("Profile picture updated successfully");
            setShowModal(false);
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Error uploading profile picture. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="panel-container">
            {/* Hamburger Menu (visible on mobile) */}
            <div className="hamburger-menu" onClick={toggleSidebar}>
                {sidebarOpen ? (
                    <FaTimes size={30} style={{ color: '#fff' }} onClick={toggleSidebar} />
                ) : (
                    <FaBars size={30} style={{ color: '#2c3e50' }} onClick={toggleSidebar} />
                )}
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="profile-section">
                    {profilePic ? (
                        <img
                            src={`http://localhost:5000/${profilePic}`}
                            alt="Profile"
                            className="profile-pic"
                            onClick={openModal}
                        />
                    ) : (
                        <div className="placeholder-pic" onClick={openModal}>
                            Upload Photo
                        </div>
                    )}
                </div>
                <div className="username">
                    {username ? `Welcome, ${username}` : "Loading..."}
                </div>
                <ul className="nav-item">
                    <li>
                        <Link to="/home">Home</Link>
                    </li>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                        <Link to="/settings">Settings</Link>
                    </li>
                    <li onClick={handleLogout}>Logout</li>
                </ul>
            </div>

            <div className="content-details">
                <Outlet />
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {profilePic && !file && (
                            <img
                                src={`http://localhost:5000/${profilePic}`}
                                alt="Current Profile"
                                className="profile-pic"
                                style={{ marginBottom: "20px" }}
                            />
                        )}
                        {file && (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Selected Profile"
                                className="profile-pic"
                                style={{ marginBottom: "20px" }}
                            />
                        )}
                        <button onClick={openFilePicker} disabled={loading}>
                            Update
                        </button>
                        <button className="close-btn" onClick={closeModal}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Panel;

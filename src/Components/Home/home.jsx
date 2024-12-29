import React, { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";

const Home = () => {
    const [userData, setUserData] = useState({
        amountRemaining: 0,
        amountShopping: 0,
        amountFD: 0,
        amountBills: 0,
        amountOther: 0,
        transactions: [],
    });


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/user-data", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserData(response.data);
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        fetchUserData();
    }, []);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        const amount = parseFloat(e.target.elements[0].value); // Parse to a number

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/add-money", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(`New balance: ₹${data.amountRemaining}`);
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while adding money.");
        }
    };

    const handleAddExpenditure = async (e) => {
        e.preventDefault();
        const purpose = e.target.elements[0].value;
        const sum = parseFloat(e.target.elements[1].value); // Parse to a number
        const date = e.target.elements[2].value;
        const category = e.target.elements["category"].value;

        if (isNaN(sum) || sum <= 0) {
            alert("Please enter a valid expenditure amount.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/add-expenditure", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ purpose, sum, date, category }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Remaining balance: ₹${data.amountRemaining}`);
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while adding expenditure.");
        }
    };

    return (
        <div className="content">
            <div className="card green balance">
                <h3>Balance</h3>
                <p>₹{userData.amountRemaining}</p>
            </div>
            <div className="card blue">
                <h3>Shopping</h3>
                <p>₹{userData.amountShopping}</p>
            </div>
            <div className="card yellow">
                <h3>Food and Drinks</h3>
                <p>₹{userData.amountFD}</p>
            </div>
            <div className="card red">
                <h3>Bills & Utilities</h3>
                <p>₹{userData.amountBills}</p>
            </div>
            <div className="card black">
                <h3>Others</h3>
                <p>₹{userData.amountOther}</p>
            </div>
            <div className="transaction-table">
                <h2>Transaction History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Purpose</th>
                            <th>Category</th>
                            <th>Sum</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userData.transactions && userData.transactions.length > 0 ? (
                            userData.transactions
                                .sort((a, b) => {
                                    const dateA = new Date(a.date);
                                    const dateB = new Date(b.date);
                                    // First, compare the dates. If they are the same, compare the time.
                                    return dateB - dateA; // Sort by date in descending order
                                })
                                .map((transaction, index) => (
                                    <tr key={index}>
                                        <td>{transaction.purpose}</td>
                                        <td>{transaction.category}</td>
                                        <td>₹{transaction.sum}</td>
                                        <td>{new Date(transaction.date).toLocaleString()}</td> {/* Shows both date and time */}
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="4">No transactions available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="form-add-money">
                <h2>Add Money</h2>
                <form onSubmit={handleAddMoney}>
                    <div className="form-group">
                        <label>Amount</label>
                        <input type="number" placeholder="Enter amount" />
                    </div>
                    <button type="submit" className="submit-button">
                        Add Money
                    </button>
                </form>
            </div>
            <div className="form-data">
                <div className="form-add-transaction">
                    <h2>Add Expenditure</h2>
                    <form onSubmit={handleAddExpenditure}>
                        <div className="form-group">
                            <label>Purpose</label>
                            <input type="text" placeholder="Enter purpose" />
                        </div>
                        <div className="form-group">
                            <label>Sum</label>
                            <input type="number" placeholder="Enter sum" />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" />
                        </div>
                        <div className="form-group categories">
                            <label>
                                <input type="radio" name="category" value="shopping" />
                                Shopping
                            </label>
                            <label>
                                <input type="radio" name="category" value="foodAndDrinks" />
                                Food & Drinks
                            </label>
                            <label>
                                <input type="radio" name="category" value="billsAndUtilities" />
                                Bills & Utilities
                            </label>
                            <label>
                                <input type="radio" name="category" value="others" />
                                Others
                            </label>
                        </div>
                        <button type="submit" className="submit-button">
                            Add Expenditure
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Home;

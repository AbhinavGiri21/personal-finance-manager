import React, { useState, useEffect } from "react";
import "./home.css";

const Dashboard = () => {
    const [expenses, setExpenses] = useState({
        balance: 0,
        shopping: 0,
        foodAndDrinks: 0,
        billsAndUtilities: 0,
        others: 0,
    });

    const [transactions, setTransactions] = useState([]); // State for recent transactions
    const [formData, setFormData] = useState({
        purpose: "",
        sum: "",
        date: "",
        category: "shopping",
    });
    const [addMoney, setAddMoney] = useState("");

    const fetchData = async () => {
        // Simulated API fetch logic (set to 0 for default)
        setExpenses({
            balance: 0,
            shopping: 0,
            foodAndDrinks: 0,
            billsAndUtilities: 0,
            others: 0,
        });
        setTransactions([]);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add money to the balance
    const handleAddMoney = (e) => {
        e.preventDefault();
        const amount = parseFloat(addMoney);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount!");
            return;
        }
        setExpenses((prevState) => ({
            ...prevState,
            balance: prevState.balance + amount,
        }));
        setAddMoney(""); // Clear the input field
    };

    // Add expenditure and update the balance
    const handleAddExpenditure = (e) => {
        e.preventDefault();
        const { purpose, sum, category, date } = formData;
        const expenseAmount = parseFloat(sum);

        if (isNaN(expenseAmount) || expenseAmount <= 0 || !purpose || !date) {
            alert("Please fill in all fields with valid data!");
            return;
        }

        if (expenseAmount > expenses.balance) {
            alert("Insufficient balance!");
            return;
        }

        // Update balance and category
        setExpenses((prevState) => ({
            ...prevState,
            balance: prevState.balance - expenseAmount,
            [category]: prevState[category] + expenseAmount,
        }));

        // Add transaction
        setTransactions((prevTransactions) => [
            {
                purpose,
                category,
                sum: -expenseAmount,
                date,
            },
            ...prevTransactions,
        ]);

        // Clear the form
        setFormData({
            purpose: "",
            sum: "",
            date: "",
            category: "shopping",
        });
    };

    return (
        <div className="content">
            {/* Expense Summary Cards */}
            <div className="card green balance">
                <h3>Balance</h3>
                <p>₹{expenses.balance}</p>
            </div>
            <div className="card blue">
                <h3>Shopping</h3>
                <p>₹{expenses.shopping}</p>
            </div>
            <div className="card yellow">
                <h3>Food and Drinks</h3>
                <p>₹{expenses.foodAndDrinks}</p>
            </div>
            <div className="card red">
                <h3>Bills & Utilities</h3>
                <p>₹{expenses.billsAndUtilities}</p>
            </div>
            <div className="card black">
                <h3>Others</h3>
                <p>₹{expenses.others}</p>
            </div>
            {/* Recent Transactions Table */}
            <div className="transaction-details">
                <h2>Recent Transactions</h2>
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Purpose</th>
                            <th>Category</th>
                            <th>Sum</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td>{transaction.purpose}</td>
                                    <td>{transaction.category}</td>
                                    <td className={transaction.sum > 0 ? "positive" : "negative"}>
                                        ₹{transaction.sum}
                                    </td>
                                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
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
            {/* Forms for Add Money and Add Expenditure */}
            <div className="forms-container">
                <div className="form-add-money">
                    <h2>Add Money</h2>
                    <form onSubmit={handleAddMoney}>
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                value={addMoney}
                                onChange={(e) => setAddMoney(e.target.value)}
                                placeholder="Enter amount"
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            Add Money
                        </button>
                    </form>
                </div>

                <div className="form add-transaction">
                    <h2>Add Expenditure</h2>
                    <form onSubmit={handleAddExpenditure}>
                        <div className="form-group">
                            <label>Purpose</label>
                            <input
                                type="text"
                                value={formData.purpose}
                                onChange={(e) =>
                                    setFormData({ ...formData, purpose: e.target.value })
                                }
                                placeholder="Enter purpose"
                            />
                        </div>
                        <div className="form-group">
                            <label>Sum</label>
                            <input
                                type="number"
                                value={formData.sum}
                                onChange={(e) =>
                                    setFormData({ ...formData, sum: e.target.value })
                                }
                                placeholder="Enter sum"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-group categories">
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="shopping"
                                    checked={formData.category === "shopping"}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                />
                                Shopping
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="foodAndDrinks"
                                    checked={formData.category === "foodAndDrinks"}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                />
                                Food & Drinks
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="billsAndUtilities"
                                    checked={formData.category === "billsAndUtilities"}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                />
                                Bills & Utilities
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="category"
                                    value="others"
                                    checked={formData.category === "others"}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                />
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

export default Dashboard;

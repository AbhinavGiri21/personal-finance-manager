import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import './profile.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Fetch user data from the backend
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user-data', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Calculate the total expenditure
    const totalExpenditure =
        (userData?.amountShopping || 0) +
        (userData?.amountFD || 0) +
        (userData?.amountBills || 0) +
        (userData?.amountOther || 0);

    // Prepare chart data for bar chart
    const barChartData = {
        labels: ['Shopping', 'Food & Drinks', 'Bills', 'Other'],
        datasets: [
            {
                label: 'Expenditure',
                data: [
                    userData?.amountShopping,
                    userData?.amountFD,
                    userData?.amountBills,
                    userData?.amountOther,
                ],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6'],
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    };

    // Prepare chart data for pie chart
    const pieChartData = {
        labels: ['Shopping', 'Food & Drinks', 'Bills', 'Other'],
        datasets: [
            {
                label: 'Expenditure Percentage',
                data: [
                    (userData?.amountShopping / totalExpenditure) * 100,
                    (userData?.amountFD / totalExpenditure) * 100,
                    (userData?.amountBills / totalExpenditure) * 100,
                    (userData?.amountOther / totalExpenditure) * 100,
                ],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6'],
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    };

    // Options for pie chart with reduced size
    const pieChartOptions = {
        responsive: true, // Make the chart responsive
        maintainAspectRatio: false, // Allow the chart size to change
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                    },
                },
            },
        },
    };

    const generatePDF = () => {
        const input = document.getElementById('report-container');

        // Wait for all images to load
        const images = input.querySelectorAll('img');
        let loadedImages = 0;

        images.forEach((image) => {
            if (image.complete) {
                loadedImages++;
            } else {
                image.onload = () => {
                    loadedImages++;
                    if (loadedImages === images.length) {
                        captureContent();
                    }
                };
            }
        });

        // If no images are present, directly capture the content
        if (images.length === 0 || loadedImages === images.length) {
            captureContent();
        }

        // Function to capture the content and generate the PDF
        function captureContent() {
            html2canvas(input, { useCORS: true })
                .then((canvas) => {
                    try {
                        const pdf = new jsPDF();
                        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 160);

                        // Now, only add the pie chart, as bar chart is already captured
                        const pieCanvas = document.getElementById('pie-chart');
                        if (pieCanvas) {
                            pdf.addPage();
                            pdf.addImage(pieCanvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 160);
                        }

                        pdf.save('report.pdf');
                    } catch (pdfError) {
                        console.error('Error generating PDF:', pdfError);
                    }
                })
                .catch((error) => {
                    console.error('Error capturing content:', error);
                });
        }
    };

    return (
        <div className="profile-container">
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <button
                    onClick={generatePDF}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                    }}
                >
                    Download Report
                </button>
            </div>

            <div id="report-container" className="chart-container">
                <h3>Expenditure Breakdown (Bar Chart)</h3>
                <Bar data={barChartData} id="bar-chart" />
            </div>

            <div id="report-container" className="chart-container" style={{ width: '50%', height: '300px' }}>
                <h3>Expenditure Breakdown (Pie Chart)</h3>
                <Pie data={pieChartData} options={pieChartOptions} id="pie-chart" />
            </div>
        </div>
    );
};

export default Profile;

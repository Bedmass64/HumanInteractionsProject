import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        // navigate('/TaskListifyPage');
        navigate('./tasks');
    };

    return (
        <div className ='welcome-container'>
            <h1>Welcome to TaskListify!</h1>
            <p>Content about app</p>
            <button onClick={handleButtonClick}>Make List!</button>
        </div>
    );
};

export default WelcomePage;
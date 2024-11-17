import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const reviews = [
        "TaskListify helped me organize my life! ⭐⭐⭐⭐⭐",
        "Fantastic app for productivity. ⭐⭐⭐⭐⭐",
        "Super easy to use and very helpful. ⭐⭐⭐⭐⭐",
    ];
    const inspirationalQuote = "Stay focused and never give up on your goals!";
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        ...reviews,
        inspirationalQuote,
        { type: "image", src: "/path-to-your-example-screenshot.png" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000); // Change slide every 3 seconds
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleButtonClick = () => {
        navigate('./tasks');
    };

    const handleLoginClick = () => {
        navigate('./login');
    };

    return (
        <div className="welcome-container">
            <button className="login-button" onClick={handleLoginClick}>Log In</button>
            <h1>Welcome to TaskListify!</h1>
            <div className="slideshow">
                {typeof slides[currentSlide] === "string" ? (
                    <p>{slides[currentSlide]}</p>
                ) : (
                    <img src={slides[currentSlide].src} alt="Example screenshot" />
                )}
            </div>
            <button onClick={handleButtonClick}>Make List!</button>
        </div>
    );
};

export default WelcomePage;

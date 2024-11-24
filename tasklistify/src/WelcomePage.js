// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './WelcomePage.css';

// const WelcomePage = () => {
//     const navigate = useNavigate();

//     const reviews = [
//         "TaskListify helped me organize my life! ⭐⭐⭐⭐⭐",
//         "Fantastic app for productivity. ⭐⭐⭐⭐⭐",
//         "Super easy to use and very helpful. ⭐⭐⭐⭐⭐",
//     ];
//     const inspirationalQuote = "Stay focused and never give up on your goals!";
//     const [currentSlide, setCurrentSlide] = useState(0);

//     const slides = [
//         ...reviews,
//         inspirationalQuote,
//         { type: "image", src: "/path-to-your-example-screenshot.png" },
//     ];

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % slides.length);
//         }, 3000); // Change slide every 3 seconds
//         return () => clearInterval(interval);
//     }, [slides.length]);

//     const handleMakeListClick = () => {
//         navigate('./tasks');
//     };

//     const handleLoginClick = () => {
//         navigate('./login');
//     };

//     const handleCreateAccountClick = () => {
//         navigate('./create-account');
//     };

//     return (
//         <div className="welcome-container">
//             <div className="auth-buttons">
//                 <button className="login-button" onClick={handleLoginClick}>Log In</button>
//                 <button className="create-account-button" onClick={handleCreateAccountClick}>
//                     Create Account
//                 </button>
//             </div>
//             <h1>Welcome to TaskListify!</h1>
//             <div className="slideshow">
//                 {typeof slides[currentSlide] === "string" ? (
//                     <p>{slides[currentSlide]}</p>
//                 ) : (
//                     <img src={slides[currentSlide].src} alt="Example screenshot" />
//                 )}
//             </div>
//             <button onClick={handleMakeListClick}>Make List!</button>
//         </div>
//     );
// };

// export default WelcomePage;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './WelcomePage.css';
// import exampleScreenshot from "./images/Example_Screenshot.png";

// const WelcomePage = () => {
//     const navigate = useNavigate();

//     const inspirationalQuotes = ['"Stay focused and never give up on your goals!" - Scooby doo',
//         '"Dream big, start small, but most importantly, start." - Winnie the Poo',
//         '"Progress over prefection" - Scibbidy doo bop',
//     ];
//     const [currentSlide, setCurrentSlide] = useState(0);

//     const slides = [
//         ...inspirationalQuotes,
//         { type: "image", src: exampleScreenshot},
//     ];

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentSlide((prev) => (prev + 1) % slides.length);
//         }, 6000); // Change slide every 6 seconds
//         return () => clearInterval(interval);
//     }, [slides.length]);

//     const handleMakeListClick = () => {
//         navigate('/tasks');
//     };

//     const handleLoginClick = () => {
//         navigate('/login');
//     };

//     const handleCreateAccountClick = () => {
//         navigate('/create-account');
//     };

//     return (
//         <div className="welcome-container">
//             <div className="auth-buttons">
//                 <button className="login-button" onClick={handleLoginClick}>Log In</button>
//                 <button className="create-account-button" onClick={handleCreateAccountClick}>
//                     Create Account
//                 </button>
//             </div>
//             <h1>Welcome to TaskListify!</h1>
//              <div className="slideshow">
//                 {typeof slides[currentSlide] === "string" ? (
//                     <p>{slides[currentSlide]}</p>
//                 ) : slides[currentSlide]?.type === "image" ? (
//                     <img src={slides[currentSlide].src} alt="Example screenshot" />
//                 ) : null}
//             </div>

//             <button onClick={handleMakeListClick}>Make List!</button>
//         </div>
//     );
// };

// export default WelcomePage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';
import exampleScreenshot from "./images/Example_Screenshot.png";
import logo from "./images/logo.png"; // Import the logo image

const WelcomePage = () => {
    const navigate = useNavigate();

    const inspirationalQuotes = [
        '"Stay focused and never give up on your goals!" - Scooby Doo',
        '"The problem is not the problem, the problem is your attitude about the problem." - Captain Jack Sparrow',
        '"Dream big, start small, but most importantly, start." - Winnie the Pooh',
        '"Progress over perfection." - Scibbidy Doo Bop',
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        ...inspirationalQuotes,
        { type: "image", src: exampleScreenshot },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000); // Change slide every 6 seconds
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleMakeListClick = () => {
        navigate('/tasks');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleCreateAccountClick = () => {
        navigate('/create-account');
    };

    return (
        <div className="welcome-container">
            <div className="auth-buttons">
                <button className="login-button" onClick={handleLoginClick}>Log In</button>
                <button className="create-account-button" onClick={handleCreateAccountClick}>
                    Create Account
                </button>
            </div>
            {/* Add the logo image here */}
            <img src={logo} alt="Logo" className="logo-image" />
            <h1>Welcome to TaskListify!</h1>
            <div className="slideshow">
                {typeof slides[currentSlide] === "string" ? (
                    <p>{slides[currentSlide]}</p>
                ) : slides[currentSlide]?.type === "image" ? (
                    <img src={slides[currentSlide].src} alt="Example screenshot" />
                ) : null}
            </div>
            <button onClick={handleMakeListClick}>Make List!</button>
        </div>
    );
};

export default WelcomePage;

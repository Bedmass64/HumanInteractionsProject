// import { useState } from 'react';
// import './LoginPage.css';

// const LoginPage = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log('Email:', email, 'Password:', password);
//     };

//     return (
//         <div className="login-container">
//             <h1>Log In</h1>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button type="submit">Log In</button>
//             </form>
//         </div>
//     );
// };

// export default LoginPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        //Adds local storage to current database.
        // localStorage.clear();
        // Retrieve saved credentials from local storage
        const savedCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};

        if (savedCredentials[email] && savedCredentials[email] === password) {
            alert('Login successful!');
            navigate('/tasks'); // Navigate to TaskListifyPage
        } else {
            alert('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default LoginPage;

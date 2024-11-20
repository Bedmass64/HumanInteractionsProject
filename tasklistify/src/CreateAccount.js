

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './CreateAccount.css';

// const CreateAccount = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [phone, setPhone] = useState('');
//     const navigate = useNavigate();

//     const handleEmailChange = (e) => {
//         setEmail(e.target.value);
//         console.log("Email:", e.target.value); // Debugging email state
//     };

//     const handlePasswordChange = (e) => {
//         setPassword(e.target.value);
//     };

//     const handleConfirmPasswordChange = (e) => {
//         setConfirmPassword(e.target.value);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault()
//         console.log("Form Submission Data:", { email, password, confirmPassword });;

//         // Validation
//         if (!email || !password || !confirmPassword || !phone) {
//             alert('All fields are required!');
//             return;
//         }

//         if (password !== confirmPassword) {
//             alert('Passwords do not match!');
//             return;
//         }

//         if (!/^\d{10}$/.test(phone)) {
//             alert('Please enter a valid 10-digit phone number.');
//             return;
//         }

//         // Retrieve existing credentials
//         const existingCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};

//         // Check if email already exists
//         if (existingCredentials[email]) {
//             alert('An account with this email already exists!');
//             return;
//         }

//         // Save credentials
//         existingCredentials[email] = password;
//         localStorage.setItem('userCredentials', JSON.stringify(existingCredentials));

//         alert('Account created successfully!');
//         navigate('/login'); // Redirect to login page
//     };

//     return (
//         <div className="create-account-container">
//             <h1>Create Account</h1>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={handleEmailChange}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={handlePasswordChange}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Confirm Password"
//                     value={confirmPassword}
//                     onChange={handleConfirmPasswordChange}
//                     required
//                 />
//                 <input
//                     type="text"
//                     placeholder="Phone Number (10 digits)"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Create Account</button>
//             </form>
//         </div>
//     );
// };

// export default CreateAccount;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateAccount = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!email || !password || !confirmPassword || !phone) {
            alert('All fields are required!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        // Retrieve existing credentials
        const existingCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};

        // Check if email already exists
        if (existingCredentials[email]) {
            alert('An account with this email already exists!');
            return;
        }

        // Save credentials
        existingCredentials[email] = { password, phone };
        localStorage.setItem('userCredentials', JSON.stringify(existingCredentials));

        alert('Account created successfully!');
        navigate('/login'); // Redirect to login page
    };

    return (
        <div className="create-account-container">
            <h1>Create Account</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Phone Number (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <button type="submit">Create Account</button>
            </form>
        </div>
    );
};

export default CreateAccount;

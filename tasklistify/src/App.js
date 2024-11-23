// // src/App.js
// "use client";

// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import WelcomePage from './WelcomePage';
// import TaskListifyPage from './TaskListifyPage';
// import LoginPage from './LoginPage';
// import CreateAccount from './CreateAccount';


// export default function App() {
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<WelcomePage />} />
//                 <Route path="/tasks" element={<TaskListifyPage />} />
//                 <Route path="/create-account" element={<CreateAccount />} />
//                 <Route path="/login" element={<LoginPage />} />
//             </Routes>
//         </Router>
//     );
// }


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import TaskListifyPage from './TaskListifyPage';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';
import SharePage from './SharePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/tasks" element={<TaskListifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="*" element={<TaskListifyPage />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default App;



// src/App.js
"use client";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import TaskListifyPage from './TaskListifyPage';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Define the route for the welcome page */}
                <Route path="/" element={<WelcomePage />} />

                {/* Define the route for the main TaskListify page */}
                <Route path="/tasks" element={<TaskListifyPage />} />
            </Routes>
        </Router>
    );
}

}

// src/App.js
"use client";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import TaskListifyPage from './TaskListifyPage';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';


export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/tasks" element={<TaskListifyPage />} />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}


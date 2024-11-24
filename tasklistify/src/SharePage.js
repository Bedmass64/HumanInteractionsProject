//Not fully working because issues with server.js, sendgrid and twilio.
//Wrote out the visual component for the page, but does not do the intended functionality.

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskListify from './TaskListify';
import TaskList from './TaskList';

const SharePage = () => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const navigate = useNavigate();

  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const layout = localStorage.getItem('layout') || 'row';
  const firstDayOfWeek = localStorage.getItem('firstDayOfWeek') || 'Sunday';
  const hiddenDays = JSON.parse(localStorage.getItem('hiddenDays')) || [];

  const taskListify = new TaskListify();

  const getOrderedDaysOfWeek = () => {
    const days = taskListify.daysOfWeek;
    const firstDayIndex = days.indexOf(firstDayOfWeek);
    const orderedDays = [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
    return orderedDays.filter((day) => !hiddenDays.includes(day));
  };

  const taskListRef = useRef(null);

  const handleShare = () => {
    if (!recipientName.trim() || (!recipientEmail.trim() && !recipientPhone.trim())) {
      alert("Please enter the recipient's name and at least one contact method.");
      return;
    }

    const messageContent = taskListRef.current.innerHTML;

    // For demonstration, log messageContent to the console
    console.log(`Sending the following content to ${recipientName}:\n${messageContent}`);

    alert(`Task list shared with ${recipientName}!`);

    navigate('/tasks');
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  return (
    <div style={{ backgroundColor: "#b3cde3", minHeight: "100vh", padding: "40px 0", color: "#000" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px", backgroundColor: "#ffffffcc", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
        <h1 style={{ color: "#005b96", textAlign: "center", fontSize: "2.5em", fontWeight: "bold", marginBottom: "20px" }}>
          Share Task List
        </h1>

        {/* Form Section */}
        <div style={{ border: "1px solid #005b96", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label>Recipient's Name:</label>
            <input
              type="text"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Recipient's Email:</label>
            <input
              type="email"
              placeholder="example-email@gmail.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Recipient's Phone Number:</label>
            <input
              type="tel"
              placeholder="(XXX)-XXX-XXXX"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
            />
          </div>
          <button
            onClick={handleShare}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              backgroundColor: "#005b96",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "1em",
            }}
          >
            Send Task List
          </button>
          <button
            onClick={handleBack}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              backgroundColor: "#ccc",
              color: "#000",
              border: "none",
              borderRadius: "5px",
              fontSize: "1em",
            }}
          >
            Back to Task List
          </button>
        </div>

        {/* Hidden div to render the task list and get its HTML */}
        <div ref={taskListRef} style={{ display: 'none' }}>
          <TaskList
            tasks={tasks}
            layout={layout}
            getOrderedDaysOfWeek={getOrderedDaysOfWeek}
            taskListify={taskListify}
          />
        </div>
      </div>
    </div>
  );
};

export default SharePage;

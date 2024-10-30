// App.js
import React, { useState } from 'react';
import TaskList from './TaskList';
import Task from './Task';

const App = () => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [taskLists, setTaskLists] = useState(() => {
        const initialLists = {};
        daysOfWeek.forEach(day => { initialLists[day] = new TaskList(); });
        return initialLists;
    });
    const [input, setInput] = useState({ day: 'Every day', eventName: '', timesPerDay: 1 });

    const handleAddTask = () => {
        daysOfWeek.forEach(day => {
            if (input.day === 'Every day' || 
                (input.day === 'Weekends' && (day === 'Saturday' || day === 'Sunday')) ||
                (input.day === 'Weekdays' && day !== 'Saturday' && day !== 'Sunday') ||
                input.day === day) {
                    const newTask = new Task(input.eventName, input.timesPerDay);
                    taskLists[day].addTask(newTask);
                }
        });
        setTaskLists({ ...taskLists });
        setInput({ day: 'Every day', eventName: '', timesPerDay: 1 });
    };

    return (
        <div>
            <h2>Hello, welcome to TaskListify</h2>
            <div>
                <label>Event Name:</label>
                <input type="text" value={input.eventName} 
                    onChange={e => setInput({ ...input, eventName: e.target.value })} />
                <label>Times per Day:</label>
                <input type="number" value={input.timesPerDay} min="1" 
                    onChange={e => setInput({ ...input, timesPerDay: parseInt(e.target.value) })} />
                <label>Day:</label>
                <select value={input.day} onChange={e => setInput({ ...input, day: e.target.value })}>
                    <option>Every day</option>
                    <option>Weekends</option>
                    <option>Weekdays</option>
                    {daysOfWeek.map(day => <option key={day}>{day}</option>)}
                </select>
                <button onClick={handleAddTask}>Add Task</button>
            </div>
            <div>
                <h3>Task Lists:</h3>
                {daysOfWeek.map(day => (
                    <div key={day}>
                        <h4>{day}</h4>
                        {taskLists[day].getTasks().map((task, idx) => (
                            <p key={idx}>Event: {task.eventName}, Times per day: {task.timesPerDay}</p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;

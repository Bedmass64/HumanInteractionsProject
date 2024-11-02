"use client";

import { useState } from 'react';
import Task from './Task';
import TaskListify from './TaskListify';

export default function TaskListifyPage() {
    const [taskName, setTaskName] = useState('');
    const [timesPerDay, setTimesPerDay] = useState(1);
    const [eventDays, setEventDays] = useState('everyday');
    const [manualDays, setManualDays] = useState([]);
    const [showTime, setShowTime] = useState(false);
    const [timesOfTheDay, setTimesOfTheDay] = useState([{ start: '', end: '' }]);
    const [layout, setLayout] = useState('row');
    const [tasks, setTasks] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [firstDayOfWeek, setFirstDayOfWeek] = useState('Sunday');
    const taskListify = new TaskListify();

    const handleAddTask = () => {
        const daysMapping = {
            everyday: taskListify.daysOfWeek,
            weekends: ["Saturday", "Sunday"],
            weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            wmf: ["Wednesday", "Monday", "Friday"],
            tt: ["Tuesday", "Thursday"],
            custom: manualDays,
        };

        const days = daysMapping[eventDays] || taskListify.daysOfWeek;
        const taskTimes = Array.from({ length: timesPerDay }, (_, i) => ({
            start: showTime ? timesOfTheDay[i].start : '',
            end: showTime ? timesOfTheDay[i].end : ''
        }));

        days.forEach(day => {
            taskListify.addTaskToDays([day], new Task(taskName, timesPerDay, taskTimes));
        });

        setTasks(prevTasks => [
            ...prevTasks,
            { taskName, timesPerDay, taskTimes, days }
        ]);

        setTaskName('');
        setTimesPerDay(1);
        setManualDays([]);
        setTimesOfTheDay([{ start: '', end: '' }]);
        setShowTime(false);
    };

    const downloadTasks = () => {
        const formattedTasks = tasks.map(task => {
            return task.days.map(day => {
                return `${day}: ${task.taskName} (${task.timesPerDay} times) - ${
                    task.taskTimes.map(t => t.start && t.end ? `from ${t.start} to ${t.end}` : '').join(', ')
                }`;
            }).join('\n');
        }).join('\n\n');

        const blob = new Blob([formattedTasks], { type: 'text/plain' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `tasklist.txt`;
        link.click();
    };

    const handleTimesChange = (value) => {
        setTimesPerDay(value);
        setTimesOfTheDay(Array(value).fill({ start: '', end: '' }));
    };

    const handleTimeChange = (index, type, value) => {
        const times = [...timesOfTheDay];
        times[index][type] = value;
        setTimesOfTheDay(times);
    };

    const handleManualDayChange = (day) => {
        setManualDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    // Helper function to order days based on the firstDayOfWeek selection
    const getOrderedDaysOfWeek = () => {
        const days = taskListify.daysOfWeek;
        const firstDayIndex = days.indexOf(firstDayOfWeek);
        return [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
    };

    return (
        <div style={{ backgroundColor: '#b3cde3', minHeight: '100vh', padding: '40px 0', color: '#000' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', backgroundColor: '#ffffffcc', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                
                <h1 style={{ color: '#005b96', textAlign: 'center', fontSize: '2.5em', fontWeight: 'bold', marginBottom: '20px' }}>
                    TaskListify
                </h1>

                {/* First Rectangle: Event Details */}
                <div style={{ border: '1px solid #005b96', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Event Name:</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Times per Day:</label>
                        <select
                            value={timesPerDay}
                            onChange={(e) => handleTimesChange(Number(e.target.value))}
                            style={{ width: '100%', marginTop: '5px', padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box' }}
                        >
                            {[...Array(7)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Event Days:</label>
                        <select
                            value={eventDays}
                            onChange={(e) => setEventDays(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box' }}
                        >
                            <option value="everyday">Every Day</option>
                            <option value="weekends">Weekends</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="wmf">WMF (Wed, Mon, Fri)</option>
                            <option value="tt">TT (Tue, Thu)</option>
                            <option value="custom">Manually Select</option>
                        </select>

                        {eventDays === 'custom' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                                {taskListify.daysOfWeek.map(day => (
                                    <label key={day} style={{ marginRight: '10px', color: '#000' }}>
                                        <input
                                            type="checkbox"
                                            checked={manualDays.includes(day)}
                                            onChange={() => handleManualDayChange(day)}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Would You Like to Select a Time?</label>
                        <input
                            type="checkbox"
                            checked={showTime}
                            onChange={() => setShowTime(!showTime)}
                            style={{ marginLeft: '10px' }}
                        />
                    </div>
                    
                    {/* Time of Event Section */}
                    {showTime && (
                        <div style={{ marginTop: '15px' }}>
                            {timesOfTheDay.map((time, index) => (
                                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="time"
                                        value={time.start}
                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                        placeholder="Start Time"
                                        style={{ padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box', width: '100%' }}
                                    />
                                    <input
                                        type="time"
                                        value={time.end}
                                        onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                        placeholder="End Time"
                                        style={{ padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box', width: '100%' }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <button onClick={handleAddTask} style={{ width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#005b96', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '1em' }}>Add Task</button>
                <button onClick={downloadTasks} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#005b96', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '1em' }}>Download Task List</button>
                <button onClick={toggleEditMode} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#005b96', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '1em' }}>{editMode ? "Exit Edit Mode" : "Edit Tasks"}</button>

                {/* Task List by Day */}
                <div style={{ marginTop: '30px' }}>
                    <h2 style={{ textAlign: 'center', color: '#005b96' }}>Task List by Day</h2>
                    <div style={{ display: layout === 'row' ? 'block' : 'grid', gap: '20px', gridTemplateColumns: layout === 'column' ? 'repeat(4, 1fr)' : 'initial' }}>
                        {getOrderedDaysOfWeek().map(day => (
                            <div key={day} style={{ padding: '10px', border: '1px solid #005b96', borderRadius: '5px', backgroundColor: '#e1f5fe', marginBottom: '10px' }}>
                                <h3 style={{ color: '#005b96', fontWeight: 'bold', marginBottom: '5px' }}>{day}</h3>
                                <ul style={{ padding: '0', listStyle: 'none', color: '#000' }}>
                                    {tasks.filter(task => task.days.includes(day)).map((task, index) => (
                                        <li key={index} style={{ marginBottom: '5px' }}>
                                            <strong>{task.taskName}</strong>
                                            {task.taskTimes.map((time, i) => (
                                                <span key={i} style={{ display: 'inline-block', padding: '2px 5px', border: '1px solid #005b96', borderRadius: '3px', marginRight: '5px' }}>{time.start} - {time.end}</span>
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Section */}
                <div style={{ border: '1px solid #005b96', borderRadius: '10px', padding: '20px', marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold', color: '#005b96' }}>Settings</label>
                    <div style={{ marginTop: '10px' }}>
                        <label>Display Layout:</label>
                        <select
                            value={layout}
                            onChange={(e) => setLayout(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box' }}
                        >
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label>First Day of the Week:</label>
                        <select
                            value={firstDayOfWeek}
                            onChange={(e) => setFirstDayOfWeek(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', padding: '10px', border: '1px solid #005b96', borderRadius: '5px', boxSizing: 'border-box' }}
                        >
                            {taskListify.daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

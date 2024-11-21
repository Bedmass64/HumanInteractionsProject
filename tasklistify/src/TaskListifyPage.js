"use client";

import { useState } from "react";
import Task from "./Task";
import TaskListify from "./TaskListify";

export default function TaskListifyPage() {
    const [taskName, setTaskName] = useState("");
    const [timesPerDay, setTimesPerDay] = useState(1);
    const [eventDays, setEventDays] = useState("everyday");
    const [manualDays, setManualDays] = useState([]);
    const [showTime, setShowTime] = useState(false);
    const [timesOfTheDay, setTimesOfTheDay] = useState([{ hour: "", minute: "", amPm: "", note: "" }]);
    const [layout, setLayout] = useState("row");
    const [tasks, setTasks] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [firstDayOfWeek, setFirstDayOfWeek] = useState("Sunday");
    const [hiddenDays, setHiddenDays] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    const taskListify = new TaskListify();

    // Utility: Get Final Times
    const getFinalTimes = () => {
        return timesOfTheDay.map(({ hour, minute, amPm, note }) => {
            if ((hour || minute) && !amPm) {
                alert("Please select AM or PM.");
                throw new Error("AM/PM is required if hours or minutes are entered.");
            }

            const time =
                hour && minute && amPm
                    ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")} ${amPm}`
                    : "";
            return { start: time, note: note || "" };
        });
    };

    // Handle adding a task
    const handleAddTask = () => {
        if (!taskName.trim()) {
            alert("Please enter a task name.");
            return;
        }

        const daysMapping = {
            everyday: taskListify.daysOfWeek,
            weekends: ["Saturday", "Sunday"],
            weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            custom: manualDays,
        };

        const days = daysMapping[eventDays] || taskListify.daysOfWeek;

        const taskTimes = getFinalTimes();

        days.forEach((day) => {
            taskListify.addTaskToDays([day], new Task(taskName, timesPerDay, taskTimes));
        });

        setTasks((prevTasks) => [...prevTasks, { taskName, timesPerDay, taskTimes, days }]);
        resetForm();
    };

    // Reset Form
    const resetForm = () => {
        setTaskName("");
        setTimesPerDay(1);
        setManualDays([]);
        setTimesOfTheDay([{ hour: "", minute: "", amPm: "", note: "" }]);
        setShowTime(false);
    };

        // Download Tasks as JSON
        const downloadTasks = () => {
            const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "tasks.json";
            link.click();
        };

        const uploadTasksJSON = (event) => {
            const file = event.target.files[0];
            if (!file) return;
        
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uploadedTasks = JSON.parse(e.target.result);
                    if (Array.isArray(uploadedTasks)) {
                        // setTasks((prevTasks) => [...prevTasks, ...uploadedTasks]); // Merge tasks
                        setTasks(uploadedTasks); // Overwrite tasks
                        alert("Tasks uploaded successfully!");
                    } else {
                        alert("Invalid file format. Please upload a valid JSON file.");
                    }
                } catch (error) {
                    alert("Error parsing the JSON file. Please ensure it is correctly formatted.");
                }
            };
            reader.readAsText(file);
        };
            
   
    // Handle Times Change
    const handleTimesChange = (value) => {
        setTimesPerDay(value);
        setTimesOfTheDay(Array.from({ length: value }, () => ({ hour: "", minute: "", amPm: "", note: "" })));
    };

    // Handle Time Change
    const handleTimeChange = (index, field, value) => {
        const updatedTimes = [...timesOfTheDay];

        if (field === "hour") {
            const hour = parseInt(value, 10);
            updatedTimes[index].hour = isNaN(hour)
                ? ""
                : Math.min(Math.max(hour, 1), 12).toString();
        } else if (field === "minute") {
            const minute = parseInt(value, 10);
            updatedTimes[index].minute = isNaN(minute)
                ? ""
                : Math.min(Math.max(minute, 0), 59).toString().padStart(2, "0");
        } else {
            updatedTimes[index][field] = value;
        }

        setTimesOfTheDay(updatedTimes);
    };

    // Toggle Hidden Day
    const toggleHiddenDay = (day) => {
        setHiddenDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    // Get Ordered Days
    const getOrderedDaysOfWeek = () => {
        const days = taskListify.daysOfWeek;
        const firstDayIndex = days.indexOf(firstDayOfWeek);
        const orderedDays = [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
        return orderedDays.filter((day) => !hiddenDays.includes(day));
    };

    return (
        <div style={{ backgroundColor: "#b3cde3", minHeight: "100vh", padding: "40px 0", color: "#000" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px", backgroundColor: "#ffffffcc", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
                <h1 style={{ color: "#005b96", textAlign: "center", fontSize: "2.5em", fontWeight: "bold", marginBottom: "20px" }}>
                    TaskListify
                </h1>

                {/* First Section */}
                <div style={{ border: "1px solid #005b96", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Event Name:</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Times per Day:</label>
                        <select
                            value={timesPerDay}
                            onChange={(e) => handleTimesChange(Number(e.target.value))}
                            style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
                        >
                            {[...Array(7)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Event Days:</label>
                        <select
                            value={eventDays}
                            onChange={(e) => setEventDays(e.target.value)}
                            style={{ width: "100%", marginTop: "5px", padding: "10px", border: "1px solid #005b96", borderRadius: "5px" }}
                        >
                            <option value="everyday">Every Day</option>
                            <option value="weekends">Weekends</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="custom">Manually Select</option>
                        </select>

                        {eventDays === "custom" && (
                            <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
                                {taskListify.daysOfWeek.map((day) => (
                                    <label key={day} style={{ marginRight: "10px", color: "#000" }}>
                                        <input
                                            type="checkbox"
                                            style={{transform: "scale(1.25)", }}
                                            checked={manualDays.includes(day)}
                                            onChange={() =>
                                                setManualDays((prev) =>
                                                    prev.includes(day)
                                                        ? prev.filter((d) => d !== day)
                                                        : [...prev, day]
                                                )
                                            }
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Would You Like to Select a Time? / Add a note to event?</label>
                        <input
                            type="checkbox"
                            
                            checked={showTime}
                            onChange={() => setShowTime(!showTime)}
                            style={{ marginLeft: "10px", transform: "scale(1.5)", }}
                        />
                    </div>

                    {showTime && (
                        <div style={{ marginTop: "15px" }}>
                            {timesOfTheDay.map((time, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "flex-start", marginBottom: "15px", gap: "10px" }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <input
                                                type="number"
                                                placeholder="HH"
                                                value={time.hour}
                                                min={1}
                                                max={12}
                                                onChange={(e) => handleTimeChange(index, "hour", e.target.value)}
                                                style={{
                                                    width: "20%",
                                                    padding: "10px",
                                                    border: "1px solid #005b96",
                                                    borderRadius: "5px",
                                                    textAlign: "center",
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="MM"
                                                value={time.minute}
                                                min={0}
                                                max={59}
                                                onChange={(e) => handleTimeChange(index, "minute", e.target.value)}
                                                style={{
                                                    width: "20%",
                                                    padding: "10px",
                                                    border: "1px solid #005b96",
                                                    borderRadius: "5px",
                                                    textAlign: "center",
                                                }}
                                            />
                                            <select
                                                value={time.amPm}
                                                onChange={(e) => handleTimeChange(index, "amPm", e.target.value)}
                                                style={{
                                                    width: "30%",
                                                    padding: "10px",
                                                    border: "1px solid #005b96",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <option value="">AM/PM</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Note for Event"
                                            value={time.note}
                                            onChange={(e) => handleTimeChange(index, "note", e.target.value)}
                                            style={{
                                                width: "100%",
                                                marginTop: "5px",
                                                padding: "10px",
                                                border: "1px solid #005b96",
                                                borderRadius: "5px",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <button
                    onClick={handleAddTask}
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
                    Add Task
                </button>
                <button
                    onClick={() => setEditMode(!editMode)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "10px",
                        backgroundColor: "#005b96",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "1em",
                    }}
                >
                    {editMode ? "Exit Edit Mode" : "Edit Tasks"}
                </button>

                {/* Task List by Day */}
                <div style={{ marginTop: "30px" }}>
                    <h2 style={{ textAlign: "center", color: "#005b96" }}>Task List by Day</h2>
                    <div
                        style={{
                            display: layout === "row" ? "block" : "grid",
                            gap: "20px",
                            gridTemplateColumns: layout === "column" ? "repeat(4, 1fr)" : "none",
                        }}
                    >
                        {getOrderedDaysOfWeek().map((day) => (
                            <div
                                key={day}
                                style={{
                                    padding: "10px",
                                    border: "1px solid #005b96",
                                    borderRadius: "5px",
                                    backgroundColor: "#e1f5fe",
                                    marginBottom: "10px",
                                    textAlign: layout === "column" ? "center" : "left",
                                }}
                            >
                                <h3 style={{ color: "#005b96", fontWeight: "bold", marginBottom: "5px", textAlign: "center" }}>{day}</h3>
                                <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
                                    {tasks
                                        .filter((task) => task.days.includes(day))
                                        .map((task, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    marginBottom: "5px",
                                                    padding: "10px",
                                                    border: "1px solid #000",
                                                    borderRadius: "5px",
                                                    backgroundColor: "#ffffff",
                                                    textAlign: layout === "column" ? "left" : "left",
                                                }}
                                            >
                                                <strong>{task.taskName}</strong>
                                                <div>
                                                    {task.taskTimes.map(({ start, note }, i) => (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: start && note ? "center" : "flex-start",
                                                                gap: "10px",
                                                                marginTop: "5px",
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                style={{
                                                                    alignSelf: start && note ? "center" : "flex-start",
                                                                    transform: "scale(1.5)",
                                                                }}
                                                            />
                                                            <div>
                                                                {start && <div>{start}</div>}
                                                                {note && <div>{note}</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings */}
                <button
                    onClick={() => setShowSettings((prev) => !prev)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "20px",
                        backgroundColor: "#005b96",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "1em",
                    }}
                >
                    {showSettings ? "Close Settings" : "Open Settings"}
                </button>
                {showSettings && (
                    <div
                        style={{
                            border: "1px solid #005b96",
                            borderRadius: "10px",
                            padding: "20px",
                            marginTop: "10px",
                        }}
                    >
                        <label>Display Layout:</label>
                        <select
                            value={layout}
                            onChange={(e) => setLayout(e.target.value)}
                            style={{
                                width: "100%",
                                marginTop: "5px",
                                padding: "10px",
                                border: "1px solid #005b96",
                                borderRadius: "5px",
                            }}
                        >
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                        </select>

                        <label>First Day of the Week:</label>
                        <select
                            value={firstDayOfWeek}
                            onChange={(e) => setFirstDayOfWeek(e.target.value)}
                            style={{
                                width: "100%",
                                marginTop: "15px",
                                padding: "10px",
                                border: "1px solid #005b96",
                                borderRadius: "5px",
                            }}
                        >
                            {taskListify.daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>

                        <label>Hide Days of the Week:</label>
                        <div style={{ display: "flex", flexWrap: "wrap", marginTop: "15px" }}>
                            {taskListify.daysOfWeek.map((day) => (
                                <label key={day} style={{ marginRight: "10px", color: "#000" }}>
                                    <input
                                        type="checkbox"
                                        style={{transform: "scale(1.25)", }}
                                        checked={hiddenDays.includes(day)}
                                        onChange={() => toggleHiddenDay(day)}
                                    />
                                    {day}
                                </label>
                            ))}
                        </div>

                        <button
                            onClick={downloadTasks}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "20px",
                                backgroundColor: "#003f69",
                                color: "#fff",
                                borderRadius: "5px",
                                border: "none",
                            }}
                        >
                            Download Task List
                        </button>

                        <label
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "20px",
                                backgroundColor: "#003f69",
                                color: "#fff",
                                textAlign: "center",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Upload Task List
                            <input
                                type="file"
                                accept=".json"
                                onChange={uploadTasksJSON}
                                style={{
                                    display: "none", 
                                }}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

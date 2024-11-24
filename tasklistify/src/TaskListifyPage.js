"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskListify from "./TaskListify";
import TaskList from "./TaskList";

export default function TaskListifyPage() {
  const [taskName, setTaskName] = useState("");
  const [dailyOccurences, setDailyOccurences] = useState(1);
  const [eventDays, setEventDays] = useState("everyday");
  const [manualDays, setManualDays] = useState([]);
  const [showTime, setShowTime] = useState(false);
  const [timesOfTheDay, setTimesOfTheDay] = useState([
    { hour: "", minute: "", amPm: "", note: "" },
  ]);
  const [layout, setLayout] = useState("row");
  const [tasks, setTasks] = useState([]);
  const [removeMode, setRemoveMode] = useState(false);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState("Sunday");
  const [hiddenDays, setHiddenDays] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modifiedTasks, setModifiedTasks] = useState([]);

  const [showTaskNameRequired, setShowTaskNameRequired] = useState(true); // Initially show required field
  const [requiredFields, setRequiredFields] = useState([]);

  // New state variables for priority
  const [priority, setPriority] = useState("");
  const [sortByPriority, setSortByPriority] = useState("None");

  const navigate = useNavigate();

  const taskListify = new TaskListify();

  // Load state from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);

    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");

    const storedLayout = localStorage.getItem("layout");
    if (storedLayout) setLayout(storedLayout);

    const storedFirstDayOfWeek = localStorage.getItem("firstDayOfWeek");
    if (storedFirstDayOfWeek) setFirstDayOfWeek(storedFirstDayOfWeek);

    const storedHiddenDays = JSON.parse(localStorage.getItem("hiddenDays")) || [];
    setHiddenDays(storedHiddenDays);

    const storedSortByPriority = localStorage.getItem("sortByPriority");
    if (storedSortByPriority) setSortByPriority(storedSortByPriority);
  }, []);

  // Save tasks and settings to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("layout", layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("firstDayOfWeek", firstDayOfWeek);
  }, [firstDayOfWeek]);

  useEffect(() => {
    localStorage.setItem("hiddenDays", JSON.stringify(hiddenDays));
  }, [hiddenDays]);

  useEffect(() => {
    localStorage.setItem("sortByPriority", sortByPriority);
  }, [sortByPriority]);

  // Handle Remove Mode toggle
  useEffect(() => {
    if (removeMode) {
      setModifiedTasks(JSON.parse(JSON.stringify(tasks))); // Deep copy
    } else {
      setModifiedTasks([]);
    }
  }, [removeMode, tasks]);

  // Utility: Get Final Times
  const getFinalTimes = () => {
    return timesOfTheDay.map(({ hour, minute, amPm, note }) => {
      const time =
        hour && minute && amPm
          ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")} ${amPm}`
          : "";
      return { start: time, note: note || "" };
    });
  };

  // Handle adding a task
  const handleAddTask = () => {
    let isValid = true;
    setRequiredFields([]);

    if (!taskName.trim()) {
      // Show required field indicator for task name
      setShowTaskNameRequired(true);
      isValid = false;
    } else {
      setShowTaskNameRequired(false);
    }

    // Validate times
    if (showTime) {
      const updatedRequiredFields = [...requiredFields];
      timesOfTheDay.forEach((time, index) => {
        const { hour, minute, amPm } = time;
        if (hour || minute || amPm) {
          // If any of the fields are filled, the others become required
          if (!hour) {
            isValid = false;
            if (!updatedRequiredFields.includes(`hour-${index}`)) {
              updatedRequiredFields.push(`hour-${index}`);
            }
          }
          if (!minute) {
            isValid = false;
            if (!updatedRequiredFields.includes(`minute-${index}`)) {
              updatedRequiredFields.push(`minute-${index}`);
            }
          }
          if (!amPm) {
            isValid = false;
            if (!updatedRequiredFields.includes(`amPm-${index}`)) {
              updatedRequiredFields.push(`amPm-${index}`);
            }
          }
        }
      });
      setRequiredFields(updatedRequiredFields);
    }

    if (!isValid) {
      alert("Please fill in all required fields.");
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

    // Create taskTimesPerDay
    const taskTimesPerDay = {};
    days.forEach((day) => {
      taskTimesPerDay[day] = JSON.parse(JSON.stringify(taskTimes)); // Deep copy
    });

    const newTask = {
      id: Date.now(),
      taskName,
      days,
      taskTimesPerDay,
      priority,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    resetForm();
  };

  // Reset Form
  const resetForm = () => {
    setTaskName("");
    setDailyOccurences(1);
    setManualDays([]);
    setTimesOfTheDay([{ hour: "", minute: "", amPm: "", note: "" }]);
    setShowTime(false);
    setShowTaskNameRequired(true); // Show required field again
    setRequiredFields([]);
    setPriority("");
  };

  // Download Tasks as JSON
  const downloadTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tasks.json";
    link.click();
  };

  const handleQuickPrint = () => {
    const printContent = document.getElementById("task-list-section").innerHTML;

    // Create a new window and set its content
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #000;
              }
              @page {
                size: auto;
                margin: 20mm;
              }
              h1 {
                text-align: center;
                color: #005b96;
              }
              .day-box {
                display: block;
                width: 100%;
                padding: 10px;
                border: 1px solid #005b96;
                border-radius: 5px;
                background-color: #e1f5fe;
                margin-bottom: 15px;
                page-break-before: always; /* Force new page for each day */
                page-break-inside: avoid;  /* Avoid cutting inside the day */
                break-inside: avoid;      /* For modern browsers */
              }
              .event-box {
                padding: 10px;
                border: 1px solid #000;
                border-radius: 5px;
                background-color: #fff;
                margin-bottom: 10px;
                position: relative;
                page-break-inside: avoid; /* Prevent cutting tasks within a day */
                break-inside: avoid;      /* For modern browsers */
              }
              .event-section {
                margin: 5px 0;
              }
              .event-section label {
                font-weight: bold;
              }
              .checkbox {
                transform: scale(1.5);
                margin-right: 10px;
              }
              /* Ensure everything fits */
              * {
                box-sizing: border-box;
                max-width: 100%;
                word-wrap: break-word;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Upload Tasks JSON
  const uploadTasksJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedTasks = JSON.parse(e.target.result);
        if (Array.isArray(uploadedTasks)) {
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
    setDailyOccurences(value);
    setTimesOfTheDay(
      Array.from({ length: value }, () => ({ hour: "", minute: "", amPm: "", note: "" }))
    );
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
        : Math.min(Math.max(minute, 0), 59).toString();
    } else {
      updatedTimes[index][field] = value;
    }

    setTimesOfTheDay(updatedTimes);

    // Update required fields
    const updatedRequiredFields = [...requiredFields];
    const { hour, minute, amPm } = updatedTimes[index];

    if (hour || minute || amPm) {
      // If any field is filled, others become required
      if (!hour && !updatedRequiredFields.includes(`hour-${index}`)) {
        updatedRequiredFields.push(`hour-${index}`);
      } else if (hour && updatedRequiredFields.includes(`hour-${index}`)) {
        updatedRequiredFields.splice(updatedRequiredFields.indexOf(`hour-${index}`), 1);
      }

      if (!minute && !updatedRequiredFields.includes(`minute-${index}`)) {
        updatedRequiredFields.push(`minute-${index}`);
      } else if (minute && updatedRequiredFields.includes(`minute-${index}`)) {
        updatedRequiredFields.splice(updatedRequiredFields.indexOf(`minute-${index}`), 1);
      }

      if (!amPm && !updatedRequiredFields.includes(`amPm-${index}`)) {
        updatedRequiredFields.push(`amPm-${index}`);
      } else if (amPm && updatedRequiredFields.includes(`amPm-${index}`)) {
        updatedRequiredFields.splice(updatedRequiredFields.indexOf(`amPm-${index}`), 1);
      }
    } else {
      // If all fields are empty, remove from requiredFields
      ["hour", "minute", "amPm"].forEach((field) => {
        const fieldKey = `${field}-${index}`;
        const fieldIndex = updatedRequiredFields.indexOf(fieldKey);
        if (fieldIndex !== -1) {
          updatedRequiredFields.splice(fieldIndex, 1);
        }
      });
    }

    setRequiredFields(updatedRequiredFields);
  };

  // Toggle Hidden Day
  const toggleHiddenDay = (day) => {
    setHiddenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Get Ordered Days
  const getOrderedDays = () => {
    const days = taskListify.daysOfWeek;
    const firstDayIndex = days.indexOf(firstDayOfWeek);
    const orderedDays = [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
    return orderedDays;
  };

  // Get Ordered Days for Task List
  const getOrderedDaysOfWeek = () => {
    return getOrderedDays().filter((day) => !hiddenDays.includes(day));
  };

  // Handle Sharing Task List
  const handleShareTaskList = () => {
    if (!isLoggedIn) {
      alert("Please log in to share the task list.");
      navigate("/login", { state: { from: "/share" } });
      return;
    } else {
      navigate("/share");
    }
  };

  // Handle Remove Task
  const handleRemoveTask = (taskId, day) => {
    setModifiedTasks((prevTasks) => {
      return prevTasks
        .map((task) => {
          if (task.id === taskId && task.days.includes(day)) {
            const updatedDays = task.days.filter((d) => d !== day);
            if (updatedDays.length > 0) {
              const updatedTaskTimesPerDay = { ...task.taskTimesPerDay };
              delete updatedTaskTimesPerDay[day];
              return { ...task, days: updatedDays, taskTimesPerDay: updatedTaskTimesPerDay };
            } else {
              return null; // Remove task completely if no days left
            }
          }
          return task;
        })
        .filter(Boolean);
    });
  };

  // Handle Remove Occurrence
  const handleRemoveOccurrence = (taskId, day, occurrenceIndex) => {
    setModifiedTasks((prevTasks) => {
      return prevTasks
        .map((task) => {
          if (task.id === taskId && task.days.includes(day)) {
            const updatedTaskTimes = [...task.taskTimesPerDay[day]];
            updatedTaskTimes.splice(occurrenceIndex, 1);

            if (updatedTaskTimes.length > 0) {
              const updatedTaskTimesPerDay = {
                ...task.taskTimesPerDay,
                [day]: updatedTaskTimes,
              };
              return { ...task, taskTimesPerDay: updatedTaskTimesPerDay };
            } else {
              // If no times left for the day, remove the day from the task
              const updatedDays = task.days.filter((d) => d !== day);
              if (updatedDays.length > 0) {
                const updatedTaskTimesPerDay = { ...task.taskTimesPerDay };
                delete updatedTaskTimesPerDay[day];
                return { ...task, days: updatedDays, taskTimesPerDay: updatedTaskTimesPerDay };
              } else {
                return null; // Remove task completely if no days left
              }
            }
          }
          return task;
        })
        .filter(Boolean);
    });
  };

  // Handle Save Changes
  const handleSaveChanges = () => {
    setTasks(modifiedTasks);
    setRemoveMode(false);
    alert("Changes saved.");
  };

  return (
    <div
      style={{
        backgroundColor: "#b3cde3",
        minHeight: "100vh",
        padding: "40px 0",
        color: "#000",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px",
          backgroundColor: "#ffffffcc",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1
          style={{
            color: "#005b96",
            textAlign: "center",
            fontSize: "2.5em",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          TaskListify
        </h1>

        {/* First Section */}
        <div
          style={{
            border: "1px solid #005b96",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "15px", position: "relative" }}>
            <label>Event Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                if (e.target.value.trim()) {
                  setShowTaskNameRequired(false);
                } else {
                  setShowTaskNameRequired(true);
                }
              }}
              style={{
                width: "97%",
                marginTop: "5px",
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
              }}
            />
            {showTaskNameRequired && (
              <div
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0",
                  backgroundColor: "#ffdddd",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontSize: "0.8em",
                  cursor: "default",
                }}
                title="Required Field"
              >
                Req. Field
              </div>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Task Frequency:</label>
            <select
              value={dailyOccurences}
              onChange={(e) => handleTimesChange(Number(e.target.value))}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
              }}
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
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
              }}
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
                      style={{ transform: "scale(1.25)" }}
                      checked={manualDays.includes(day)}
                      onChange={() =>
                        setManualDays((prev) =>
                          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                        )
                      }
                    />
                    {day}
                  </label>
                ))}
              </div>
            )}
          </div>



          {/* Priority Level Selection */}
          <div style={{ marginBottom: "15px" }}>
            <label>Priority Level:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
              }}
            >
              <option value="">None (No colour)</option>
              <option value="Low">Low Priority (Green)</option>
              <option value="Medium">Med Priority (Yellow)</option>
              <option value="High">High Priority (Red)</option>
            </select>


          <div style={{ marginTop: "15px" }}>
            <label>Would You Like to Select a Time? / Add a note to event?</label>
            <input
              type="checkbox"
              checked={showTime}
              onChange={() => setShowTime(!showTime)}
              style={{ marginLeft: "10px", transform: "scale(1.5)" }}
            />
          </div>

          {showTime && (
            <div style={{ marginTop: "15px" }}>
              {timesOfTheDay.map((time, index) => {
                const isHourRequired = requiredFields.includes(`hour-${index}`);
                const isMinuteRequired = requiredFields.includes(`minute-${index}`);
                const isAmPmRequired = requiredFields.includes(`amPm-${index}`);

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: "15px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", gap: "40px" }}>
                      {/* Hour Input */}
                      <div style={{ position: "relative", width: "30%" }}>
                        <input
                          type="number"
                          placeholder="HH"
                          value={time.hour}
                          min={1}
                          max={12}
                          onChange={(e) => handleTimeChange(index, "hour", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #005b96",
                            borderRadius: "5px",
                            textAlign: "center",
                          }}
                        />
                        {isHourRequired && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-20px",
                              left: "0",
                              backgroundColor: "#ffdddd",
                              padding: "2px 5px",
                              borderRadius: "3px",
                              fontSize: "0.8em",
                              cursor: "default",
                            }}
                            title="Required Field"
                          >
                            Req. Field
                          </div>
                        )}
                      </div>

                      {/* Minute Input */}
                      <div style={{ position: "relative", width: "30%" }}>
                        <input
                          type="number"
                          placeholder="MM"
                          value={time.minute}
                          min={0}
                          max={59}
                          onChange={(e) => handleTimeChange(index, "minute", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #005b96",
                            borderRadius: "5px",
                            textAlign: "center",
                          }}
                        />
                        {isMinuteRequired && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-20px",
                              left: "0",
                              backgroundColor: "#ffdddd",
                              padding: "2px 5px",
                              borderRadius: "3px",
                              fontSize: "0.8em",
                              cursor: "default",
                            }}
                            title="Required Field"
                          >
                            Req. Field
                          </div>
                        )}
                      </div>

                      {/* AM/PM Select */}
                      <div style={{ position: "relative", width: "30%" }}>
                        <select
                          value={time.amPm}
                          onChange={(e) => handleTimeChange(index, "amPm", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #005b96",
                            borderRadius: "5px",
                          }}
                        >
                          <option value="">AM/PM</option>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        {isAmPmRequired && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-20px",
                              left: "0",
                              backgroundColor: "#ffdddd",
                              padding: "2px 5px",
                              borderRadius: "3px",
                              fontSize: "0.8em",
                              cursor: "default",
                            }}
                            title="Required Field"
                          >
                            Req. Field
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Note for Event"
                      value={time.note}
                      onChange={(e) => handleTimeChange(index, "note", e.target.value)}
                      style={{
                        width: "97.3%",
                        marginTop: "5px",
                        padding: "10px",
                        border: "1px solid #005b96",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          </div>
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
          onClick={() => setRemoveMode(!removeMode)}
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
          {removeMode ? "Untoggle Remove Task" : "Remove Tasks"}
        </button>

        {/* Save Changes Button */}
        {removeMode && (
          <button
            onClick={handleSaveChanges}
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
            Save Removed Tasks
          </button>
        )}

        {/* Task List by Day */}
        <TaskList
          tasks={removeMode ? modifiedTasks : tasks}
          layout={layout}
          getOrderedDaysOfWeek={getOrderedDaysOfWeek}
          removeMode={removeMode}
          onRemoveTask={handleRemoveTask}
          onRemoveOccurrence={handleRemoveOccurrence}
          sortByPriority={sortByPriority}
        />

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
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

            <div style={{ marginTop: "15px" }} />
            <label>First Day of the Week:</label>
            <select
              value={firstDayOfWeek}
              onChange={(e) => setFirstDayOfWeek(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
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
            <div style={{ marginTop: "15px" }} />
            <label>Hide Days of the Week:</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: "5px" }}>
              {getOrderedDays().map((day) => (
                <label key={day} style={{ marginRight: "29.22px", color: "#000" }}>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(1.5)" }}
                    checked={hiddenDays.includes(day)}
                    onChange={() => toggleHiddenDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>

            {/* Sort by Priority Level */}
            <div style={{ marginTop: "15px" }} />
            <label>Sort Tasks by Priority:</label>
            <select
              value={sortByPriority}
              onChange={(e) => setSortByPriority(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
              }}
            >
              <option value="None">Default (None)</option>
              <option value="HighToLow">Highest to Lowest</option>
              <option value="LowToHigh">Lowest to Highest</option>
            </select>

            <div style={{ marginTop: "15px" }} />
            <label>
              Download Task list as a JSON File so you can reuse it in the future as a template for making
              new lists:
            </label>
            <button
              onClick={downloadTasks}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                backgroundColor: "#003f69",
                color: "#fff",
                borderRadius: "5px",
                border: "none",
                fontSize: "15px",
              }}
            >
              Download Task List
            </button>

            <div style={{ marginTop: "15px" }} />
            <label>
              Upload Task list lets you import JSON Files to work from an existing list template. 
            </label>
            <div style={{ marginTop: "0px" }} />
            <label>
              (This will replace what you have written with the uploaded list, it will not add to it):
            </label>  

            <label
              style={{
                display: "block",
                width: "97.33%",
                padding: "10px",
                marginTop: "5px",
                backgroundColor: "#003f69",
                color: "#fff",
                textAlign: "center",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
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

            <div style={{ marginTop: "15px" }} />
            <label>
              Quick Print gives the option to save list as a PDF for viewing, or send it automatically to
              print screen:
            </label>
            <button
              onClick={handleQuickPrint}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                backgroundColor: "#003f69",
                color: "#fff",
                borderRadius: "5px",
                border: "none",
                fontSize: "15px",
              }}
            >
              Quick Print Task List
            </button>

            {/* Share Task List Section */}
            <div style={{ marginTop: "15px" }}>
              <label
                style={{
                  display: "block",
                }}
              >
                Share Task List via Email or Text:
              </label>
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate("/login", { state: { from: "/share" } })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#003f69",
                    color: "#fff",
                    borderRadius: "5px",
                    border: "none",
                    marginBottom: "15px",
                    fontSize: "15px",
                  }}
                >
                  Log In / Sign Up
                </button>
              ) : (
                <button
                  onClick={handleShareTaskList}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    backgroundColor: "#003f69",
                    color: "#fff",
                    borderRadius: "5px",
                    border: "none",
                    fontSize: "15px",
                  }}
                >
                  Share Task List
                </button>
              )}
            </div>

            {/* Log Out Button */}
            <div style={{ marginTop: "45px" }} />
            {isLoggedIn && (
              <button
                onClick={() => {
                  localStorage.setItem("isLoggedIn", "false");
                  setIsLoggedIn(false);
                  alert("You have been logged out.");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "10px",
                  backgroundColor: "#003f69",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "15px",
                }}
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

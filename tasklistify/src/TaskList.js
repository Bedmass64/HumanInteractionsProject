import React from "react";

const TaskList = ({
  tasks,
  layout,
  getOrderedDaysOfWeek,
  removeMode,
  onRemoveTask,
  onRemoveOccurrence,
  sortByPriority,
}) => {
  // Function to get priority value for sorting
  const getPriorityValue = (priority) => {
    switch (priority) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "Low":
        return 1;
      default:
        return 0;
    }
  };

  // Sort tasks based on priority
  const sortedTasks = tasks.slice(); // Make a copy of tasks
  if (sortByPriority !== "None") {
    sortedTasks.sort((a, b) => {
      const priorityA = getPriorityValue(a.priority);
      const priorityB = getPriorityValue(b.priority);
      if (sortByPriority === "HighToLow") {
        return priorityB - priorityA;
      } else if (sortByPriority === "LowToHigh") {
        return priorityA - priorityB;
      }
      return 0;
    });
  }

  return (
    <div id="task-list-section" style={{ marginTop: "30px" }}>
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
            <h3
              style={{
                color: "#005b96",
                fontWeight: "bold",
                marginBottom: "5px",
                textAlign: "center",
              }}
            >
              {day}
            </h3>
            <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
              {sortedTasks
                .filter((task) => task.days.includes(day))
                .map((task) => (
                  <li
                    key={`${task.id}-${day}`}
                    style={{
                      marginBottom: "5px",
                      padding: "10px",
                      border: "1px solid #000",
                      borderRadius: "5px",
                      backgroundColor: "#ffffff",
                      textAlign: layout === "column" ? "left" : "left",
                      position: "relative",
                    }}
                  >
                    {removeMode && (
                      <button
                        onClick={() => onRemoveTask(task.id, day)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          backgroundColor: "#fff",
                          border: "1px solid #000",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          lineHeight: "18px",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        -
                      </button>
                    )}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {task.priority && (
                        <div style={{ display: "flex", alignItems: "center", marginRight: "5px" }}>
                          <span>{}</span>
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor:
                                task.priority === "High"
                                  ? "red"
                                  : task.priority === "Medium"
                                  ? "yellow"
                                  : "green",
                              marginLeft: "5px",
                            }}
                          ></div>
                        </div>
                      )}
                      <strong>{task.taskName}</strong>
                    </div>
                    <div>
                      {task.taskTimesPerDay[day].map(({ start, note }, occurrenceIndex) => (
                        <div
                          key={occurrenceIndex}
                          style={{
                            display: "flex",
                            alignItems: start && note ? "center" : "flex-start",
                            gap: "10px",
                            marginTop: "5px",
                            position: "relative",
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
                          {removeMode && (
                            <button
                              onClick={() => onRemoveOccurrence(task.id, day, occurrenceIndex)}
                              style={{
                                backgroundColor: "#fff",
                                border: "1px solid #000",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                lineHeight: "18px",
                                textAlign: "center",
                                cursor: "pointer",
                                marginLeft: "auto",
                              }}
                            >
                              -
                            </button>
                          )}
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
  );
};

export default TaskList;

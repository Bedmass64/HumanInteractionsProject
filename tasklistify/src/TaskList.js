// // src/models/TaskList.js
// export default class TaskList {
//     constructor() {
//       this.tasks = [];
//     }

//     addTask(task) {
//       this.tasks.push(task);
//     }

//     getTasks() {
//       return this.tasks;
//     }
//   }




// import React from 'react';

// const TaskList = ({
//   tasks,
//   layout,
//   getOrderedDaysOfWeek,
//   taskListify,
// }) => {
//   return (
//     <div id="task-list-section" style={{ marginTop: "30px" }}>
//       <h2 style={{ textAlign: "center", color: "#005b96" }}>Task List by Day</h2>
//       <div
//         style={{
//           display: layout === "row" ? "block" : "grid",
//           gap: "20px",
//           gridTemplateColumns: layout === "column" ? "repeat(4, 1fr)" : "none",
//         }}
//       >
//         {getOrderedDaysOfWeek().map((day) => (
//           <div
//             key={day}
//             style={{
//               padding: "10px",
//               border: "1px solid #005b96",
//               borderRadius: "5px",
//               backgroundColor: "#e1f5fe",
//               marginBottom: "10px",
//               textAlign: layout === "column" ? "center" : "left",
//             }}
//           >
//             <h3 style={{ color: "#005b96", fontWeight: "bold", marginBottom: "5px", textAlign: "center" }}>{day}</h3>
//             <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
//               {tasks
//                 .filter((task) => task.days.includes(day))
//                 .map((task, index) => (
//                   <li
//                     key={index}
//                     style={{
//                       marginBottom: "5px",
//                       padding: "10px",
//                       border: "1px solid #000",
//                       borderRadius: "5px",
//                       backgroundColor: "#ffffff",
//                       textAlign: layout === "column" ? "left" : "left",
//                     }}
//                   >
//                     <strong>{task.taskName}</strong>
//                     <div>
//                       {task.taskTimes.map(({ start, note }, i) => (
//                         <div
//                           key={i}
//                           style={{
//                             display: "flex",
//                             alignItems: start && note ? "center" : "flex-start",
//                             gap: "10px",
//                             marginTop: "5px",
//                           }}
//                         >
//                           <input
//                             type="checkbox"
//                             style={{
//                               alignSelf: start && note ? "center" : "flex-start",
//                               transform: "scale(1.5)",
//                             }}
//                           />
//                           <div>
//                             {start && <div>{start}</div>}
//                             {note && <div>{note}</div>}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </li>
//                 ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TaskList;



// import React from "react";

// const TaskList = ({
//   tasks,
//   layout,
//   getOrderedDaysOfWeek,
//   taskListify,
//   removeMode,
//   onRemoveTask,
//   onRemoveOccurrence,
// }) => {
//   return (
//     <div id="task-list-section" style={{ marginTop: "30px" }}>
//       <h2 style={{ textAlign: "center", color: "#005b96" }}>Task List by Day</h2>
//       <div
//         style={{
//           display: layout === "row" ? "block" : "grid",
//           gap: "20px",
//           gridTemplateColumns: layout === "column" ? "repeat(4, 1fr)" : "none",
//         }}
//       >
//         {getOrderedDaysOfWeek().map((day) => (
//           <div
//             key={day}
//             style={{
//               padding: "10px",
//               border: "1px solid #005b96",
//               borderRadius: "5px",
//               backgroundColor: "#e1f5fe",
//               marginBottom: "10px",
//               textAlign: layout === "column" ? "center" : "left",
//             }}
//           >
//             <h3
//               style={{
//                 color: "#005b96",
//                 fontWeight: "bold",
//                 marginBottom: "5px",
//                 textAlign: "center",
//               }}
//             >
//               {day}
//             </h3>
//             <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
//               {tasks
//                 .map((task, taskIndex) => ({ ...task, taskIndex }))
//                 .filter((task) => task.days.includes(day))
//                 .map((task) => (
//                   <li
//                     key={task.id}
//                     style={{
//                       marginBottom: "5px",
//                       padding: "10px",
//                       border: "1px solid #000",
//                       borderRadius: "5px",
//                       backgroundColor: "#ffffff",
//                       textAlign: layout === "column" ? "left" : "left",
//                       position: "relative",
//                     }}
//                   >
//                     {removeMode && (
//                       <button
//                         onClick={() => onRemoveTask(task.id)}
//                         style={{
//                           position: "absolute",
//                           top: "5px",
//                           right: "5px",
//                           backgroundColor: "#fff",
//                           border: "1px solid #000",
//                           borderRadius: "50%",
//                           width: "20px",
//                           height: "20px",
//                           lineHeight: "18px",
//                           textAlign: "center",
//                           cursor: "pointer",
//                         }}
//                       >
//                         -
//                       </button>
//                     )}
//                     <strong>{task.taskName}</strong>
//                     <div>
//                       {task.taskTimes.map(({ start, note }, occurrenceIndex) => (
//                         <div
//                           key={occurrenceIndex}
//                           style={{
//                             display: "flex",
//                             alignItems: start && note ? "center" : "flex-start",
//                             gap: "10px",
//                             marginTop: "5px",
//                             position: "relative",
//                           }}
//                         >
//                           {removeMode && (
//                             <button
//                               onClick={() => onRemoveOccurrence(task.id, occurrenceIndex)}
//                               style={{
//                                 position: "absolute",
//                                 top: "0",
//                                 left: "-25px",
//                                 backgroundColor: "#fff",
//                                 border: "1px solid #000",
//                                 borderRadius: "50%",
//                                 width: "20px",
//                                 height: "20px",
//                                 lineHeight: "18px",
//                                 textAlign: "center",
//                                 cursor: "pointer",
//                               }}
//                             >
//                               -
//                             </button>
//                           )}
//                           <input
//                             type="checkbox"
//                             style={{
//                               alignSelf: start && note ? "center" : "flex-start",
//                               transform: "scale(1.5)",
//                             }}
//                           />
//                           <div>
//                             {start && <div>{start}</div>}
//                             {note && <div>{note}</div>}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </li>
//                 ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TaskList;


// import React from "react";

// const TaskList = ({
//   tasks,
//   layout,
//   getOrderedDaysOfWeek,
//   removeMode,
//   onRemoveTask,
//   onRemoveOccurrence,
// }) => {
//   return (
//     <div id="task-list-section" style={{ marginTop: "30px" }}>
//       <h2 style={{ textAlign: "center", color: "#005b96" }}>Task List by Day</h2>
//       <div
//         style={{
//           display: layout === "row" ? "block" : "grid",
//           gap: "20px",
//           gridTemplateColumns: layout === "column" ? "repeat(4, 1fr)" : "none",
//         }}
//       >
//         {getOrderedDaysOfWeek().map((day) => (
//           <div
//             key={day}
//             style={{
//               padding: "10px",
//               border: "1px solid #005b96",
//               borderRadius: "5px",
//               backgroundColor: "#e1f5fe",
//               marginBottom: "10px",
//               textAlign: layout === "column" ? "center" : "left",
//             }}
//           >
//             <h3
//               style={{
//                 color: "#005b96",
//                 fontWeight: "bold",
//                 marginBottom: "5px",
//                 textAlign: "center",
//               }}
//             >
//               {day}
//             </h3>
//             <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
//               {tasks
//                 .filter((task) => task.days.includes(day))
//                 .map((task) => (
//                   <li
//                     key={`${task.id}-${day}`}
//                     style={{
//                       marginBottom: "5px",
//                       padding: "10px",
//                       border: "1px solid #000",
//                       borderRadius: "5px",
//                       backgroundColor: "#ffffff",
//                       textAlign: layout === "column" ? "left" : "left",
//                       position: "relative",
//                     }}
//                   >
//                     {removeMode && (
//                       <button
//                         onClick={() => onRemoveTask(task.id, day)}
//                         style={{
//                           position: "absolute",
//                           top: "5px",
//                           right: "5px",
//                           backgroundColor: "#fff",
//                           border: "1px solid #000",
//                           borderRadius: "50%",
//                           width: "20px",
//                           height: "20px",
//                           lineHeight: "18px",
//                           textAlign: "center",
//                           cursor: "pointer",
//                         }}
//                       >
//                         -
//                       </button>
//                     )}
//                     <strong>{task.taskName}</strong>
//                     <div>
//                       {task.taskTimes.map(({ start, note }, occurrenceIndex) => (
//                         <div
//                           key={occurrenceIndex}
//                           style={{
//                             display: "flex",
//                             alignItems: start && note ? "center" : "flex-start",
//                             gap: "10px",
//                             marginTop: "5px",
//                             position: "relative",
//                           }}
//                         >
//                           <input
//                             type="checkbox"
//                             style={{
//                               alignSelf: start && note ? "center" : "flex-start",
//                               transform: "scale(1.5)",
//                             }}
//                           />
//                           <div>
//                             {start && <div>{start}</div>}
//                             {note && <div>{note}</div>}
//                           </div>
//                           {removeMode && (
//                             <button
//                               onClick={() => onRemoveOccurrence(task.id, day, occurrenceIndex)}
//                               style={{
//                                 backgroundColor: "#fff",
//                                 border: "1px solid #000",
//                                 borderRadius: "50%",
//                                 width: "20px",
//                                 height: "20px",
//                                 lineHeight: "18px",
//                                 textAlign: "center",
//                                 cursor: "pointer",
//                                 marginLeft: "auto",
//                               }}
//                             >
//                               -
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </li>
//                 ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TaskList;


import React from "react";

const TaskList = ({
  tasks,
  layout,
  getOrderedDaysOfWeek,
  removeMode,
  onRemoveTask,
  onRemoveOccurrence,
}) => {
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
              {tasks
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
                    <strong>{task.taskName}</strong>
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

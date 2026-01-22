// // src/TaskList.js
// import React, { useRef, useState } from "react";

// const TaskList = ({
//   tasks,
//   layout,
//   getOrderedDaysOfWeek,
//   removeMode,
//   onRemoveTask,
//   onRemoveOccurrence,
//   sortByPriority,

//   editMode,
//   onSetPriority,

//   // NOTE: updated signature for name to support SetOne vs SetAll properly
//   // onEditTaskName(taskId, day, occurrenceIndex, newName, scope)
//   onEditTaskName,
//   // onEditNote(taskId, day, occurrenceIndex, newNote, scope)
//   onEditNote,
//   // onEditTime(taskId, day, occurrenceIndex, {hour, minute, amPm}, scope)
//   onEditTime,

//   // drag ordering
//   orderByDay,
//   onReorderDay,
//   makeEventKey,
// }) => {
//   const dragState = useRef({ draggingKey: null, draggingDay: null });

//   // Priority popup state (still exists), but SetOne/SetAll is now shared per-event
//   const [priorityPicker, setPriorityPicker] = useState(null);
//   // priorityPicker = { taskId, day, occurrenceIndex, eventKey }

//   // NEW: Persisted scope per event row (SetOne/SetAll applies to all fields)
//   const [scopeByEvent, setScopeByEvent] = useState({}); // { [eventKey]: "one"|"all" }

//   // NEW: Local “draft” time fields so you can type HH/MM/AMPM before it becomes a valid start string.
//   const [timeDraftByEvent, setTimeDraftByEvent] = useState({}); // { [eventKey]: {hour, minute, amPm, touched:boolean} }

//   const getPriorityValue = (priority) => {
//     switch (priority) {
//       case "High":
//         return 3;
//       case "Medium":
//         return 2;
//       case "Low":
//         return 1;
//       default:
//         return 0;
//     }
//   };

//   const getOcc = (task, day, occurrenceIndex) =>
//     task?.taskTimesPerDay?.[day]?.[occurrenceIndex] || {};

//   // Priority for an occurrence (fallback to task priority)
//   const getOccPriority = (task, day, occurrenceIndex) => {
//     const occ = getOcc(task, day, occurrenceIndex);
//     return occ?.priority || task?.priority || "";
//   };

//   // NEW: Per-occurrence name override (SetOne) fallback to task.taskName (SetAll)
//   const getOccName = (task, day, occurrenceIndex) => {
//     const occ = getOcc(task, day, occurrenceIndex);
//     return occ?.name ?? task?.taskName ?? "";
//   };

//   const priorityDotColor = (p) => {
//     if (p === "High") return "red";
//     if (p === "Medium") return "yellow";
//     if (p === "Low") return "green";
//     return null;
//   };

//   // Parse "HH:MM AM/PM" into fields for edit UI
//   const parseStart = (start = "") => {
//     const m = String(start).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
//     if (!m) return { hour: "", minute: "", amPm: "" };
//     return { hour: m[1], minute: m[2], amPm: m[3].toUpperCase() };
//   };

//   // Build list of occurrence-rows per day:
//   // each row = { task, day, occurrenceIndex, eventKey, priority }
//   const buildDayRows = (day) => {
//     const rows = [];
//     tasks
//       .filter((task) => task.days.includes(day))
//       .forEach((task) => {
//         const occs = task.taskTimesPerDay?.[day] || [];
//         occs.forEach((occ, occurrenceIndex) => {
//           const key = makeEventKey
//             ? makeEventKey(task.id, day, occurrenceIndex)
//             : `${task.id}::${day}::${occurrenceIndex}`;

//           rows.push({
//             task,
//             day,
//             occurrenceIndex,
//             eventKey: key,
//             priority: getOccPriority(task, day, occurrenceIndex),
//           });
//         });
//       });

//     if (sortByPriority !== "None") {
//       const dir = sortByPriority === "HighToLow" ? -1 : 1;
//       rows.sort((a, b) => {
//         const pa = getPriorityValue(a.priority);
//         const pb = getPriorityValue(b.priority);
//         if (pa !== pb) return (pa - pb) * dir;
//         return a.task.id - b.task.id || a.occurrenceIndex - b.occurrenceIndex;
//       });
//       return rows;
//     }

//     const custom = orderByDay?.[day];
//     if (custom && Array.isArray(custom) && custom.length) {
//       const idx = new Map(custom.map((k, i) => [k, i]));
//       rows.sort((a, b) => {
//         const ia = idx.has(a.eventKey) ? idx.get(a.eventKey) : 999999;
//         const ib = idx.has(b.eventKey) ? idx.get(b.eventKey) : 999999;
//         if (ia !== ib) return ia - ib;
//         return a.task.id - b.task.id || a.occurrenceIndex - b.occurrenceIndex;
//       });
//       return rows;
//     }

//     return rows;
//   };

//   // Ensure orderByDay contains every key currently on the page (when not sorting by priority)
//   const ensureDayOrderKeys = (day, rows) => {
//     if (sortByPriority !== "None") return;
//     const existing = orderByDay?.[day] || [];
//     const existingSet = new Set(existing);
//     const missing = rows.map((r) => r.eventKey).filter((k) => !existingSet.has(k));
//     if (missing.length) onReorderDay?.(day, [...existing, ...missing]);
//   };

//   // --- Drag logic ---
//   const onDragStartRow = (e, day, draggingKey) => {
//     if (!editMode) return;
//     dragState.current = { draggingKey, draggingDay: day };

//     const li = e.currentTarget;
//     if (e.dataTransfer && li) {
//       try {
//         e.dataTransfer.setDragImage(li, li.offsetWidth / 2, li.offsetHeight / 2);
//       } catch {}
//       e.dataTransfer.effectAllowed = "move";
//       e.dataTransfer.setData("text/plain", draggingKey);
//     }
//   };

//   const onDragOverRow = (e, day, targetKey) => {
//     if (!editMode) return;
//     if (sortByPriority !== "None") return;

//     e.preventDefault();
//     const { draggingKey, draggingDay } = dragState.current;
//     if (!draggingKey || draggingDay !== day) return;
//     if (draggingKey === targetKey) return;

//     const cur = orderByDay?.[day] || [];
//     const from = cur.indexOf(draggingKey);
//     const to = cur.indexOf(targetKey);
//     if (from === -1 || to === -1) return;

//     const next = [...cur];
//     next.splice(from, 1);
//     next.splice(to, 0, draggingKey);
//     onReorderDay?.(day, next);
//   };

//   const onDropRow = (e) => {
//     if (!editMode) return;
//     e.preventDefault();
//     dragState.current = { draggingKey: null, draggingDay: null };
//   };

//   const onDragEndRow = () => {
//     dragState.current = { draggingKey: null, draggingDay: null };
//   };

//   // Helper: get/set scope for event row
//   const getScope = (eventKey) => scopeByEvent[eventKey] || "one";

//   const setScope = (eventKey, nextScope) => {
//     setScopeByEvent((prev) => ({ ...prev, [eventKey]: nextScope }));
//   };

//   // ===== Time draft logic =====
//   const getTimeDraft = (eventKey, occStart) => {
//     const existing = timeDraftByEvent[eventKey];
//     if (existing) return existing;

//     // Initialize draft from stored start string (or blanks)
//     const parsed = parseStart(occStart || "");
//     return { ...parsed, touched: false };
//   };

//   const updateTimeDraft = (eventKey, patch) => {
//     setTimeDraftByEvent((prev) => {
//       const cur = prev[eventKey] || { hour: "", minute: "", amPm: "", touched: false };
//       return {
//         ...prev,
//         [eventKey]: { ...cur, ...patch, touched: true },
//       };
//     });
//   };

//   // When all 3 are filled, commit to parent
//   const maybeCommitTime = (eventKey, taskId, day, occurrenceIndex, scope) => {
//     const d = timeDraftByEvent[eventKey];
//     if (!d) return;

//     const any = !!(d.hour || d.minute || d.amPm);
//     const all = !!(d.hour && d.minute && d.amPm);

//     if (!any) {
//       // allow clearing time entirely (commit blanks)
//       onEditTime?.(taskId, day, occurrenceIndex, { hour: "", minute: "", amPm: "" }, scope);
//       return;
//     }

//     if (all) {
//       onEditTime?.(taskId, day, occurrenceIndex, { hour: d.hour, minute: d.minute, amPm: d.amPm }, scope);
//     }
//   };

//   // Optional: when leaving editMode, keep drafts (so user doesn’t lose half-typed fields)
//   // If you prefer clearing drafts when leaving editMode, uncomment:
//   // useEffect(() => { if (!editMode) setTimeDraftByEvent({}); }, [editMode]);

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
//         {getOrderedDaysOfWeek().map((day) => {
//           const rows = buildDayRows(day);
//           ensureDayOrderKeys(day, rows);

//           return (
//             <div
//               key={day}
//               style={{
//                 padding: "10px",
//                 border: "1px solid #005b96",
//                 borderRadius: "5px",
//                 backgroundColor: "#e1f5fe",
//                 marginBottom: "10px",
//                 textAlign: layout === "column" ? "center" : "left",
//               }}
//             >
//               <h3
//                 style={{
//                   color: "#005b96",
//                   fontWeight: "bold",
//                   marginBottom: "5px",
//                   textAlign: "center",
//                 }}
//               >
//                 {day}
//               </h3>

//               <ul style={{ padding: "0", listStyle: "none", color: "#000" }}>
//                 {rows.map(({ task, day: rowDay, occurrenceIndex, eventKey, priority }) => {
//                   const occ = getOcc(task, rowDay, occurrenceIndex);
//                   const dot = priorityDotColor(priority);

//                   const scope = getScope(eventKey);

//                   // Draft values for time editing
//                   const draft = getTimeDraft(eventKey, occ.start);
//                   const anyTimeTouched = draft.touched && (draft.hour || draft.minute || draft.amPm);
//                   const timeAllFilled = !!(draft.hour && draft.minute && draft.amPm);

//                   const hourReq = anyTimeTouched && !draft.hour;
//                   const minuteReq = anyTimeTouched && !draft.minute;
//                   const ampmReq = anyTimeTouched && !draft.amPm;

//                   // Name value (occ override or task name)
//                   const nameValue = getOccName(task, rowDay, occurrenceIndex);

//                   return (
//                     <li
//                       key={eventKey}
//                       draggable={!!editMode && sortByPriority === "None"}
//                       onDragStart={(e) => onDragStartRow(e, rowDay, eventKey)}
//                       onDragOver={(e) => onDragOverRow(e, rowDay, eventKey)}
//                       onDrop={onDropRow}
//                       onDragEnd={onDragEndRow}
//                       style={{
//                         marginBottom: "5px",
//                         padding: "10px",
//                         border: "1px solid #000",
//                         borderRadius: "5px",
//                         backgroundColor: "#ffffff",
//                         textAlign: "left",
//                         position: "relative",
//                         // Keep right side lane for :::, without widening columns or forcing horizontal scroll
//                         paddingRight: editMode && sortByPriority === "None" ? "42px" : "10px",
//                         opacity: editMode && dragState.current.draggingKey === eventKey ? 0.6 : 1,
//                         cursor: editMode && sortByPriority === "None" ? "grab" : "default",
//                         overflow: "hidden",
//                       }}
//                     >
//                       {/* REMOVE whole task from THIS day */}
//                       {removeMode && (
//                         <button
//                           onClick={() => onRemoveTask(task.id, rowDay)}
//                           style={{
//                             position: "absolute",
//                             top: "5px",
//                             right: "5px",
//                             backgroundColor: "#fff",
//                             border: "1px solid #000",
//                             borderRadius: "50%",
//                             width: "20px",
//                             height: "20px",
//                             lineHeight: "18px",
//                             textAlign: "center",
//                             cursor: "pointer",
//                             zIndex: 30,
//                           }}
//                           title="Remove task from this day"
//                         >
//                           -
//                         </button>
//                       )}

//                       {/* EDIT MODE drag handle (middle-right) */}
//                       {editMode && sortByPriority === "None" && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: "50%",
//                             right: "8px",
//                             transform: "translateY(-50%)",
//                             fontWeight: "bold",
//                             letterSpacing: "1px",
//                             userSelect: "none",
//                             padding: "2px 6px",
//                             borderRadius: "6px",
//                             backgroundColor: "#ffffffcc",
//                             border: "1px solid #005b96",
//                             cursor: "grab",
//                             zIndex: 25,
//                           }}
//                           title="Drag to reorder"
//                         >
//                           :::
//                         </div>
//                       )}

//                       {/* NEW: Global per-event scope toggle (applies to name/note/time/priority/etc) */}
//                       {editMode && (
//                         <div style={{ marginBottom: "6px", display: "flex", gap: "6px" }}>
//                           <button
//                             type="button"
//                             onClick={() => setScope(eventKey, "one")}
//                             style={{
//                               padding: "4px 8px",
//                               borderRadius: "8px",
//                               border: "1px solid #005b96",
//                               backgroundColor: scope === "one" ? "#005b96" : "#fff",
//                               color: scope === "one" ? "#fff" : "#005b96",
//                               cursor: "pointer",
//                               fontWeight: "bold",
//                               fontSize: "12px",
//                             }}
//                             title="Apply changes only to this event occurrence"
//                           >
//                             SetOne
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => setScope(eventKey, "all")}
//                             style={{
//                               padding: "4px 8px",
//                               borderRadius: "8px",
//                               border: "1px solid #005b96",
//                               backgroundColor: scope === "all" ? "#005b96" : "#fff",
//                               color: scope === "all" ? "#fff" : "#005b96",
//                               cursor: "pointer",
//                               fontWeight: "bold",
//                               fontSize: "12px",
//                             }}
//                             title="Apply changes to all occurrences for this task"
//                           >
//                             SetAll
//                           </button>
//                         </div>
//                       )}

//                       {/* Priority picker button (top-right lane, but not blocking :::) */}
//                       {editMode && (
//                         <div style={{ position: "absolute", top: "6px", right: "6px", zIndex: 40 }}>

//                           <button
//                             type="button"
//                             onClick={() =>
//                               setPriorityPicker((prev) => {
//                                 const same =
//                                   prev &&
//                                   prev.taskId === task.id &&
//                                   prev.day === rowDay &&
//                                   prev.occurrenceIndex === occurrenceIndex;
//                                 return same ? null : { taskId: task.id, day: rowDay, occurrenceIndex, eventKey };
//                               })
//                             }
//                             style={{
//                               width: "22px",
//                               height: "22px",
//                               borderRadius: "50%",
//                               border: "1px solid #005b96",
//                               backgroundColor: "#fff",
//                               color: "#005b96",
//                               fontWeight: "bold",
//                               cursor: "pointer",
//                               lineHeight: "18px",
//                               padding: 0,
//                             }}
//                             title="Set priority"
//                           >
//                             +
//                           </button>

//                           {priorityPicker &&
//                             priorityPicker.taskId === task.id &&
//                             priorityPicker.day === rowDay &&
//                             priorityPicker.occurrenceIndex === occurrenceIndex && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: "26px",
//                                   right: 0,
//                                   backgroundColor: "#fff",
//                                   border: "1px solid #005b96",
//                                   borderRadius: "8px",
//                                   padding: "8px",
//                                   minWidth: "140px",
//                                   maxWidth: "160px",  
//                                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
//                                 }}
//                               >
//                                 <div style={{ fontSize: "12px", marginBottom: "6px" }}>Priority</div>

//                                 <select
//                                   value={priority || ""}
//                                   onChange={(e) =>
//                                     onSetPriority?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)
//                                   }
//                                   style={{
//                                     width: "100%",
//                                     padding: "6px",
//                                     borderRadius: "6px",
//                                     border: "1px solid #005b96",
//                                   }}
//                                 >
//                                   <option value="">None</option>
//                                   <option value="Low">Low</option>
//                                   <option value="Medium">Medium</option>
//                                   <option value="High">High</option>
//                                 </select>

//                                 <button
//                                   type="button"
//                                   onClick={() => setPriorityPicker(null)}
//                                   style={{
//                                     marginTop: "8px",
//                                     width: "100%",
//                                     padding: "6px",
//                                     borderRadius: "6px",
//                                     border: "none",
//                                     backgroundColor: "#005b96",
//                                     color: "#fff",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   Done
//                                 </button>
//                               </div>
//                             )}
//                         </div>
//                       )}

//                       {/* Title + priority dot (name edits now respect SetOne/SetAll) */}
//                       <div style={{ display: "flex", alignItems: "center" }}>
//                         {editMode ? (
//                           <input
//                             type="text"
//                             value={nameValue}
//                             onChange={(e) =>
//                               onEditTaskName?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)
//                             }
//                             style={{
//                               width: "100%",
//                               padding: "6px",
//                               border: "1px solid #005b96",
//                               borderRadius: "5px",
//                               fontWeight: "bold",
//                             }}
//                           />
//                         ) : (
//                           <strong>{nameValue}</strong>
//                         )}

//                         {dot && (
//                           <div style={{ display: "flex", alignItems: "center", marginLeft: "6px" }}>
//                             <div
//                               style={{
//                                 width: "10px",
//                                 height: "10px",
//                                 borderRadius: "50%",
//                                 backgroundColor: dot,
//                               }}
//                             />
//                           </div>
//                         )}
//                       </div>

//                       {/* Occurrence content */}
//                       <div style={{ marginTop: "6px" }}>
//                         <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
//                           <input
//                             type="checkbox"
//                             style={{
//                               alignSelf: "flex-start",
//                               transform: "scale(1.5)",
//                               marginTop: editMode ? "6px" : "2px",
//                             }}
//                           />

//                           <div style={{ width: "100%" }}>
//                             {/* TIME */}
//                             {editMode ? (
//                               <>
//                                 <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//                                   {/* HH */}
//                                   <div style={{ position: "relative" }}>
//                                     <input
//                                       type="number"
//                                       placeholder="HH"
//                                       min={1}
//                                       max={12}
//                                       value={draft.hour}
//                                       onChange={(e) => {
//                                         updateTimeDraft(eventKey, { hour: e.target.value });
//                                       }}
//                                       onBlur={() =>
//                                         maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)
//                                       }
//                                       style={{
//                                         width: "56px",
//                                         padding: "6px",
//                                         border: `1px solid ${hourReq ? "red" : "#005b96"}`,
//                                         borderRadius: "5px",
//                                         textAlign: "center",
//                                       }}
//                                     />
//                                     {hourReq && (
//                                       <div
//                                         style={{
//                                           position: "absolute",
//                                           top: "-18px",
//                                           left: "0",
//                                           backgroundColor: "#ffdddd",
//                                           padding: "2px 5px",
//                                           borderRadius: "3px",
//                                           fontSize: "0.75em",
//                                         }}
//                                       >
//                                         Req. Field
//                                       </div>
//                                     )}
//                                   </div>

//                                   {/* MM */}
//                                   <div style={{ position: "relative" }}>
//                                     <input
//                                       type="number"
//                                       placeholder="MM"
//                                       min={0}
//                                       max={59}
//                                       value={draft.minute}
//                                       onChange={(e) => {
//                                         updateTimeDraft(eventKey, { minute: e.target.value });
//                                       }}
//                                       onBlur={() =>
//                                         maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)
//                                       }
//                                       style={{
//                                         width: "56px",
//                                         padding: "6px",
//                                         border: `1px solid ${minuteReq ? "red" : "#005b96"}`,
//                                         borderRadius: "5px",
//                                         textAlign: "center",
//                                       }}
//                                     />
//                                     {minuteReq && (
//                                       <div
//                                         style={{
//                                           position: "absolute",
//                                           top: "-18px",
//                                           left: "0",
//                                           backgroundColor: "#ffdddd",
//                                           padding: "2px 5px",
//                                           borderRadius: "3px",
//                                           fontSize: "0.75em",
//                                         }}
//                                       >
//                                         Req. Field
//                                       </div>
//                                     )}
//                                   </div>

//                                   {/* AM/PM */}
//                                   <div style={{ position: "relative" }}>
//                                     <select
//                                       value={draft.amPm}
//                                       onChange={(e) => {
//                                         updateTimeDraft(eventKey, { amPm: e.target.value });
//                                         // If now complete, commit immediately
//                                         setTimeout(() => {
//                                           maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope);
//                                         }, 0);
//                                       }}
//                                       onBlur={() =>
//                                         maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)
//                                       }
//                                       style={{
//                                         width: "78px",
//                                         padding: "6px",
//                                         border: `1px solid ${ampmReq ? "red" : "#005b96"}`,
//                                         borderRadius: "5px",
//                                       }}
//                                     >
//                                       <option value="">AM/PM</option>
//                                       <option value="AM">AM</option>
//                                       <option value="PM">PM</option>
//                                     </select>
//                                     {ampmReq && (
//                                       <div
//                                         style={{
//                                           position: "absolute",
//                                           top: "-18px",
//                                           left: "0",
//                                           backgroundColor: "#ffdddd",
//                                           padding: "2px 5px",
//                                           borderRadius: "3px",
//                                           fontSize: "0.75em",
//                                         }}
//                                       >
//                                         Req. Field
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Helpful hint */}
//                                 {anyTimeTouched && !timeAllFilled && (
//                                   <div style={{ marginTop: "4px", fontSize: "12px", color: "#444" }}>
//                                     Complete HH, MM, and AM/PM to save a time.
//                                   </div>
//                                 )}
//                               </>
//                             ) : (
//                               occ.start && <div>{occ.start}</div>
//                             )}

//                             {/* NOTE */}
//                             {editMode ? (
//                               <input
//                                 type="text"
//                                 placeholder="Note"
//                                 value={occ.note || ""}
//                                 onChange={(e) =>
//                                   onEditNote?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)
//                                 }
//                                 style={{
//                                   width: "100%",
//                                   marginTop: "6px",
//                                   padding: "6px",
//                                   border: "1px solid #005b96",
//                                   borderRadius: "5px",
//                                 }}
//                               />
//                             ) : (
//                               occ.note && <div>{occ.note}</div>
//                             )}
//                           </div>

//                           {/* Remove THIS occurrence */}
//                           {removeMode && (
//                             <button
//                               onClick={() => onRemoveOccurrence(task.id, rowDay, occurrenceIndex)}
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
//                               title="Remove this occurrence"
//                             >
//                               -
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default TaskList;


// src/TaskList.js
import React, { useRef, useState, useEffect, useMemo } from "react";

const TaskList = ({
  tasks,
  layout,
  getOrderedDaysOfWeek,
  removeMode,
  onRemoveTask,
  onRemoveOccurrence,
  sortByPriority,

  editMode,
  onSetPriority,

  onEditTaskName,
  onEditNote,
  onEditTime,

  orderByDay,
  onReorderDay,
  makeEventKey,
}) => {
  const dragState = useRef({ draggingKey: null, draggingDay: null });

  const [priorityPicker, setPriorityPicker] = useState(null);
  const [scopeByEvent, setScopeByEvent] = useState({});
  const [timeDraftByEvent, setTimeDraftByEvent] = useState({});

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

  const getOcc = (task, day, occurrenceIndex) =>
    task?.taskTimesPerDay?.[day]?.[occurrenceIndex] || {};

  const getOccPriority = (task, day, occurrenceIndex) => {
    const occ = getOcc(task, day, occurrenceIndex);
    return occ?.priority || task?.priority || "";
  };

  const getOccName = (task, day, occurrenceIndex) => {
    const occ = getOcc(task, day, occurrenceIndex);
    return occ?.name ?? task?.taskName ?? "";
  };

  const priorityDotColor = (p) => {
    if (p === "High") return "red";
    if (p === "Medium") return "yellow";
    if (p === "Low") return "green";
    return null;
  };

  const parseStart = (start = "") => {
    const m = String(start).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return { hour: "", minute: "", amPm: "" };
    return { hour: m[1], minute: m[2], amPm: m[3].toUpperCase() };
  };

  const buildDayRows = (day) => {
    const rows = [];

    tasks
      .filter((task) => task.days.includes(day))
      .forEach((task) => {
        const occs = task.taskTimesPerDay?.[day] || [];
        occs.forEach((occ, occurrenceIndex) => {
          const key = makeEventKey
            ? makeEventKey(task.id, day, occurrenceIndex)
            : `${task.id}::${day}::${occurrenceIndex}`;

          rows.push({
            task,
            day,
            occurrenceIndex,
            eventKey: key,
            priority: getOccPriority(task, day, occurrenceIndex),
          });
        });
      });

    if (sortByPriority !== "None") {
      const dir = sortByPriority === "HighToLow" ? -1 : 1;
      rows.sort((a, b) => {
        const pa = getPriorityValue(a.priority);
        const pb = getPriorityValue(b.priority);
        if (pa !== pb) return (pa - pb) * dir;
        return a.task.id - b.task.id || a.occurrenceIndex - b.occurrenceIndex;
      });
      return rows;
    }

    const custom = orderByDay?.[day];
    if (custom && Array.isArray(custom) && custom.length) {
      const idx = new Map(custom.map((k, i) => [k, i]));
      rows.sort((a, b) => {
        const ia = idx.has(a.eventKey) ? idx.get(a.eventKey) : 999999;
        const ib = idx.has(b.eventKey) ? idx.get(b.eventKey) : 999999;
        if (ia !== ib) return ia - ib;
        return a.task.id - b.task.id || a.occurrenceIndex - b.occurrenceIndex;
      });
    }

    return rows;
  };

  // Build rows for all days once per render (memoized)
  const orderedDays = getOrderedDaysOfWeek();
  const rowsByDay = useMemo(() => {
    const map = {};
    orderedDays.forEach((d) => {
      map[d] = buildDayRows(d);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, orderByDay, sortByPriority, orderedDays.join("|")]);

  // ✅ FIX: Fill missing orderByDay keys AFTER render (never during render)
  useEffect(() => {
    if (sortByPriority !== "None") return;
    if (!onReorderDay) return;

    orderedDays.forEach((day) => {
      const rows = rowsByDay[day] || [];
      const existing = orderByDay?.[day] || [];
      const existingSet = new Set(existing);

      const missing = rows.map((r) => r.eventKey).filter((k) => !existingSet.has(k));
      if (missing.length) {
        onReorderDay(day, [...existing, ...missing]);
      }
    });
  }, [orderedDays, rowsByDay, orderByDay, sortByPriority, onReorderDay]);

  // --- Drag logic ---
  const onDragStartRow = (e, day, draggingKey) => {
    if (!editMode) return;
    dragState.current = { draggingKey, draggingDay: day };

    const li = e.currentTarget;
    if (e.dataTransfer && li) {
      try {
        e.dataTransfer.setDragImage(li, li.offsetWidth / 2, li.offsetHeight / 2);
      } catch {}
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggingKey);
    }
  };

  const onDragOverRow = (e, day, targetKey) => {
    if (!editMode) return;
    if (sortByPriority !== "None") return;

    e.preventDefault();
    const { draggingKey, draggingDay } = dragState.current;
    if (!draggingKey || draggingDay !== day) return;
    if (draggingKey === targetKey) return;

    const cur = orderByDay?.[day] || [];
    const from = cur.indexOf(draggingKey);
    const to = cur.indexOf(targetKey);
    if (from === -1 || to === -1) return;

    const next = [...cur];
    next.splice(from, 1);
    next.splice(to, 0, draggingKey);
    onReorderDay?.(day, next);
  };

  const onDropRow = (e) => {
    if (!editMode) return;
    e.preventDefault();
    dragState.current = { draggingKey: null, draggingDay: null };
  };

  const onDragEndRow = () => {
    dragState.current = { draggingKey: null, draggingDay: null };
  };

  const getScope = (eventKey) => scopeByEvent[eventKey] || "one";
  const setScope = (eventKey, nextScope) => {
    setScopeByEvent((prev) => ({ ...prev, [eventKey]: nextScope }));
  };

  // ===== Time draft logic =====
  const getTimeDraft = (eventKey, occStart) => {
    const existing = timeDraftByEvent[eventKey];
    if (existing) return existing;
    const parsed = parseStart(occStart || "");
    return { ...parsed, touched: false };
  };

  const updateTimeDraft = (eventKey, patch) => {
    setTimeDraftByEvent((prev) => {
      const cur = prev[eventKey] || { hour: "", minute: "", amPm: "", touched: false };
      return { ...prev, [eventKey]: { ...cur, ...patch, touched: true } };
    });
  };

  const maybeCommitTime = (eventKey, taskId, day, occurrenceIndex, scope) => {
    const d = timeDraftByEvent[eventKey];
    if (!d) return;

    const any = !!(d.hour || d.minute || d.amPm);
    const all = !!(d.hour && d.minute && d.amPm);

    if (!any) {
      onEditTime?.(taskId, day, occurrenceIndex, { hour: "", minute: "", amPm: "" }, scope);
      return;
    }

    if (all) {
      onEditTime?.(taskId, day, occurrenceIndex, { hour: d.hour, minute: d.minute, amPm: d.amPm }, scope);
    }
  };

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
        {orderedDays.map((day) => {
          const rows = rowsByDay[day] || [];

          return (
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
                {rows.map(({ task, day: rowDay, occurrenceIndex, eventKey }) => {
                  const occ = getOcc(task, rowDay, occurrenceIndex);
                  const priority = getOccPriority(task, rowDay, occurrenceIndex); // ✅ FIX
                  const dot = priorityDotColor(priority);
                  const scope = getScope(eventKey);

                  const draft = getTimeDraft(eventKey, occ.start);
                  const anyTimeTouched = draft.touched && (draft.hour || draft.minute || draft.amPm);
                  const timeAllFilled = !!(draft.hour && draft.minute && draft.amPm);

                  const hourReq = anyTimeTouched && !draft.hour;
                  const minuteReq = anyTimeTouched && !draft.minute;
                  const ampmReq = anyTimeTouched && !draft.amPm;

                  const nameValue = getOccName(task, rowDay, occurrenceIndex);

                  return (
                    <li
                      key={eventKey}
                      draggable={!!editMode && sortByPriority === "None"}
                      onDragStart={(e) => onDragStartRow(e, rowDay, eventKey)}
                      onDragOver={(e) => onDragOverRow(e, rowDay, eventKey)}
                      onDrop={onDropRow}
                      onDragEnd={onDragEndRow}
                      style={{
                        marginBottom: "5px",
                        padding: "10px",
                        border: "1px solid #000",
                        borderRadius: "5px",
                        backgroundColor: "#ffffff",
                        textAlign: "left",
                        position: "relative",
                        paddingRight: editMode && sortByPriority === "None" ? "42px" : "10px",
                        opacity: editMode && dragState.current.draggingKey === eventKey ? 0.6 : 1,
                        cursor: editMode && sortByPriority === "None" ? "grab" : "default",
                        overflow: "hidden",
                      }}
                    >
                      {removeMode && (
                        <button
                          type="button"
                          onClick={() => onRemoveTask(task.id, rowDay)}
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
                            zIndex: 30,
                          }}
                          title="Remove task from this day"
                        >
                          -
                        </button>
                      )}

                      {editMode && sortByPriority === "None" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "8px",
                            transform: "translateY(-50%)",
                            fontWeight: "bold",
                            letterSpacing: "1px",
                            userSelect: "none",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            backgroundColor: "#ffffffcc",
                            border: "1px solid #005b96",
                            cursor: "grab",
                            zIndex: 25,
                          }}
                          title="Drag to reorder"
                        >
                          :::
                        </div>
                      )}

                      {editMode && (
                        <div style={{ marginBottom: "6px", display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setScope(eventKey, "one")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              border: "1px solid #005b96",
                              backgroundColor: scope === "one" ? "#005b96" : "#fff",
                              color: scope === "one" ? "#fff" : "#005b96",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "12px",
                            }}
                          >
                            SetOne
                          </button>

                          <button
                            type="button"
                            onClick={() => setScope(eventKey, "all")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              border: "1px solid #005b96",
                              backgroundColor: scope === "all" ? "#005b96" : "#fff",
                              color: scope === "all" ? "#fff" : "#005b96",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "12px",
                            }}
                          >
                            SetAll
                          </button>
                        </div>
                      )}

                      {editMode && (
                        <div style={{ position: "absolute", top: "6px", right: "6px", zIndex: 40 }}>
                          <button
                            type="button"
                            onClick={() =>
                              setPriorityPicker((prev) => {
                                const same =
                                  prev &&
                                  prev.taskId === task.id &&
                                  prev.day === rowDay &&
                                  prev.occurrenceIndex === occurrenceIndex;
                                return same ? null : { taskId: task.id, day: rowDay, occurrenceIndex, eventKey };
                              })
                            }
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              border: "1px solid #005b96",
                              backgroundColor: "#fff",
                              color: "#005b96",
                              fontWeight: "bold",
                              cursor: "pointer",
                              lineHeight: "18px",
                              padding: 0,
                            }}
                            title="Set priority"
                          >
                            +
                          </button>

                          {priorityPicker &&
                            priorityPicker.taskId === task.id &&
                            priorityPicker.day === rowDay &&
                            priorityPicker.occurrenceIndex === occurrenceIndex && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "26px",
                                  right: 0,
                                  backgroundColor: "#fff",
                                  border: "1px solid #005b96",
                                  borderRadius: "8px",
                                  padding: "8px",
                                  minWidth: "140px",
                                  maxWidth: "160px",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                }}
                              >
                                <div style={{ fontSize: "12px", marginBottom: "6px" }}>Priority</div>

                                <select
                                  value={priority || ""}  // ✅ FIXED binding
                                  onChange={(e) =>
                                    onSetPriority?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    border: "1px solid #005b96",
                                  }}
                                >
                                  <option value="">None</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => setPriorityPicker(null)}
                                  style={{
                                    marginTop: "8px",
                                    width: "100%",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#005b96",
                                    color: "#fff",
                                    cursor: "pointer",
                                  }}
                                >
                                  Done
                                </button>
                              </div>
                            )}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center" }}>
                        {editMode ? (
                          <input
                            type="text"
                            value={nameValue}
                            onChange={(e) =>
                              onEditTaskName?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)
                            }
                            style={{
                              width: "100%",
                              padding: "6px",
                              border: "1px solid #005b96",
                              borderRadius: "5px",
                              fontWeight: "bold",
                            }}
                          />
                        ) : (
                          <strong>{nameValue}</strong>
                        )}

                        {dot && (
                          <div style={{ display: "flex", alignItems: "center", marginLeft: "6px" }}>
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: dot,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: "6px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <input
                            type="checkbox"
                            style={{
                              alignSelf: "flex-start",
                              transform: "scale(1.5)",
                              marginTop: editMode ? "6px" : "2px",
                            }}
                          />

                          <div style={{ width: "100%" }}>
                            {editMode ? (
                              <>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  <div style={{ position: "relative" }}>
                                    <input
                                      type="number"
                                      placeholder="HH"
                                      min={1}
                                      max={12}
                                      value={draft.hour}
                                      onChange={(e) => updateTimeDraft(eventKey, { hour: e.target.value })}
                                      onBlur={() => maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)}
                                      style={{
                                        width: "56px",
                                        padding: "6px",
                                        border: `1px solid ${hourReq ? "red" : "#005b96"}`,
                                        borderRadius: "5px",
                                        textAlign: "center",
                                      }}
                                    />
                                  </div>

                                  <div style={{ position: "relative" }}>
                                    <input
                                      type="number"
                                      placeholder="MM"
                                      min={0}
                                      max={59}
                                      value={draft.minute}
                                      onChange={(e) => updateTimeDraft(eventKey, { minute: e.target.value })}
                                      onBlur={() => maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)}
                                      style={{
                                        width: "56px",
                                        padding: "6px",
                                        border: `1px solid ${minuteReq ? "red" : "#005b96"}`,
                                        borderRadius: "5px",
                                        textAlign: "center",
                                      }}
                                    />
                                  </div>

                                  <div style={{ position: "relative" }}>
                                    <select
                                      value={draft.amPm}
                                      onChange={(e) => {
                                        updateTimeDraft(eventKey, { amPm: e.target.value });
                                        setTimeout(() => {
                                          maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope);
                                        }, 0);
                                      }}
                                      onBlur={() => maybeCommitTime(eventKey, task.id, rowDay, occurrenceIndex, scope)}
                                      style={{
                                        width: "78px",
                                        padding: "6px",
                                        border: `1px solid ${ampmReq ? "red" : "#005b96"}`,
                                        borderRadius: "5px",
                                      }}
                                    >
                                      <option value="">AM/PM</option>
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                </div>

                                {anyTimeTouched && !timeAllFilled && (
                                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#444" }}>
                                    Complete HH, MM, and AM/PM to save a time.
                                  </div>
                                )}
                              </>
                            ) : (
                              occ.start && <div>{occ.start}</div>
                            )}

                            {editMode ? (
                              <input
                                type="text"
                                placeholder="Note"
                                value={occ.note || ""}
                                onChange={(e) => onEditNote?.(task.id, rowDay, occurrenceIndex, e.target.value, scope)}
                                style={{
                                  width: "100%",
                                  marginTop: "6px",
                                  padding: "6px",
                                  border: "1px solid #005b96",
                                  borderRadius: "5px",
                                }}
                              />
                            ) : (
                              occ.note && <div>{occ.note}</div>
                            )}
                          </div>

                          {removeMode && (
                            <button
                              type="button"
                              onClick={() => onRemoveOccurrence(task.id, rowDay, occurrenceIndex)}
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
                              title="Remove this occurrence"
                            >
                              -
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;

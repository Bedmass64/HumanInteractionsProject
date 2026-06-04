"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskListify from "./TaskListify";
import TaskList from "./TaskList";
import {
  buildTimeString,
  makeEventKey,
  getOrderedDays as orderDays,
  getVisibleDays,
} from "./utils/schedule";
import { button, SAVE_GREEN } from "./styles";
import useLocalStorage from "./hooks/useLocalStorage";

export default function TaskListifyPage() {
  const [taskName, setTaskName] = useState("");
  const [dailyOccurences, setDailyOccurences] = useState(1);
  const [eventDays, setEventDays] = useState("everyday");
  const [manualDays, setManualDays] = useState([]);
  const [showTime, setShowTime] = useState(false);
  const [timesOfTheDay, setTimesOfTheDay] = useState([
    { hour: "", minute: "", amPm: "", note: "" },
  ]);
  const [layout, setLayout] = useLocalStorage("layout", "column", { raw: true });
  const [tasks, setTasks] = useState([]);
  const [removeMode, setRemoveMode] = useState(false);
  const [firstDayOfWeek, setFirstDayOfWeek] = useLocalStorage(
    "firstDayOfWeek",
    "Sunday",
    { raw: true }
  );
  const [hiddenDays, setHiddenDays] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modifiedTasks, setModifiedTasks] = useState([]);


  const [showTaskNameRequired, setShowTaskNameRequired] = useState(true);
  const [requiredFields, setRequiredFields] = useState([]);

  // New state variables for priority
  const [priority, setPriority] = useState("");
  const [sortByPriority, setSortByPriority] = useLocalStorage(
    "sortByPriority",
    "None",
    { raw: true }
  );

  // New state variables for Edit Mode
  const [editMode, setEditMode] = useState(false);
  const [editedTasks, setEditedTasks] = useState([]);

  // Per-day manual ordering for drag/drop (stores event keys per day)
  const [orderByDay, setOrderByDay] = useState({});

  // Undo / Redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Search / filter
  const [searchQuery, setSearchQuery] = useState("");

  // Custom day column order (null = use default from firstDayOfWeek)
  const [customDayOrder, setCustomDayOrder] = useState(null);

  // Completed occurrences (Set of eventKeys)
  const [completedOccurrences, setCompletedOccurrences] = useState(new Set());

  // Colour theme
  const [theme, setTheme] = useLocalStorage("theme", "ocean", { raw: true });

  // Font family for the app
  const [fontFamily, setFontFamily] = useLocalStorage("fontFamily", "system", {
    raw: true,
  });

  // Print flip edge: "short" (current, column-reversed) or "long" (no reverse)
  const [printFlipEdge, setPrintFlipEdge] = useLocalStorage(
    "printFlipEdge",
    "short",
    { raw: true }
  );

  // Max events allowed per day (keeps print layout within 2-page slice)
  const MAX_EVENTS_PER_DAY = 14;

  // Custom day labels (e.g. "Monday" -> "Chest")
  const [customDayNames, setCustomDayNames] = useState({});

  // Two-step delete-list confirmation
  const [confirmDeleteList, setConfirmDeleteList] = useState(false);

  const themes = {
    ocean:     { bg: "#b3cde3", primary: "#005b96", secondary: "#003f69" },
    sunset:    { bg: "#ffb347", primary: "#c0392b", secondary: "#922b21" },
    forest:    { bg: "#a8d5a2", primary: "#2d6a4f", secondary: "#1b4332" },
    purple:    { bg: "#d7c4e8", primary: "#6a0dad", secondary: "#4a0080" },
    rose:      { bg: "#f4c2c2", primary: "#b5446e", secondary: "#8b2252" },
    crimson:   { bg: "#f5b7b1", primary: "#922b21", secondary: "#641e16" },
    tangerine: { bg: "#ffd8a8", primary: "#d35400", secondary: "#873600" },
    lemon:     { bg: "#fff3b0", primary: "#b7950b", secondary: "#7d6608" },
    mint:      { bg: "#b8e0d2", primary: "#117a65", secondary: "#0b5345" },
    sky:       { bg: "#aed6f1", primary: "#1f618d", secondary: "#154360" },
    indigo:    { bg: "#c0bcd9", primary: "#2c3e83", secondary: "#1a2457" },
    slate:     { bg: "#d5dbdb", primary: "#34495e", secondary: "#17202a" },
  };
  const clr = themes[theme] || themes.ocean;

  const fonts = {
    system:  `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    serif:   `Georgia, 'Times New Roman', serif`,
    mono:    `'Courier New', Consolas, monospace`,
    rounded: `'Trebuchet MS', 'Lucida Grande', sans-serif`,
    classic: `'Arial', 'Helvetica Neue', sans-serif`,
  };
  const fontStack = fonts[fontFamily] || fonts.system;

  // Keep scroll position stable when toggling modes from bottom controls
  const preserveScrollRef = useRef(false);
  const preservedScrollYRef = useRef(0);


  const navigate = useNavigate();

  const taskListify = new TaskListify();

  // Load state from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);

    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");

    // layout, firstDayOfWeek, sortByPriority, theme, fontFamily and
    // printFlipEdge are loaded and persisted by useLocalStorage above.

    const storedHiddenDays = JSON.parse(localStorage.getItem("hiddenDays")) || [];
    setHiddenDays(storedHiddenDays);

    // NEW: Load drag ordering
    const storedOrderByDay = JSON.parse(localStorage.getItem("orderByDay")) || {};
    setOrderByDay(storedOrderByDay);

    const storedCustomDayNames = JSON.parse(localStorage.getItem("customDayNames")) || {};
    setCustomDayNames(storedCustomDayNames);

    const storedCompleted = JSON.parse(localStorage.getItem("completedOccurrences")) || [];
    setCompletedOccurrences(new Set(storedCompleted));

    const storedDayOrder = JSON.parse(localStorage.getItem("customDayOrder"));
    if (storedDayOrder) setCustomDayOrder(storedDayOrder);
  }, []);

  // Save tasks and settings to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("customDayNames", JSON.stringify(customDayNames));
  }, [customDayNames]);

  useEffect(() => {
    localStorage.setItem("completedOccurrences", JSON.stringify([...completedOccurrences]));
  }, [completedOccurrences]);

  useEffect(() => {
    localStorage.setItem("customDayOrder", JSON.stringify(customDayOrder));
  }, [customDayOrder]);

  useEffect(() => {
    localStorage.setItem("hiddenDays", JSON.stringify(hiddenDays));
  }, [hiddenDays]);

  // NEW: Save drag ordering
  useEffect(() => {
    localStorage.setItem("orderByDay", JSON.stringify(orderByDay));
  }, [orderByDay]);

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoStack, redoStack]);

  // Handle Remove Mode toggle
  useEffect(() => {
    if (removeMode) {
      setModifiedTasks(JSON.parse(JSON.stringify(tasks))); // Deep copy
    } else {
      setModifiedTasks([]);
    }
  }, [removeMode, tasks]);

  // NEW: Handle Edit Mode toggle
  useEffect(() => {
    if (editMode) {
      setEditedTasks(JSON.parse(JSON.stringify(tasks))); // Deep copy
    } else {
      setEditedTasks([]);
    }
  }, [editMode, tasks]);

    useLayoutEffect(() => {
      if (!preserveScrollRef.current) return;

      const y = preservedScrollYRef.current;
      window.scrollTo(0, y);

      // Re-assert scroll across several frames — edit/remove UI
      // inflates row heights and the browser can otherwise clamp us
      // to the top before the new layout settles.
      let frames = 0;
      const tick = () => {
        window.scrollTo(0, y);
        if (++frames < 6) requestAnimationFrame(tick);
        else preserveScrollRef.current = false;
      };
      requestAnimationFrame(tick);
    }, [removeMode, editMode]);



  // Utility: Get Final Times
  const getFinalTimes = () => {
    return timesOfTheDay.map(({ hour, minute, amPm, note }) => {
      const time =
        hour && minute && amPm
          ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")} ${amPm}`
          : "";
      return { start: time, note: note || "", priority: "" }; // <-- add priority here
    });
  };


  // Undo / Redo helpers
  const setTasksWithHistory = (newTasksOrFn) => {
    setTasks((prev) => {
      const next = typeof newTasksOrFn === "function" ? newTasksOrFn(prev) : newTasksOrFn;
      setUndoStack((s) => [...s.slice(-19), prev]);
      setRedoStack([]);
      return next;
    });
  };

  const handleUndo = () => {
    setUndoStack((stack) => {
      if (!stack.length) return stack;
      const prev = stack[stack.length - 1];
      setTasks((cur) => {
        setRedoStack((r) => [...r, cur]);
        return prev;
      });
      return stack.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack((stack) => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setTasks((cur) => {
        setUndoStack((u) => [...u, cur]);
        return next;
      });
      return stack.slice(0, -1);
    });
  };

  // Task completion toggle
  const handleToggleComplete = (eventKey) => {
    setCompletedOccurrences((prev) => {
      const next = new Set(prev);
      if (next.has(eventKey)) next.delete(eventKey);
      else next.add(eventKey);
      return next;
    });
  };

  // Reorder day columns
  const handleReorderDays = (newOrder) => {
    setCustomDayOrder(newOrder);
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

    // Enforce the print-capacity cap per day before adding
    const extraPerDay = Math.max(1, dailyOccurences);
    const overflow = days.find((day) => {
      const existing = tasks.reduce((sum, t) => {
        if (!t.days.includes(day)) return sum;
        return sum + (t.taskTimesPerDay?.[day]?.length || 0);
      }, 0);
      return existing + extraPerDay > MAX_EVENTS_PER_DAY;
    });

    if (overflow) {
      alert(
        `Element cannot be added — ${overflow} already has the maximum of ${MAX_EVENTS_PER_DAY} events. ` +
          `Remove an event from that day to free up space.`
      );
      return;
    }

    const taskTimes = getFinalTimes();

    // Create taskTimesPerDay
    const taskTimesPerDay = {};
    days.forEach((day) => {
      taskTimesPerDay[day] = JSON.parse(JSON.stringify(taskTimes)); // Deep copy
    });

    const newTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      taskName,
      days,
      taskTimesPerDay,
      priority,
    };

    setTasksWithHistory((prevTasks) => [...prevTasks, newTask]);
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

  // Delete the entire current list (two-step confirmation via state)
  const handleDeleteList = () => {
    setTasksWithHistory([]);
    setCompletedOccurrences(new Set());
    setOrderByDay({});
    setConfirmDeleteList(false);
    alert("List deleted.");
  };

  const handleRenameDay = (day, label) => {
    setCustomDayNames((prev) => {
      const next = { ...prev };
      if (!label || !label.trim() || label.trim() === day) {
        delete next[day];
      } else {
        next[day] = label.trim();
      }
      return next;
    });
  };

  // Download Tasks in JSON format
  const downloadTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tasks.json";
    link.click();
  };

  // =========================
  // NEW: Edit + Drag handlers
  // =========================

  // Event key format for ordering (stable and day-specific)
  // Update priority (edit mode)
  // scope = "one" or "all"
  const handleEditSetPriority = (taskId, day, occurrenceIndex, newPriority, scope = "one") => {
    setEditedTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        // Deep-ish copy of nested structure we mutate
        const taskTimesPerDay = { ...t.taskTimesPerDay };

        if (scope === "all") {
          // Apply to every occurrence on every day for this task
          Object.keys(taskTimesPerDay).forEach((d) => {
            taskTimesPerDay[d] = (taskTimesPerDay[d] || []).map((occ) => ({
              ...occ,
              priority: newPriority,
            }));
          });

          return {
            ...t,
            priority: newPriority, // keep task-level default in sync too
            taskTimesPerDay,
          };
        }
        // scope === "one": only the targeted occurrence
        const arr = [...(taskTimesPerDay[day] || [])];
        if (!arr[occurrenceIndex]) return t;

        arr[occurrenceIndex] = {
          ...arr[occurrenceIndex],
          priority: newPriority,
        };

        taskTimesPerDay[day] = arr;

        return { ...t, taskTimesPerDay };
      })
    );
  };


  // Update the manual order for a given day (expects an array of event keys)
  const handleReorderDay = (day, newOrderedKeys) => {
    setOrderByDay((prev) => ({
      ...prev,
      [day]: newOrderedKeys,
    }));
  };

  const handleSaveEdits = () => {
    preserveScrollNow();
    setTasksWithHistory(editedTasks);
    setEditMode(false);
    alert("Edits saved.");
  };


    const preserveScrollNow = () => {
    preservedScrollYRef.current = window.scrollY || 0;
    preserveScrollRef.current = true;
  };

    // --- NEW: mutually-exclusive toggles for Remove vs Edit ---
    const toggleRemoveMode = () => {
      preserveScrollNow();
      setRemoveMode((prev) => {
        const next = !prev;
        if (next) setEditMode(false);
        return next;
      });
    };

    const toggleEditMode = () => {
      preserveScrollNow();
      setEditMode((prev) => {
        const next = !prev;
        if (next) setRemoveMode(false);
        return next;
      });
    };



  const handleSaveChanges = () => {
    preserveScrollNow();
    setTasksWithHistory(modifiedTasks);
    setRemoveMode(false);
    alert("Changes saved.");
  };


  // =========================
// NEW: Edit handlers (name, note, time)
// =========================

// time string helpers (your stored format is "HH:MM AM/PM")

// 1) Edit Task Name (supports SetOne vs SetAll)
// scope: "one" | "all"
// - "all": updates task.taskName (global)
// - "one": sets occ.name override on that specific occurrence only
const handleEditTaskName = (taskId, day, occurrenceIndex, newName, scope = "one") => {
  setEditedTasks((prev) =>
    prev.map((t) => {
      if (t.id !== taskId) return t;

      // SetAll: task-level rename
      if (scope === "all") {
        // Optional: clear per-occurrence overrides so they match the global name again
        const taskTimesPerDay = { ...t.taskTimesPerDay };
        Object.keys(taskTimesPerDay).forEach((d) => {
          taskTimesPerDay[d] = (taskTimesPerDay[d] || []).map((occ) => {
            const { name, ...rest } = occ || {};
            return rest; // remove occ.name override
          });
        });
        return { ...t, taskName: newName, taskTimesPerDay };
      }

      // SetOne: occurrence-level name override
      const taskTimesPerDay = { ...t.taskTimesPerDay };
      const arr = [...(taskTimesPerDay[day] || [])];
      if (!arr[occurrenceIndex]) return t;

      arr[occurrenceIndex] = { ...(arr[occurrenceIndex] || {}), name: newName };
      taskTimesPerDay[day] = arr;

      return { ...t, taskTimesPerDay };
    })
  );
};


// 2) Edit Note (per occurrence)
// scope: "one" | "all"
const handleEditSetNote = (
  taskId,
  day,
  occurrenceIndex,
  newNote,
  scope = "one"
) => {
  setEditedTasks((prev) =>
    prev.map((t) => {
      if (t.id !== taskId) return t;

      const taskTimesPerDay = { ...t.taskTimesPerDay };

      if (scope === "all") {
        Object.keys(taskTimesPerDay).forEach((d) => {
          taskTimesPerDay[d] = (taskTimesPerDay[d] || []).map((occ) => ({
            ...occ,
            note: newNote ?? "",
          }));
        });
        return { ...t, taskTimesPerDay };
      }

      const arr = [...(taskTimesPerDay[day] || [])];
      if (!arr[occurrenceIndex]) return t;

      arr[occurrenceIndex] = {
        ...arr[occurrenceIndex],
        note: newNote ?? "",
      };

      taskTimesPerDay[day] = arr;
      return { ...t, taskTimesPerDay };
    })
  );
};

// 3) Edit Time (per occurrence)
// inputs are the three fields, you can pass strings
// scope: "one" | "all"
const handleEditSetTime = (
  taskId,
  day,
  occurrenceIndex,
  { hour, minute, amPm },
  scope = "one"
) => {
  const nextStart = buildTimeString({ hour, minute, amPm });

  setEditedTasks((prev) =>
    prev.map((t) => {
      if (t.id !== taskId) return t;

      const taskTimesPerDay = { ...t.taskTimesPerDay };

      if (scope === "all") {
        Object.keys(taskTimesPerDay).forEach((d) => {
          taskTimesPerDay[d] = (taskTimesPerDay[d] || []).map((occ) => ({
            ...occ,
            start: nextStart,
          }));
        });
        return { ...t, taskTimesPerDay };
      }

      const arr = [...(taskTimesPerDay[day] || [])];
      if (!arr[occurrenceIndex]) return t;

      arr[occurrenceIndex] = {
        ...arr[occurrenceIndex],
        start: nextStart,
      };

      taskTimesPerDay[day] = arr;
      return { ...t, taskTimesPerDay };
    })
  );
};


// ===== Reusable controls =====

// Top controls (include Add Task)
const TopModeControls = (
  <>
    {/* Add Task only when not editing/removing */}
    {!removeMode && !editMode && (
      <button
        onClick={handleAddTask}
        style={button(clr.primary, { marginTop: "15px" })}
      >
        Add Task
      </button>
    )}

    {/* Remove */}
    {!editMode && (
      <button
        onClick={toggleRemoveMode}
        style={button(clr.primary)}
      >
        {removeMode ? "Untoggle Remove Task" : "Remove Tasks"}
      </button>
    )}

    {removeMode && (
      <button
        onClick={handleSaveChanges}
        style={button(SAVE_GREEN)}
      >
        Save Removed Tasks
      </button>
    )}

    {/* Edit */}
    {!removeMode && (
      <button
        onClick={() => {
          toggleEditMode();
        }}
        style={button(clr.primary)}
      >
        {editMode ? "Untoggle Edit Tasks" : "Edit Tasks"}
      </button>
    )}

    {editMode && (
      <button
        onClick={handleSaveEdits}
        style={button(SAVE_GREEN)}
      >
        Save Edited Tasks
      </button>
    )}
  </>
);


const BottomModeControls = (
  <>
    {/* Remove */}
    {!editMode && (
      <button
        onClick={() => {
          preserveScrollNow();
          toggleRemoveMode();
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          backgroundColor: clr.primary,
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "1em",
        }}
      >
        {removeMode ? "Untoggle Remove Task" : "Remove Tasks"}
      </button>
    )}

    {removeMode && (
      <button
        onClick={() => {
          preserveScrollNow();
          handleSaveChanges();
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          backgroundColor: "#009605",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "1em",
        }}
      >
        Save Removed Tasks
      </button>
    )}

    {/* Edit */}
    {!removeMode && (
      <button
        onClick={() => {
          preserveScrollNow();
          toggleEditMode();
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          backgroundColor: clr.primary,
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "1em",
        }}
      >
        {editMode ? "Untoggle Edit Tasks" : "Edit Tasks"}
      </button>
    )}

    {editMode && (
      <button
        onClick={() => {
          preserveScrollNow();
          handleSaveEdits();
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          backgroundColor: "#009605",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "1em",
        }}
      >
        Save Edited Tasks
      </button>
    )}
  </>
);



// //COMPLETE WORKING VERSION FOR NO SHORT EDGE FLIP
// // a b c d
// // a b c d
// //  e f g
// //  e f g
// const handleQuickPrint = () => {
//   const taskSection = document.getElementById("task-list-section");
//   if (!taskSection) {
//     alert("Couldn't find #task-list-section.");
//     return;
//   }

//   // Try to grab real .day-box children first
//   let dayBoxes = Array.from(taskSection.querySelectorAll(':scope > .day-box'));

//   // If none, fall back: your DOM looks like [H2, <DIV all days...>]
//   let daysWrapper = taskSection.children[1] || taskSection;

//   if (dayBoxes.length < 7) {
//     const DAY_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
//     const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

//     const html = daysWrapper.innerHTML;
//     const splitRegex = new RegExp(
//       "(?:^|>)\\s*(" + [...DAY_FULL, ...DAY_SHORT].join("|") + ")\\b",
//       "gi"
//     );

//     let match;
//     const indices = [];
//     while ((match = splitRegex.exec(html)) !== null) {
//       const token = match[1];
//       const full = DAY_FULL.find(d => d.toLowerCase().startsWith(token.toLowerCase())) || token;
//       indices.push({ name: full, index: match.index });
//     }

//     if (indices.length === 0) {
//       alert("Could not detect day sections. Make sure each day name (e.g., 'Sunday', 'Mon') appears clearly.");
//       return;
//     }

//     const chunks = [];
//     for (let i = 0; i < indices.length && chunks.length < 7; i++) {
//       const startIdx = indices[i].index;
//       const endIdx   = (i + 1 < indices.length) ? indices[i + 1].index : html.length;
//       const name     = indices[i].name;
//       let piece      = html.slice(startIdx, endIdx);

//       // --- sanitize ---
//       if (piece[0] === '>') piece = piece.slice(1);
//       const dayHeadRE = new RegExp(
//         "^\\s*(?:" + [...DAY_FULL, ...DAY_SHORT].join("|") + ")\\b\\s*[:\\-]*\\s*",
//         "i"
//       );
//       piece = piece.replace(dayHeadRE, "");
//       // --- end sanitize ---

//       chunks.push(`<div class="day-box"><h3 class="day-title">${name}</h3>${piece}</div>`);
//     }

//     dayBoxes = chunks.map(htmlStr => {
//       const tmp = document.createElement('div');
//       tmp.innerHTML = htmlStr;
//       return tmp.firstElementChild;
//     });
//   }

//   if (dayBoxes.length === 0) {
//     alert("Couldn't form any day boxes; check your markup.");
//     return;
//   }

//   const c1HTML = dayBoxes.slice(0, 4).map(el => el.outerHTML); // days 1–4
//   const c2HTML = dayBoxes.slice(4, 7).map(el => el.outerHTML); // days 5–7

//   const printWindow = window.open("", "_blank");
//   if (!printWindow) {
//     alert("Pop-up blocked. Please allow pop-ups.");
//     return;
//   }

//   // Build the print document (auto-removes whitespace if container 2 is skipped)
//   printWindow.document.write(`
// <!doctype html>
// <html>
// <head>
// <meta charset="utf-8" />
// <title>Task List Print</title>
// <style>
//   :root {
//     --day-box-height-c1: 477.5mm;
//     --day-box-height-c2: 481.5mm;
//     --col-gap: 4mm;
//   }

//   @media print { @page { margin: 6mm; } }

//   html, body {
//     margin: 0;
//     padding: 0;
//     background: #fff;
//     font-family: Arial, sans-serif;
//   }

//   #print-root {
//     width: 100%;
//     margin: 0 auto;
//     box-sizing: border-box;
//   }

//   .container {
//     box-sizing: border-box;
//     margin: 0; /* No extra white space */
//     padding: 1mm;
//     border: 3px solid transparent;
//     border-radius: 6px;
//     display: grid;
//   }
//   .container-1 {
//     border-color: #fff;
//     grid-template-columns: repeat(4, 1fr);
//     gap: var(--col-gap);
//   }
//   .container-2 {
//     border-color: #fff;
//     grid-template-columns: repeat(3, 1fr);
//     gap: var(--col-gap);
//     margin-top: 5mm; /* only adds space when actually rendered */
//   }

//   .day-box {
//     border: 1px solid currentColor;
//     border-radius: 6px;
//     padding: 0;
//     background: #fff;
//     page-break-inside: avoid;
//     box-sizing: border-box;
//     width: auto;
//     overflow: hidden;
//   }
//   .container-1 .day-box {
//     color: #000;
//     border-color: #005b96 !important;
//     height: var(--day-box-height-c1) !important;
//   }
//   .container-2 .day-box {
//     color: #000;
//     border-color: #005b96 !important;
//     height: var(--day-box-height-c2) !important;
//   }

//   .day-title {
//     font-weight: bold;
//     font-size: 16px;
//     margin: 8px 0;
//     text-align: center;
//   }

//   .event-box {
//     border: 1px solid #000;
//     border-radius: 4px;
//     padding: 6px;
//     margin-bottom: 6px;
//     box-sizing: border-box;
//     page-break-inside: avoid;
//   }

//   h1,h2,.task-list-header,#page-header { display: none; }
// </style>
// </head>
// <body>
//   <div id="print-root"></div>
//   <script>
//     const payload = {
//       c1: ${JSON.stringify(c1HTML)},
//       c2: ${JSON.stringify(c2HTML)}
//     };

//     const root = document.getElementById('print-root');

//     function buildContainer(containerClass, htmlArray) {
//       const cont = document.createElement('div');
//       cont.className = 'container ' + containerClass;
//       htmlArray.forEach(html => {
//         const wrap = document.createElement('div');
//         wrap.innerHTML = html;
//         let node = wrap.firstElementChild;
//         if (!node) return;
//         if (!node.classList.contains('day-box')) node.classList.add('day-box');
//         cont.appendChild(node);
//       });
//       root.appendChild(cont);
//     }

//     // Always build container 1
//     buildContainer('container-1', payload.c1);

//     // Only build container 2 if there’s a 5th element onward
//     if (payload.c2 && payload.c2.length > 0) {
//       buildContainer('container-2', payload.c2);
//     } else {
//       // Ensure no white space remains where container 2 would be
//       document.body.style.marginBottom = '0';
//       root.style.marginBottom = '0';
//     }

//     window.addEventListener('load', () => {
//       window.print();
//       window.close();
//     });
//   </script>
// </body>
// </html>
//   `);

//   printWindow.document.close();
// };



//COMPLETE WORKING VERSION FOR SHORT EDGE FLIP
// a b c d
// d c b a
//  e f g
//  g f e
const handleQuickPrint = () => {
  if (editMode) {
    alert("Please finish editing before going to the print screen.");
    return;
  }

  if (removeMode) {
    alert("Please finish removing tasks before going to the print screen.");
    return;
  }

  const taskSection = document.getElementById("task-list-section");
  if (!taskSection) {
    alert("Couldn't find #task-list-section.");
    return;
  }

  // Detect day containers via the DOM class — every visible day has .day-box.
  // We previously fell back to an innerHTML regex that split on day-name
  // tokens, but that corrupted event boxes when a user named an event
  // after a day of the week (e.g. "Monday").
  const dayBoxes = Array.from(taskSection.querySelectorAll('.day-box'));

  if (!dayBoxes.length) {
    alert("Couldn't find any day boxes. Add at least one task first.");
    return;
  }

  // Dynamic split: fit up to 4 days in the first container, the rest in the second.
  const total = dayBoxes.length;
  const firstSize = Math.min(4, total);
  const secondSize = Math.max(0, total - firstSize);

  // Top slices (page 1 + container 3)
  const page1 = dayBoxes.slice(0, firstSize).map((el) => el.outerHTML);
  const c34 = dayBoxes.slice(firstSize, total).map((el) => el.outerHTML);

  // Bottom slices — for short-edge flip we reverse columns so content aligns
  // when the paper is flipped along its short edge. For long-edge flip we
  // keep the same order.
  const reverseCols = printFlipEdge === "short";
  const page2 = reverseCols ? [...page1].reverse() : [...page1];
  const c34REV = reverseCols ? [...c34].reverse() : [...c34];

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups.");
    return;
  }

  printWindow.document.write(`
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Task List Print</title>
<style>
  /* Physical page setup for the sliced Page 1–4 */
  @media print { @page { size: Letter landscape; margin: 6mm; } }

  html, body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
  #print-root { width: 100%; margin: 0 auto; box-sizing: border-box; }

  /* --- Slicing variables for container-1 (4 columns / pages 1–4) --- */
  :root {
    --total-h: 470mm;      /* total logical height of a day (c1) */
    --slice1-h: 232mm;     /* top slice height (c1) */
    --col-gap: 4mm;

    /* --- Slicing variables for containers 3 & 4 (3 columns / days 5–7) --- */
    --total-h-34: 470mm;   /* total logical height (c3/c4) */
    --slice1-h-34: 232mm;  /* top slice height (c3); c4 shows the bottom */
  }

  /* ====== PAGES (container-1 slicing) ====== */
  .print-page {
    page-break-after: always; break-after: page;
    margin: 0; padding: 0;
  }
  .print-page:last-of-type { page-break-after: auto; break-after: auto; }

  .container-4col {
    display: grid;
    grid-template-columns: repeat(${Math.max(1, firstSize)}, 1fr);
    gap: var(--col-gap);
    padding: 1mm;
    border: 3px solid transparent;
    border-radius: 6px;
    box-sizing: border-box;
  }

  .day-viewport {
    box-sizing: border-box;
    border: 1px solid #005b96;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
    height: var(--slice1-h); /* top slice (Page 1 & 3) */
  }
  .day-inner { height: var(--total-h); box-sizing: border-box; }

  .day-inner .day-box {
    height: auto !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
  }

  .day-title { font-weight: bold; font-size: 16px; margin: 8px 0; text-align: center; }

  /* Write-on lines under every event name and blank filler rows */
  .day-inner ul, .day-inner-34 ul { list-style: none; padding: 0; margin: 0; }
  .day-inner li, .day-inner-34 li {
    border: none !important;
    background: transparent !important;
    padding: 4px 6px !important;
    margin: 0 !important;
    border-bottom: 1px solid #000 !important;
    min-height: 18mm;
    page-break-inside: avoid;
  }
  .day-inner li:last-child, .day-inner-34 li:last-child { border-bottom: 1px solid #000 !important; }
  .print-blank-line {
    border-bottom: 1px solid #000;
    min-height: 18mm;
    margin: 0;
  }

  /* Bottom slice on reversed pages (Page 2 & 4) */
  .slice-bottom .day-viewport { height: calc(var(--total-h) - var(--slice1-h)); }
  .slice-bottom .day-inner   { transform: translateY(calc(-1 * var(--slice1-h))); }

  /* ====== CONTAINERS 3 & 4 (3 columns with slicing) ====== */
  .container { box-sizing: border-box; margin: 0; padding: 1mm; border: 3px solid transparent; border-radius: 6px; display: grid; }

  .container-3, .container-4 {
    grid-template-columns: repeat(${Math.max(1, secondSize)}, 1fr);
    gap: var(--col-gap);
    margin-top: 5mm; /* only shows if present */
    border-color: #fff;
  }

  /* Viewport for 3-col slices (top/bottom) */
  .day-viewport-34 {
    box-sizing: border-box;
    border: 1px solid #005b96;
    border-radius: 6px;
    background: #fff;
    overflow: hidden;
    height: var(--slice1-h-34);  /* top slice by default */
  }
  .day-inner-34 { height: var(--total-h-34); box-sizing: border-box; }

  .day-inner-34 .day-box {
    height: auto !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
  }

  /* Bottom slice for container-4 */
  .slice-bottom-34 .day-viewport-34 { height: calc(var(--total-h-34) - var(--slice1-h-34)); }
  .slice-bottom-34 .day-inner-34   { transform: translateY(calc(-1 * var(--slice1-h-34))); }

  /* Keep items intact visually */
  @media print {
    .day-viewport, .day-inner, .day-viewport-34, .day-inner-34,
    .day-box, .event-box, .task, .event, .task-item {
      page-break-inside: avoid; break-inside: avoid;
      -webkit-column-break-inside: avoid; -webkit-region-break-inside: avoid;
    }
    h1, h2, .task-list-header, #page-header { display: none !important; }
  }
</style>
</head>
<body>
  <div id="print-root"></div>
  <script>
    const payload = {
      page1: ${JSON.stringify(page1)},   // first 4 days, normal (top slice)
      page2: ${JSON.stringify(page2)},   // same 4 days, reversed (bottom slice)

      c3: ${JSON.stringify(c34)},        // days 5–7 normal (top slice)
      c4: ${JSON.stringify(c34REV)}      // days 5–7 reversed (bottom slice)
    };

    const root = document.getElementById('print-root');
    const MAX_PRINT_EVENTS = ${MAX_EVENTS_PER_DAY};

    /* Pad each day's event list with blank filler lines so writable lines
       always go from the current bottom of the real content down to the
       total cap. */
    function padBlankLines(dayEl) {
      if (!dayEl) return;
      const list = dayEl.querySelector('ul');
      if (!list) return;
      const existing = list.querySelectorAll('li').length;
      const needed = Math.max(0, MAX_PRINT_EVENTS - existing);
      for (let i = 0; i < needed; i++) {
        const li = document.createElement('li');
        li.className = 'print-blank-line';
        li.innerHTML = '&nbsp;';
        list.appendChild(li);
      }
    }

    /* ====== container-1 page builders ====== */
    function makeSlicedCard(html) {
      const wrap = document.createElement('div');
      wrap.className = 'day-viewport';
      const inner = document.createElement('div');
      inner.className = 'day-inner';
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const node = tmp.firstElementChild;
      if (node) {
        padBlankLines(node);
        inner.appendChild(node);
      }
      wrap.appendChild(inner);
      return wrap;
    }

    function buildExactPage(htmlArray, { reversed=false, label="" } = {}) {
      const page = document.createElement('div');
      page.className = 'print-page' + (reversed ? ' slice-bottom' : '');
      if (label) page.setAttribute('data-print-page', label);

      const cont = document.createElement('div');
      cont.className = 'container-4col';

      htmlArray.forEach(html => {
        const card = makeSlicedCard(html);
        cont.appendChild(card);
      });

      page.appendChild(cont);
      root.appendChild(page);
    }

    /* ====== container-3/4 builders with slicing ====== */
    function makeSlicedCard34(html) {
      const wrap = document.createElement('div');
      wrap.className = 'day-viewport-34';
      const inner = document.createElement('div');
      inner.className = 'day-inner-34';
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const node = tmp.firstElementChild;
      if (node) {
        padBlankLines(node);
        inner.appendChild(node);
      }
      wrap.appendChild(inner);
      return wrap;
    }

    function buildContainer34(htmlArray, { reversed=false, which=3 } = {}) {
      const cont = document.createElement('div');
      cont.className = 'container ' + (which === 3 ? 'container-3' : 'container-4') + (reversed ? ' slice-bottom-34' : '');
      htmlArray.forEach(html => {
        const card = makeSlicedCard34(html);
        cont.appendChild(card);
      });
      root.appendChild(cont);
    }

    /* ====== Build exactly like your current flow (pages 1–4), then containers 3 & 4 ====== */
    buildExactPage(payload.page1, { reversed: false, label: '1' }); // Page 1 (top slice)
    buildExactPage(payload.page2, { reversed: true,  label: '2' }); // Page 2 (bottom slice)


    // Container 3: days 5–7 normal (top slice)
    if (payload.c3 && payload.c3.length) {
      buildContainer34(payload.c3, { reversed: false, which: 3 });
    }
    // Container 4: days 5–7 reversed (bottom slice)
    if (payload.c4 && payload.c4.length) {
      buildContainer34(payload.c4, { reversed: true, which: 4 });
    }

    window.addEventListener('load', () => {
      window.print();
      window.close();
    });
  </script>
</body>
</html>
  `);

  printWindow.document.close();
};










  const readTasksFile = (event, onTasksReady) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedTasks = JSON.parse(e.target.result);
        if (Array.isArray(uploadedTasks)) {
          onTasksReady(uploadedTasks);
        } else {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      } catch (error) {
        alert("Error parsing the JSON file. Please ensure it is correctly formatted.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const uploadTasksJSON = (event) => {
    readTasksFile(event, (uploadedTasks) => {
      setTasksWithHistory(uploadedTasks);
      alert("Tasks uploaded successfully!");
    });
  };

  const mergeTasksJSON = (event) => {
    readTasksFile(event, (uploadedTasks) => {
      setTasksWithHistory((prev) => {
        const existingIds = new Set(prev.map((t) => String(t.id)));
        const fresh = uploadedTasks.filter((t) => !existingIds.has(String(t.id)));
        return [...prev, ...fresh];
      });
      alert("Tasks merged successfully!");
    });
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

  // Reset custom day order when first day of week changes
  useEffect(() => {
    setCustomDayOrder(null);
  }, [firstDayOfWeek]);

  // Get Ordered Days
  const getOrderedDays = () => orderDays(firstDayOfWeek, taskListify.daysOfWeek);

  // Get Ordered Days for Task List
  const getOrderedDaysOfWeek = () =>
    getVisibleDays(customDayOrder || getOrderedDays(), hiddenDays);

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
              return null; // Removes tasks completely if no days are left
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
              // If no times left for the day, removes the day from the task
              const updatedDays = task.days.filter((d) => d !== day);
              if (updatedDays.length > 0) {
                const updatedTaskTimesPerDay = { ...task.taskTimesPerDay };
                delete updatedTaskTimesPerDay[day];
                return { ...task, days: updatedDays, taskTimesPerDay: updatedTaskTimesPerDay };
              } else {
                return null; // Removes the task completely if no days are left
              }
            }
          }
          return task;
        })
        .filter(Boolean);
    });
  };


  return (
    <div
      style={{
        backgroundColor: clr.bg,
        minHeight: "100vh",
        padding: "40px 0",
        color: "#000",
        fontFamily: fontStack,
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
            color: clr.primary,
            textAlign: "center",
            fontSize: "2.5em",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          TaskListify
        </h1>

        <div
          style={{
            border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                              border: `1px solid ${clr.primary}`,
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
                              border: `1px solid ${clr.primary}`,
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
                              border: `1px solid ${clr.primary}`,
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
                          border: `1px solid ${clr.primary}`,
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

        {TopModeControls}

        {/* Undo / Redo */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: undoStack.length === 0 ? "#ccc" : clr.secondary,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "0.95em",
              cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
            }}
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: redoStack.length === 0 ? "#ccc" : clr.secondary,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "0.95em",
              cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
            }}
            title="Redo (Ctrl+Y)"
          >
            ↪ Redo
          </button>
        </div>

        {/* Search / Filter */}
        <div style={{ marginTop: "15px" }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "97%",
              padding: "10px",
              border: `1px solid ${clr.primary}`,
              borderRadius: "5px",
              fontSize: "1em",
            }}
          />
        </div>

        {/* Task List by Day*/}
        <TaskList
          tasks={removeMode ? modifiedTasks : editMode ? editedTasks : tasks}
          layout={layout}
          getOrderedDaysOfWeek={getOrderedDaysOfWeek}
          removeMode={removeMode}
          onRemoveTask={handleRemoveTask}
          onRemoveOccurrence={handleRemoveOccurrence}
          sortByPriority={sortByPriority}
          editMode={editMode}
          onSetPriority={handleEditSetPriority}
          onEditTaskName={handleEditTaskName}
          onEditNote={handleEditSetNote}
          onEditTime={handleEditSetTime}
          orderByDay={orderByDay}
          onReorderDay={handleReorderDay}
          makeEventKey={makeEventKey}
          searchQuery={searchQuery}
          completedOccurrences={completedOccurrences}
          onToggleComplete={handleToggleComplete}
          onReorderDays={handleReorderDays}
          customDayNames={customDayNames}
        />


        <div style={{ marginTop: "15px" }}>
          {BottomModeControls}
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            backgroundColor: clr.primary,
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
              border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
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
                border: `1px solid ${clr.primary}`,
                borderRadius: "5px",
              }}
            >
              <option value="None">Default (None)</option>
              <option value="HighToLow">Highest to Lowest</option>
              <option value="LowToHigh">Lowest to Highest</option>
            </select>

            {/* Colour Theme */}
            <div style={{ marginTop: "15px" }} />
            <label>Colour Theme:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: `1px solid ${clr.primary}`,
                borderRadius: "5px",
              }}
            >
              <option value="ocean">Ocean (Light Blue &amp; Dark Blue)</option>
              <option value="sunset">Sunset (Orange &amp; Red)</option>
              <option value="forest">Forest (Light Green &amp; Dark Green)</option>
              <option value="purple">Purple Dusk (Lavender &amp; Deep Purple)</option>
              <option value="rose">Rose Gold (Blush Pink &amp; Rose)</option>
              <option value="crimson">Crimson (Pink &amp; Deep Red)</option>
              <option value="tangerine">Tangerine (Peach &amp; Burnt Orange)</option>
              <option value="lemon">Lemon (Cream &amp; Gold)</option>
              <option value="mint">Mint (Sage &amp; Teal)</option>
              <option value="sky">Sky (Sky Blue &amp; Navy)</option>
              <option value="indigo">Indigo (Lavender Gray &amp; Indigo)</option>
              <option value="slate">Slate (Silver &amp; Charcoal)</option>
            </select>

            {/* Font Family */}
            <div style={{ marginTop: "15px" }} />
            <label>Font:</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: `1px solid ${clr.primary}`,
                borderRadius: "5px",
              }}
            >
              <option value="system">System Default</option>
              <option value="serif">Serif (Georgia)</option>
              <option value="mono">Monospace (Courier)</option>
              <option value="rounded">Rounded (Trebuchet)</option>
              <option value="classic">Classic (Arial)</option>
            </select>

            {/* Rename Day Titles */}
            <div style={{ marginTop: "15px" }} />
            <label>Rename Day Titles (blank = default):</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "5px" }}>
              {taskListify.daysOfWeek.map((day) => (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "80px", fontSize: "0.9em" }}>{day}:</span>
                  <input
                    type="text"
                    placeholder={day}
                    value={customDayNames[day] || ""}
                    onChange={(e) => handleRenameDay(day, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      border: `1px solid ${clr.primary}`,
                      borderRadius: "5px",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Print Flip Edge */}
            <div style={{ marginTop: "15px" }} />
            <label>Print Flip Edge:</label>
            <select
              value={printFlipEdge}
              onChange={(e) => setPrintFlipEdge(e.target.value)}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "10px",
                border: `1px solid ${clr.primary}`,
                borderRadius: "5px",
              }}
            >
              <option value="short">Short Edge Flip (columns reversed on back)</option>
              <option value="long">Long Edge Flip (columns stay in place)</option>
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
                backgroundColor: clr.secondary,
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
            <label>(This will replace what you have written with the uploaded list, it will not add to it):</label>

            <label
              style={{
                display: "block",
                width: "97.33%",
                padding: "10px",
                marginTop: "5px",
                backgroundColor: clr.secondary,
                color: "#fff",
                textAlign: "center",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Upload Task List (Replace)
              <input
                type="file"
                accept=".json"
                onChange={uploadTasksJSON}
                style={{
                  display: "none",
                }}
              />
            </label>

            <label
              style={{
                display: "block",
                width: "97.33%",
                padding: "10px",
                marginTop: "10px",
                backgroundColor: clr.secondary,
                color: "#fff",
                textAlign: "center",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
              }}
              title="Adds uploaded tasks to the existing list instead of replacing it"
            >
              Merge Upload (Add to List)
              <input
                type="file"
                accept=".json"
                onChange={mergeTasksJSON}
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
                backgroundColor: clr.secondary,
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
                  onClick={() => navigate("/login")}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: clr.secondary,
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
                    backgroundColor: clr.secondary,
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
                  backgroundColor: clr.secondary,
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

        {/* Delete current list — always visible at the bottom */}
        <div style={{ marginTop: "30px", borderTop: `1px solid ${clr.primary}`, paddingTop: "15px" }}>
          {!confirmDeleteList ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteList(true)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#b71c1c",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "1em",
              }}
            >
              Delete Current List
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleDeleteList}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#b71c1c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "1em",
                }}
              >
                Confirm Delete (Cannot Undo)
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteList(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: clr.secondary,
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "1em",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

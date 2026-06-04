import React, { useRef, useState, useEffect, useMemo } from "react";
import { getPriorityValue } from "./utils/schedule";

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

  searchQuery,
  completedOccurrences,
  onToggleComplete,
  onReorderDays,
  customDayNames = {},
}) => {
  const dragState = useRef({ draggingKey: null, draggingDay: null });

  const [priorityPicker, setPriorityPicker] = useState(null);
  const [scopeByEvent, setScopeByEvent] = useState({});
  const [timeDraftByEvent, setTimeDraftByEvent] = useState({});

  const getOcc = (task, day, occurrenceIndex) =>
    task?.taskTimesPerDay?.[day]?.[occurrenceIndex] || {};

  const getOccPriority = (task, day, occurrenceIndex) => {
    const occ = getOcc(task, day, occurrenceIndex);
    if (occ && Object.prototype.hasOwnProperty.call(occ, "priority")) {
      return occ.priority || "";
    }
    return task?.priority || "";
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
    const q = (searchQuery || "").trim().toLowerCase();

    tasks
      .filter((task) => task.days.includes(day))
      .filter((task) => !q || (task.taskName || "").toLowerCase().includes(q))
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

    const compareIds = (a, b) => String(a).localeCompare(String(b));

    if (sortByPriority !== "None") {
      const dir = sortByPriority === "HighToLow" ? -1 : 1;
      rows.sort((a, b) => {
        const pa = getPriorityValue(a.priority);
        const pb = getPriorityValue(b.priority);
        if (pa !== pb) return (pa - pb) * dir;
        return compareIds(a.task.id, b.task.id) || a.occurrenceIndex - b.occurrenceIndex;
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
        return compareIds(a.task.id, b.task.id) || a.occurrenceIndex - b.occurrenceIndex;
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
  }, [tasks, orderByDay, sortByPriority, orderedDays.join("|"), searchQuery]);

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

  // --- Day column drag logic ---
  const dayDragRef = useRef({ draggingDay: null });
  const [draggingDayCol, setDraggingDayCol] = useState(null);

  const onDayDragStart = (e, day) => {
    dayDragRef.current.draggingDay = day;
    setDraggingDayCol(day);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", day);
  };

  const onDayDragOver = (e, day) => {
    e.preventDefault();
    const { draggingDay } = dayDragRef.current;
    if (!draggingDay || draggingDay === day) return;
    const cur = orderedDays;
    const fromIdx = cur.indexOf(draggingDay);
    const toIdx = cur.indexOf(day);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...cur];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, draggingDay);
    onReorderDays?.(next);
  };

  const onDayDrop = (e) => {
    e.preventDefault();
    dayDragRef.current.draggingDay = null;
    setDraggingDayCol(null);
  };

  const onDayDragEnd = () => {
    dayDragRef.current.draggingDay = null;
    setDraggingDayCol(null);
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
              className="day-box"
              draggable
              onDragStart={(e) => onDayDragStart(e, day)}
              onDragOver={(e) => onDayDragOver(e, day)}
              onDrop={onDayDrop}
              onDragEnd={onDayDragEnd}
              style={{
                padding: "10px",
                border: "1px solid #005b96",
                borderRadius: "5px",
                backgroundColor: "#e1f5fe",
                marginBottom: "10px",
                textAlign: layout === "column" ? "center" : "left",
                opacity: draggingDayCol === day ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              <h3
                className="day-title"
                style={{
                  color: "#005b96",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  textAlign: "center",
                  userSelect: "none",
                }}
                title={customDayNames[day] ? `${day} (renamed)` : "Drag to reorder days"}
              >
                ⠿ {customDayNames[day] || day}
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

                  const isCompleted = completedOccurrences?.has(eventKey) || false;

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
                        backgroundColor: isCompleted ? "#f0f0f0" : "#ffffff",
                        textAlign: "left",
                        position: "relative",
                        paddingRight: editMode && sortByPriority === "None" ? "42px" : "10px",
                        opacity: editMode && dragState.current.draggingKey === eventKey ? 0.6 : isCompleted ? 0.6 : 1,
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
                          <strong style={{ textDecoration: isCompleted ? "line-through" : "none", color: isCompleted ? "#888" : "inherit" }}>{nameValue}</strong>
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
                            checked={isCompleted}
                            onChange={() => onToggleComplete?.(eventKey)}
                            style={{
                              alignSelf: "flex-start",
                              transform: "scale(1.5)",
                              marginTop: editMode ? "6px" : "2px",
                              cursor: "pointer",
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

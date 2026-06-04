import TaskListify from "./TaskListify";
import { DAYS_OF_WEEK } from "./utils/schedule";

describe("TaskListify", () => {
  it("initializes an empty task bucket for every day of the week", () => {
    const tl = new TaskListify();
    expect(tl.daysOfWeek).toEqual(DAYS_OF_WEEK);
    DAYS_OF_WEEK.forEach((day) => {
      expect(tl.tasksByDay[day]).toEqual([]);
    });
  });

  it("adds a task to each of the given days", () => {
    const tl = new TaskListify();
    const task = { taskName: "Stretch" };

    tl.addTaskToDays(["Monday", "Wednesday"], task);

    expect(tl.tasksByDay.Monday).toEqual([task]);
    expect(tl.tasksByDay.Wednesday).toEqual([task]);
    expect(tl.tasksByDay.Tuesday).toEqual([]);
  });

  it("appends rather than overwriting when a day already has tasks", () => {
    const tl = new TaskListify();
    tl.addTaskToDays(["Friday"], { taskName: "Run" });
    tl.addTaskToDays(["Friday"], { taskName: "Swim" });

    expect(tl.tasksByDay.Friday.map((t) => t.taskName)).toEqual([
      "Run",
      "Swim",
    ]);
  });
});

import { DAYS_OF_WEEK } from "./utils/schedule";

class TaskListify {
  constructor() {
    this.daysOfWeek = [...DAYS_OF_WEEK];
    this.tasksByDay = {};
    this.daysOfWeek.forEach(day => {
      this.tasksByDay[day] = [];
    });
  }

  addTaskToDays(days, task) {
    days.forEach(day => {
      if (this.tasksByDay[day]) {
        this.tasksByDay[day].push(task);
      } else {
        this.tasksByDay[day] = [task];
      }
    });
  }
}

export default TaskListify;
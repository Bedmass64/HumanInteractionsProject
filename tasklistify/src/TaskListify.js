class TaskListify {
  constructor() {
    this.daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
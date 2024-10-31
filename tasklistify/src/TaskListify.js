import TaskList from './TaskList';

export default class TaskListify {
  constructor() {
    this.daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.taskLists = this.daysOfWeek.reduce((acc, day) => {
      acc[day] = new TaskList();
      return acc;
    }, {});
  }

  addTaskToDays(days, task) {
    days.forEach(day => {
      if (this.taskLists[day]) {
        this.taskLists[day].addTask(task);
      }
    });
  }

  getTaskLists() {
    return this.taskLists;
  }
}
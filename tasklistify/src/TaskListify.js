// import TaskList from './TaskList';

// export default class TaskListify {
//   constructor() {
//     this.daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     this.taskLists = this.daysOfWeek.reduce((acc, day) => {
//       acc[day] = new TaskList();
//       return acc;
//     }, {});
//   }

//   addTaskToDays(days, task) {
//     days.forEach(day => {
//       if (this.taskLists[day]) {
//         this.taskLists[day].addTask(task);
//       }
//     });
//   }

//   getTaskLists() {
//     return this.taskLists;
//   }
// }


// TaskListify.js
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
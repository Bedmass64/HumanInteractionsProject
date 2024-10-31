// src/models/TaskList.js
export default class TaskList {
    constructor() {
      this.tasks = [];
    }

    addTask(task) {
      this.tasks.push(task);
    }

    getTasks() {
      return this.tasks;
    }
  }
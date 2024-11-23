// // src/models/Task.js
// export default class Task {
//     constructor(eventName, timesPerDay, startTime = null, endTime = null) {
//       this.eventName = eventName;
//       this.timesPerDay = timesPerDay;
//       this.startTime = startTime;
//       this.endTime = endTime;
//     }

//     getEventName() {
//       return this.eventName;
//     }

//     getTimesPerDay() {
//       return this.timesPerDay;
//     }

//     getStartTime() {
//       return this.startTime;
//     }

//     getEndTime() {
//       return this.endTime;
//     }
//   }


class Task {
  constructor(taskName, timesPerDay, taskTimes) {
    this.taskName = taskName;
    this.timesPerDay = timesPerDay;
    this.taskTimes = taskTimes;
  }
}

export default Task;
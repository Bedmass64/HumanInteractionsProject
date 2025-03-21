package JavaVersion.src.humaninteractions;

class Task {
    final private String eventName;
    final private int timesPerDay;

    public Task(String eventName, int timesPerDay) {
        this.eventName = eventName;
        this.timesPerDay = timesPerDay;
    }

    public String getEventName() {
        return eventName;
    }

    public int getTimesPerDay() {
        return timesPerDay;
    }
}

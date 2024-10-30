package JavaVersion.src.humaninteractions;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.*;
import java.util.*;

public class TaskListify{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);

        // Create a TaskList for each day of the week
        Map<String, TaskList> taskLists = new LinkedHashMap<>();
        String[] daysOfWeek = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        for (String day : daysOfWeek){
            taskLists.put(day, new TaskList());
        }

        // User input to create tasks
        System.out.println("\nHello welcome to TaskListify, your online task organizer for the week.");
        System.out.println("\n* Menu operations: 'next' to proceed to next element type *");
        System.out.println("\n- list of operations: Every day, Weekends, Weekdays, Manually add -");


        // Adding events happening every day
        System.out.print("\nDo you have tasks happening every day? (y/n): ");
        String everydayResponse = scanner.nextLine();
        boolean loop = false;
        if (everydayResponse.equalsIgnoreCase("y")){
            loop = true;
        }
            while(loop){
            System.out.print("Enter event name happening every day: ");
            String eventName = scanner.nextLine();
            if (eventName.equalsIgnoreCase("next")){
                loop = false;
                break;
            }
            System.out.print("How many times does it occur per day? ");
            int timesPerDay = scanner.nextInt();
            scanner.nextLine(); // Consume newline
            for (String day : daysOfWeek){
                Task task = new Task(eventName, timesPerDay);
                taskLists.get(day).addTask(task);
            }
            System.out.print("\n");
        }
        

        // Adding events happening on weekends
        System.out.print("\nDo you have tasks happening on weekends? (y/n): ");
        String weekendsResponse = scanner.nextLine();
        if (weekendsResponse.equalsIgnoreCase("y")) {
            loop = true;
        }
            while(loop){
            System.out.print("Enter event name happening on weekends: ");
            String eventName = scanner.nextLine();
            if (eventName.equalsIgnoreCase("next")){
                loop = false;
                break;
            }

            System.out.print("How many times does it occur per day? ");
            int timesPerDay = scanner.nextInt();
            scanner.nextLine(); // Consume newline
            for (String day : new String[]{"Saturday", "Sunday"}){
                Task task = new Task(eventName, timesPerDay);
                taskLists.get(day).addTask(task);
            }
            System.out.print("\n");
        }

        // Adding events happening on weekdays
        System.out.print("\nDo you have tasks happening on weekdays? (y/n): ");
        String weekdaysResponse = scanner.nextLine();
        if (weekdaysResponse.equalsIgnoreCase("y")) {
            loop = true;
        }
            while(loop){
            System.out.print("Enter event name happening on weekdays: ");
            String eventName = scanner.nextLine();
            if (eventName.equalsIgnoreCase("next")){
                loop = false;
                break;
            }
            System.out.print("How many times does it occur per day? ");
            int timesPerDay = scanner.nextInt();
            scanner.nextLine(); // Consume newline
            for (String day : Arrays.copyOfRange(daysOfWeek, 1, 6)){
                Task task = new Task(eventName, timesPerDay);
                taskLists.get(day).addTask(task);
            }
            System.out.print("\n");
        }
        boolean token = true;
        System.out.print("\nWould you like to manually add events? (y/n): ");
        String manuallyResponse = scanner.nextLine();
        if (manuallyResponse.equalsIgnoreCase("y")){
            loop = true;

            for (String day : daysOfWeek){ 
                if (token == false){
                break;
                }

                while (loop) {
                    System.out.println("Events for " + day + ":");
                    System.out.print("Enter event name (or 'next' for the next day, '-1' to finish): ");
                    String eventName = scanner.nextLine();
                    if (eventName.equalsIgnoreCase("next")) {
                        break;
                    } else if (eventName.equals("-1")) {
                        token = false;
                        loop = false;
                        break;
                    }
                    System.out.print("How many times does it occur per day? ");
                    int timesPerDay = scanner.nextInt();
                    scanner.nextLine(); // Consume newline
                    Task task = new Task(eventName, timesPerDay);
                    taskLists.get(day).addTask(task);
                    System.out.print("\n");
                }
            }
        }

        // // SQLite database setup
        // String url = "jdbc:sqlite:db/tasklist.db";
        // try (Connection conn = DriverManager.getConnection(url)) {
        //     if (conn != null) {
        //         Statement stmt = conn.createStatement();
        //         stmt.execute("CREATE TABLE IF NOT EXISTS tasks (day TEXT, eventName TEXT, timesPerDay INTEGER)");

        //         // Query data from DB
        //         ResultSet rs = stmt.executeQuery("SELECT * FROM tasks");
        //         while (rs.next()) {
        //             System.out.println(rs.getString("day") + ": " + rs.getString("eventName") + " - " + rs.getInt("timesPerDay"));
        //         }
        //     }
        // } catch (Exception e) {
        //     e.printStackTrace();
        // }

        // Print the task lists
        printDaysWithEvents(taskLists);

        exportToTxt(taskLists, "tasklist.txt");

        scanner.close();
    }

    private static void exportToTxt(Map<String, TaskList> taskLists, String fileName) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
            // Write the task lists to the file
            for (String day : taskLists.keySet()) {
                TaskList taskList = taskLists.get(day);
                writer.write(day + " tasks:\n");
                if (!taskList.getTasks().isEmpty()) {
                    for (Task task : taskList.getTasks()) {
                        // Writing in CSV-like format: Event Name,Times per Day
                        writer.write(task.getEventName() + "," + task.getTimesPerDay() + "\n");
                    }
                }
                writer.write("\n"); // Empty line after each day
            }
            System.out.println("Task list exported to " + fileName);
        } catch (IOException e) {
            System.out.println("An error occurred while exporting the task list: " + e.getMessage());
        }
    }

    private static void printDaysWithEvents(Map<String, TaskList> taskLists){
        System.out.println("\n--------------------------------------------");
        for (String day : taskLists.keySet()) {
            TaskList taskList = taskLists.get(day);
            if (!taskList.getTasks().isEmpty()){
                System.out.println("\n" + day + " tasks:");
                for (Task task : taskList.getTasks()){
                    System.out.println("Event: " + task.getEventName() + ", Times per day: " + task.getTimesPerDay());
                }
            }
        }
        System.out.println("\n\n--------------------------------------------\n");
    }
}

const csvParser = require("csv-parser");
const fs = require("fs");

async function analyzeCSV(csvPath) {
  // Read the CSV file.
  const csvData = fs.readFileSync(csvPath);

  // Parse the CSV file into a JSON array.
  const employeeData = [];
  const parser = csvParser();
  parser.on("data", (row) => {
    employeeData.push(row);
  });
  parser.on("end", () => {
    // Filter the data to get the employees who have worked for 7 consecutive days.

    const groupedEmployees = new Map();

    employeeData.forEach((employee) => {
      if (!groupedEmployees.has(employee["File Number"])) {
        groupedEmployees.set(employee["File Number"], []);
      }

      groupedEmployees.get(employee["File Number"]).push(employee);
    });

    // Print the name and position of the employees in the console who worked for 7 consecutive days.
    console.log("Employees who have worked for 7 consecutive days:");
    const employeesWhoHaveWorkedFor7ConsecutiveDays = groupedEmployees.forEach(
      (employee, key) => {
        let consecutiveDays = 1;
        employee.sort((a, b) => a["Time"] - b["Time"]);

        // For each object, check if the difference between the log in date and the log out date is equal to the number of consecutive days you are looking for.
        let previousDate = new Date(employee[0]["Time"]).getDate();
        for (let i = 0; i < employee.length; i++) {
          let currentDate = new Date(employee[i]["Time"]).getDate();
          if (previousDate != null && currentDate - previousDate === 1) {
            consecutiveDays++;
          }
          // Update the previous date.
          previousDate = currentDate;
        }
        if (consecutiveDays === 7) {
          console.log(employee[0]["Employee Name"], " , ", employee[0]["Position ID"])
        }
      },
    );

    console.log('===============================================================')
    // Filter the data to get the employees who have less than 10 hours of time between shifts but greater than 1 hour.
    console.log(
      "Employees who have less than 10 hours of time between shifts but greater than 1 hour:",
    );
    const employeesWhoHaveLessThan10HoursOfTimeBetweenShiftsButGreaterThan1Hour =
      groupedEmployees.forEach((employee, key) => {
        // Check if the employee has less than 10 hours of time between shifts but greater than 1 hour.
        employee.sort((a, b) => a["Time"] - b["Time"]);
        let isValid = 0;
        // For each object, check if the difference between the log in date and the log out date is equal to the number of consecutive days you are looking for.
        for (let i = 0; i < employee.length - 1; i++) {
          const previousShift = new Date(employee[i]["Time Out"]);
          const currentShift = new Date(employee[i + 1]["Time"]);
          const timeDiff = parseFloat((currentShift - previousShift) / 3600000);
          if (1 < timeDiff && timeDiff < 10) {
            isValid = 1;
          }
        }
        if (isValid)
          console.log(
            employee[0]["Employee Name"],
            " , ",
            employee[0]["Position ID"],
          );
      });

    // Filter the data to get the employees who have worked for more than 14 hours in a single shift.
    const employeesWhoHaveWorkedForMoreThan14HoursInASingleShift =
      employeeData.filter((employee) => {
        // Check if the employee has worked for more than 14 hours in a single shift.
        const [hours, minutes] =
          employee["Timecard Hours (as Time)"].split(":");
        const time = parseFloat(hours) + minutes / 60;
        return time > 14;
      });

    console.log('===============================================================')
    console.log(
      "Employees who have worked for more than 14 hours in a single shift:",
    );
    employeesWhoHaveWorkedForMoreThan14HoursInASingleShift.forEach(
      (employee) => {
        console.log(
          `${employee["Employee Name"]} - ${employee["Position ID"]}`,
        );
      },
    );
  });
  await parser.write(csvData);
  await parser.end();
}

const csvPath = "./data.csv";
analyzeCSV(csvPath);

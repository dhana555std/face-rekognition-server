import mysql from 'mysql2';
import dotenv from "dotenv";
import util from 'util'; // Import the 'util' module for promisify
const environment = process.env.ENV || "development";
console.log(`Environment is ${environment}`);
dotenv.config({
  path: `./.env.${environment}`,
});

// Database credentials (replace with your actual values if needed)
export async function getConnection() {
  const connectionToDatabase = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME
  });
  return connectionToDatabase;
}

// Connect to the database
export async function logDataToDb(userId,email) {
  const connection = await getConnection();
  connection.connect(async (error) => {
    if (error) {
      console.error('Error connecting to database:', error);
      return; // Exit if connection fails
    }
    console.log('Connected to the database');
    const now = new Date();
    const timeStamp = await getFormattedTimestamp();
    // console.log(timeStamp); // Output: 2024-01-16T13:46:54.789 
    if (userId) {
      connection.query('INSERT INTO attendance (employeeId, email, date_column) VALUES (?, ?, ?)',
        [ userId, email, timeStamp], (error, results, fields) => {
          if (error) throw error;
          console.log('Results:', results);
        });
    }

    connection.end();
  });
}

//added new function getEmployeeData
export async function getEmployeeData(empId) {
  const connection = await getConnection();
  const queryAsync = util.promisify(connection.query).bind(connection);

  try {
    const results = await queryAsync('SELECT * FROM boomi.employees WHERE emp_id = ?', [empId]);
    

    if (results.length > 0) {
      console.log('Employee data:', results[0]);
      return results[0];
    } else {
      console.log('Employee not found with ID:', empId);
      return null; 
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error; 
  } finally {
    connection.end(); 
  }
}


export async function getFormattedTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

await logDataToDb();
// Example usage
await getEmployeeData();
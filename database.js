import mysql from 'mysql2';
import dotenv from "dotenv";

const environment = process.env.ENV || "development";
console.log(`Environment is ${environment}`);
dotenv.config({
  path: `./.env.${environment}`,
});

// Database credentials (replace with your actual values if needed)
async function getConnection(){
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
export async function logDataToDb(userId){
    const connection = await getConnection();
    connection.connect((error) => {
        if (error) {
          console.error('Error connecting to database:', error);
          return; // Exit if connection fails
        }
        console.log('Connected to the database');
        const now = new Date();
        const timeStamp = now.toISOString().slice(0, 23).replace('T',' ');
        console.log(timeStamp); // Output: 2024-01-16T13:46:54.789
        connection.query('INSERT INTO user_logs (userId, date_column) VALUES (?, ?)',
        [userId, timeStamp], (error, results, fields) => {
          if (error) throw error;
          console.log('Results:', results);
        });
      
        connection.end();
      });
}


// await logDataToDb();
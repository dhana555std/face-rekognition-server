import { getConnection } from "./database.js"
import fs from "fs";
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
// Read JSON file
const jsonData = fs.readFileSync('employees.json');
const employees = JSON.parse(jsonData);

// Extract required fields
const employeeData = employees.map(employee => {
    const { emp_id, email, data_source, location, firstname, middlename, lastname } = employee;
    return { emp_id, email, data_source, location, firstname, middlename, lastname };
});

// Separate profile pics
const profilePics = employees.map(employee => {
    const { emp_id, profile_pic } = employee;
    return { emp_id, profile_pic };
});


// Connect to the database
export async function insertEmployeeData(employeeData) {
    const connection = await getConnection();
    connection.connect(async (error) => {
        if (error) {
            console.error('Error connecting to database:', error);
            return; // Exit if connection fails
        }
        console.log('Connected to the database');

        for (const employee of employeeData) {
            connection.query('INSERT INTO employees (emp_id, email, location, firstname, middlename, lastname, created_by, updated_by, display_name) VALUES (?,?,?,?,?,?,?,?,?)',
                [employee.emp_id, employee.email, employee.location[1], employee.firstname, employee.middlename, employee.lastname, employee.data_source, employee.data_source, `${employee.firstname} ${employee.lastname}`], (error, results, fields) => {
                    if (error) throw error;
                    console.log('Inserted employee:', employee.emp_id);
                });
        }

        connection.end();
    });
}

async function uploadProfilePics(profilePics) {
    try {
        for (const employee of profilePics) {
            const { profile_pic, emp_id } = employee;
            if (profile_pic) {
                const base64Data = Buffer.from(profile_pic.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: `AccionlabsEmployess/${emp_id}.jpg`,
                    Body: base64Data,
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg'
                };

                const data = await s3.upload(params).promise();
                console.log('Profile pic uploaded successfully. Location:', data.Location);
            }
        }
    } catch (error) {
        console.error('Error uploading profile pics to S3:', error);
    }
}

await insertEmployeeData(employeeData);
// await uploadProfilePics(profilePics);
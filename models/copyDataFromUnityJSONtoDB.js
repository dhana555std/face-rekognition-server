import { getConnection } from "../services/database.js";
import fs from "fs/promises"; 
import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

async function readJsonFile(filePath) {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

async function insertEmployeeData(employeeData) {
    const connection = await getConnection();
    try {
        await connection.connect(); 
        console.log('Connected to the database');

        const query = 'INSERT INTO employees (emp_id, email, location, firstname, middlename, lastname, created_by, updated_by, display_name, reporting_manager) VALUES ?';
        const values = employeeData.map(employee => [
            employee.emp_id, employee.email, employee.location[1], employee.firstname, 
            employee.middlename, employee.lastname, employee.data_source, 
            employee.data_source, `${employee.firstname} ${employee.lastname}`, 
            employee.reporting_manager
        ]);

        await connection.query(query, [values]);
        console.log('Inserted employees successfully');
    } catch (error) {
        console.error('Error connecting or inserting into the database:', error);
    } finally {
        connection.end();
    }
}

async function uploadProfilePics(profilePics) {
    try {
        for (const employee of profilePics) {
            const { profile_pic, emp_id } = employee;
            if (profile_pic) {
                const base64Data = Buffer.from(profile_pic.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const params = {
                    Bucket: BUCKET_NAME,
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

async function copyData() {
    try {
        const employees = await readJsonFile('employees.json');
        const employeeData = employees.map(employee => ({
            emp_id: employee.emp_id,
            email: employee.email,
            data_source: employee.data_source,
            location: employee.location,
            firstname: employee.firstname,
            middlename: employee.middlename,
            lastname: employee.lastname,
            reporting_manager: employee.reporting_manager
        }));

        await insertEmployeeData(employeeData);
        // await uploadProfilePics(profilePics);
    } catch (error) {
        console.error('Error:', error);
    }
}

copyData();

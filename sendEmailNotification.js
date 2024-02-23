import nodemailer from 'nodemailer';
import { getFormattedTimestamp} from "./database.js"
export async function sendEmailNotification(reporting_manager) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_ADMIN_ID,
              pass: process.env.GMAIL_ADMIN_APP_PASSWORD
            }
          });

      console.log("this is reporting manager", reporting_manager);
    //   sandhya rani kande (1100-5938)
    //   const managerEmail = reporting_manager.match(/^(.*)\(/)[1];
    //   console.log("this is managerName",managerEmail)
      const timeStamp = await getFormattedTimestamp();
      const mailOptions = {
        from: process.env.GMAIL_ADMIN_ID,
        // to: `${managerEmail}@accionlabs.com`,
        to: `mandepally.shivasai@accionlabs.com`,
        subject: 'New Attendance Record Added',
        text: `A new attendance record has been added: ${timeStamp}` 
      };
  
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
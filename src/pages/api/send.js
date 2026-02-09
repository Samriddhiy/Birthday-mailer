import fs from 'fs';
import csv from 'csv-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path' ;

dotenv.config();
const filePath = path.join(process.cwd(), 'public', 'members.csv');

const readMembersData = (filePath) => {
  return new Promise((resolve, reject) => {
    const members = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => members.push(row))
      .on('end', () => resolve(members))
      .on('error', (error) => reject(error));
  });
};


const sendBirthdayEmail = async (member) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    },
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: 'Team BDCOE <bdcoe@akgec.ac.in>',
    to: member.email,
    subject: 'Happy Birthday!',
    html: `
      <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Happy Birthday</title>

    <link href="https://fonts.googleapis.com/css2?family=Playball&family=Lora:wght@400;700&display=swap"
        rel="stylesheet">
</head>

<body style="margin:0; padding:0;">

    <div style="
        margin: 0;
        padding: 0;
        background-color: #fdfdfd;
        background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
        min-height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Lora', serif;
    ">

        <div style="
            max-width: 500px;
            width: 90%;
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #e8f0ff, #fdfdff);
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(43,89,162,0.25);
        ">

            <div style="margin-bottom: 10px;">
                <h1 style="
                    font-family: 'Playball', cursive;
                    font-size: 60px;
                    color: #2b59a2;
                    margin: 0;
                    line-height: 0.8;
                    font-weight: normal;">
                    happy
                </h1>
                <h1 style="
                    font-family: 'Playball', cursive;
                    font-size: 60px;
                    color: #2b59a2;
                    margin: 0;
                    line-height: 1;">
                    birthday
                </h1>
            </div>

            <div style="margin: 20px auto; width: 100px; position: relative;">
                <div style="
                    width: 6px;
                    height: 20px;
                    background: repeating-linear-gradient(
                        45deg,
                        #2b59a2,
                        #2b59a2 4px,
                        #ffffff 4px,
                        #ffffff 8px
                    );
                    margin: 0 auto;
                    border-radius: 1px;">
                </div>

                <div style="
                    width: 90px;
                    height: 30px;
                    background: #2b59a2;
                    border-radius: 8px 8px 0 0;
                    margin: 0 auto;
                    position: relative;">
                    <div style="
                        position: absolute;
                        bottom: -4px;
                        left: 0;
                        right: 0;
                        display: flex;
                        justify-content: space-around;">
                        <div style="width:12px;height:8px;background:#2b59a2;border-radius:0 0 10px 10px;"></div>
                        <div style="width:12px;height:12px;background:#2b59a2;border-radius:0 0 10px 10px;"></div>
                        <div style="width:12px;height:6px;background:#2b59a2;border-radius:0 0 10px 10px;"></div>
                    </div>
                </div>

                <div style="
                    width: 90px;
                    height: 40px;
                    background: #fdf5e6;
                    border-radius: 0 0 8px 8px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                </div>
            </div>

            <div style="color: #2b59a2;">
                <h2 style="font-size: 1.4em; margin-bottom: 15px;">
                    🎉 Happy Birthday, ${member.name}! 🎉
                </h2>

                <p style="font-size: 0.95em; line-height: 1.5; margin-bottom: 10px;">
                    On behalf of everyone at <strong>BDCOE</strong>, we want to take this moment to celebrate you and
                    all that you bring to our team.
                </p>

                <p style="font-size: 0.95em; line-height: 1.5; margin-bottom: 10px;">
                    We hope your day is filled with joy, laughter, and special moments. May the year ahead bring new
                    opportunities, growth, and fulfillment, both personally and professionally.
                </p>

                <p style="font-size: 0.95em; line-height: 1.5; margin-bottom: 15px;">
                    Thank you for being such a valuable part of our community. Wishing you a fantastic birthday and a
                    wonderful year ahead!
                </p>

                <p style="margin-top: 15px; font-weight: bold; font-size: 1.1em;">
                    Cheers,<br>
                    Team BDCOE 🎂🎈
                </p>
            </div>

        </div>
    </div>

</body>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Birthday email sent to ${member.name}`);
};


const sendAdminAlert = async (members) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    },
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  const mailOptions = {
    from: 'Team BDCOE <bdcoe@akgec.ac.in>',
    to: 'samriddhi4005@gmail.com',
      cc: ['samriddhi2310108@akgec.ac.in'], 
      
    subject: 'Birthday Alert',
    text: `Today is the birthday of: ${members.map(m => m.name).join(', ')}`,
  };

  await transporter.sendMail(mailOptions);
  console.log("Admin alert sent with today's birthdays");
};

export default async function handler(req, res) {
  try {
    const members = await readMembersData(filePath);
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const birthdayMembers = members.filter(member => {
      if (!member.birthday) return false;
      const [day, month, year] = member.birthday.split('-');
      return `${day}-${month}` === todayStr;
    });

    for (const member of birthdayMembers) {
      await sendBirthdayEmail(member);
    }

    if (birthdayMembers.length > 0) {
      await sendAdminAlert(birthdayMembers);
    }

    res.status(200).json({ message: 'Birthday emails sent successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

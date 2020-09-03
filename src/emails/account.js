const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASSWORD
  }
});


const sendwelcomemail=(email,name)=>{
    const mailOptions = {
        from: 'jenugadhiya78@gmail.com',
        to: email,
        subject: 'Thanx for joining in..!!',
        text: `Welcome to the app, ${name} . Let me know how you get along with app`
      }
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
}

const sendcancelmail=(email,name)=>{
    const mailOptions = {
        from: 'jenugadhiya78@gmail.com',
        to: email,
        subject: 'Sorry to delete your account',
        text: `Goodbye..., ${name} . i hope to see you soon...`
      }
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
}

module.exports={
    sendwelcomemail,
    sendcancelmail
}
























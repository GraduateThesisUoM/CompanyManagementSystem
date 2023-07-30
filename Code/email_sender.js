//https://www.youtube.com/watch?v=klDTBiW6iiM
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: process.env.DEMO_EMAIL,
      pass: process.env.DEMO_EMAIL_KEY
   }
});

const mailOptions = {
   from: process.env.DEMO_EMAIL,
   to: "nektarios00007@gmail.com",
   subject: "Nodemailer Test",
   html: "Test <button>sending</button> Gmail using Node JS"
};

const sendMail = async () => {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
           console.log(error);
        }else{
           console.log("Email sent: " + info.response);
        }
     });
  };

module.exports = sendMail;
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

const sendEmail = async (email: string, link: string) => {
  try {
    const transporter = nodemailer.createTransport(
      nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY!,
      })
    );
    await transporter.sendMail({
      from: '"Fact Checker App" <app.fact.checker@gmail.com>',
      to: email,
      subject: "Welcome to the Fact Checker App",
      text: "Its great to have you join!",
      html: `<h1>Here is the Verification Link</h1><a clicktracking=off href="${link}">Verify Email Address</a>`,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export { sendEmail };

import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";
import { Response } from "express";

interface SendEmailParams {
  res: Response;
  email: string;
  code: number;
}

const sendEmail = async ({ res, email, code }: SendEmailParams) => {
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
      html: `<h1>Here is the Verification Link</h1><h2>${code}</h2>`,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong trying to deliver you the confirmation",
    });
  }
};

export { sendEmail };

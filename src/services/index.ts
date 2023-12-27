import { v2 as cloudinary } from 'cloudinary';
import { BadRequestError } from '../errors/bad-request-error';
import { randomBytes } from 'crypto';
import axios from 'axios';
import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';

const SECURE = 'production';
const ROOT = 'dynasty';

interface User {
  email: string;
  firstname: string;
}

export const config = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: process.env.NODE_ENV === SECURE,
  });
};

export class ImageService {
  static resourceUpload = async (
    file: string,
    folder: string,
    type: string,
    resource_type: string
  ) => {
    config();
    if (resource_type !== 'image' && resource_type !== 'video')
      throw new Error('Invalid resource type');
    try {
      const name = randomBytes(10).toString('hex');
      const result = await cloudinary.uploader.upload(file, {
        public_id: `${ROOT}/${type}/${folder}/${name}`,
        resource_type,
      });
      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestError('Resource upload failed: ');
    }
  };
  static deleteUploads = async (
    files: string[],
    folderName: string,
    type: string
  ) => {
    try {
      config();
      await cloudinary.api.delete_resources(files, {
        type: 'upload',
      });
      const path = `${ROOT}/${type}/${folderName}`;
      await cloudinary.api.delete_folder(path);
    } catch (error) {
      console.log(error);
      throw new BadRequestError('Failed to delete resources');
    }
  };
  static deleteImage = async (file: string) => {
    try {
      config();
      await cloudinary.api.delete_resources([file], {
        type: 'upload',
        resource_type: 'image',
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestError('Failed to delete resource');
    }
  };
}

export class PaystackService {
  static verifyTransaction = async (reference: string) => {
    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    });
    return response.data;
  };

  static initialize = async (email: string, amount: string) => {
    const params = JSON.stringify({
      email,
      amount: `${amount}00`,
    });

    const url = 'https://api.paystack.co/transaction/initialize';
    const response = await axios.post(url, params, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };
}

export class EmailService {
  static config = () => {
    let transport = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'cc8729d47376ab',
        pass: 'b54e4b98565a2a',
      },
    });

    transport.use(
      'compile',
      hbs({
        viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
      })
    );
    return transport;
  };
  static verifyEmail = async (user: User, token: string) => {
    const transporter = this.config();
    if (user.email) {
      const mailOptions = {
        from: process.env.MAIL_FROM, // sender address
        template: 'verify-email', // the name of the template file, i.e., verify-email.handlebars
        to: user.email,
        subject: 'Email Verification',
        attachments: [
          {
            filename: 'email.png',
            path: './attachments/email.png',
            cid: 'imagename',
          },
        ],
        context: {
          token: `${process.env.SITE_URL}/verify-email/${token}`,
        },
      };
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };
  static scheduleAppointment = async (
    email: string,
    name: string,
    message: string,
    phone: string,
    link: string
  ) => {
    const transporter = this.config();
    if (email) {
      const mailOptions = {
        from: email, // sender address
        template: 'appointment-email', // the name of the template file, i.e., verify-email.handlebars
        to: 'care@pdrealestates.com',
        subject: 'Appointment Scheduled',
        context: {
          name,
          email,
          phone,
          message,
          link
        },
      };
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };
  static resetToken = async (user: User, token: string) => {
    const transporter = this.config();
    if (user.email) {
      const mailOptions = {
        from: process.env.MAIL_FROM, // sender address
        template: 'password-reset', // the name of the template file, i.e., verify-email.handlebars
        to: user.email,
        subject: 'Password Reset',
        attachments: [
          {
            filename: 'email.png',
            path: './attachments/email.png',
            cid: 'imagename',
          },
        ],
        context: {
          token: `${process.env.SITE_URL}/reset-password/${token}`,
        },
      };
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: `MediConnect <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };
    await transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map
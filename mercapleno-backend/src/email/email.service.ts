import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from '../config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    if (!envs.smtpUser || !envs.smtpPass) {
      throw new Error('SMTP no configurado: faltan SMTP_USER/SMTP_PASS');
    }

    if (!envs.smtpService && !envs.smtpHost) {
      throw new Error('SMTP no configurado: falta SMTP_HOST o SMTP_SERVICE');
    }

    const options = envs.smtpService
      ? {
          service: envs.smtpService,
          auth: {
            user: envs.smtpUser,
            pass: envs.smtpPass,
          },
        }
      : {
          host: envs.smtpHost,
          port: envs.smtpPort,
          secure: envs.smtpSecure,
          auth: {
            user: envs.smtpUser,
            pass: envs.smtpPass,
          },
        };

    this.transporter = nodemailer.createTransport(options);
    return this.transporter;
  }

  private fromAddress(): string {
    const from = envs.smtpFromEmail || envs.smtpUser;
    if (!from) {
      throw new Error('SMTP no configurado: falta SMTP_FROM_EMAIL');
    }

    return envs.appName ? `"${envs.appName}" <${from}>` : from;
  }

  async sendVerificationCode(email: string, code: string, ttlMin: number): Promise<void> {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: this.fromAddress(),
      to: email,
      subject: `${envs.appName} - Codigo de verificacion`,
      text: `Tu codigo de verificacion es ${code}. Vence en ${ttlMin} minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Tu codigo de verificacion es:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
          <p>Este codigo vence en ${ttlMin} minutos.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetCode(email: string, code: string, ttlMin: number): Promise<void> {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: this.fromAddress(),
      to: email,
      subject: `${envs.appName} - Recuperar contrasena`,
      text: `Tu codigo para recuperar contrasena es ${code}. Vence en ${ttlMin} minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Tu codigo para recuperar contrasena es:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
          <p>Este codigo vence en ${ttlMin} minutos.</p>
        </div>
      `,
    });
  }
}

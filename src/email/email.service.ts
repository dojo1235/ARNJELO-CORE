import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private resend: Resend
  private emailFrom: string
  private clientUrl: string
  private supportEmail = 'support@arnjelo.com'

  constructor(private readonly configService: ConfigService) {
    const { resendApiKey, emailFrom } = this.configService.get('email')
    const { clientUrl } = this.configService.get('urls')

    this.emailFrom = emailFrom
    this.resend = new Resend(resendApiKey)
    this.clientUrl = clientUrl
  }

  // Welcome email
  async sendWelcomeEmail(email: string, name: string) {
    const firstName = name.trim().split(/\s+/)[0]
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Welcome aboard!',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Hey ${firstName} 👋</h1>
  <p>Welcome to Arnjelo.</p>
  <p>Glad to have you here.</p>
  <p>
    Arnjelo gives you a simple, structured way to manage everything in one place without unnecessary complexity.
  </p>
  <p>Take your time and explore at your own pace.</p>
  <p>
    Cheers,<br />
    Arnjelo Team
  </p>
</div>
      `,
    })
  }
  
  // Email verification email
  async sendEmailVerification(email: string, link: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Verify your email',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Email verification</h1>
  <p>
    Click the button below to verify your email address.
  </p>
  <a
    href="${link}"
    style="
      display:inline-block;
      padding:12px 18px;
      background:#365fd9;
      color:#fff;
      text-decoration:none;
      border-radius:6px;
      margin-top:10px;
    "
  >
    Verify Email
  </a>
  <p style="margin-top:20px;">
    This link expires in 10 minutes.
  </p>
</div>
      `,
    })
  }

  // Email verified success notification
  async sendEmailVerificationSuccessEmail(email: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Email verified successfully 🎉',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <p>Hey,</p>
  <p>
    Your email has been successfully verified.
  </p>
  <p>
    All account limits have been lifted. You can now access all features of your account.
  </p>
</div>
      `,
    })
  }

  // Email change request email
  async sendEmailChange(email: string, link: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Confirm your new email',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Confirm your new email address</h1>
  <p>
    We received a request to change the email on your account.
    Click below to confirm this change.
  </p>
  <a href="${link}"
    style="display:inline-block;padding:12px 18px;background:#365fd9;color:#fff;text-decoration:none;border-radius:6px;">
    Confirm Email Change
  </a>
  <p style="margin-top:20px;">
    This link expires in 10 minutes. If you did not request this, ignore this email.
  </p>
</div>
      `,
    })
  }

  // Email change success email to new email
  async sendEmailChangeSuccessEmail(newEmail: string, name: string) {
    const dateTime = new Date().toLocaleString()
    return this.resend.emails.send({
      from: this.emailFrom,
      to: newEmail,
      subject: 'Email updated successfully 🎉',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <p>Hi ${name},</p>
  <p>Your account email has been successfully updated.</p>
  <p>
    This email is now linked to your account and will be used for future notifications and account access.
  </p>
  <p>
    New email: <b>${newEmail}</b><br/>
    Time: ${dateTime}
  </p>
  <p>
    If you did not make this change, please contact our support team immediately:
    <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>
  </p>
  <br/>
  <p>Thanks,<br/>Arnjelo Team</p>
</div>
      `,
    })
  }

  // Email change security alert email to old email
  async sendEmailChangeSecurityAlertEmail(oldEmail: string, newEmail: string, name: string) {
    const dateTime = new Date().toLocaleString()
    return this.resend.emails.send({
      from: this.emailFrom,
      to: oldEmail,
      subject: 'Security alert: Your email was changed',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <p>Hi ${name},</p>
  <p>Your account email has just been changed.</p>
  <p>
    New email: ${newEmail}<br/>
    Time: ${dateTime}
  </p>
  <p>
    If you made this change, no further action is required.
  </p>
  <p>
    If you did not make this change, please contact our support team immediately:
    <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>
  </p>
  <br/>
  <p>Thanks,<br/>Arnjelo Team</p>
</div>
      `,
    })
  }

  // Magic login email
  async sendMagicLoginEmail(email: string, link: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Your login link',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Login to Arnjelo</h1>
  <p>
    Click the button below to sign in.
  </p>
  <a
    href="${link}"
    style="
      display:inline-block;
      padding:12px 18px;
      background:#365fd9;
      color:#fff;
      text-decoration:none;
      border-radius:6px;
      margin-top:10px;
    "
  >
    Sign In
  </a>
  <p style="margin-top:20px;">
    This link expires in 10 minutes.
  </p>
</div>
      `,
    })
  }

  // Magic login success email
  async sendMagicLoginSuccessEmail(email: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'New secure sign in to your account',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <p>Hey,</p>
  <h1>New secure sign in to your account</h1>
  <p>
    You signed in using a secure link.
  </p>
  <p>
    Time: ${new Date().toLocaleString()}
  </p>
  <p>
    If this was you, no further action is needed.
  </p>
  <p>
    If this wasn’t you, your email account may be compromised. Please secure your email provider immediately.
  </p>
</div>
      `,
    })
  }

  // Password reset email
  async sendPasswordResetEmail(email: string, link: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Reset your password',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Password reset request</h1>
  <p>
    Click the button below to reset your password.
  </p>
  <a
    href="${link}"
    style="
      display:inline-block;
      padding:12px 18px;
      background:#365fd9;
      color:#fff;
      text-decoration:none;
      border-radius:6px;
      margin-top:10px;
    "
  >
    Reset Password
  </a>
  <p style="margin-top:20px;">
    This link expires in 10 minutes.
  </p>
</div>
      `,
    })
  }

  // Password changed success notification
  async sendPasswordChangeSecurityAlertEmail(email: string) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Password changed successfully',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>Password changed successfully</h1>
  <p>
    If you made this change, no further action is required.
  </p>
  <p>
    If this wasn’t you, secure your account immediately.
  </p>
  <a
    href="${this.clientUrl}/auth/reset-password/request"
    style="
      display:inline-block;
      padding:12px 18px;
      background:#365fd9;
      color:#fff;
      text-decoration:none;
      border-radius:6px;
      margin-top:10px;
    "
  >
    Reset Password
  </a>
</div>
      `,
    })
  }

  // Admin order success email
  async sendAdminOrderSuccessEmail(
    adminEmail: string,
    orderId: string,
    customerName: string,
    amount: number,
  ) {
    return this.resend.emails.send({
      from: this.emailFrom,
      to: adminEmail,
      subject: 'New Order Received 📦',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111">
  <div style="margin-bottom:20px;">
    <img
      src="${this.clientUrl}/logo.png"
      alt="Arnjelo Logo"
      width="128"
      height="128"
      style="
        display: block;
        border-radius: 50%;
        object-fit: cover;
        margin: 0;
      "
    />
  </div>
  <h1>New Order Alert</h1>
  <p>Order ID: ${orderId}</p>
  <p>Customer: ${customerName}</p>
  <p>Amount: ₦${amount}</p>
</div>
      `,
    })
  }
}

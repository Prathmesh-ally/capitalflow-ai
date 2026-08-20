const nodemailer = require('nodemailer');

exports.sendAlertEmail = async (actionData) => {
  try {
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS  
      }
    });

    const mailOptions = {
      from: '"CapitalFlow AI" <system@capitalflow.ai>',
      to: 'cfo@company.com',
      subject: `🚨 URGENT: Action Required - Cash Flow Risk Detected`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #d9534f;">CapitalFlow AI Alert</h2>
          <p><strong>Detected Issue:</strong> ${actionData.detectedIssue}</p>
          <p><strong>Projected Date:</strong> ${new Date(actionData.projectedShortfallDate).toLocaleDateString()}</p>
          <hr/>
          <h3>AI Recommended Solution:</h3>
          <p><strong>Transfer Amount:</strong> ${actionData.recommendedAction.amountToTransfer} INR</p>
          <p><strong>Reasoning:</strong> ${actionData.reasoningSummary}</p>
          <br/>
          <a href="http://localhost:5173" style="background-color: #0275d8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px;">Review & Approve Action in Dashboard</a>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Alert sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email: ${error.message}`);
  }
};
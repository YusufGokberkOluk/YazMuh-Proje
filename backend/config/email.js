const nodemailer = require('nodemailer');

// E-posta transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// E-posta gönderme fonksiyonu
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"YazMuh Proje" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // HTML'den text oluştur
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.messageId);
    return info;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw error;
  }
};

// Davet e-postası şablonu
const sendInvitationEmail = async (invitationData) => {
  const { 
    invitedUserEmail, 
    invitedUserName, 
    inviterName, 
    pageTitle, 
    pageId, 
    role, 
    shareLink 
  } = invitationData;

  const subject = `${inviterName} sizi bir sayfaya davet etti`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sayfa Daveti</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sayfa Daveti</h1>
        </div>
        <div class="content">
          <h2>Merhaba ${invitedUserName || invitedUserEmail}!</h2>
          <p><strong>${inviterName}</strong> sizi <strong>"${pageTitle}"</strong> sayfasına davet etti.</p>
          
          <p><strong>Rol:</strong> ${role === 'editor' ? 'Düzenleyici' : 'Görüntüleyici'}</p>
          
          <p>Bu sayfaya erişim için aşağıdaki butona tıklayabilirsiniz:</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/page/${pageId}" class="button">
            Sayfayı Görüntüle
          </a>
          
          ${shareLink ? `
          <p>Veya doğrudan paylaşım linkini kullanabilirsiniz:</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${pageId}?token=${shareLink}">Paylaşım Linki</a></p>
          ` : ''}
          
          <p>Herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin.</p>
        </div>
        <div class="footer">
          <p>Bu e-posta YazMuh Proje tarafından gönderilmiştir.</p>
          <p>E-posta almak istemiyorsanız, lütfen ayarlarınızdan bildirimleri kapatın.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(invitedUserEmail, subject, html);
};

// Bildirim e-postası şablonu
const sendNotificationEmail = async (notificationData) => {
  const { 
    userEmail, 
    userName, 
    notificationType, 
    message, 
    actionUrl 
  } = notificationData;

  const subject = `YazMuh Proje - ${notificationType}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bildirim</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="container">
          <div class="header">
            <h1>Bildirim</h1>
          </div>
          <div class="content">
            <h2>Merhaba ${userName || userEmail}!</h2>
            <p>${message}</p>
            
            ${actionUrl ? `
            <a href="${actionUrl}" class="button">
              Detayları Görüntüle
            </a>
            ` : ''}
          </div>
          <div class="footer">
            <p>Bu e-posta YazMuh Proje tarafından gönderilmiştir.</p>
            <p>E-posta almak istemiyorsanız, lütfen ayarlarınızdan bildirimleri kapatın.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(userEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendInvitationEmail,
  sendNotificationEmail
}; 
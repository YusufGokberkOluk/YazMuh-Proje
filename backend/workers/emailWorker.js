const { connectRabbitMQ, consumeMessages, RABBITMQ_CONFIG } = require('../config/rabbitmq');
const { sendInvitationEmail, sendNotificationEmail } = require('../config/email');

// E-posta worker'ını başlat
const startEmailWorker = async () => {
  try {
    // RabbitMQ bağlantısını kur
    await connectRabbitMQ();

    // Davet e-postası kuyruğunu dinle
    await consumeMessages(RABBITMQ_CONFIG.queues.invitationEmail, async (message) => {
      try {
        console.log('Davet e-postası mesajı alındı:', message);
        
        if (message.type === 'invitation_email') {
          await sendInvitationEmail(message.data);
          console.log('Davet e-postası başarıyla gönderildi');
        }
      } catch (error) {
        console.error('Davet e-postası gönderme hatası:', error);
        throw error; // Mesajı dead letter queue'ya gönder
      }
    });

    // Bildirim e-postası kuyruğunu dinle
    await consumeMessages(RABBITMQ_CONFIG.queues.notificationEmail, async (message) => {
      try {
        console.log('Bildirim e-postası mesajı alındı:', message);
        
        if (message.type === 'notification_email') {
          await sendNotificationEmail(message.data);
          console.log('Bildirim e-postası başarıyla gönderildi');
        }
      } catch (error) {
        console.error('Bildirim e-postası gönderme hatası:', error);
        throw error; // Mesajı dead letter queue'ya gönder
      }
    });

    console.log('E-posta worker başlatıldı');
  } catch (error) {
    console.error('E-posta worker başlatma hatası:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('E-posta worker kapatılıyor...');
  process.exit(0);
};

// Sinyal dinleyicileri
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Worker'ı başlat
if (require.main === module) {
  startEmailWorker();
}

module.exports = {
  startEmailWorker
}; 
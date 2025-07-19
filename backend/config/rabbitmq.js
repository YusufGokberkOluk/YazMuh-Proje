const amqp = require('amqplib');

// RabbitMQ konfigürasyonu
const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  queues: {
    invitationEmail: 'invitation_email',
    notificationEmail: 'notification_email'
  }
};

let connection = null;
let channel = null;

// RabbitMQ bağlantısını oluştur
const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    
    console.log('RabbitMQ bağlantısı başarılı');

    // Kuyrukları oluştur
    await channel.assertQueue(RABBITMQ_CONFIG.queues.invitationEmail, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: 'dlx.invitation_email'
    });

    await channel.assertQueue(RABBITMQ_CONFIG.queues.notificationEmail, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: 'dlx.notification_email'
    });

    // Dead letter exchange oluştur
    await channel.assertExchange('dlx', 'direct', { durable: true });
    await channel.assertQueue('dlx.invitation_email', { durable: true });
    await channel.assertQueue('dlx.notification_email', { durable: true });
    await channel.bindQueue('dlx.invitation_email', 'dlx', 'dlx.invitation_email');
    await channel.bindQueue('dlx.notification_email', 'dlx', 'dlx.notification_email');

    console.log('RabbitMQ kuyrukları oluşturuldu');

    // Bağlantı olayları
    connection.on('error', (err) => {
      console.error('RabbitMQ bağlantı hatası:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ bağlantısı kapandı');
    });

    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ bağlantı hatası:', error);
    throw error;
  }
};

// Mesaj gönder
const sendMessage = async (queue, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ kanalı başlatılmamış');
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const result = await channel.sendToQueue(queue, messageBuffer, {
      persistent: true,
      timestamp: Date.now()
    });

    console.log(`Mesaj ${queue} kuyruğuna gönderildi`);
    return result;
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    throw error;
  }
};

// Davet e-postası mesajı gönder
const sendInvitationEmail = async (invitationData) => {
  const message = {
    type: 'invitation_email',
    data: invitationData,
    timestamp: new Date().toISOString()
  };

  return await sendMessage(RABBITMQ_CONFIG.queues.invitationEmail, message);
};

// Bildirim e-postası mesajı gönder
const sendNotificationEmail = async (notificationData) => {
  const message = {
    type: 'notification_email',
    data: notificationData,
    timestamp: new Date().toISOString()
  };

  return await sendMessage(RABBITMQ_CONFIG.queues.notificationEmail, message);
};

// Mesaj tüket
const consumeMessages = async (queue, callback) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ kanalı başlatılmamış');
    }

    await channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Mesaj işleme hatası:', error);
          // Mesajı dead letter queue'ya gönder
          channel.nack(msg, false, false);
        }
      }
    });

    console.log(`${queue} kuyruğu dinleniyor`);
  } catch (error) {
    console.error('Mesaj tüketme hatası:', error);
    throw error;
  }
};

// Bağlantıyı kapat
const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('RabbitMQ bağlantısı kapatıldı');
  } catch (error) {
    console.error('RabbitMQ bağlantı kapatma hatası:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  sendInvitationEmail,
  sendNotificationEmail,
  consumeMessages,
  closeConnection,
  RABBITMQ_CONFIG
}; 
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');

// Ortam değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Middleware'leri yapılandır
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için uploads klasörü
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basit mod için environment değişkenlerini ayarla
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yazmuh-proje';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.ENABLE_REDIS = process.env.ENABLE_REDIS || 'false';
process.env.ENABLE_RABBITMQ = process.env.ENABLE_RABBITMQ || 'false';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Veritabanına bağlan
connectDB();

// Redis'e bağlan (opsiyonel)
if (process.env.ENABLE_REDIS === 'true') {
  try {
    connectRedis();
  } catch (error) {
    console.log('Redis bağlantısı başarısız, devam ediliyor...');
  }
} else {
  console.log('⚠️ Redis devre dışı (ENABLE_REDIS=false)');
}

// RabbitMQ'ya bağlan (opsiyonel)
if (process.env.ENABLE_RABBITMQ === 'true') {
  connectRabbitMQ().catch(console.error);
}

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'YazMuh Proje API çalışıyor!' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workspaces', require('./routes/workspace'));
app.use('/api/pages', require('./routes/page'));
app.use('/api/user', require('./routes/userFeatures'));
app.use('/api/share', require('./routes/share'));
app.use('/api/ai', require('./routes/ai'));

// Yeni eklenen route'lar
app.use('/api/blocks', require('./routes/blockRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası!' });
});

// Port'u al ve sunucuyu başlat
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend sunucusu ${PORT} portunda çalışıyor`);
  console.log(`🌍 Ortam: ${process.env.NODE_ENV || 'development'}`);
  console.log('📡 API endpoint\'leri hazır');
  console.log('🔗 http://localhost:5000');
});

// Socket.IO'yu başlat
const { initializeSocket } = require('./config/socket');
initializeSocket(server);

console.log('⚡ Socket.IO gerçek zamanlı işbirliği aktif'); 
const redis = require('redis');

let client = null;
let isConnected = false;

// Redis'e bağlan
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    client = redis.createClient({
      url: redisUrl
    });

    client.on('error', (err) => {
      console.log('Redis Client Error:', err);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('✅ Redis bağlantısı başarılı');
      isConnected = true;
    });

    client.on('ready', () => {
      console.log('🚀 Redis hazır');
    });

    client.on('end', () => {
      console.log('❌ Redis bağlantısı kesildi');
      isConnected = false;
    });

    await client.connect();
    return client;
  } catch (error) {
    console.log('⚠️ Redis bağlantısı başarısız, cache devre dışı:', error.message);
    isConnected = false;
    return null;
  }
};

// Cache'e veri kaydet
const setCache = async (key, data, expireTime = 3600) => {
  if (!isConnected || !client) {
    return false;
  }
  
  try {
    const serializedData = JSON.stringify(data);
    await client.setEx(key, expireTime, serializedData);
    return true;
  } catch (error) {
    console.error('Cache kaydetme hatası:', error);
    return false;
  }
};

// Cache'den veri getir
const getCache = async (key) => {
  if (!isConnected || !client) {
    return null;
  }
  
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache getirme hatası:', error);
    return null;
  }
};

// Cache'den veri sil
const deleteCache = async (key) => {
  if (!isConnected || !client) {
    return false;
  }
  
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache silme hatası:', error);
    return false;
  }
};

// Pattern ile cache temizle
const clearCacheByPattern = async (pattern) => {
  if (!isConnected || !client) {
    return false;
  }
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache pattern temizleme hatası:', error);
    return false;
  }
};

// Tüm cache'i temizle
const clearAllCache = async () => {
  if (!isConnected || !client) {
    return false;
  }
  
  try {
    await client.flushAll();
    return true;
  } catch (error) {
    console.error('Tüm cache temizleme hatası:', error);
    return false;
  }
};

// Cache durumunu kontrol et
const isCacheConnected = () => {
  return isConnected;
};

// Redis client'ını al
const getClient = () => {
  return client;
};

// JWT blocklist işlemleri
const addToBlocklist = async (token, expiresIn = 86400) => {
  try {
    // Token'ı blocklist'e ekle (varsayılan 24 saat)
    await client.setEx(`blocklist:${token}`, expiresIn, '1');
    console.log('Token blocklist\'e eklendi');
  } catch (error) {
    console.error('Token blocklist\'e eklenemedi:', error);
  }
};

const isBlocklisted = async (token) => {
  try {
    const result = await client.get(`blocklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error('Blocklist kontrolü hatası:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCacheByPattern,
  clearAllCache,
  isCacheConnected,
  getClient,
  addToBlocklist,
  isBlocklisted
}; 
# Backend API

Bu proje Node.js ve Express.js kullanılarak geliştirilmiş bir REST API'dir.

## Özellikler

- Express.js web framework
- MongoDB veritabanı (Mongoose ODM)
- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- CORS desteği
- Ortam değişkenleri yönetimi

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyası oluşturun:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/yazmuh-proje
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. MongoDB'nin çalıştığından emin olun

4. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

## API Endpoints

### Kimlik Doğrulama

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Kullanıcı profili (JWT gerekli)

### Örnek Kullanım

#### Kullanıcı Kaydı
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'
```

#### Kullanıcı Girişi
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## Klasör Yapısı

```
backend/
├── config/
│   └── database.js          # MongoDB bağlantı konfigürasyonu
├── controllers/
│   └── authController.js    # Kimlik doğrulama iş mantığı
├── middleware/
│   └── auth.js              # JWT token kontrolü
├── models/
│   └── User.js              # Kullanıcı modeli
├── routes/
│   └── auth.js              # Kimlik doğrulama route'ları
├── server.js                # Ana uygulama dosyası
├── package.json
└── README.md
```

## Güvenlik

- Şifreler bcrypt ile hashlenir
- JWT token'ları 30 gün geçerlidir
- CORS koruması aktif
- Input validasyonu mevcuttur 
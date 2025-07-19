# 📝 étude - AI Destekli İşbirlikçi Not Alma Uygulaması

> Notion'dan ilham alan, modern web teknolojileri ve AI entegrasyonları ile geliştirilmiş güzel ve akıllı bir not alma uygulaması.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Özellikler

### ✅ **Kimlik Doğrulama ve Kullanıcı Yönetimi**
- Güvenli kullanıcı kaydı ve giriş sistemi
- Redis token blocklist ile JWT tabanlı kimlik doğrulama
- Cascade cleanup ile hesap silme
- Kullanıcı tercihleri ve ayarları

### ✅ **Çalışma Alanı ve İşbirliği**
- Birden fazla çalışma alanı oluşturma ve yönetme
- Takım işbirliği ve üye yönetimi
- Gerçek zamanlı ortak çalışma
- Rol tabanlı erişim kontrolü

### ✅ **Notion-Benzeri Editör**
- Sürükle-bırak ile blok editörü
- 10+ blok tipi (metin, başlık, liste, resim, kod, vs.)
- Gerçek zamanlı işbirlikçi düzenleme
- Geri alma/ileri alma fonksiyonları
- Klavye kısayolları

### ✅ **AI Entegrasyonları**
- **Metin Tamamlama**: OpenAI GPT ile akıllı öneriler
- **Dilbilgisi Kontrolü**: Otomatik yazım ve dilbilgisi düzeltme
- **Çeviri**: Çoklu dil desteği ile anlık çeviri
- **OCR**: Görsellerden metin çıkarma
- **Takvim Senkronizasyonu**: AI destekli takvim entegrasyonu
- **Başlık Önerileri**: İçeriğe uygun otomatik başlık oluşturma

### ✅ **Gelişmiş Özellikler**
- Favoriler sistemi ile hızlı erişim
- Gelişmiş arama ve filtreleme
- Dosya yükleme ve resim işleme
- Paylaşım ve izin yönetimi
- Gerçek zamanlı bildirimler
- Mobile responsive tasarım

## 🛠 Teknoloji Yığını

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Veritabanı ve ODM
- **Socket.io** - Gerçek zamanlı iletişim
- **Redis** - Caching ve session yönetimi
- **RabbitMQ** - Message queue sistemi
- **JWT** - Kimlik doğrulama
- **Multer** - Dosya yükleme
- **OpenAI API** - AI entegrasyonları

### Frontend
- **React 18** & **Next.js 14** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Socket.io Client** - Gerçek zamanlı güncellemeler
- **Custom Hooks** - State management

### DevOps & Testing
- **Docker** & **Docker Compose** - Containerization
- **Jest** & **React Testing Library** - Testing
- **Swagger/OpenAPI** - API documentation
- **ESLint** & **Prettier** - Code quality

## 📁 Proje Yapısı

```
YazMuh-Proje/
├── backend/                 # Backend API server
│   ├── controllers/         # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── config/             # Database & services
│   └── server.js           # Ana server dosyası
├── frontend/               # React/Next.js app
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   └── styles/             # CSS files
├── docs/                   # Dokümantasyon
└── docker-compose.yml      # Production setup
```

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js 18+ 
- MongoDB
- Redis (opsiyonel)
- Git

### Hızlı Başlangıç

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/YusufGokberkOluk/YazMuh-Proje.git
cd YazMuh-Proje
```

2. **Backend kurulum:**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend kurulum:**
```bash
cd frontend
npm install
npm run dev
```

4. **Uygulamaya erişin:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Environment Variables

Backend `.env` dosyası oluşturun:
```env
MONGO_URI=mongodb://localhost:27017/yazmuh-proje
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
ENABLE_REDIS=false
ENABLE_RABBITMQ=false
```

## 📊 API Dokümantasyonu

- **Swagger UI**: http://localhost:5000/api-docs
- **Postman Collection**: [docs/api-collection.json](docs/api-collection.json)

### Ana Endpoint'ler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/workspace` | Çalışma alanları listesi |
| POST | `/api/page` | Yeni sayfa oluştur |
| PUT | `/api/block/:id` | Blok güncelle |
| POST | `/api/ai/complete` | AI metin tamamlama |

## 🧪 Test Etme

### Backend Testleri
```bash
cd backend
npm test
```

### Frontend Testleri
```bash
cd frontend
npm test
```

### Hızlı Test Script'i
```bash
# Her iki sunucuyu başlat
./start-local-test.bat

# API endpoint'lerini test et
./quick-test.bat
```

## 🚢 Production Deployment

### Docker ile Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manuel Deployment
1. Backend production build
2. Frontend build ve export
3. Nginx reverse proxy kurulumu
4. SSL sertifikası ekleme
5. Monitoring setup

## 👥 Takım

Bu proje **Yazılım Mühendisliği** dersi kapsamında geliştirilmiştir:

- **Yiğit** - Backend Development & Authentication
- **Deniz** - Frontend Development & UI/UX
- **Yunus** - AI Integration & Features
- **Yusuf** - Database Design & Real-time Features

## 📋 Gereksinimler Listesi

✅ **Tamamlanan 24 Gereksinim:**

1. ✅ Kullanıcı kaydı ve hesap oluşturma
2. ✅ Güvenli giriş sistemi
3. ✅ Hesap silme ve veri temizleme
4. ✅ Çalışma alanı oluşturma ve yönetimi
5. ✅ Favoriler sistemi
6. ✅ Metin tamamlama (AI)
7. ✅ Dilbilgisi kontrolü (AI)
8. ✅ Çeviri sistemi (AI)
9. ✅ OCR - görsellerden metin çıkarma
10. ✅ Görsel ekleme ve düzenleme
11. ✅ Takvim senkronizasyonu (AI)
12. ✅ Başlık önerileri (AI)
13. ✅ Sayfa oluşturma ve düzenleme
14. ✅ Gerçek zamanlı işbirliği
15. ✅ Geri alma/ileri alma
16. ✅ Arama ve filtreleme
17. ✅ Yorum sistemi
18. ✅ Bildirimler
19. ✅ Paylaşım ve izinler
20. ✅ Mobile responsive tasarım
21. ✅ Test coverage
22. ✅ API dokümantasyonu
23. ✅ Performance optimizasyonu
24. ✅ Production deployment

## 🎯 Gelecek Planları

- [ ] Offline mode desteği
- [ ] Advanced analytics dashboard
- [ ] Plugin sistemi
- [ ] Çoklu dil arayüzü
- [ ] Advanced AI features

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje ile ilgili sorularınız için:
- GitHub Issues kullanın
- Email: [proje@yazmuh.edu.tr](mailto:proje@yazmuh.edu.tr)

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!

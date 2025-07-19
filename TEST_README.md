# 🧪 Local Test Guide

Bu rehber projenizi local ortamda test etmeniz için hazırlanmıştır.

## 🚀 Quick Start (Basit Test)

### 1. Backend Başlatma
```bash
cd backend
npm install
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:5000`

### 2. Frontend Başlatma (Yeni terminal)
```bash
cd frontend  
npm install
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:3000`

## 📋 Test Senaryoları

### ✅ Temel Testler

1. **Homepage Test**
   - `http://localhost:3000` adresini açın
   - Ana sayfa yüklendiğini kontrol edin

2. **Sign In Test**
   - `http://localhost:3000/sign-in` adresine gidin
   - Test kullanıcısı ile giriş yapın:
     - Email: `kullanici@etude.app`
     - Password: `password123`

3. **App Interface Test**
   - Giriş sonrası `http://localhost:3000/app` yönlendirildiğini kontrol edin
   - Sidebar'ın göründüğünü kontrol edin
   - Editor alanının yüklendiğini kontrol edin

4. **Templates Test**
   - `http://localhost:3000/templates` adresine gidin
   - Template gallerinin yüklendiğini kontrol edin

5. **Settings Test**
   - `http://localhost:3000/settings` adresine gidin
   - Account settings sayfasının yüklendiğini kontrol edin

### ✅ API Testler

1. **API Health Check**
   ```bash
   curl http://localhost:5000
   ```
   Expected: `{"message":"YazMuh Proje API çalışıyor!"}`

2. **Auth Test**
   ```bash
   # Register test
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@test.com","password":"123456"}'
   
   # Login test
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"123456"}'
   ```

## 🔧 Troubleshooting

### Backend İssues

**Port 5000 kullanımda:**
```bash
# Windows'ta port'u kill edin:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**MongoDB bağlantı hatası:**
- MongoDB'nin çalıştığından emin olun
- Alternatif olarak MongoDB Atlas kullanabilirsiniz

### Frontend İssues

**Port 3000 kullanımda:**
- Next.js otomatik olarak 3001 portunu önerecek

**Build hatası:**
```bash
cd frontend
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

## 🎯 Test Checklist

### Backend ✅
- [ ] Server başlatıldı (Port 5000)
- [ ] API endpoint'leri respond ediyor
- [ ] Database bağlantısı çalışıyor
- [ ] Auth routes çalışıyor

### Frontend ✅
- [ ] Next.js dev server başlatıldı (Port 3000)
- [ ] Ana sayfa yüklendi
- [ ] Sign-in sayfası çalışıyor
- [ ] App interface yüklendi
- [ ] Templates sayfası çalışıyor
- [ ] Settings sayfası çalışıyor

### Integration ✅
- [ ] Frontend backend'e API call'ları yapabiliyor
- [ ] Authentication flow çalışıyor
- [ ] Page navigation çalışıyor
- [ ] Responsive design test edildi

## 📱 Device Testing

1. **Desktop (1920x1080)**
   - Chrome, Firefox, Edge, Safari

2. **Tablet (768x1024)**
   - Mobile sidebar test edin
   - Touch interactions test edin

3. **Mobile (375x667)**
   - Responsive layout kontrol edin
   - Mobile navigation test edin

## 🐛 Known Issues & Workarounds

### Development Mode Issues

1. **Next.js Hydration Warnings**
   - Normal development warnings - production'da yoktur

2. **Fast Refresh Issues**
   - Sayfa refresh yapın veya server restart edin

3. **CSS Hot Reload**
   - Tailwind değişiklikleri için browser refresh gerekebilir

## 🔄 Live Testing Features

### Real-time Features Test
- Birden fazla browser tab açın
- Aynı sayfayı farklı tab'larda açın
- Real-time sync test edin

### AI Features Test
- OpenAI API key ekleyin
- AI actions popup test edin
- Text completion test edin

## 📊 Performance Testing

### Lighthouse Audit
1. Chrome DevTools > Lighthouse
2. Run audit for Performance, Accessibility, SEO
3. Scores should be 90+ for all metrics

### Memory Usage
1. Chrome DevTools > Memory
2. Monitor for memory leaks
3. Profile React components

## 🎉 Success Criteria

Test başarılı sayılır eğer:
- ✅ Her iki server (backend & frontend) sorunsuz başlatıldı
- ✅ Authentication flow çalışıyor
- ✅ Tüm sayfalar yükleniyor
- ✅ API endpoints respond ediyor
- ✅ Responsive design çalışıyor
- ✅ Console'da kritik error yok

## 🚀 Next Steps

Test başarılı olduktan sonra:
1. Production build test edin: `npm run build`
2. Docker container test edin
3. Database gerçek data ile test edin
4. External API'ları test edin

---

**Happy Testing! 🧪✨** 
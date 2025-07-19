# Node.js 18 LTS imajını kullan
FROM node:18-alpine

# Çalışma dizinini belirle
WORKDIR /app

# Package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama kodlarını kopyala
COPY . .

# Uploads klasörü oluştur
RUN mkdir -p uploads

# Port'u aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"] 
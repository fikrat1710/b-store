# ============ Build Stage ============
# Bu bosqichda ilova quriladi va barcha kerakli fayllar (node_modules, dist) tayyorlanadi.
# node:18-alpine yoki node:20-alpine dan foydalanishingiz mumkin, Node.js versiyangizga qarab.
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci # Bog'liqliklarni o'rnatish
COPY . .
RUN npm run build # NestJS ilovasini qurish (TypeScript'dan JavaScript'ga o'girish)

# ============ Production Stage ============
# Bu bosqichda faqat ilovani ishga tushirish uchun kerakli narsalar (node_modules, dist) kiritiladi.
# Bu image hajmini kichikroq qiladi.
FROM node:18-alpine

WORKDIR /app
# Oldingi bosqichdan qurilgan fayllarni kopyalash
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Ilova ichida qaysi portda ishlashini belgilash.
# .env faylida PORT=3000 bo'lsa, bu yerda 3000 belgilanishi kerak.
EXPOSE 3000 

CMD ["npm", "run", "start:prod"] # NestJS ilovasini production rejimida ishga tushirish
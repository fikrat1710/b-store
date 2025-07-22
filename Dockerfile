FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci # Bog'liqliklarni o'rnatish
COPY . .
RUN npm run build # NestJS ilovasini qurish (TypeScript'dan JavaScript'ga o'girish)


FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


EXPOSE 3000 

CMD ["npm", "run", "start:prod"] # NestJS ilovasini production rejimida ishga tushirish
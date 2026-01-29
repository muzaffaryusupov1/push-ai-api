# 🚀 Push AI API

Text va rasm generatsiya uchun API

## 🔧 O'rnatish

1. **Dependencylarni o'rnating:**
```bash
npm install
```

2. **API keylarni oling:**

### Groq API (Text generation)
- https://console.groq.com ga kiring
- API Keys bo'limidan yangi key yarating
- `.env` fayliga qo'shing

### Replicate API (Image generation)
- https://replicate.com ga kiring
- Account Settings > API tokens
- Yangi token yarating
- `.env` fayliga qo'shing

3. **`.env` faylini to'ldiring:**
```env
GROQ_API_KEY=gsk_your_key_here
REPLICATE_API_KEY=r8_your_key_here
DEMO_SECRET=your_secret_here
```

## 🎯 Ishlatish

### Serverni ishga tushirish:
```bash
npm run dev
```

### Test sahifalar:
- Text generation: http://localhost:3000/test.html
- Image generation: http://localhost:3000/test-image.html

## 📡 API Endpoints

### 1. Text Generation (Groq)
**POST** `/api/generate`

```json
{
  "language": "uz",
  "tone": "friendly",
  "goal": "Foydalanuvchilarni jalb qilish",
  "product": "Yangi mahsulot",
  "audience": "Yoshlar",
  "constraints": "120-160 belgi, 1-2 emoji"
}
```

**Response:**
```json
{
  "variants": [
    "Variant 1 🎉",
    "Variant 2 ✨",
    "Variant 3 🚀"
  ]
}
```

### 2. Image Generation (Replicate)
**POST** `/api/generate-image`

```json
{
  "prompt": "A beautiful sunset over mountains, digital art",
  "aspectRatio": "16:9",
  "outputFormat": "webp",
  "outputQuality": 80,
  "numOutputs": 1
}
```

**Response:**
```json
{
  "success": true,
  "images": [
    "https://replicate.delivery/..."
  ],
  "id": "prediction-id",
  "model": "flux-schnell"
}
```

## 💰 Narxlar

### Groq (Text)
- ✅ **Bepul tier**: 30 so'rov/daqiqa
- ✅ **Juda tez**: ~500ms
- Model: Llama 3.3 70B

### Replicate (Image)
- ✅ **Bepul tier**: 50 so'rov/oy
- 💰 **Pullik**: ~$0.003 per rasm
- Model: Flux Schnell
- ⚡ Tezlik: 2-5 soniya

## 🎨 Qo'llab-quvvatlanadigan formatlar

### Aspect Ratios:
- `1:1` - Kvadrat
- `16:9` - Keng (landscape)
- `9:16` - Vertikal (portrait)
- `4:3` - Standart
- `3:4` - Portret

### Output Formats:
- `webp` - Eng yaxshi siqish (tavsiya)
- `jpg` - Universal
- `png` - Shaffoflik kerak bo'lsa

## 🔒 Xavfsizlik

API himoyasi uchun `DEMO_SECRET` o'rnating va so'rovlarda:

```javascript
headers: {
  'Authorization': 'Bearer your_demo_secret'
}
```

## 📚 Qo'shimcha modellar

Replicate'da boshqa modellar ham mavjud:

- **SDXL**: Yuqori sifat, sekinroq
- **Stable Diffusion 3**: Eng yangi
- **Flux Pro**: Professional sifat

Model o'zgartirish uchun `api/generate-image.js` dagi `version` ni almashtiring.

## 🆘 Yordam

Muammo bo'lsa:
1. API keylar to'g'ri ekanligini tekshiring
2. `.env` fayli to'g'ri joylashganligini tekshiring
3. Serverni qayta ishga tushiring

## 📝 Litsenziya

MIT

# 🚀 GILI - Setup Guide

## Prerequisites

- Node.js 18+ dan npm
- Android Studio dengan Android SDK
- Emulator Android atau device fisik
- Go 1.21+ (untuk backend)
- PostgreSQL 14+
- Redis
- RabbitMQ
- Python 3.10+ (untuk AI service)

## 📱 Mobile App Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Prebuild Native Code
```bash
npx expo prebuild --platform android
```

### 3. Run on Android
```bash
# Via Expo
npx expo run:android

# Atau via ADB langsung
npm run android
```

### 4. Development Mode
```bash
npm run dev
```

## 🔧 Backend API Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Copy Environment File
```bash
cp .env.example .env
```

### 3. Configure .env
Edit `.env` file dengan konfigurasi database dan services Anda:
```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=gili
DB_PASSWORD=gili_secret
DB_NAME=gili_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
JWT_SECRET=your-super-secret-key-change-in-production
```

### 4. Install Go Dependencies
```bash
go mod download
```

### 5. Run Database Migrations
Database akan otomatis di-migrate saat aplikasi pertama kali dijalankan.

### 6. Run Backend Server
```bash
go run main.go
```

Atau build terlebih dahulu:
```bash
go build -o gili-api
./gili-api
```

## 🤖 AI Service Setup

### 1. Navigate to AI Service Directory
```bash
cd ai-service
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate  # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` ke `.env` dan sesuaikan:
```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
DB_HOST=localhost
DB_PORT=5432
DB_USER=gili
DB_PASSWORD=gili_secret
DB_NAME=gili_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

### 5. Run AI Worker
```bash
python worker.py
```

## 🐳 Docker Setup (Recommended)

### 1. Start All Services
```bash
cd backend
docker-compose up -d
```

Ini akan menjalankan:
- PostgreSQL
- Redis
- RabbitMQ

### 2. Check Services Status
```bash
docker-compose ps
```

### 3. View Logs
```bash
docker-compose logs -f
```

## 🗄️ Database Setup

### Manual PostgreSQL Setup

1. **Create Database**
```sql
CREATE DATABASE gili_db;
CREATE USER gili WITH PASSWORD 'gili_secret';
GRANT ALL PRIVILEGES ON DATABASE gili_db TO gili;
```

2. **Connect to Database**
```bash
psql -U gili -d gili_db
```

3. **Migrations**
Migrations akan otomatis dijalankan oleh backend saat startup.

## 🧪 Testing

### Test Mobile App
```bash
npm run lint
```

### Test Backend
```bash
cd backend
go test ./...
```

### Test AI Service
```bash
cd ai-service
pytest
```

## 📊 Monitoring

### RabbitMQ Management UI
```
http://localhost:15672
Username: guest
Password: guest
```

### Backend Health Check
```
http://localhost:8080/health
```

## 🔍 Troubleshooting

### Mobile App Issues

**Issue: Metro bundler error**
```bash
npm start -- --reset-cache
```

**Issue: Android build failed**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Backend Issues

**Issue: Database connection failed**
- Pastikan PostgreSQL running
- Check credentials di `.env`
- Verify database exists

**Issue: RabbitMQ connection failed**
- Pastikan RabbitMQ running
- Check RABBITMQ_URL di `.env`

### AI Service Issues

**Issue: OpenAI API error**
- Verify API key valid
- Check API quota
- Ensure internet connection

**Issue: Queue not processing**
- Check RabbitMQ connection
- Verify worker is running
- Check logs untuk errors

## 📱 Running on Physical Device

### Android

1. **Enable USB Debugging**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

2. **Connect Device**
```bash
adb devices
```

3. **Run App**
```bash
npx expo run:android --device
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token

### Stories
- `POST /stories` - Create story baru
- `GET /stories` - Get user stories
- `GET /stories/:id` - Get story detail
- `GET /stories/timeline` - Get timeline

### User
- `GET /users/me` - Get profile
- `PUT /users/me` - Update profile

### Skills
- `GET /skills` - Get all skills
- `GET /skills/progress` - Get user skill progress

## 🎯 Development Workflow

1. **Start Backend Services**
```bash
cd backend
docker-compose up -d
go run main.go
```

2. **Start AI Worker**
```bash
cd ai-service
source venv/bin/activate
python worker.py
```

3. **Start Mobile App**
```bash
npm run dev
```

4. **Make Changes & Test**
- Mobile: Hot reload otomatis
- Backend: Restart server
- AI: Restart worker

## 📝 Notes

- **Offline-First**: Mobile app dapat bekerja offline, data akan di-sync saat online
- **Audio Recording**: Maksimal 3 menit per recording
- **Rate Limiting**: 100 requests per menit per user
- **AI Evaluation**: Async via RabbitMQ, hasil muncul di timeline

## 🔐 Security

- JWT tokens expire dalam 15 menit
- Refresh tokens expire dalam 7 hari
- Semua passwords di-hash dengan bcrypt
- Rate limiting aktif di semua endpoints
- Input validation ketat

## 📚 Additional Resources

- [PRD GILI](./PRD_GILI.md)
- [Architecture & Tasks](./GILI_ADR_AND_TASKS.md)
- [Backend README](./backend/README.md)
- [AI Service README](./ai-service/README.md)

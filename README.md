# 🎯 GILI - Aplikasi Pendidikan Berbasis Storytelling

> **Gili** adalah aplikasi pendidikan yang membantu siswa Indonesia berani menyampaikan ide, berbicara dengan runtut, dan melihat progres belajar secara nyata dengan cara yang joyful, ringan, dan aman.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8.svg)](https://golang.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB.svg)](https://python.org/)

## 📋 Daftar Isi

- [Tentang Gili](#tentang-gili)
- [Fitur Utama](#fitur-utama)
- [Prinsip Non-Negotiable](#prinsip-non-negotiable)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Quick Start](#quick-start)
- [Dokumentasi](#dokumentasi)
- [Development](#development)
- [Contributing](#contributing)

## 🎓 Tentang Gili

Gili dibangun untuk membantu siswa Indonesia (SD, SMP, SMA) mengembangkan kemampuan komunikasi dan storytelling mereka melalui:

- 🎙️ **Audio Recording** - Rekam cerita dengan suara
- ✍️ **Text Input** - Tulis cerita dengan teks
- 🤖 **AI Evaluation** - Feedback positif dan membangun dari AI
- 📊 **Skill Tracking** - Monitor progres kemampuan komunikasi
- 📚 **Portfolio** - Riwayat cerita dan pencapaian otomatis

### Target Pengguna

| Segment | Usia | Fokus Utama |
|---------|------|-------------|
| SD | 7-12 | Berani bercerita |
| SMP | 13-15 | Alur & kejelasan ide |
| SMA/Kuliah | 16-22 | Argumentasi & refleksi |
| Orang Tua | - | Monitoring progres |

## ✨ Fitur Utama

### 1. Education Timeline
- Riwayat aktivitas belajar terstruktur
- Visualisasi progres per jenjang
- Dasar pembentukan portofolio

### 2. Ruang Cerita (Core Feature)
- **Input Audio**: Rekam cerita hingga 3 menit
- **Input Text**: Tulis cerita bebas
- **Prompt Cerita**: Topik disesuaikan usia
- **Offline-First**: Rekam offline, sync saat online

### 3. AI Evaluation
- Evaluasi otomatis via LangGraph
- Feedback positif dan membangun
- Scoring: Clarity, Structure, Creativity, Expression
- Guardrail ketat (AI sebagai coach, bukan hakim)

### 4. Skill Progress
- Track 4 skill utama:
  - Kejelasan Bertutur
  - Alur Cerita
  - Ekspresi Perasaan
  - Kreativitas
- Level up system
- Progress visualization

### 5. Portfolio Otomatis
- Riwayat semua cerita
- Feedback AI tersimpan
- Export capability (future)

## 🚫 Prinsip Non-Negotiable

### ❌ TIDAK Ada:
- AR, face tracking, atau kamera realtime
- UI/animasi GPU-berat
- Chatbot bebas tanpa guardrail
- Fitur yang membuat aplikasi panas/tidak stabil

### ✅ WAJIB Ada:
- Offline-first functionality
- Feedback positif & membangun
- Low-end device friendly (RAM 2-3GB)
- AI sebagai coach, bukan hakim

## 🛠️ Tech Stack

### Mobile App
- **Framework**: React Native + Expo
- **State Management**: Zustand (planned)
- **Offline Storage**: SQLite (planned)
- **Audio**: expo-av
- **Navigation**: Expo Router
- **UI**: Custom components + Lucide icons

### Backend API
- **Language**: Go 1.21
- **Framework**: Fiber v2
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Auth**: JWT

### AI Service
- **Framework**: LangGraph + LangChain
- **LLM**: OpenAI-compatible models
- **Language**: Python 3.10+
- **Worker**: RabbitMQ consumer

### Infrastructure
- **Containerization**: Docker
- **Reverse Proxy**: Nginx (planned)
- **Monitoring**: Basic health checks

## 🏗️ Arsitektur

```
┌─────────────────────────────┐
│   Mobile App (React Native) │
│   - Expo Router             │
│   - Audio Recording         │
│   - Offline-First           │
└──────────────┬──────────────┘
               │ HTTPS + JWT
               ▼
┌─────────────────────────────┐
│   Backend API (Go Fiber)    │
│   - Auth & Security         │
│   - Story Management        │
│   - Rate Limiting           │
└──────────────┬──────────────┘
               │ Publish Job
               ▼
┌─────────────────────────────┐
│      RabbitMQ (Queue)       │
│   - Async Processing        │
│   - Retry & DLQ             │
└──────────────┬──────────────┘
               │ Consume
               ▼
┌─────────────────────────────┐
│  AI Service (LangGraph)     │
│   - Story Evaluation        │
│   - LLM Integration         │
│   - Guardrails              │
└──────────────┬──────────────┘
               │ Save Results
               ▼
┌─────────────────────────────┐
│  PostgreSQL + Redis         │
│   - User Data               │
│   - Stories & Feedback      │
│   - Skill Progress          │
└─────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Android Studio + SDK
- Go 1.21+
- PostgreSQL 14+
- Redis
- RabbitMQ
- Python 3.10+

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/gili.git
cd gili
```

### 2. Setup Mobile App
```bash
npm install
npx expo prebuild --platform android
npm run android
```

### 3. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env dengan konfigurasi Anda
go mod download
go run main.go
```

### 4. Setup AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env dengan OpenAI API key
python worker.py
```

### 5. Setup Infrastructure (Docker)
```bash
cd backend
docker-compose up -d
```

Lihat [SETUP.md](./SETUP.md) untuk panduan lengkap.

## 📚 Dokumentasi

- **[PRD_GILI.md](./PRD_GILI.md)** - Product Requirements Document (FINAL)
- **[GILI_ADR_AND_TASKS.md](./GILI_ADR_AND_TASKS.md)** - Architecture Decision Records & Task Breakdown
- **[SETUP.md](./SETUP.md)** - Setup Guide Lengkap
- **[backend/README.md](./backend/README.md)** - Backend API Documentation
- **[ai-service/README.md](./ai-service/README.md)** - AI Service Documentation

## 💻 Development

### Project Structure
```
gili/
├── app/                    # React Native app (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── game/              # Game/story screens
│   └── _layout.tsx        # Root layout
├── assets/                # Images, fonts, etc
├── backend/               # Go Fiber API
│   ├── handlers/          # HTTP handlers
│   ├── models/            # Data models
│   ├── middleware/        # Middleware
│   └── database/          # DB & migrations
├── ai-service/            # Python AI service
│   ├── graph.py           # LangGraph pipeline
│   ├── worker.py          # RabbitMQ worker
│   └── prompts.py         # AI prompts
├── hooks/                 # React hooks
├── services/              # API services
└── types/                 # TypeScript types
```

### Development Workflow

1. **Start Services**
```bash
# Terminal 1: Backend
cd backend && go run main.go

# Terminal 2: AI Worker
cd ai-service && python worker.py

# Terminal 3: Mobile App
npm run dev
```

2. **Make Changes**
- Mobile: Hot reload otomatis
- Backend: Restart server
- AI: Restart worker

3. **Test**
```bash
# Mobile
npm run lint

# Backend
cd backend && go test ./...

# AI Service
cd ai-service && pytest
```

### Key Commands

```bash
# Mobile App
npm run dev              # Start Expo dev server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run lint             # Lint code

# Backend
go run main.go           # Run server
go test ./...            # Run tests
go build -o gili-api     # Build binary

# AI Service
python worker.py         # Run worker
pytest                   # Run tests
```

## 🔑 ADR (Architecture Decision Records)

### ADR-001: Tidak Menggunakan AR
**Status**: Accepted

**Alasan**:
- Target device: RAM 2-3GB (low-end)
- AR = GPU intensif, panas, crash
- Fokus pada audio & text storytelling
- Kompleksitas tinggi tanpa nilai edukatif sebanding

### ADR-002: RabbitMQ untuk Async Processing
**Status**: Accepted

**Alasan**:
- AI evaluation tidak realtime
- Decoupling API dan AI service
- Retry & dead-letter queue support
- Tahan lonjakan traffic
- UX tetap cepat

## 🎯 Roadmap

### MVP (Sprint 1 Minggu) ✅
- [x] Login & profil siswa
- [x] Education timeline (basic)
- [x] Ruang Cerita (audio & teks)
- [x] Evaluasi cerita AI
- [x] Skill komunikasi & progress
- [x] Portofolio otomatis (read-only)

### Phase 2 (Future)
- [ ] Offline sync mechanism
- [ ] Audio transcription
- [ ] Parent dashboard
- [ ] Export portfolio
- [ ] Gamification enhancements
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] School integration
- [ ] Teacher dashboard
- [ ] Collaborative storytelling
- [ ] Advanced analytics

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- **Mobile**: Follow React Native best practices
- **Backend**: Follow Go conventions (gofmt, golint)
- **AI**: Follow PEP 8 (Python)
- **Commits**: Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Product**: Product requirements & vision
- **Mobile**: React Native development
- **Backend**: Go API development
- **AI**: LangGraph & LLM integration
- **DevOps**: Infrastructure & deployment

## 📞 Contact

- **Email**: support@gili.app
- **Website**: https://gili.app
- **Issues**: https://github.com/yourusername/gili/issues

## 🙏 Acknowledgments

- Expo team untuk amazing framework
- Go Fiber untuk fast HTTP framework
- LangChain/LangGraph untuk AI orchestration
- OpenAI untuk LLM capabilities

---

> **Gili dibangun bukan untuk terlihat canggih, tetapi untuk membuat siswa berani menyampaikan pikirannya dan bangga dengan progresnya sendiri.**

Made with ❤️ for Indonesian students

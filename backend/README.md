# Gili Backend API

Backend API untuk aplikasi Gili - platform pendidikan berbasis storytelling.

## Tech Stack

- **Framework**: Golang Fiber
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Broker**: RabbitMQ (ADR-002: async processing)
- **Auth**: JWT (short-lived access + refresh token)

## Arsitektur

```
[ Mobile App (React Native) ]
          |
          | HTTPS + JWT
          v
[ Backend API (Go Fiber) ]
          |
          | publish job
          v
[ RabbitMQ ]
          |
          v
[ AI Service (LangGraph + LLM) ]
          |
          v
[ PostgreSQL | Redis ]
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register user baru
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (protected)

### User
- `GET /api/v1/user/profile` - Get profile (protected)
- `PUT /api/v1/user/profile` - Update profile (protected)

### Stories
- `POST /api/v1/stories` - Create story (protected)
- `GET /api/v1/stories` - Get all stories (protected)
- `GET /api/v1/stories/:id` - Get story by ID (protected)

### Timeline
- `GET /api/v1/timeline` - Get education timeline (protected)

### Skills & Progress
- `GET /api/v1/skills` - Get all skills
- `GET /api/v1/progress` - Get user progress (protected)
- `GET /api/v1/portfolio` - Get user portfolio (protected)

## Setup Development

### Prerequisites
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3+

### Quick Start dengan Docker

```bash
# Start semua services
docker-compose up -d

# API akan berjalan di http://localhost:8080
```

### Manual Setup

1. Copy environment file
```bash
cp .env.example .env
```

2. Edit `.env` sesuai konfigurasi lokal

3. Install dependencies
```bash
go mod download
```

4. Run server
```bash
go run main.go
```

## Data Model

### users
- id, name, email, password_hash, age, level, avatar

### stories
- id, user_id, prompt_id, prompt_title, input_type, content, audio_url, transcript, status

### story_feedback
- id, story_id, clarity_score, structure_score, creativity_score, expression_score, overall_score, feedback_text

### skills
- id, name, description, icon, color

### skill_progress
- id, user_id, skill_id, level, progress, total_stories

## Security

- JWT short-lived (15 menit) + refresh token (7 hari)
- Rate limiting per IP (100 req/menit)
- Input validation ketat
- Password hashing dengan bcrypt
- CORS configured

## Prinsip (dari PRD)

- ❌ Tidak ada AR, face tracking, kamera realtime
- ✅ Offline-first friendly
- ✅ Low-end device friendly
- ✅ AI sebagai coach, bukan hakim
- ✅ Semua heavy process via RabbitMQ (ADR-002)

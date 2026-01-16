# 🐰 RabbitMQ Setup Guide untuk GILI

## Status Saat Ini
⚠️ RabbitMQ belum terinstall di sistem

## Mengapa RabbitMQ Diperlukan?
RabbitMQ digunakan untuk **async processing** AI evaluation sesuai ADR-002:
- Decoupling antara API dan AI service
- Retry & dead-letter queue untuk reliability
- Tahan lonjakan traffic
- UX tetap cepat (non-blocking)

## 📥 Cara Install RabbitMQ di Windows

### Option 1: Manual Installation (Recommended)

#### Step 1: Install Erlang
RabbitMQ memerlukan Erlang runtime.

1. Download Erlang dari: https://www.erlang.org/downloads
2. Pilih versi Windows installer (OTP 26.x atau lebih baru)
3. Install dengan default settings
4. Verify installation:
   ```powershell
   erl -version
   ```

#### Step 2: Install RabbitMQ
1. Download RabbitMQ dari: https://www.rabbitmq.com/download.html
2. Pilih "Windows Installer"
3. Run installer sebagai Administrator
4. Install dengan default settings

#### Step 3: Enable Management Plugin
```powershell
# Run as Administrator
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-3.x.x\sbin"
rabbitmq-plugins enable rabbitmq_management
```

#### Step 4: Start RabbitMQ Service
```powershell
# Run as Administrator
net start RabbitMQ
```

#### Step 5: Verify Installation
```powershell
# Check service status
Get-Service RabbitMQ

# Access management UI
# Open browser: http://localhost:15672
# Default credentials: guest / guest
```

### Option 2: Via Chocolatey (Requires Admin)

```powershell
# Run PowerShell as Administrator
choco install rabbitmq -y

# Start service
net start RabbitMQ
```

### Option 3: Via Scoop (Alternative Package Manager)

```powershell
# Install Scoop if not installed
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install RabbitMQ
scoop install erlang
scoop install rabbitmq

# Start RabbitMQ
rabbitmq-server
```

### Option 4: CloudAMQP (Cloud-based, No Installation)

Jika tidak bisa install lokal, gunakan CloudAMQP free tier:

1. Sign up di: https://www.cloudamqp.com/
2. Create free instance (Little Lemur plan)
3. Get connection URL
4. Update `.env`:
   ```env
   RABBITMQ_URL=amqps://username:password@host/vhost
   ```

## 🚀 Setelah RabbitMQ Terinstall

### 1. Verify RabbitMQ Running
```powershell
# Check service
Get-Service RabbitMQ

# Test connection
curl http://localhost:15672
```

### 2. Restart Backend
Backend akan otomatis connect ke RabbitMQ:
```powershell
cd backend
go run main.go
```

Output yang diharapkan:
```
✅ Connected to RabbitMQ
✅ Database migrations completed
✅ Connected to Redis
🚀 Gili API starting on port 8080
```

### 3. Setup AI Worker
```powershell
cd ai-service

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env dengan config:
# RABBITMQ_URL=amqp://guest:guest@localhost:5672/
# DB_HOST=aws-1-ap-south-1.pooler.supabase.com
# DB_PORT=6543
# DB_USER=postgres.odtyyaqtjnkketfywlwl
# DB_PASSWORD=jiiancoK123
# DB_NAME=postgres
# OPENAI_API_KEY=your-openai-api-key

# Run worker
python worker.py
```

## 🔧 Configuration

### Backend (.env)
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

### AI Service (.env)
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.odtyyaqtjnkketfywlwl
DB_PASSWORD=jiiancoK123
DB_NAME=postgres
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
```

## 🧪 Testing RabbitMQ

### Test Connection
```powershell
# PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:15672/api/overview" -Credential (Get-Credential)
$response.Content
```

### Test Queue Creation
```powershell
# Access management UI
# http://localhost:15672
# Login: guest / guest
# Go to Queues tab
# Should see: story_evaluation queue (after backend starts)
```

## 🔄 Workaround Tanpa RabbitMQ

Jika RabbitMQ tidak bisa diinstall, ada 2 opsi:

### Option 1: Synchronous AI Evaluation
Modify backend untuk process AI evaluation secara synchronous:

```go
// backend/handlers/story.go
// Instead of publishing to queue, call AI service directly
```

### Option 2: Use CloudAMQP
Gunakan RabbitMQ cloud gratis (sudah dijelaskan di atas).

### Option 3: Skip AI Evaluation
Stories tetap bisa dibuat dan disimpan, hanya AI evaluation yang di-skip:
- Stories tersimpan dengan status "pending"
- Bisa ditambahkan feedback manual via database
- Atau implement AI evaluation nanti

## 📊 Current Status

### ✅ Yang Sudah Berjalan
- Backend API dengan Supabase PostgreSQL
- Mobile app dengan Expo
- Redis untuk rate limiting
- User registration & authentication
- Story creation & storage

### ⚠️ Yang Belum Berjalan
- RabbitMQ (not installed)
- AI Worker (menunggu RabbitMQ)
- AI Evaluation (akan di-skip)

### 🎯 Impact
- Stories dapat dibuat dan disimpan ✅
- AI evaluation tidak akan diproses ⚠️
- Timeline & profile tetap berfungsi ✅
- Aplikasi tetap dapat digunakan untuk testing ✅

## 🚀 Recommended Next Steps

1. **Install RabbitMQ** (pilih salah satu option di atas)
2. **Restart Backend** untuk connect ke RabbitMQ
3. **Setup AI Worker** dengan OpenAI API key
4. **Test end-to-end** story creation dengan AI evaluation

## 📞 Troubleshooting

### Issue: "dial tcp [::1]:5672: connectex: No connection could be made"
**Solution**: RabbitMQ belum running atau belum terinstall
```powershell
# Check service
Get-Service RabbitMQ

# Start service
net start RabbitMQ
```

### Issue: "Access denied" saat install
**Solution**: Run PowerShell/CMD sebagai Administrator

### Issue: Erlang not found
**Solution**: Install Erlang terlebih dahulu sebelum RabbitMQ

### Issue: Port 5672 already in use
**Solution**: 
```powershell
# Check what's using the port
netstat -ano | findstr :5672

# Kill the process or change RabbitMQ port
```

## 📚 Resources

- RabbitMQ Official: https://www.rabbitmq.com/
- Erlang Downloads: https://www.erlang.org/downloads
- CloudAMQP: https://www.cloudamqp.com/
- RabbitMQ Management Plugin: https://www.rabbitmq.com/management.html

---

**Note**: Untuk development saat ini, aplikasi dapat berjalan tanpa RabbitMQ. AI evaluation akan di-skip, tapi semua fitur lain tetap berfungsi normal.

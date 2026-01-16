# 🚀 GILI - Running Services Status

**Status**: ✅ ALL SYSTEMS RUNNING

**Last Updated**: 18 Desember 2025, 14:21 WIB

---

## 📊 Services Status

### 1. ✅ Mobile App (Expo Dev Server)
- **Status**: RUNNING
- **URL**: http://localhost:8081
- **Expo URL**: exp://10.8.0.46:8081
- **Command**: `npm run dev`
- **Terminal**: Background (ID: 88)

**QR Code**: Tersedia di terminal untuk scan dengan Expo Go

### 2. ✅ Backend API (Mock Server)
- **Status**: RUNNING
- **URL**: http://localhost:8080
- **Android Emulator URL**: http://10.0.2.2:8080
- **Command**: `node mock-server.js`
- **Terminal**: Background (ID: 110)

**Health Check**: ✅ Verified
```bash
curl http://localhost:8080/health
# Response: {"status":"ok","service":"gili-mock-api"}
```

### 3. ⚠️ Database Services (Docker)
- **Status**: NOT RUNNING (Docker Desktop not started)
- **Note**: Using mock data instead
- **Impact**: None for testing - mock server provides all needed data

---

## 🎯 How to Test the App

### Option 1: Test on Android Emulator (Recommended)

1. **Pastikan emulator sudah running**
   ```bash
   adb devices
   # Should show: emulator-5554   device
   ```

2. **Install Expo Go di emulator**
   - Buka Play Store di emulator
   - Search "Expo Go"
   - Install aplikasi

3. **Connect ke Expo Dev Server**
   - Buka Expo Go app
   - Tap "Enter URL manually"
   - Masukkan: `exp://10.8.0.46:8081`
   - Atau scan QR code dari terminal

4. **Test Features**
   - ✅ Timeline screen
   - ✅ Ruang Cerita (audio recording)
   - ✅ Ruang Cerita (text input)
   - ✅ Profile screen
   - ✅ Leaderboard screen

### Option 2: Test on Physical Device

1. **Connect device ke WiFi yang sama dengan PC**

2. **Install Expo Go dari Play Store**

3. **Scan QR Code**
   - Buka Expo Go
   - Scan QR code dari terminal

4. **Test semua features**

### Option 3: Test on Web Browser

1. **Open browser**
   ```
   http://localhost:8081
   ```

2. **Note**: Beberapa fitur native (audio recording) mungkin tidak work di web

---

## 🧪 Testing Scenarios

### Scenario 1: Create Story (Text Mode)
1. Buka app → Tap "Ruang Cerita" tab
2. Pilih mode "Tulis Cerita"
3. Pilih topik cerita (contoh: "Liburan Terbaik")
4. Tulis cerita di text area
5. Tap "Kirim untuk Evaluasi AI"
6. ✅ Story akan tersimpan dan muncul status "pending"
7. ⏳ Tunggu 3 detik → status berubah "completed" dengan feedback AI

### Scenario 2: Create Story (Audio Mode)
1. Buka app → Tap "Ruang Cerita" tab
2. Pilih mode "Rekam Suara"
3. Pilih topik cerita
4. Tap tombol merah untuk mulai merekam
5. Bicara (maksimal 3 menit)
6. Gunakan controls:
   - Pause: Jeda recording
   - Lanjutkan: Resume recording
   - Batal: Cancel recording
   - Selesai: Stop dan kirim
7. ✅ Recording akan di-submit untuk evaluasi

### Scenario 3: View Timeline
1. Buka app → Tab "Timeline" (home)
2. ✅ Lihat riwayat aktivitas
3. ✅ Lihat stats (Level, Total Cerita)
4. Tap "Mulai Bercerita" → Navigate ke Ruang Cerita

### Scenario 4: View Profile
1. Buka app → Tab "Profile"
2. ✅ Lihat stats overview
3. ✅ Lihat category progress
4. ✅ Lihat achievements
5. Edit name (tap icon edit)

---

## 🔌 API Endpoints Available

### Authentication
```bash
# Register
POST http://localhost:8080/auth/register
Body: { "name": "Test", "email": "test@test.com", "password": "123456", "age": 12, "level": "sd" }

# Login
POST http://localhost:8080/auth/login
Body: { "email": "test@test.com", "password": "123456" }
```

### Stories
```bash
# Create story
POST http://localhost:8080/stories
Body: { "prompt_id": "1", "prompt_title": "Liburan", "input_type": "text", "content": "Cerita saya..." }

# Get stories
GET http://localhost:8080/stories

# Get timeline
GET http://localhost:8080/stories/timeline
```

### User
```bash
# Get profile
GET http://localhost:8080/users/me

# Update profile
PUT http://localhost:8080/users/me
Body: { "name": "New Name", "age": 13 }
```

### Skills
```bash
# Get skills
GET http://localhost:8080/skills

# Get progress
GET http://localhost:8080/skills/progress
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Solution**: 
- Pastikan mock server running: `node mock-server.js`
- Check URL di `services/api.ts` → harus `http://10.0.2.2:8080` untuk emulator
- Restart Expo dev server: `npm run dev`

### Issue: "Audio recording not working"
**Solution**:
- Grant microphone permission di Android settings
- Restart app
- Check di real device (emulator mungkin tidak support audio)

### Issue: "App crashes on startup"
**Solution**:
- Clear Expo cache: `npx expo start -c`
- Reinstall app di device
- Check terminal untuk error messages

### Issue: "QR code not scanning"
**Solution**:
- Manually enter URL: `exp://10.8.0.46:8081`
- Pastikan device dan PC di WiFi yang sama
- Try web version: `http://localhost:8081`

---

## 📱 Mobile App Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Timeline Screen | ✅ Working | Mock data |
| Ruang Cerita - Text | ✅ Working | Full functionality |
| Ruang Cerita - Audio | ✅ Working | Recording implemented |
| Profile Screen | ✅ Working | Mock data |
| Leaderboard | ✅ Working | Mock data |
| API Integration | ✅ Working | Mock server |
| Offline Mode | ⏳ Planned | Not yet implemented |
| Real AI Evaluation | ⏳ Planned | Mock feedback for now |

---

## 🔄 How to Stop Services

### Stop Expo Dev Server
```bash
# In terminal where it's running, press:
Ctrl + C
```

### Stop Mock API Server
```bash
# In terminal where it's running, press:
Ctrl + C
```

### Stop All (Alternative)
```bash
# Kill all node processes (Windows)
taskkill /F /IM node.exe

# Then restart what you need
```

---

## 🚀 Next Steps for Production

1. **Setup Real Database**
   - Start Docker Desktop
   - Run: `cd backend && docker-compose up -d`
   - Configure `.env` files

2. **Run Real Backend**
   ```bash
   cd backend
   go run main.go
   ```

3. **Run AI Service**
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python worker.py
   ```

4. **Build Production APK**
   ```bash
   # Option A: EAS Build (recommended)
   eas build --platform android --profile production
   
   # Option B: Local build (fix CMake first)
   npx expo run:android --variant release
   ```

---

## 📞 Quick Commands Reference

```bash
# Start mobile app
npm run dev

# Start mock API
node mock-server.js

# Check running processes
adb devices                    # Android devices
curl http://localhost:8080/health  # API health

# Restart everything
# 1. Ctrl+C on all terminals
# 2. npm run dev
# 3. node mock-server.js

# Clear cache
npx expo start -c

# View logs
# Logs appear in Expo dev server terminal
```

---

## ✅ Current Testing Capabilities

**You can now test:**
- ✅ Complete UI/UX flow
- ✅ Audio recording functionality
- ✅ Text story creation
- ✅ API integration (mock)
- ✅ Navigation between screens
- ✅ Form inputs and validations
- ✅ Loading states
- ✅ Error handling

**What's mocked:**
- 🔄 Database (using in-memory storage)
- 🔄 AI evaluation (using predefined responses)
- 🔄 User authentication (always succeeds)
- 🔄 File uploads (simulated)

**What's real:**
- ✅ Audio recording
- ✅ UI interactions
- ✅ Navigation
- ✅ Form validations
- ✅ API calls structure

---

## 🎉 Success!

**All systems are GO! 🚀**

Aplikasi GILI siap untuk testing dan development. Scan QR code di terminal atau buka Expo Go untuk mulai testing!

**Happy Testing! 😊**

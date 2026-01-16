# 📘 GILI — Product Requirements Document (PRD)

> **Dokumen ini adalah PRD FINAL aplikasi Gili.**
> Digunakan sebagai acuan resmi seluruh tim (Product, Mobile, Backend, AI, Infra).
> Jika terjadi perbedaan pendapat, **PRD ini yang menjadi rujukan utama**.

---

## 1. Nama Produk

**Gili**

> Gili adalah aplikasi pendidikan berbasis storytelling dan portofolio yang membantu siswa berani menyampaikan ide, berbicara dengan runtut, dan melihat progres belajarnya secara nyata dengan cara yang **joyful, ringan, dan aman**.

---

## 2. Visi Produk

Membangun ruang belajar digital yang:

* membuat siswa **nyaman dan berani berbicara**
* mendorong **kejelasan berpikir dan bertutur**
* membentuk **riwayat & portofolio pendidikan otomatis**
* berjalan **stabil di perangkat menengah ke bawah**

---

## 3. Prinsip Non‑Negotiable

❌ Tidak ada AR, face tracking, atau kamera realtime
❌ Tidak ada UI/animasi GPU‑berat
❌ Tidak ada chatbot bebas tanpa guardrail
❌ Tidak ada fitur yang membuat aplikasi panas atau tidak stabil

✅ Offline‑first
✅ Feedback positif & membangun
✅ Low‑end device friendly
✅ AI sebagai *coach*, bukan hakim

---

## 4. Target Pengguna

| Segment      | Usia  | Fokus Utama            |
| ------------ | ----- | ---------------------- |
| SD           | 7–12  | Berani bercerita       |
| SMP          | 13–15 | Alur & kejelasan ide   |
| SMA / Kuliah | 16–22 | Argumentasi & refleksi |
| Orang Tua    | –     | Monitoring progres     |

---

## 5. Definisi Joyful Experience

Sebuah fitur dianggap **JOYFUL** jika:

* Bisa dimulai ≤ 3 tap
* Tidak memerlukan setup rumit
* Memberi respon cepat
* Tidak menghukum kesalahan

Fitur **HARUS DITOLAK** jika:

* Bergantung kamera realtime
* Membutuhkan GPU berat
* Tidak stabil di HP RAM 2–3GB

---

## 6. Ruang Lingkup MVP (Sprint 1 Minggu)

### Termasuk

* Login & profil siswa
* Education timeline (basic)
* Ruang Cerita (audio & teks)
* Evaluasi cerita berbasis AI
* Skill komunikasi & progress
* Portofolio otomatis (read‑only)

### Tidak Termasuk

* AR / visual efek berat
* Video recording
* Forum terbuka
* Integrasi sekolah

---

## 7. Fitur Utama

### 7.1 Education Timeline

* Riwayat aktivitas belajar
* Terstruktur per jenjang
* Menjadi dasar pembentukan portofolio

### 7.2 Ruang Cerita (Core Feature)

**Input yang didukung:**

* 🎙️ Audio (offline → upload)
* ✍️ Teks

**Input yang ditolak:**

* Kamera realtime
* Video berat

Prompt cerita:

* Disediakan sistem
* Disesuaikan usia

---

## 8. Posisi AI (LLM & LangGraph)

### LLM

* Tidak pernah diakses langsung oleh user
* Tidak menerima prompt bebas
* Digunakan untuk analisis bahasa & narasi

### LangGraph

* Satu‑satunya gerbang ke LLM
* Mengatur alur evaluasi AI
* Menentukan kapan LLM dipanggil

### Alur AI Wajib

```
Rule‑based Validation
   ↓
LangGraph
   ↓
LLM (Optional)
   ↓
Post‑validation (Schema & Tone)
```

---

## 9. Tech Stack Final

### Mobile App

* **React Native**
* Expo (Bare / Custom Dev Client)
* State management: Zustand / Redux Toolkit
* Offline storage: SQLite
* Sensor: accelerometer / gyroscope
* Audio recording: expo‑av

### Backend API

* Golang (Fiber)
* PostgreSQL
* Redis

### Messaging / Async Processing

* **RabbitMQ**
* Digunakan untuk:

  * AI evaluation job
  * Retry & failure handling

### AI Service

* LangGraph
* LangChain (prompt & tools)
* OpenAI‑compatible OSS model

### Infrastructure

* Docker
* Nginx (reverse proxy)
* HTTPS (TLS)
* Rate limiting

---

## 10. Arsitektur Sistem

```
[ Mobile App (React Native) ]
          |
          | HTTPS + JWT
          v
[ Backend API (Go) ]
          |
          | publish job
          v
[ RabbitMQ ]
          |
          v
[ AI Service (LangGraph + LLM) ]
          |
          v
[ PostgreSQL | Redis | Object Storage ]
```

---

## 11. Keamanan & Reliability (WAJIB)

* JWT short‑lived + refresh token
* Rate limiting per IP & user
* Input validation ketat
* Payload size limit
* AI output harus JSON schema
* Audio auto‑delete ≤ 7 hari
* Tidak ada camera permission

---

## 12. Data Model (MVP)

### users

* id
* name
* age
* level

### stories

* id
* user_id
* input_type (audio / text)
* transcript
* created_at

### story_feedback

* story_id
* clarity_score
* structure_score
* confidence_score
* feedback_text

### skills

* id
* name

### skill_progress

* user_id
* skill_id
* level
* total_story

---

## 13. Sprint Plan (1 Minggu)

**Day 1:** Setup repo, auth, database, security baseline
**Day 2:** Timeline & data backbone
**Day 3:** Ruang Cerita (audio & text input)
**Day 4:** AI evaluation (LangGraph pipeline)
**Day 5:** Skill & portofolio
**Day 6:** Hardening, rate limit, failure handling
**Day 7:** Testing, polish, demo

---

## 14. Definition of Done

* Aplikasi stabil di HP RAM 2GB
* Tidak crash saat AI delay
* Feedback AI konsisten & positif
* Tidak membutuhkan kamera
* Data siswa aman

---

## 15. Prinsip Keputusan Fitur

Jika ada ide fitur baru, tanyakan:

1. Apakah ini membuat siswa lebih berani berbicara?
2. Apakah ini memperberat device low‑end?
3. Apakah ini bisa gagal dengan aman?

Jika ragu → **TUNDA**.

---

## 16. Penutup

> **Gili dibangun bukan untuk terlihat canggih, tetapi untuk membuat siswa berani menyampaikan pikirannya dan bangga dengan progresnya sendiri.**

---

📌 Dokumen ini bersifat final dan mengikat seluruh tim.

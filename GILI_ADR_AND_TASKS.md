# 📘 GILI — Architecture & Execution Handbook

> Dokumen ini melengkapi PRD Gili.
> Berisi **Architecture Decision Record (ADR)** dan **Task Breakdown per Role**.
> Digunakan sebagai acuan teknis & eksekusi harian tim.

---

# 🧠 ARCHITECTURE DECISION RECORD (ADR)

## ADR-001 — Keputusan: **Tidak Menggunakan AR (Augmented Reality)**

### Status

**Accepted**

### Konteks

Pada fase awal pengembangan Gili, muncul kebutuhan untuk membuat aplikasi terasa *joyful* dan interaktif. Salah satu opsi yang dipertimbangkan adalah penggunaan teknologi AR (kamera realtime, face tracking, filter visual).

Namun, target pengguna Gili adalah siswa Indonesia dengan dominasi perangkat **menengah ke bawah (RAM 2–3GB)**, koneksi tidak stabil, dan sensitivitas tinggi terhadap performa aplikasi.

### Keputusan

Gili **TIDAK menggunakan AR, face tracking, atau kamera realtime** pada MVP dan fase awal produk.

### Alasan Utama

* AR membutuhkan kamera always-on dan GPU intensif
* Konsumsi baterai dan panas tinggi
* Tingkat crash tinggi pada low-end device
* Fokus visual mengganggu tujuan utama: speaking & storytelling
* Kompleksitas teknis tinggi tanpa nilai edukatif sebanding

### Alternatif yang Dipilih

* Audio-first interaction
* Gesture ringan (tap, swipe, tilt)
* Micro-interaction visual sederhana
* Feedback berbasis narasi (AI)

### Konsekuensi

**Positif:**

* Aplikasi lebih stabil dan ringan
* UX lebih aman untuk anak
* Waktu development lebih efisien

**Negatif:**

* Tidak ada efek visual "wow" di awal

Keputusan ini dianggap **strategis dan sejalan dengan visi jangka panjang produk**.

---

## ADR-002 — Keputusan: **Menggunakan RabbitMQ untuk Async Processing**

### Status

**Accepted**

### Konteks

Fitur AI evaluation (story feedback) membutuhkan proses:

* tidak realtime
* dapat retry
* tahan lonjakan request

Pemrosesan sinkron akan:

* memperlambat UX
* meningkatkan risiko timeout
* membuat backend rapuh

### Keputusan

Gili menggunakan **RabbitMQ** sebagai message broker utama untuk pemrosesan asynchronous.

### Alasan Utama

* Decoupling antara API dan AI service
* Mendukung retry & dead-letter queue
* Kontrol beban AI service
* Mudah diobservasi dan di-scale

### Konsekuensi

**Positif:**

* UX tetap cepat
* Sistem tahan lonjakan traffic
* Failure tidak berdampak ke user

**Negatif:**

* Penambahan komponen infra
* Perlu monitoring tambahan

Keputusan ini **wajib dipertahankan** untuk semua proses AI dan heavy task.

---

# 🧩 TASK BREAKDOWN PER ROLE

## 1. React Native (Mobile) Team

### Core Responsibilities

* Implementasi UI & UX sesuai PRD
* Offline-first handling
* Audio recording & upload

### Task Breakdown

* Setup project React Native + Expo
* Auth flow (login, token handling)
* Education timeline UI
* Ruang Cerita (audio & text input)
* Offline save → sync
* Skill progress & portfolio view
* Error handling & loading state

### Non-Goal

* AR / kamera realtime
* Animasi GPU berat

---

## 2. Backend (API) Team

### Core Responsibilities

* Auth & security
* Data backbone
* Queue producer

### Task Breakdown

* Setup Golang Fiber project
* JWT auth & refresh token
* User & story API
* Skill & progress calculation
* Publish job ke RabbitMQ
* Rate limiting & validation

---

## 3. AI / LangGraph Team

### Core Responsibilities

* Evaluasi cerita
* Feedback naratif
* Safety & guardrail

### Task Breakdown

* Setup LangGraph service
* Prompt template per jenjang usia
* Rule-based pre-validation
* LLM node integration
* Output schema validation
* Feedback composer

### Non-Goal

* Chatbot bebas
* Real-time correction

---

## 4. Infrastructure / DevOps Team

### Core Responsibilities

* Stability
* Security
* Deployment

### Task Breakdown

* Dockerize semua service
* Setup RabbitMQ
* Setup PostgreSQL & Redis
* Nginx reverse proxy
* TLS / HTTPS
* Monitoring basic (health check, queue depth)

---

# 📌 Aturan Penutup

* Semua heavy process **WAJIB async via RabbitMQ**
* Semua AI call **WAJIB lewat LangGraph**
* Semua ide fitur **HARUS lolos PRD & Manifesto**

> **Gili dibangun untuk stabil dulu, pintar kemudian, dan indah secukupnya.**

---

📄 Dokumen ini bersifat mengikat dan menjadi pelengkap resmi PRD Gili.

# Gili AI Service

AI Service untuk evaluasi cerita menggunakan LangGraph.

## Arsitektur

Sesuai PRD dan ADR:
- **ADR-002**: Semua heavy process WAJIB async via RabbitMQ
- **PRD**: Semua AI call WAJIB lewat LangGraph

```
[ RabbitMQ Queue: story_evaluation ]
          |
          v
[ AI Worker (Python) ]
          |
          v
[ LangGraph Pipeline ]
    1. Rule-based Validation
    2. LLM Evaluation (OpenAI)
    3. Post-validation (Schema & Tone)
          |
          v
[ PostgreSQL: story_feedback ]
```

## Prinsip AI (dari PRD)

- AI sebagai **COACH**, bukan hakim
- Feedback selalu **POSITIF** dan **MEMBANGUN**
- Tidak pernah menghukum kesalahan
- Skor minimum 40 untuk yang sudah berusaha
- Selalu temukan minimal 2 kelebihan

## Evaluasi Berdasarkan Usia

| Level   | Fokus                              |
|---------|-----------------------------------|
| SD      | Keberanian bercerita, sederhana   |
| SMP     | Alur cerita, kejelasan ide        |
| SMA     | Argumentasi, refleksi             |
| Kuliah  | Analisis, originalitas            |

## Setup

### Prerequisites
- Python 3.11+
- RabbitMQ
- PostgreSQL
- OpenAI API Key

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Run Worker

```bash
python worker.py
```

### Docker

```bash
docker build -t gili-ai-service .
docker run -e OPENAI_API_KEY=your-key gili-ai-service
```

## LangGraph Pipeline

```python
validate_input -> [valid?] -> evaluate_with_llm -> post_validate -> END
                    |
                    v [invalid]
                   skip -> END
```

### Nodes

1. **validate_input**: Rule-based pre-validation
   - Cek panjang cerita
   - Filter kata tidak pantas
   
2. **evaluate_with_llm**: Evaluasi dengan OpenAI
   - Prompt disesuaikan usia
   - Output JSON terstruktur
   
3. **post_validate**: Validasi output
   - Pastikan skor minimum 40
   - Pastikan tone positif
   - Pastikan minimal 2 kelebihan

## Output Schema

```json
{
  "clarity_score": 0-100,
  "structure_score": 0-100,
  "creativity_score": 0-100,
  "expression_score": 0-100,
  "overall_score": 0-100,
  "feedback_text": "Feedback naratif positif",
  "strengths": ["Kelebihan 1", "Kelebihan 2"],
  "improvements": ["Saran 1", "Saran 2"]
}
```

## Fallback

Jika LLM tidak tersedia, worker akan menggunakan fallback evaluation berbasis heuristic sederhana untuk memastikan user tetap mendapat feedback.

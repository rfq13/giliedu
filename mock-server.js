const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const users = new Map();
const stories = new Map();
let storyIdCounter = 1;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gili-mock-api' });
});

// Auth endpoints
app.post('/auth/register', (req, res) => {
  const { name, email, password, age, level } = req.body;
  const userId = `user-${Date.now()}`;
  
  users.set(userId, { id: userId, name, email, age, level });
  
  res.json({
    user: { id: userId, name, email, age, level },
    token: `mock-token-${userId}`,
    refresh_token: `mock-refresh-${userId}`
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock login - always success
  const userId = `user-${Date.now()}`;
  res.json({
    user: { id: userId, name: 'Test User', email, age: 12, level: 'sd' },
    token: `mock-token-${userId}`,
    refresh_token: `mock-refresh-${userId}`
  });
});

// Story endpoints
app.post('/stories', (req, res) => {
  const { prompt_id, prompt_title, input_type, content, audio_url } = req.body;
  
  const storyId = `story-${storyIdCounter++}`;
  const story = {
    id: storyId,
    user_id: 'user-1',
    prompt_id,
    prompt_title,
    input_type,
    content,
    audio_url,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  stories.set(storyId, story);
  
  // Simulate async AI evaluation
  setTimeout(() => {
    story.status = 'completed';
    story.feedback = {
      clarity_score: 75,
      structure_score: 80,
      creativity_score: 85,
      expression_score: 78,
      overall_score: 80,
      feedback_text: 'Ceritamu sangat bagus! Kamu sudah berani bercerita dengan jelas. Terus berlatih ya! 😊',
      strengths: ['Berani bercerita', 'Alur cerita jelas', 'Ekspresi bagus'],
      improvements: ['Coba tambahkan lebih banyak detail', 'Ceritakan perasaanmu']
    };
  }, 3000);
  
  res.status(201).json(story);
});

app.get('/stories', (req, res) => {
  const storiesArray = Array.from(stories.values());
  res.json({
    stories: storiesArray,
    total_count: storiesArray.length,
    page: 1,
    page_size: 20
  });
});

app.get('/stories/:id', (req, res) => {
  const story = stories.get(req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
});

app.get('/stories/timeline', (req, res) => {
  const items = Array.from(stories.values()).map(story => ({
    id: story.id,
    type: 'story',
    title: `Cerita: ${story.prompt_title || 'Cerita Bebas'}`,
    description: story.status === 'completed' ? 'Evaluasi selesai' : 'Menunggu evaluasi',
    status: story.status,
    date: story.created_at
  }));
  
  res.json({
    items,
    total_count: items.length
  });
});

// User endpoints
app.get('/users/me', (req, res) => {
  res.json({
    id: 'user-1',
    name: 'Siswa Gili',
    email: 'siswa@gili.app',
    age: 12,
    level: 'sd',
    created_at: new Date().toISOString()
  });
});

app.put('/users/me', (req, res) => {
  const { name, age, level } = req.body;
  res.json({
    id: 'user-1',
    name: name || 'Siswa Gili',
    email: 'siswa@gili.app',
    age: age || 12,
    level: level || 'sd',
    updated_at: new Date().toISOString()
  });
});

// Skill endpoints
app.get('/skills', (req, res) => {
  res.json({
    skills: [
      { id: 'skill-1', name: 'Kejelasan Bertutur', description: 'Kemampuan berbicara dengan jelas' },
      { id: 'skill-2', name: 'Alur Cerita', description: 'Kemampuan menyusun cerita dengan runtut' },
      { id: 'skill-3', name: 'Ekspresi Perasaan', description: 'Kemampuan mengekspresikan emosi' },
      { id: 'skill-4', name: 'Kreativitas', description: 'Kemampuan berpikir kreatif' }
    ]
  });
});

app.get('/skills/progress', (req, res) => {
  res.json({
    progress: [
      { skill_id: 'skill-1', skill_name: 'Kejelasan Bertutur', level: 3, progress: 65, total_stories: 5 },
      { skill_id: 'skill-2', skill_name: 'Alur Cerita', level: 2, progress: 80, total_stories: 5 },
      { skill_id: 'skill-3', skill_name: 'Ekspresi Perasaan', level: 3, progress: 45, total_stories: 5 },
      { skill_id: 'skill-4', skill_name: 'Kreativitas', level: 2, progress: 90, total_stories: 5 }
    ]
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Mock Gili API running on http://localhost:${PORT}`);
  console.log(`📱 Mobile app can connect to: http://10.0.2.2:${PORT} (Android emulator)`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  POST /auth/register`);
  console.log(`  POST /auth/login`);
  console.log(`  POST /stories`);
  console.log(`  GET  /stories`);
  console.log(`  GET  /stories/:id`);
  console.log(`  GET  /stories/timeline`);
  console.log(`  GET  /users/me`);
  console.log(`  PUT  /users/me`);
  console.log(`  GET  /skills`);
  console.log(`  GET  /skills/progress`);
});

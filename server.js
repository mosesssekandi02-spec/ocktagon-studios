const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'ocktagon';

app.use(express.json({ limit: '10mb' }));
// Serve static files from root (since GitHub has everything at root level)
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

const settingsPath = path.join(__dirname, 'settings.json');

const defaultSettings = {
  whatsapp: "+256 770 903 235",
  email: "ocktagonstudios@gmail.com",
  youtube_channel: "https://www.youtube.com/@OctagonFilms-q6k",
  youtube_video: "https://www.youtube.com/watch?v=5Fiq59JbLVA",
  youtube_video_id: "5Fiq59JbLVA",
  red_note: "🎬 Dancing Girl is now streaming on YouTube! Watch, like and subscribe.",
  show_red_note: true,
  cast: [
    { name: "Queen Kellisha", role: "Dancer", emoji: "👑" },
    { name: "Kyomuhendo Gift", role: "Hope", emoji: "💫" },
    { name: "Mushabe Nickson", role: "Lecturer", emoji: "📚" },
    { name: "Twesigyomwe Dorothy", role: "Dancer", emoji: "💃" }
  ],
  crew: [
    { role: "Director", names: ["Aratutambire Anicia"] },
    { role: "Producer & Writer", names: ["Kaye Joshua"] },
    { role: "Overall Supervisor", names: ["Ssemanganda Reagan"] },
    { role: "Cinematographers", names: ["Tree Moses", "Tribx Tony"] },
    { role: "Editors", names: ["Tree Moses", "Trib YX"] },
    { role: "Advertising Team", names: ["Ahumuza Natasha", "Nalukenge Angella Ruth"] }
  ],
  stats: { views: "371", likes: "47", subscribers: "32" },
  gallery_count: 14
};

function getSettings() {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return defaultSettings;
    }
  }
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  return defaultSettings;
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
  const { password, ...newSettings } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  saveSettings(merged);
  res.json({ success: true });
});

// Upload to root (since images are at root on GitHub)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename || file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/upload', upload.single('image'), (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ success: true, filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`🎬 Ocktagon Studios running on port ${PORT}`);
});

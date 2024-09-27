const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/data', express.static('data'));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/api/sounds', async (req, res) => {
  try {
    const soundFiles = await fs.readdir(path.join(__dirname, 'data'));
    const mp3Files = soundFiles.filter(file => file.endsWith('.mp3'));
    const mp3Paths = mp3Files.map(file => `/data/${file}`);
    res.json(mp3Paths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('sound'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileName = req.file.originalname;

    await fs.writeFile(path.join(__dirname, 'data', fileName), req.file.buffer);

    res.json({ message: 'Sound uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

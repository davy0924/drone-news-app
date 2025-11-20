const express = require('express');
const path = require('path');
const newsService = require('../services/newsService');

const app = express();
const PORT = process.env.PORT || 3000;

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, '../public')));

// 設置路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API 獲取新聞
app.get('/api/news', async (req, res) => {
  try {
    const news = await newsService.getDroneNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 獲取分類新聞
app.get('/api/news/classified', async (req, res) => {
  try {
    const classifiedNews = await newsService.getClassifiedDroneNews();
    res.json(classifiedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Drone News App listening at http://localhost:${PORT}`);
});
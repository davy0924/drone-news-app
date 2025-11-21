const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 從香港本地新聞網站抓取無人機新聞
 */

/**
 * 從文匯報抓取新聞
 */
async function scrapeWenweipo() {
  try {
    // 搜索文匯報的無人機相關新聞
    const searchUrl = 'https://www.wenweipo.com/s/無人機';
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const articles = [];
    
    // 根據文匯報的HTML結構提取新聞
    $('.news-item, .article-item, article').each((i, elem) => {
      const $elem = $(elem);
      const title = $elem.find('h3, h4, .title, a').first().text().trim();
      const url = $elem.find('a').first().attr('href');
      const content = $elem.find('.summary, .content, p').first().text().trim();
      
      if (title && url) {
        const fullUrl = url.startsWith('http') ? url : `https://www.wenweipo.com${url}`;
        articles.push({
          title,
          content: content || title,
          source: '文匯報',
          date: new Date().toISOString(),
          url: fullUrl
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('從文匯報抓取新聞失敗:', error.message);
    return [];
  }
}

/**
 * 從香港01抓取新聞
 */
async function scrapeHK01() {
  try {
    const searchUrl = 'https://www.hk01.com/search?q=無人機';
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const articles = [];
    
    $('.search-result-item, .article-card').each((i, elem) => {
      const $elem = $(elem);
      const title = $elem.find('h3, h4, .title').first().text().trim();
      const url = $elem.find('a').first().attr('href');
      const content = $elem.find('.description, .summary').first().text().trim();
      
      if (title && url) {
        const fullUrl = url.startsWith('http') ? url : `https://www.hk01.com${url}`;
        articles.push({
          title,
          content: content || title,
          source: '香港01',
          date: new Date().toISOString(),
          url: fullUrl
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('從香港01抓取新聞失敗:', error.message);
    return [];
  }
}

/**
 * 從所有香港新聞網站抓取無人機新聞
 */
async function scrapeAllHKNews() {
  console.log('開始從香港本地新聞網站抓取...');
  
  const results = await Promise.allSettled([
    scrapeWenweipo(),
    scrapeHK01()
  ]);
  
  let allArticles = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles = allArticles.concat(result.value);
      console.log(`網站 ${index + 1} 抓取到 ${result.value.length} 條新聞`);
    }
  });
  
  // 過濾最近7天的新聞
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 7);
  
  const recentArticles = allArticles.filter(article => {
    const articleDate = new Date(article.date);
    return articleDate >= threeDaysAgo;
  });
  
  console.log(`從香港本地網站共獲取到 ${recentArticles.length} 條最近3天的新聞`);
  return recentArticles;
}

module.exports = {
  scrapeWenweipo,
  scrapeHK01,
  scrapeAllHKNews
};

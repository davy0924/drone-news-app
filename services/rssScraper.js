const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

/**
 * 從RSS源獲取無人機相關新聞
 * @returns {Promise<Array>} 新聞列表
 */
async function scrapeDroneNewsFromRSS() {
  try {
    // 定義RSS源（使用真實的RSS源）
    const rssFeeds = [
      {
        name: 'HK新聞',
        url: 'https://www.hk01.com/rss/hongkong/latest'
      },
      {
        name: '明報',
        url: 'https://news.mingpao.com/rss/pns/s00010'
      },
      {
        name: '蘋果日報',
        url: 'https://hk.appledaily.com/rss/hotspot'
      }
    ];
    
    let allNews = [];
    
    // 從每個RSS源獲取新聞
    for (const feed of rssFeeds) {
      try {
        const news = await scrapeFromRSS(feed.url, feed.name);
        allNews = allNews.concat(news);
      } catch (error) {
        console.error(`從 ${feed.name} RSS源獲取新聞失敗:`, error.message);
      }
    }
    
    // 去重處理
    const uniqueNews = Array.from(new Set(allNews.map(item => item.url)))
      .map(url => allNews.find(item => item.url === url));
    
    return uniqueNews;
  } catch (error) {
    console.error('從RSS獲取新聞失敗:', error);
    throw error;
  }
}

/**
 * 從RSS源獲取新聞
 * @param {String} rssUrl RSS源URL
 * @param {String} sourceName 來源名稱
 * @returns {Promise<Array>} 新聞列表
 */
async function scrapeFromRSS(rssUrl, sourceName) {
  try {
    const feed = await parser.parseURL(rssUrl);
    
    const articles = feed.items.slice(0, 10).map(item => {
      // 檢查標題或內容是否包含無人機相關關鍵詞
      const isDroneRelated = isArticleDroneRelated(item.title, item.content);
      
      return {
        title: item.title,
        content: item.contentSnippet || item.content || '',
        source: sourceName,
        date: item.pubDate ? new Date(item.pubDate) : new Date(),
        url: item.link,
        droneRelated: isDroneRelated
      };
    }).filter(item => item.droneRelated); // 只保留與無人機相關的新聞
    
    return articles;
  } catch (error) {
    console.error(`從RSS源 ${rssUrl} 獲取新聞失敗:`, error.message);
    return [];
  }
}

/**
 * 檢查文章是否與無人機相關
 * @param {String} title 標題
 * @param {String} content 內容
 * @returns {Boolean} 是否與無人機相關
 */
function isArticleDroneRelated(title, content) {
  const droneKeywords = ['無人機', 'drone', '無人飛機', 'UAV', '無人航空載具'];
  
  const fullText = (title || '') + ' ' + (content || '');
  const lowerText = fullText.toLowerCase();
  
  return droneKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase()) || 
    lowerText.includes(keyword)
  );
}

module.exports = {
  scrapeDroneNewsFromRSS,
  scrapeFromRSS
};
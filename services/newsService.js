const classifier = require('./newsClassifier');
const webScraper = require('./webScraper');
const rssScraper = require('./rssScraper');
const googleNewsScraper = require('./googleNewsScraper');

// 緩存設置
let newsCache = null;
let cacheTime = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30分鐘緩存

/**
 * 獲取無人機相關新聞
 * @returns {Promise<Array>} 新聞列表
 */
async function getDroneNews() {
  try {
    // 檢查緩存是否有效
    const now = Date.now();
    if (newsCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
      console.log('使用緩存的新聞數據');
      return newsCache;
    }
    
    console.log('開始獲取最新新聞...');
    console.log('當前時間:', new Date().toISOString());
    
    // 優先嘗試從Google新聞獲取新聞
    let scrapedNews = [];
    
    try {
      scrapedNews = await googleNewsScraper.scrapeDroneNewsFromGoogle();
      console.log(`從Google新聞獲取到 ${scrapedNews.length} 條新聞`);
      
      // 如果Google新聞沒有返回結果，嘗試搜索特定關鍵詞
      if (scrapedNews.length === 0) {
        scrapedNews = await googleNewsScraper.searchNews('無人機 香港');
        console.log(`從Google新聞搜索獲取到 ${scrapedNews.length} 條新聞`);
      }
    } catch (googleError) {
      console.log('Google新聞抓取失敗:', googleError.message);
      
      // 如果Google新聞抓取失敗，嘗試RSS源
      try {
        scrapedNews = await rssScraper.scrapeDroneNewsFromRSS();
        console.log(`從RSS源獲取到 ${scrapedNews.length} 條新聞`);
      } catch (rssError) {
        console.log('RSS抓取失敗，嘗試網頁抓取:', rssError.message);
        
        // 如果RSS抓取失敗，嘗試網頁抓取
        try {
          scrapedNews = await webScraper.scrapeDroneNews();
          console.log(`從網頁獲取到 ${scrapedNews.length} 條新聞`);
        } catch (webError) {
          console.log('網頁抓取也失敗:', webError.message);
        }
      }
    }
    
    // 如果都失敗了，返回模擬數據
    if (scrapedNews.length === 0) {
      console.log('無法從網上獲取新聞，使用模擬數據');
      scrapedNews = [
        {
          title: '香港無人機表演秀吸引數萬觀眾',
          content: '昨晚在維多利亞港舉行的無人機表演吸引了超過三萬名觀眾駐足觀看，成為本年度最受矚目的科技藝術表演之一。',
          source: 'HK News Daily',
          date: new Date(),
          url: 'https://example.com/news/drone-show-hong-kong'
        },
        {
          title: '政府發布新的無人機飛行法規',
          content: '為了確保航空安全，政府今日發布了新的無人機飛行法規，要求所有重量超過250克的無人機必須進行註冊。',
          source: 'Gov HK',
          date: new Date(),
          url: 'https://example.com/news/drone-regulation-hong-kong'
        },
        {
          title: '本地公司開發新型農業無人機',
          content: '一家位於科學園的初創公司開發了一款專門用於農業監測的無人機，可以精確監測作物生長狀況。',
          source: 'Tech HK',
          date: new Date(),
          url: 'https://example.com/news/agriculture-drone-hong-kong'
        }
      ];
    }
    
    // 添加ID以便於識別
    const newsWithIds = scrapedNews.map((news, index) => ({
      ...news,
      id: index + 1
    }));
    
    // 更新緩存
    newsCache = newsWithIds;
    cacheTime = Date.now();
    console.log(`緩存已更新，共 ${newsWithIds.length} 條新聞`);
    
    return newsWithIds;
  } catch (error) {
    console.error('獲取新聞失敗:', error.message);
    
    // 如果所有方法都失敗，返回模擬數據
    const mockNews = [
      {
        id: 1,
        title: '香港無人機表演秀吸引數萬觀眾',
        content: '昨晚在維多利亞港舉行的無人機表演吸引了超過三萬名觀眾駐足觀看，成為本年度最受矚目的科技藝術表演之一。',
        source: 'HK News Daily',
        date: new Date(),
        url: 'https://example.com/news/drone-show-hong-kong'
      },
      {
        id: 2,
        title: '政府發布新的無人機飛行法規',
        content: '為了確保航空安全，政府今日發布了新的無人機飛行法規，要求所有重量超過250克的無人機必須進行註冊。',
        source: 'Gov HK',
        date: new Date(),
        url: 'https://example.com/news/drone-regulation-hong-kong'
      },
      {
        id: 3,
        title: '本地公司開發新型農業無人機',
        content: '一家位於科學園的初創公司開發了一款專門用於農業監測的無人機，可以精確監測作物生長狀況。',
        source: 'Tech HK',
        date: new Date(),
        url: 'https://example.com/news/agriculture-drone-hong-kong'
      }
    ];
    
    return mockNews;
  }
}

/**
 * 獲取並分類無人機新聞
 * @returns {Promise<Object>} 分類後的新聞
 */
async function getClassifiedDroneNews() {
  const news = await getDroneNews();
  return classifier.classifyNews(news);
}

module.exports = {
  getDroneNews,
  getClassifiedDroneNews
};
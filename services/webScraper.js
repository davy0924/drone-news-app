const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 獲取網站基本URL
 * @param {String} url 完整URL
 * @returns {String} 基本URL
 */
function getSourceBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    return '';
  }
}

/**
 * 獲取模擬新聞數據
 * @returns {Array} 新聞列表
 */
function getMockNews() {
  return [
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

/**
 * 網頁抓取服務
 */

/**
 * 從多個來源獲取無人機相關新聞
 * @returns {Promise<Array>} 新聞列表
 */
async function scrapeDroneNews() {
  try {
    // 從多個來源獲取新聞
    const sources = [
      { name: 'HK01', url: 'https://www.hk01.com/search/%E7%84%A1%E4%BA%BA%E6%A9%9F' },
      { name: '明報', url: 'https://news.mingpao.com/search/%E7%84%A1%E4%BA%BA%E6%A9%9F' },
      { name: '蘋果日報', url: 'https://hk.appledaily.com/search/%E7%84%A1%E4%BA%BA%E6%A9%9F' }
    ];
    
    let allNews = [];
    
    // 從每個來源獲取新聞
    for (const source of sources) {
      try {
        const news = await scrapeFromWebsite(source.url, source.name);
        allNews = allNews.concat(news);
      } catch (error) {
        console.error(`從 ${source.name} 抓取新聞失敗:`, error.message);
      }
    }
    
    // 去重處理
    const uniqueNews = Array.from(new Set(allNews.map(item => item.url)))
      .map(url => allNews.find(item => item.url === url));
    
    // 如果沒有獲取到新聞，返回模擬數據
    if (uniqueNews.length === 0) {
      console.log('無法從網上獲取新聞，使用模擬數據');
      return getMockNews();
    }
    
    return uniqueNews;
  } catch (error) {
    console.error('抓取新聞失敗:', error);
    return getMockNews();
  }
}

/**
 * 從特定網站獲取新聞
 * @param {String} url 網站URL
 * @param {String} sourceName 來源名稱
 * @returns {Promise<Array>} 新聞列表
 */
async function scrapeFromWebsite(url, sourceName) {
  try {
    // 設置請求頭以模擬瀏覽器
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
    
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    
    const articles = [];
    
    // 根據不同網站的結構進行處理
    if (url.includes('hk01.com')) {
      // HK01 的新聞結構
      $('.search-result-item').each((index, element) => {
        const title = $(element).find('.title').text().trim();
        const content = $(element).find('.description').text().trim();
        const articleUrl = $(element).find('a').attr('href');
        
        if (title && content && articleUrl) {
          articles.push({
            title,
            content,
            source: sourceName,
            date: new Date(),
            url: articleUrl.startsWith('http') ? articleUrl : `https://www.hk01.com${articleUrl}`
          });
        }
      });
    } else {
      // 通用處理方式
      $('article, .news-item, .story').each((index, element) => {
        const title = $(element).find('h1, h2, h3, h4, .title').first().text().trim();
        const content = $(element).find('p, .summary, .description').first().text().trim();
        const articleUrl = $(element).find('a').attr('href');
        
        if (title && content && articleUrl) {
          articles.push({
            title,
            content,
            source: sourceName,
            date: new Date(),
            url: articleUrl.startsWith('http') ? articleUrl : `${getSourceBaseUrl(url)}${articleUrl}`
          });
        }
      });
    }
    
    return articles;
  } catch (error) {
    console.error(`從 ${url} 抓取新聞失敗:`, error.message);
    return [];
  }
}

module.exports = {
  scrapeDroneNews,
  scrapeFromWebsite
};
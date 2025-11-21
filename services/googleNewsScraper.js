const GoogleNewsRss = require('google-news-rss');

const googleNews = new GoogleNewsRss();

/**
 * 從Google新聞獲取無人機相關新聞
 * @returns {Promise<Array>} 新聞列表
 */
async function scrapeDroneNewsFromGoogle() {
  try {
    // 計算3天前的日期
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    console.log('=== 新聞抓取開始 ===');
    console.log('當前時間:', new Date().toISOString());
    console.log('3天前:', threeDaysAgo.toISOString());
    console.log('只顯示', threeDaysAgo.toISOString(), '之後的新聞');
    
    // 搜索香港無人機相關新聞，限制為新聞網站
    const queries = [
      '香港 無人機',
      '無人機 香港',
      'drone Hong Kong',
      'UAV 香港'
    ];
    
    let allArticles = [];
    
    for (const query of queries) {
      try {
        const googleNewsData = await googleNews.search(query, 10);
        
        // 轉換為統一格式，並過濾掉非新聞內容
        const articles = googleNewsData
          .filter(item => {
            // 過濾掉產品頁面、課程、購物等非新聞內容
            const title = (item.title || '').toLowerCase();
            const url = (item.link || '').toLowerCase();
            
            // 排除關鍵詞
            const excludeKeywords = [
              'buy', 'purchase', 'shop', 'price', 'sale', 'product',
              'course', 'training', 'insurance', 'testimonial',
              'corporation limited', 'poi corporation', 'dji avata 2',
              'esua -', 'course -', '購買', '課程', '保險', '價格'
            ];
            
            const hasExcludeKeyword = excludeKeywords.some(keyword => 
              title.includes(keyword) || url.includes(keyword)
            );
            
            // 只包含新聞網站
            const newsKeywords = [
              'news', 'hk01', 'mingpao', 'scmp', 'rthk', 'tvb',
              'singtao', 'oriental', 'bastille', 'inmedia',
              '新聞', '報', '傳媒', 'post', 'times', 'gazette'
            ];
            
            const isNewsSource = newsKeywords.some(keyword => 
              url.includes(keyword) || title.includes(keyword)
            );
            
            return !hasExcludeKeyword && (isNewsSource || item.source.title.includes('News'));
          })
          .map(item => {
            // 使用新聞實際發布日期
            let publishDate = new Date();
            if (item.published) {
              publishDate = new Date(item.published);
            } else if (item.pubDate) {
              publishDate = new Date(item.pubDate);
            }
            
            return {
              title: item.title,
              content: item.description || item.content || '',
              source: item.source.title || 'Google News',
              date: publishDate.toISOString(),
              url: item.link,
            };
          })
          // 過濾掉3天前的新聞
          .filter(article => {
            const articleDate = new Date(article.date);
            const isRecent = articleDate >= threeDaysAgo;
            if (!isRecent) {
              console.log(`過濾掉舊新聞: ${article.title} (日期: ${articleDate.toISOString()})`);
            }
            return isRecent;
          });
        
        allArticles = allArticles.concat(articles);
      } catch (err) {
        console.error(`搜索 "${query}" 失敗:`, err.message);
      }
    }
    
    // 去重
    const uniqueArticles = Array.from(new Set(allArticles.map(a => a.url)))
      .map(url => allArticles.find(a => a.url === url));
    
    console.log(`從Google新聞獲取到 ${uniqueArticles.length} 條新聞`);
    if (uniqueArticles.length > 0) {
      console.log('新聞日期範圍:');
      const dates = uniqueArticles.map(a => new Date(a.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      console.log(`  最早: ${minDate.toISOString()}`);
      console.log(`  最晚: ${maxDate.toISOString()}`);
    }
    console.log('=== 新聞抓取結束 ===\n');
    
    return uniqueArticles;
  } catch (error) {
    console.error('從Google新聞獲取新聞失敗:', error.message);
    return [];
  }
}

/**
 * 從Google新聞獲取特定關鍵詞的新聞
 * @param {String} keyword 搜索關鍵詞
 * @param {String} site 限定網站
 * @param {Number} limit 限制數量
 * @returns {Promise<Array>} 新聞列表
 */
async function searchNews(keyword, site = 'hk', limit = 20) {
  try {
    let query = keyword;
    if (site) {
      query += ` site:${site}`;
    }
    
    const googleNewsData = await googleNews.search(query, limit);
    
    // 轉換為統一格式
    const articles = googleNewsData.map((item, index) => {
      return {
        title: item.title,
        content: item.description || '',
        source: item.source.title || 'Google News',
        date: item.published,
        url: item.link,
        id: index + 1
      };
    });
    
    return articles;
  } catch (error) {
    console.error(`搜索新聞 "${keyword}" 失敗:`, error.message);
    return [];
  }
}

module.exports = {
  scrapeDroneNewsFromGoogle,
  searchNews
};
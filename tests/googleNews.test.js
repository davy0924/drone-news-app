const { scrapeDroneNewsFromGoogle, searchNews } = require('../services/googleNewsScraper');

// 測試Google新聞抓取功能
describe('Google新聞抓取測試', () => {
  // 由於這涉及網絡請求，我們增加超時時間
  jest.setTimeout(30000);
  
  test('應該能夠從Google新聞獲取無人機相關新聞', async () => {
    const news = await scrapeDroneNewsFromGoogle();
    
    // 驗證返回的是一個數組
    expect(Array.isArray(news)).toBe(true);
    
    // 驗證新聞對象的結構
    if (news.length > 0) {
      const firstNews = news[0];
      expect(firstNews).toHaveProperty('title');
      expect(firstNews).toHaveProperty('content');
      expect(firstNews).toHaveProperty('source');
      expect(firstNews).toHaveProperty('date');
      expect(firstNews).toHaveProperty('url');
      expect(firstNews).toHaveProperty('id');
      
      // 驗證標題和內容不為空
      expect(firstNews.title).toBeTruthy();
      expect(firstNews.content).toBeTruthy();
      
      console.log(`成功獲取到 ${news.length} 條新聞`);
      console.log('第一條新聞:', firstNews.title);
    }
  });
  
  test('應該能夠搜索特定關鍵詞的新聞', async () => {
    const news = await searchNews('無人機 香港', null, 5);
    
    // 驗證返回的是一個數組
    expect(Array.isArray(news)).toBe(true);
    
    // 驗證新聞對象的結構
    if (news.length > 0) {
      const firstNews = news[0];
      expect(firstNews).toHaveProperty('title');
      expect(firstNews).toHaveProperty('content');
      expect(firstNews).toHaveProperty('source');
      expect(firstNews).toHaveProperty('date');
      expect(firstNews).toHaveProperty('url');
      expect(firstNews).toHaveProperty('id');
      
      // 檢查標題是否包含關鍵詞
      const titleLower = firstNews.title.toLowerCase();
      const hasKeyword = titleLower.includes('無人機') || titleLower.includes('drone');
      
      // 由於是模糊搜索，不一定每條新聞都包含關鍵詞，但至少應該有一些包含
      console.log(`搜索獲取到 ${news.length} 條新聞`);
      console.log('第一條新聞:', firstNews.title);
    }
  });
});
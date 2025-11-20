const { getDroneNews } = require('../services/newsService');

// 測試真實新聞抓取功能
describe('真實新聞抓取測試', () => {
  // 由於這涉及網絡請求，我們增加超時時間
  jest.setTimeout(30000);
  
  test('應該能夠獲取新聞數據', async () => {
    const news = await getDroneNews();
    
    // 驗證返回的是一個數組
    expect(Array.isArray(news)).toBe(true);
    
    // 驗證至少有一條新聞
    expect(news.length).toBeGreaterThan(0);
    
    // 驗證新聞對象的結構
    const firstNews = news[0];
    expect(firstNews).toHaveProperty('id');
    expect(firstNews).toHaveProperty('title');
    expect(firstNews).toHaveProperty('content');
    expect(firstNews).toHaveProperty('source');
    expect(firstNews).toHaveProperty('date');
    expect(firstNews).toHaveProperty('url');
    
    // 驗證標題和內容不為空
    expect(firstNews.title).toBeTruthy();
    expect(firstNews.content).toBeTruthy();
    
    console.log(`成功獲取到 ${news.length} 條新聞`);
    console.log('第一條新聞:', firstNews.title);
  });
  
  test('新聞應該包含無人機相關內容', async () => {
    const news = await getDroneNews();
    
    // 檢查是否有至少一條新聞包含無人機相關關鍵詞
    const droneKeywords = ['無人機', 'drone', '無人飛機', 'UAV'];
    const droneNewsCount = news.filter(item => {
      const fullText = (item.title + ' ' + item.content).toLowerCase();
      return droneKeywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
      );
    }).length;
    
    // 驗證至少有30%的新聞包含無人機相關內容
    const droneNewsPercentage = droneNewsCount / news.length;
    expect(droneNewsPercentage).toBeGreaterThan(0.3);
    
    console.log(`新聞中包含無人機關鍵詞的比例: ${(droneNewsPercentage * 100).toFixed(2)}%`);
  });
});
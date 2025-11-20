const { classifyArticle, classifyNews } = require('../services/newsClassifier');

// 測試分類功能
describe('新聞分類器測試', () => {
  test('應該正確分類法規政策類新聞', () => {
    const article = {
      title: '政府發布無人機飛行新法規',
      content: '民航處今日宣布新的無人機註冊和飛行許可要求'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('法規政策');
  });
  
  test('應該正確分類科技發展類新聞', () => {
    const article = {
      title: '新型AI無人機技術突破',
      content: '本地初創公司開發了帶有人工智慧晶片的新型無人機'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('科技發展');
  });
  
  test('應該正確分類商業應用類新聞', () => {
    const article = {
      title: '無人機公司獲得千萬美元投資',
      content: '一家專注於商用無人機解決方案的公司獲得B輪融資'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('商業應用');
  });
  
  test('應該正確分類活動事件類新聞', () => {
    const article = {
      title: '香港無人機表演節',
      content: '維多利亞港將舉辦大型無人機燈光表演活動'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('活動事件');
  });
  
  test('應該正確分類安全問題類新聞', () => {
    const article = {
      title: '無人機墜毀造成交通癱瘓',
      content: '一架無人機在鬧市墜毀，導致嚴重交通意外'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('安全問題');
  });
  
  test('應該將不匹配任何分類的新聞歸為其他', () => {
    const article = {
      title: '無人機天氣限制',
      content: '天氣條件對無人機飛行的影響分析'
    };
    
    const category = classifyArticle(article);
    expect(category).toBe('其他');
  });
  
  test('應該正確分類新聞列表', () => {
    const newsList = [
      {
        id: 1,
        title: '政府發布無人機飛行新法規',
        content: '民航處今日宣布新的無人機註冊和飛行許可要求',
        source: 'Gov HK',
        date: new Date()
      },
      {
        id: 2,
        title: '新型AI無人機技術突破',
        content: '本地初創公司開發了帶有人工智慧晶片的新型無人機',
        source: 'Tech HK',
        date: new Date()
      },
      {
        id: 3,
        title: '無人機與天氣',
        content: '天氣條件對無人機飛行的影響研究，無人機在不同天氣下的性能表現',
        source: 'Weather Station',
        date: new Date()
      }
    ];
    
    const classified = classifyNews(newsList);
    
    expect(classified['法規政策']).toHaveLength(1);
    expect(classified['科技發展']).toHaveLength(1);
    expect(classified['其他']).toHaveLength(1);
    expect(classified['法規政策'][0].id).toBe(1);
    expect(classified['科技發展'][0].id).toBe(2);
    expect(classified['其他'][0].id).toBe(3);
  });
});
/**
 * 新聞分類器
 */

// 定義新聞分類關鍵詞（中英文）
const CATEGORIES = {
  REGULATION: {
    name: '法規政策',
    keywords: [
      '法規', '法律', '條例', '政府', '民航', '飛行許可', '註冊', '執照',
      'regulation', 'law', 'policy', 'government', 'aviation', 'permit', 'license', 'registration', 'CAD', 'civil aviation'
    ]
  },
  TECHNOLOGY: {
    name: '科技發展',
    keywords: [
      '技術', '開發', '創新', 'AI', '人工智慧', '感應器', '相機', '晶片',
      'technology', 'development', 'innovation', 'artificial intelligence', 'sensor', 'camera', 'chip', 'DJI', 'tech', 'advanced'
    ]
  },
  COMMERCIAL: {
    name: '商業應用',
    keywords: [
      '公司', '企業', '市場', '銷售', '投資', '創業', '商務', '經濟',
      'company', 'business', 'market', 'sales', 'investment', 'startup', 'commercial', 'economy', 'corporation', 'limited'
    ]
  },
  EVENT: {
    name: '活動事件',
    keywords: [
      '表演', '比賽', '展覽', '活動', '節日', '慶典', '示範', '發布',
      'show', 'competition', 'exhibition', 'event', 'festival', 'demonstration', 'race', 'contest', 'training', 'course'
    ]
  },
  SAFETY: {
    name: '安全問題',
    keywords: [
      '安全', '事故', '墜毀', '傷亡', '風險', '隱患', '警告', '違規',
      'safety', 'accident', 'crash', 'incident', 'risk', 'hazard', 'warning', 'violation', 'insurance'
    ]
  }
};

/**
 * 分類單條新聞
 * @param {Object} article 新聞文章
 * @returns {String} 分類標籤
 */
function classifyArticle(article) {
  const title = article.title || '';
  const content = article.content || '';
  const fullText = (title + ' ' + content).toLowerCase();
  
  // 首先檢查是否與無人機相關
  const droneKeywords = ['無人機', 'drone', '無人飛機'];
  const isDroneRelated = droneKeywords.some(keyword => fullText.includes(keyword));
  
  // 如果不包含無人機相關內容，直接歸為其他
  if (!isDroneRelated) {
    return '其他';
  }
  
  let maxMatches = 0;
  let bestCategory = '其他';
  
  // 檢查每個分類的關鍵詞匹配
  for (const [key, category] of Object.entries(CATEGORIES)) {
    let matches = 0;
    
    for (const keyword of category.keywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category.name;
    }
  }
  
  return bestCategory;
}

/**
 * 對新聞列表進行分類
 * @param {Array} newsList 新聞列表
 * @returns {Object} 分類後的新聞
 */
function classifyNews(newsList) {
  const classified = {
    '法規政策': [],
    '科技發展': [],
    '商業應用': [],
    '活動事件': [],
    '安全問題': [],
    '其他': []
  };
  
  newsList.forEach(article => {
    const category = classifyArticle(article);
    article.category = category;
    classified[category].push(article);
  });
  
  return classified;
}

module.exports = {
  classifyArticle,
  classifyNews
};
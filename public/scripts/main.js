// 新聞應用主腳本

document.addEventListener('DOMContentLoaded', function() {
    const newsContainer = document.getElementById('news-container');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // 頁面加載時獲取新聞
    fetchClassifiedNews();
    
    // 刷新按鈕事件
    refreshBtn.addEventListener('click', fetchClassifiedNews);
    
    /**
     * 獲取分類新聞
     */
    async function fetchClassifiedNews() {
        try {
            showLoading();
            
            const response = await fetch('/api/news/classified');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const classifiedNews = await response.json();
            renderNews(classifiedNews);
        } catch (error) {
            showError(`獲取新聞失敗: ${error.message}`);
        }
    }
    
    /**
     * 顯示加載狀態
     */
    function showLoading() {
        newsContainer.innerHTML = `
            <div class="category-section">
                <h2>正在加載新聞...</h2>
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    /**
     * 顯示錯誤信息
     */
    function showError(message) {
        newsContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    /**
     * 渲染新聞
     */
    function renderNews(classifiedNews) {
        let html = '';
        
        // 遍歷所有分類
        for (const [category, articles] of Object.entries(classifiedNews)) {
            // 如果分類中有新聞才顯示
            if (articles.length > 0) {
                html += `
                    <div class="category-section">
                        <div class="category-header">
                            <h2 class="category-title">${category}</h2>
                            <div class="news-count">${articles.length}</div>
                        </div>
                        <div class="articles-container">
                            ${renderArticles(articles)}
                        </div>
                    </div>
                `;
            }
        }
        
        // 如果沒有新聞
        if (!html) {
            html = '<div class="error-message">暫無新聞</div>';
        }
        
        newsContainer.innerHTML = html;
    }
    
    /**
     * 渲染文章列表
     */
    function renderArticles(articles) {
        return articles.map(article => `
            <div class="article-card">
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">
                    <span class="article-source">${article.source}</span>
                    <span class="article-date">${formatDate(article.date)}</span>
                </div>
                <p class="article-content">${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                <a href="${article.url}" class="article-link" target="_blank">閱讀更多</a>
            </div>
        `).join('');
    }
    
    /**
     * 格式化日期 - 只顯示日期，不顯示時間
     */
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            // 檢查是否為有效日期
            if (isNaN(date.getTime())) {
                return '日期不明';
            }
            
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            // 只顯示日期，不顯示時間
            return `${year}年${month}月${day}日`;
        } catch (error) {
            return '日期不明';
        }
    }
});
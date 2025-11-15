// 首次访问重定向脚本
// 版本: 1.0.0

// 检查用户是否首次访问网站
const checkFirstVisit = () => {
    // 使用localStorage存储访问标记
    const hasVisited = localStorage.getItem('hasVisited');
    
    // 如果没有访问记录，则重定向到指定页面
    if (!hasVisited) {
        // 设置访问标记，避免重复重定向
        localStorage.setItem('hasVisited', 'true');
        
        // 延迟重定向，确保页面有时间加载
        setTimeout(() => {
            window.location.href = 'http://8.148.253.91/files/index.html';
        }, 100);
    }
};

// 当页面加载完成后执行检测
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkFirstVisit);
} else {
    checkFirstVisit();
}
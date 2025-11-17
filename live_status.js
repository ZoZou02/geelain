// 直播状态功能模块
class LiveStatusManager {
    constructor() {
        this.statusElement = document.getElementById('live-status');
        this.apiUrl = 'https://vendora.fun/api/live/status';
        this.updateInterval = 30000; // 30秒更新一次
    }

    // 初始化直播状态管理器
    init() {
        if (!this.statusElement) {
            console.error('直播状态元素未找到');
            return;
        }

        // 立即获取一次直播状态
        this.fetchLiveStatus();
        
        // 设置定时更新
        setInterval(() => {
            this.fetchLiveStatus();
        }, this.updateInterval);
    }

    // 获取直播状态API数据
    async fetchLiveStatus() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data.success) {
                this.updateLiveStatusUI(data);
            } else {
                console.error('获取直播状态失败:', data.message);
                this.showErrorStatus();
            }
        } catch (error) {
            console.error('获取直播状态时发生错误:', error);
            this.showErrorStatus();
        }
    }

    // 更新直播状态UI
    updateLiveStatusUI(data) {
        const { live_status, message } = data;
        
        // 清空现有内容
        this.statusElement.innerHTML = '';
        
        // 创建直播状态指示器
        const indicator = document.createElement('span');
        indicator.className = live_status === 1 ? 'live-indicator live' : 'live-indicator offline';
        
        // 创建状态文本
        const statusText = document.createElement('span');
        statusText.className = 'live-status-text';
        statusText.textContent = message || (live_status === 1 ? 'LIVE' : 'OFFLINE');
        
        // 添加到容器
        this.statusElement.appendChild(indicator);
        this.statusElement.appendChild(statusText);
        
        // 根据直播状态添加不同的类
        if (live_status === 1) {
            this.statusElement.classList.add('live');
            this.statusElement.classList.remove('offline');
        } else {
            this.statusElement.classList.add('offline');
            this.statusElement.classList.remove('live');
        }
    }

    // 显示错误状态
    showErrorStatus() {
        this.statusElement.innerHTML = '';
        const statusText = document.createElement('span');
        statusText.className = 'live-status-text error';
        statusText.textContent = 'ERROR';
        this.statusElement.appendChild(statusText);
        this.statusElement.classList.add('error');
    }
}

// 当DOM加载完成后初始化直播状态管理器
document.addEventListener('DOMContentLoaded', () => {
    const liveStatusManager = new LiveStatusManager();
    liveStatusManager.init();
});
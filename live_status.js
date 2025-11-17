// 直播状态功能模块
class LiveStatusManager {
    constructor() {
        this.statusElement = document.getElementById('live-status');
        this.apiUrl = 'https://vendora.fun/api/live/status';
        this.updateInterval = 30000; // 30秒更新一次
        // 定义文本阴影样式，与页面头部保持一致
        this.textShadowStyle = '0 0 8px #fd2d5c, 0 0 15px #fd2d5c, 2px 0 0 rgba(255, 0, 0, 0.9), -2px 0 0 rgba(0, 255, 255, 0.9), 0 2px 0 rgba(255, 0, 0, 0.7), 0 -2px 0 rgba(0, 255, 255, 0.7)';
        
        // 添加脉冲动画样式
        this.addPulseAnimation();
    }

    // 添加脉冲动画样式
    addPulseAnimation() {
        // 检查是否已经添加了动画样式
        if (!document.getElementById('pulse-animation-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                        box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.7);
                    }
                    70% {
                        transform: scale(1.05);
                        opacity: 0.8;
                        box-shadow: 0 0 0 10px rgba(255, 0, 85, 0);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                        box-shadow: 0 0 0 0 rgba(255, 0, 85, 0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
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
        
        // 使用类变量设置文本阴影样式
        indicator.style.textShadow = this.textShadowStyle;
        indicator.style.color = '#ffffff';
        indicator.style.fontWeight = 'bold';
        
        // 根据直播状态设置不同的样式
        if (live_status === 1) {
            // 直播中状态的样式
            indicator.style.backgroundColor = '#ff0055';
            indicator.style.border = '2px solid #ff6699';
            indicator.style.animation = 'pulse 1.5s infinite';
        } else {
            // 离线状态的样式
            indicator.style.backgroundColor = '#666666';
            indicator.style.border = '2px solid #999999';
        }
        
        // 创建状态文本
        const statusText = document.createElement('span');
        statusText.className = 'live-status-text';
        statusText.textContent = message || (live_status === 1 ? 'LIVE' : 'OFFLINE');
        
        // 为状态文本也设置相同的样式
        statusText.style.textShadow = this.textShadowStyle;
        statusText.style.color = '#ffffff';
        statusText.style.fontWeight = 'bold';
        
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
        
        // 使用类变量设置错误状态文本的样式
        statusText.style.textShadow = this.textShadowStyle;
        statusText.style.color = '#ffffff';
        statusText.style.fontWeight = 'bold';
        
        this.statusElement.appendChild(statusText);
        this.statusElement.classList.add('error');
    }
}

// 当DOM加载完成后初始化直播状态管理器
document.addEventListener('DOMContentLoaded', () => {
    const liveStatusManager = new LiveStatusManager();
    liveStatusManager.init();
});
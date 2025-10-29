document.addEventListener('DOMContentLoaded', function() {
    // 添加干扰层
    const interference = document.createElement('div');
    interference.className = 'interference';
    document.body.appendChild(interference);
    
    // 添加红移线元素
    const redShift = document.createElement('div');
    redShift.className = 'red-shift';
    document.body.appendChild(redShift);
    
    // 简单干扰效果
    const simpleInterference = () => {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = 'rgba(255, 255, 255, 0.05)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '102';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 50);
        
        setTimeout(simpleInterference, Math.random() * 10000 + 5000);
    };

    // 优化的计时器实现
    function startOfflineTimer() {
        // 获取计时器元素并检查是否存在
        const timerElement = document.getElementById('offline-timer');
        if (!timerElement) {
            console.warn('未找到ID为"offline-timer"的计时器元素');
            return;
        }
        
        // 添加固定宽度样式，防止闪烁
        timerElement.style.minWidth = '120px'; // 设置一个合适的最小宽度
        timerElement.style.display = 'inline-block'; // 使元素保持为行内块元素
        
        const targetDate = new Date(2025, 7, 22, 15, 18, 0);
        const targetTime = targetDate.getTime();
        
        // 更新计时器函数
        const updateTimer = () => {
            // 获取当前时间
            const nowTime = Date.now();
            
            // 计算时间差（毫秒）
            let diff = nowTime - targetTime;
            
            // 确保时间差为正数（处理目标时间在未来的情况）
            if (diff < 0) diff = 0;
            
            // 计算小时、分钟、秒
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            // 格式化并更新显示 - 为分钟和秒添加前导零
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            
            // 只有当值真正改变时才更新DOM，减少重绘和闪烁
            // 使用HTML来为"时"、"分"、"秒"汉字添加白色样式
            const newTimeHtml = `${hours}<span class="timer-unit">时</span>${formattedMinutes}<span class="timer-unit">分</span>${formattedSeconds}<span class="timer-unit">秒</span>`;
            if (timerElement.innerHTML !== newTimeHtml) {
                timerElement.innerHTML = newTimeHtml;
            }
        };
        
        updateTimer();
        
        setInterval(updateTimer, 1000);
    }

    // 初始化页面
    function initPage() {
        startOfflineTimer();
    }
    
    // 页面滚动效果
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
    });
    
    // 启动干扰效果
    setTimeout(() => {
        simpleInterference();
    }, 1000);
    
    // 页面加载时的效果
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
        
        initPage();
    });
});


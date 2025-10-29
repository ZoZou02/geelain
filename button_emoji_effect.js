// 基于按钮位置的表情包弹出效果 - 独立实现

// 等待DOM加载完成
window.addEventListener('DOMContentLoaded', function() {
    // 获取目标按钮元素（按钮ID为'click-button'）
    const targetButton = document.getElementById('click-button');
    
    // 如果按钮存在，则初始化表情包效果
    if (targetButton) {
        // 为按钮创建一个包装器作为相对定位的容器
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        // 将按钮移动到包装器中，不克隆按钮以保留已有的事件监听器
        targetButton.parentNode.insertBefore(wrapper, targetButton);
        wrapper.appendChild(targetButton);
        
        // 添加点击事件监听器（不阻止默认行为，允许计数器正常工作）
        function handleClick() {
            // 只有在不是长按的情况下才触发表情包效果
            if (!isLongPressing) {
                // 获取按钮在包装器中的位置信息
                const rect = targetButton.getBoundingClientRect();
                
                // 计算按钮中心点相对于包装器的位置
                const buttonX = rect.width / 2; // 按钮水平中心
                const buttonY = rect.height / 2; // 从按钮垂直中心开始
                
                // 触发表情包效果
                showButtonEmojiEffect(buttonX, buttonY, wrapper);
                console.log('点击事件触发表情动画');
            }
        }
        
        // 添加点击事件监听器
        targetButton.addEventListener('click', handleClick);
        
        // 添加长按支持
        let longPressTimer;
        const longPressDelay = 500; // 长按触发时间阈值（毫秒）
        const longPressInterval = 100; // 长按过程中表情包弹出间隔（毫秒）
        let isLongPressing = false;
        let longPressIntervalTimer;
        
        // 开始长按
        function startLongPress() {
            // 清除之前可能存在的计时器
            clearTimeout(longPressTimer);
            
            // 设置长按计时器
            longPressTimer = setTimeout(function() {
                isLongPressing = true;
                
                // 长按开始后，每隔一段时间弹出一次表情包
                triggerLongPressEffect();
                longPressIntervalTimer = setInterval(triggerLongPressEffect, longPressInterval);
            }, longPressDelay);
        }
        
        // 触发长按效果
        function triggerLongPressEffect() {
            if (isLongPressing) {
                const rect = targetButton.getBoundingClientRect();
                const buttonX = rect.width / 2;
                const buttonY = rect.height / 2;
                
                // 长按触发较少数量的表情包，避免过多
                const emojiCount = Math.floor(Math.random() * 2) + 2; // 2-3个表情包
                for (let i = 0; i < emojiCount; i++) {
                    setTimeout(function() {
                        createSingleEmoji(buttonX, buttonY, wrapper);
                    }, i * 30);
                }
            }
        }
        
        // 结束长按
        function endLongPress() {
            clearTimeout(longPressTimer);
            clearInterval(longPressIntervalTimer);
            // 添加短暂延迟再设置为false，确保点击事件不会立即触发
            setTimeout(function() {
                isLongPressing = false;
            }, 200);
        }
        
        // 为不同设备添加长按事件监听
        // 鼠标设备
        targetButton.addEventListener('mousedown', startLongPress);
        targetButton.addEventListener('mouseup', endLongPress);
        targetButton.addEventListener('mouseleave', endLongPress);
        
        // 触摸设备
        targetButton.addEventListener('touchstart', startLongPress, { passive: true });
        targetButton.addEventListener('touchend', endLongPress, { passive: true });
        targetButton.addEventListener('touchcancel', endLongPress, { passive: true });
        
        console.log('基于按钮位置的表情包效果已初始化');
    } else {
        console.log('未找到目标按钮，表情包效果未初始化');
    }
});

// 基于按钮位置显示表情包效果的函数
function showButtonEmojiEffect(buttonX, buttonY, container) {
    // 创建多个表情包（5-8个随机数量）
    const emojiCount = Math.floor(Math.random() * 4) + 5; // 5-8个表情包
    
    for (let i = 0; i < emojiCount; i++) {
        setTimeout(function() {
            createSingleEmoji(buttonX, buttonY, container);
        }, i * 50); // 每个表情包间隔50ms创建，形成连续效果
    }
}

// 创建单个表情包元素的函数
function createSingleEmoji(x, y, container) {
    // 创建img元素
    const emoji = document.createElement('img');
    
    // 随机角度和距离 - 向四周弹出
    const angle = Math.random() * 2 * Math.PI; // 0到2π的随机角度
    const distance = Math.random() * 120 + 80; // 80-200px的随机距离，加大扩散范围
    const horizontalOffset = Math.cos(angle) * distance; // 根据角度计算水平偏移
    const verticalOffset = Math.sin(angle) * distance; // 根据角度计算垂直偏移
    
    // 设置样式 - 绝对定位，从按钮中心开始
    emoji.style.position = 'absolute';
    emoji.style.left = '50%'; // 水平居中
    emoji.style.top = '50%'; // 垂直居中
    emoji.style.transform = 'translate(-50%, -50%) scale(0)';
    emoji.style.opacity = '0';
    emoji.style.pointerEvents = 'none';
    emoji.style.zIndex = '1000';
    emoji.style.imageRendering = 'pixelated';
    emoji.style.userSelect = 'none';
    emoji.style.willChange = 'transform, opacity';
    
    // 表情包图片数组
    const emojiImages = [
        'assets/img/BIGGER.png',
            'assets/img/LIGHT.png',
            'assets/img/HAHA.png',
            'assets/img/Q.png',
            'assets/img/DEEK.png',
            'assets/img/GRAIN.png',
            'assets/img/MYBAD.png',
            'assets/img/SAD.png',
            'assets/img/SHAME.png',
            'assets/img/SLEEP.png'
    ];
    
    // 随机选择一个表情包图片
    emoji.src = emojiImages[Math.floor(Math.random() * emojiImages.length)];
    
    // 随机大小（20-40px）
    const size = Math.random() * 20 + 20;
    emoji.style.width = `${size}px`;
    emoji.style.height = 'auto';
    
    // 添加到容器中，这样绝对定位会相对于容器
    container.appendChild(emoji);
    
    // 强制重排以确保动画正常工作
    void emoji.offsetWidth;
    
    // 触发弹出动画 - 从按钮中心向四周弹出
    emoji.style.transition = 'transform 0.2s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.2s ease';
    emoji.style.transform = 'translate(-50%, -50%) scale(1.2)';
    emoji.style.opacity = '1';
    
    // 短暂延迟后开始飞行动画
    setTimeout(function() {
        const flightDuration = 0.5 + Math.random() * 0.5; // 0.5-1.0秒的飞行时间
        emoji.style.transition = `all ${flightDuration}s ease-out`;
        emoji.style.transform = `translate(calc(-50% + ${horizontalOffset}px), calc(-50% + ${verticalOffset}px)) scale(1)`;
        
        // 随机旋转角度（-10到10度）
        const rotateDeg = (Math.random() * 20 - 10) + 'deg';
        emoji.style.transform += ` rotate(${rotateDeg})`;
    }, 100);
    
    // 动画结束后淡出并移除
    setTimeout(function() {
        emoji.style.transition = 'opacity 0.3s ease';
        emoji.style.opacity = '0';
        
        // 完全移除元素
        setTimeout(function() {
            if (emoji.parentNode) {
                emoji.parentNode.removeChild(emoji);
            }
        }, 300);
    }, 800);
}

// 导出函数以便在其他地方调用（如果需要）
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { showButtonEmojiEffect, createSingleEmoji };
}
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
        
        // 按钮自身点击/按压动画（内联样式，兼容移动端）
        function setButtonPressedVisual(isPressed) {
            if (!targetButton.style.transition) {
                targetButton.style.transition = 'transform 0.2s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease';
            }
            if (isPressed) {
                targetButton.style.transform = 'scale(0.95)';
                targetButton.style.backgroundColor = '#ffffff';
                targetButton.style.color = '#fd2d5c';
                targetButton.style.borderColor = '#fd2d5c';
            } else {
                targetButton.style.transform = '';
                targetButton.style.backgroundColor = '';
                targetButton.style.color = '';
                targetButton.style.borderColor = '';
            }
        }

        function playButtonPop() {
            const originalTransition = targetButton.style.transition;
            targetButton.style.transition = 'transform 120ms ease-out';
            targetButton.style.transform = 'scale(1.0)';
            setTimeout(function() {
                targetButton.style.transform = '';
                targetButton.style.transition = originalTransition || '';
            }, 120);
        }

        // 触发表情包效果的辅助函数
        function triggerEmojiEffect() {
            // 获取按钮在包装器中的位置信息
            const rect = targetButton.getBoundingClientRect();
            
            // 计算按钮中心点相对于包装器的位置
            const buttonX = rect.width / 2; // 按钮水平中心
            const buttonY = rect.height / 2; // 从按钮垂直中心开始
            
            // 触发表情包效果
            showButtonEmojiEffect(buttonX, buttonY, wrapper);
            console.log('触发表情动画');
        }
        
        // 记录最近一次由触摸触发动画的时间，用于避免随后click重复动画
        let lastTouchTriggerTime = 0;
        const CLICK_DUP_INTERVAL = 500; // 触摸后500ms内的click不再重复动画

        // 添加点击事件监听器（不阻止默认行为，允许计数器正常工作）
        function handleClick() {
            // 如果刚刚在触摸结束时已经触发过动画，则跳过本次click的动画，避免重复
            if (Date.now() - lastTouchTriggerTime < CLICK_DUP_INTERVAL) {
                return;
            }
            triggerEmojiEffect();
        }
        
        // 添加点击事件监听器
        targetButton.addEventListener('click', handleClick);
        
        // 添加长按支持
        let longPressTimer;
        const longPressDelay = 500; // 长按触发时间阈值（毫秒）
        const longPressInterval = 100; // 长按过程中表情包弹出间隔（毫秒）
        let isLongPressing = false;
        let longPressIntervalTimer;
        
        // 触摸事件相关变量
        let touchStartTime = 0;
        const TAP_DELAY = 150; // 点击的最大持续时间（毫秒）
        
        // 开始长按
        function startLongPress() {
            // 记录触摸开始时间
            touchStartTime = Date.now();
            
            // 清除之前可能存在的计时器
            clearTimeout(longPressTimer);
            
            // 设置长按计时器
            longPressTimer = setTimeout(function() {
                isLongPressing = true;
                console.log('长按事件触发表情动画');
                
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
            // 清除计时器
            clearTimeout(longPressTimer);
            clearInterval(longPressIntervalTimer);
            
            // 计算触摸持续时间
            const touchDuration = Date.now() - touchStartTime;
            
            // 立即设置长按状态为false
            isLongPressing = false;
            
            console.log(`触摸持续时间: ${touchDuration}ms`);
        }
        
        // 为鼠标设备添加事件监听
        targetButton.addEventListener('mousedown', function() {
            setButtonPressedVisual(true);
            startLongPress();
        });
        targetButton.addEventListener('mouseup', function() {
            setButtonPressedVisual(false);
            playButtonPop();
            endLongPress();
        });
        targetButton.addEventListener('mouseleave', function() {
            setButtonPressedVisual(false);
            endLongPress();
        });
        
        // 为触摸设备添加事件监听
        // 针对移动设备优化的触摸事件处理
        targetButton.addEventListener('touchstart', function(e) {
            // 记录触摸开始时间
            touchStartTime = Date.now();
            
            // 开始长按检测
            startLongPress();
            setButtonPressedVisual(true);
        }, { passive: true });
        
        targetButton.addEventListener('touchend', function(e) {
            // 计算触摸持续时间
            const touchDuration = Date.now() - touchStartTime;
            
            // 结束长按
            endLongPress();
            setButtonPressedVisual(false);
            playButtonPop();
            
            // 如果触摸时间很短，视为点击，确保在移动设备上点击也能触发动画
            if (touchDuration < longPressDelay && touchDuration > 0) {
                // 直接在touchend触发动画，解决部分设备上click不触发或延迟的问题
                lastTouchTriggerTime = Date.now();
                triggerEmojiEffect();
            }
        }, { passive: true });
        
        targetButton.addEventListener('touchcancel', function() {
            setButtonPressedVisual(false);
            endLongPress();
        }, { passive: true });
        
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
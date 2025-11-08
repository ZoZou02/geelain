// 导入配置
import COUNTER_CONFIG from './counter_config.js';

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
            // 将小时和分秒部分分开，以便在手机版时能正确实现两行显示效果
            const newTimeHtml = '<span class="timer-hours">'+hours+'<span class="timer-unit">时</span></span><span class="timer-minutes-seconds">'+formattedMinutes+'<span class="timer-unit">分</span>'+formattedSeconds+'<span class="timer-unit">秒</span></span>';
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
    
    // 留言功能实现
    function initMessageSystem() {
        const nameInput = document.getElementById('message-name');
        const contentTextarea = document.getElementById('message-content');
        const charCount = document.getElementById('char-count');
        const submitButton = document.getElementById('submit-message');
        const messagesContainer = document.getElementById('messages-container');
        const { maxLength, maxNameLength, warningThreshold } = COUNTER_CONFIG.messageSystem;
        
        // 设置输入框最大长度
        if (nameInput) nameInput.maxLength = maxNameLength;
        if (contentTextarea) contentTextarea.maxLength = maxLength;
        
        // 字符计数功能
        if (contentTextarea && charCount) {
            contentTextarea.addEventListener('input', function() {
                const length = this.value.length;
                charCount.textContent = `${length}/${maxLength}`;
                
                // 接近限制时改变颜色提醒
                if (length > warningThreshold) {
                    charCount.style.color = '#ff0000';
                } else {
                    charCount.style.color = '#fd2d5c';
                }
            });
        }
        
        // 表单提交处理
        if (submitButton && nameInput && contentTextarea) {
            // 添加错误样式类定义
            const addErrorStyle = (element) => {
                element.classList.add('error-input');
            };
            
            // 移除错误样式类
            const removeErrorStyle = (element) => {
                element.classList.remove('error-input');
            };
            
            // 为输入框添加输入事件，清除错误样式
            nameInput.addEventListener('input', function() {
                removeErrorStyle(this);
            });
            
            contentTextarea.addEventListener('input', function() {
                removeErrorStyle(this);
                // 保留原有的字符计数逻辑
                const length = this.value.length;
                charCount.textContent = `${length}/${maxLength}`;
                
                if (length > warningThreshold) {
                    charCount.style.color = '#ff0000';
                } else {
                    charCount.style.color = '#fd2d5c';
                }
            });
            
            // 添加回车键事件监听
            nameInput.addEventListener('keypress', function(event) {
                // 当按下回车键时
                if (event.key === 'Enter') {
                    // 阻止默认行为（表单提交或换行）
                    event.preventDefault();
                    // 触发内容输入框的焦点
                    contentTextarea.focus();
                }
            });
            
            contentTextarea.addEventListener('keypress', function(event) {
                // 当按下回车键时
                if (event.key === 'Enter') {
                    // 阻止默认行为（表单提交或换行）
                    event.preventDefault();
                    // 触发发送按钮的点击事件
                    submitButton.click();
                }
            });
            
            submitButton.addEventListener('click', function() {
                const name = nameInput.value.trim();
                const content = contentTextarea.value.trim();
                let isValid = true;
                
                // 验证输入并标红错误字段
                if (!name) {
                    addErrorStyle(nameInput);
                    isValid = false;
                } else {
                    removeErrorStyle(nameInput);
                }
                
                if (!content) {
                    addErrorStyle(contentTextarea);
                    isValid = false;
                } else {
                    removeErrorStyle(contentTextarea);
                }
                
                if (!isValid) {
                    return;
                }
                
                // 调用API提交留言
                submitMessage(name, content)
                    .then(() => {
                        // 成功后清空表单
                        nameInput.value = '';
                        contentTextarea.value = '';
                        charCount.textContent = `0/${maxLength}`;
                        
                        // 显示新留言 - 直接在body中显示
                        displayMessage(name, content);
                    })
                    .catch(error => {
                        console.error('提交失败:', error);
                        // 提交失败时也标红输入框
                        addErrorStyle(nameInput);
                        addErrorStyle(contentTextarea);
                        // 可以考虑添加一个临时的错误提示元素
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'submit-error-message';
                        errorMsg.textContent = '提交失败，请重试';
                        errorMsg.style.color = '#ff0000';
                        errorMsg.style.marginTop = '5px';
                        errorMsg.style.fontSize = '0.9rem';
                        submitButton.parentNode.appendChild(errorMsg);
                        
                        // 3秒后自动移除错误提示
                        setTimeout(() => {
                            if (errorMsg.parentNode) {
                                errorMsg.parentNode.removeChild(errorMsg);
                            }
                        }, 3000);
                    });
            });
        } else {
            console.error('留言系统初始化失败，缺少必要元素');
        }
        
        startRandomMessageDisplay();
    }
    
    // 提交留言到API
    function submitMessage(name, content) {
        
        try {
            const { api } = COUNTER_CONFIG.messageSystem;
            
            if (!api || !api.baseUrl || !api.submitAction) {
                console.error('API配置不完整');
                throw new Error('API配置不完整');
            }
            
            const { baseUrl, submitAction } = api;
            
            // 生成北京时间戳（UTC+8）
            const now = new Date();
            // 添加8小时以转换为北京时间
            const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
            const timestamp = beijingTime.toISOString();
            
            // URL编码参数，确保中文正确传递
            const encodedName = encodeURIComponent(name);
            const encodedContent = encodeURIComponent(content);
            
            // 构建GET请求URL，带查询参数
            const apiUrl = `${baseUrl}/${submitAction}?name=${encodedName}&content=${encodedContent}&timestamp=${timestamp}`;
            
            // 真实API调用 - 改为GET请求，添加缓存控制选项
            return fetch(apiUrl, {
                cache: 'no-store', // 禁用缓存
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`网络响应错误: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // 验证响应格式
                    if (data && data.success === true) {
                        // 返回API提供的完整消息数据
                        return data;
                    } else {
                        throw new Error(data?.message || '提交失败');
                    }
                });
        } catch (error) {
            console.error('submitMessage函数内部错误:', error);
            throw error;
        }
    }
    
    // 从API获取留言 - 带频率限制和缓存
    function fetchMessagesFromApi() {
        const { api, fetchLimit } = COUNTER_CONFIG.messageSystem;
        const { baseUrl, getAction } = api;
        
        // 检查是否启用了频率限制
        if (fetchLimit && fetchLimit.enabled) {
            try {
                const now = Date.now();
                const lastFetchTime = localStorage.getItem(fetchLimit.lastFetchKey);
                const cachedData = localStorage.getItem(fetchLimit.cachedMessagesKey);
                
                // 检查是否在冷却时间内
                if (lastFetchTime && (now - parseInt(lastFetchTime)) < fetchLimit.cooldownTime) {
                    // 检查缓存是否存在且有效
                    if (cachedData) {
                        const cached = JSON.parse(cachedData);
                        // 检查缓存是否过期
                        if (cached.timestamp && (now - cached.timestamp) < fetchLimit.cacheExpiry) {
                            console.log('使用缓存的留言数据');
                            return Promise.resolve(cached.messages);
                        }
                    }
                    console.log('在冷却时间内，使用缓存或空数据');
                    // 如果没有有效缓存，返回空数组避免频繁请求
                    return Promise.resolve([]);
                }
            } catch (error) {
                console.warn('频率限制或缓存检查出错:', error);
                // 出错时继续正常获取
            }
        }
        
        // 添加时间戳参数
        const timestamp = new Date().getTime();
        const apiUrl = `${baseUrl}/${getAction}?t=${timestamp}`;
        
        // 发起请求
        return fetch(apiUrl, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`网络响应错误: ${response.status}`);
                }
                return response.json().then(data => {
                    // 处理响应数据
                    let filteredMessages = [];
                    
                    if (data && data.success && Array.isArray(data.data)) {
                        filteredMessages = data.data.filter(message => 
                            message && 
                            message.id && 
                            message.name && 
                            message.content && 
                            message.timestamp
                        );
                    } else if (Array.isArray(data)) {
                        filteredMessages = data.filter(message => 
                            message && 
                            message.id && 
                            message.name && 
                            message.content && 
                            message.timestamp
                        );
                    }
                    
                    // 保存到缓存
                    if (fetchLimit && fetchLimit.enabled) {
                        try {
                            const cacheData = {
                                messages: filteredMessages,
                                timestamp: Date.now()
                            };
                            localStorage.setItem(fetchLimit.cachedMessagesKey, JSON.stringify(cacheData));
                            localStorage.setItem(fetchLimit.lastFetchKey, Date.now().toString());
                        } catch (error) {
                            console.warn('缓存保存失败:', error);
                        }
                    }
                    
                    return filteredMessages;
                });
            })
            .catch(error => {
                console.error('获取留言失败:', error);
                return [];
            });
    }
    
    // 存储当前活跃的弹幕位置
    const activeMessages = [];
    
    // 弹幕配置参数 - 可根据需要调整这些值
    const MESSAGE_HEIGHT = 30; // 估计的弹幕高度
    const NUM_TRACKS = 10; // 轨道数量 - 减少到6条可增加每条轨道的间距
    const TOP_MARGIN = 10; // 顶部边距
    const BOTTOM_MARGIN = 40; // 底部边距
    const TRACK_SPACING_FACTOR = 0.8; // 轨道间距因子 - 值越小间距越大，值越大间距越小
    
    // 轨道系统
    let messageTracks = [];
    let lastTrackIndex = -1; // 上次使用的轨道索引，避免连续使用同一条轨道
    
    // 初始化轨道 - 可调整的垂直间距
    function initializeTracks(containerHeight, containerTop) {
        messageTracks = [];
        
        // 计算可用高度，考虑上下边距
        const availableHeight = Math.max(200, containerHeight - TOP_MARGIN - BOTTOM_MARGIN); 
        
        // 计算轨道间距 - 可通过调整TRACK_SPACING_FACTOR来改变间距大小
        // 值越小，轨道间距越大；值越大，轨道间距越小
        const verticalSpacing = availableHeight / (NUM_TRACKS + TRACK_SPACING_FACTOR); 
        
        // 创建轨道
        for (let i = 0; i < NUM_TRACKS; i++) {
            // 计算轨道顶部位置，添加顶部边距偏移
            const top = containerTop + TOP_MARGIN + (i + 0.5) * verticalSpacing - MESSAGE_HEIGHT / 2;
            messageTracks.push({
                top: Math.floor(top), // 确保top值为整数
                index: i // 轨道索引，用于调试
            });
        }
    }
    
    // 获取一个可用的轨道 - 使用随机方式避免过于规整
    function getAvailableTrack(messageWidth, duration) {
        // 如果没有轨道，返回默认位置
        if (messageTracks.length === 0) {
            return Math.floor(window.innerHeight / 2);
        }
        
        // 使用随机方式选择轨道，但避免连续使用同一条轨道
        let availableTracks = messageTracks;
        if (lastTrackIndex !== -1 && messageTracks.length > 1) {
            // 排除上次使用的轨道，增加随机性
            availableTracks = messageTracks.filter(track => track.index !== lastTrackIndex);
        }
        
        // 从可用轨道中随机选择一个
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        const selectedTrack = availableTracks[randomIndex];
        
        // 更新上次使用的轨道索引
        lastTrackIndex = selectedTrack.index;
        return selectedTrack.top;
    }
    
    // 随机显示单条留言
    function displayMessage(name, content) {
        const { baseDuration, minDuration, maxDuration } = COUNTER_CONFIG.messageSystem;
        
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.innerHTML = `
            <div class="message-content"><span class="message-author">${escapeHtml(name)}</span>: ${escapeHtml(content)}</div>
        `;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 强制计算以获取实际宽度
        const messageWidth = messageElement.offsetWidth;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        let top;
        
        // 限制弹幕范围在选中的div区域内显示
        const targetDiv = document.querySelector('.image-section');
        if (targetDiv) {
            const divRect = targetDiv.getBoundingClientRect();
            const divTop = divRect.top + scrollY;
            const divHeight = divRect.height;
            
            // 确保轨道系统正确初始化
            if (messageTracks.length === 0) {
                initializeTracks(divHeight, divTop);
            }
            // 验证轨道数量，如果不足则重新初始化
            if (messageTracks.length !== NUM_TRACKS) {
                initializeTracks(divHeight, divTop);
            }
            
            // 估算动画时长，用于计算水平间距
            const estimatedDuration = Math.max(COUNTER_CONFIG.messageSystem.minDuration, 
                Math.min(COUNTER_CONFIG.messageSystem.maxDuration, 
                COUNTER_CONFIG.messageSystem.baseDuration / (1 + Math.log10(messageWidth / 100))));
                
            // 获取可用轨道位置
            top = getAvailableTrack(messageWidth, estimatedDuration);
        } else {
            // 后备方案：使用视口范围和轨道系统
            const viewportHeight = window.innerHeight;
            const minTop = scrollY + 50;
            const maxTop = scrollY + viewportHeight - MESSAGE_HEIGHT;
            const availableHeight = maxTop - minTop;
            
            // 确保轨道系统正确初始化
            if (messageTracks.length === 0) {
                initializeTracks(availableHeight, minTop);
            }
            // 验证轨道数量，如果不足则重新初始化
            if (messageTracks.length !== NUM_TRACKS) {
                initializeTracks(availableHeight, minTop);
            }
            
            // 估算动画时长，用于计算水平间距
            const estimatedDuration = Math.max(COUNTER_CONFIG.messageSystem.minDuration, 
                Math.min(COUNTER_CONFIG.messageSystem.maxDuration, 
                COUNTER_CONFIG.messageSystem.baseDuration / (1 + Math.log10(messageWidth / 100))));
                
            // 获取可用轨道位置
            top = getAvailableTrack(messageWidth, estimatedDuration);
        }
        
        messageElement.style.top = `${top}px`;
        
        // 计算动画时间（根据弹幕长度）
        // 让动画时间与长度成反比，越长越快
        // 使用对数函数让速度变化更平滑，避免过长句子太快
        // 修改计算逻辑，确保短弹幕也有足够的显示时间
        const isMobile = window.innerWidth < 768;
        const mobileMultiplier = isMobile ? 1000 : 1;
        const adjustedMinDuration = minDuration / mobileMultiplier;
        // 确保消息宽度至少为100px，防止短消息速度过快
        const adjustedMessageWidth = Math.max(100, messageWidth);
        const duration = Math.max(adjustedMinDuration, Math.min(maxDuration, baseDuration / (1 + Math.log10(adjustedMessageWidth / 100))));
        
        // 记录当前弹幕的位置和持续时间
        const messageId = Date.now();
        activeMessages.push({
            id: messageId,
            top: top,
            element: messageElement
        });
        
        // 显示并开始动画
        setTimeout(() => {
            messageElement.style.opacity = '1';
            // 添加轻微的透明度动画和滚动动画
            messageElement.style.transition = `transform ${duration}ms linear, opacity 0.5s ease-out`;
            messageElement.style.transform = `translateX(-${window.innerWidth + messageWidth}px)`;
            
            // 确保弹幕完全移动出屏幕后才消失
            // 计算弹幕完全移出屏幕所需的额外时间
            // 总滚动距离是屏幕宽度+弹幕宽度，需要确保弹幕完全移出屏幕
            const totalScrollDistance = window.innerWidth + messageWidth;
            const pixelsPerMillisecond = totalScrollDistance / duration;
            // 当弹幕完全移出屏幕时需要额外的时间：弹幕宽度 / 速度
            const extraTime = (messageWidth / pixelsPerMillisecond) * 0.8; // 乘以0.8稍微提前一点开始淡出效果
            
            setTimeout(() => {
                // 只有当弹幕完全移出屏幕后才开始淡出
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                    // 从活跃弹幕列表中移除
                    const index = activeMessages.findIndex(msg => msg.id === messageId);
                    if (index !== -1) {
                        activeMessages.splice(index, 1);
                    }
                }, 500); // 淡出动画持续时间
            }, duration + extraTime);
        }, 50);
        
        // 定期清理无效的弹幕元素引用（防止内存泄漏）
        function cleanupDeadMessages() {
            const now = Date.now();
            for (let i = activeMessages.length - 1; i >= 0; i--) {
                const msg = activeMessages[i];
                if (!msg.element.parentNode) {
                    activeMessages.splice(i, 1);
                }
            }
        }
        
        // 每20条弹幕清理一次
        if (activeMessages.length % 20 === 0) {
            cleanupDeadMessages();
        }
    }
    
    // 随机显示已有留言的函数
    function startRandomMessageDisplay() {
        const { minDisplayInterval, maxDisplayInterval } = COUNTER_CONFIG.messageSystem;
        
        // 只从API获取留言
        fetchMessagesFromApi()
            .then(messages => {
                // 如果没有留言，等待一段时间后重试
                if (!messages || messages.length === 0) {
                    setTimeout(startRandomMessageDisplay, 5000);
                    return;
                }
                
                // 定期随机显示留言，根据配置的间隔范围
                const displayInterval = Math.random() * (maxDisplayInterval - minDisplayInterval) + minDisplayInterval;
                
                setTimeout(() => {
                    // 随机选择一条留言
                    const randomIndex = Math.floor(Math.random() * messages.length);
                    const randomMessage = messages[randomIndex];
                    if (randomMessage && randomMessage.name && randomMessage.content) {
                        displayMessage(randomMessage.name, randomMessage.content);
                    }
                    
                    // 非递归方式：通过setTimeout创建新的任务来获取最新留言列表
                    setTimeout(startRandomMessageDisplay, displayInterval);
                }, displayInterval);
            })
            .catch(error => {
                console.error('获取留言失败:', error);
                // 出错后等待一段时间重试
                setTimeout(startRandomMessageDisplay, 5000);
            });
    }
    
    // HTML转义函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
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
        // 初始化留言系统
        initMessageSystem();
    });
});


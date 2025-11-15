// 导入配置
import COUNTER_CONFIG from './counter_config.js';

// 当前网站版本号 - 与HTML中的脚本版本号同步
const CURRENT_VERSION = '2.0.0';

// 检查并处理版本更新
function checkForUpdates() {
    // 从localStorage获取存储的版本
    const storedVersion = localStorage.getItem('siteVersion');
    
    // 如果localStorage中没有版本信息或者版本不匹配
    if (!storedVersion || storedVersion !== CURRENT_VERSION) {
        console.log('检测到网站更新，正在清除缓存...');
        
        // 清除localStorage中的版本信息
        localStorage.removeItem('siteVersion');
        
        // 强制刷新页面以获取最新内容
        // 使用reload(true)确保从服务器重新加载而不是从缓存
        location.reload(true);
    } else {
        console.log('网站已是最新版本');
    }
    
    // 更新localStorage中的版本信息
    localStorage.setItem('siteVersion', CURRENT_VERSION);
}

// 添加一个额外的防缓存机制 - 在页面加载时检查
window.addEventListener('pageshow', function(event) {
    // 检查页面是否是从缓存加载的
    if (event.persisted) {
        console.log('页面从缓存加载，检查更新...');
        checkForUpdates();
    }
});

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
          // 目标日期时间
          const liveTime = new Date(2025, 10, 15, 16, 0, 0); // 恢复为目标日期
          const targetTime = targetDate.getTime();
        
        // 更新计时器函数
        const updateTimer = () => {
            // 获取当前时间
            const nowTime = Date.now();
            
            // 判断是否已到达或超过liveTime
            if (nowTime >= liveTime.getTime()) {
                // 获取计时器容器元素
                const timerContainer = document.querySelector('.offline-timer');
                if (timerContainer) {
                    // 检查是否已经添加了图片，避免重复添加
                    if (!timerContainer.querySelector('.return-image')) {
                        // 创建a标签作为点击跳转的容器
                        const returnLink = document.createElement('a');
                        returnLink.href = 'http://8.148.253.91/files/index.html';
                        
                        // 设置为绝对定位，覆盖在时间上，使用vw单位调整大小
                        returnLink.style.position = 'absolute';
                        returnLink.style.top = '50%';
                        returnLink.style.left = '50%';
                        returnLink.style.transform = 'translate(-50%, -50%)';
                        // 增大基础尺寸，特别是在移动设备上更明显
                        returnLink.style.width = '30vw';
                        returnLink.style.height = 'auto';
                        returnLink.style.minWidth = '120px'; // 确保在小屏幕上也有最小宽度
                        returnLink.style.maxWidth = '250px';
                        returnLink.style.transition = 'transform 0.2s ease';
                        returnLink.style.zIndex = '10'; // 确保在顶层
                        
                        // 添加悬停放大效果
                        returnLink.addEventListener('mouseenter', function() {
                            this.style.transform = 'translate(-50%, -50%) scale(1.05)';
                        });
                        
                        returnLink.addEventListener('mouseleave', function() {
                            this.style.transform = 'translate(-50%, -50%) scale(1)';
                        });
                        
                        // 创建图片元素
                        const returnImage = document.createElement('img');
                        returnImage.src = 'assets/img/s-return.svg';
                        returnImage.className = 'return-image';
                        returnImage.style.width = '100%';
                        returnImage.style.height = '100%';
                        returnImage.style.objectFit = 'contain';
                        
                        // 将图片添加到链接中
                        returnLink.appendChild(returnImage);
                        
                        // 设置容器为相对定位，以便图片能正确覆盖
                        timerContainer.style.position = 'relative';
                        
                        // 添加到timerContainer，覆盖在时间上面
                        timerContainer.appendChild(returnLink);
                    }
                }
                return; // 不再更新计时器
            }
            
            // 计算时间差（毫秒）正计时
            let diff = nowTime - targetTime;

            // 计算时间差（毫秒）倒计时
            let diffLive = liveTime - nowTime;
            
            // 确保时间差为正数（处理目标时间在未来的情况）
            if (diff < 0) diff = 0;
            if (diffLive < 0) diffLive = 0;
            
            // 计算小时、分钟、秒
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            // 计算倒计时小时、分钟、秒
            const hoursLive = Math.floor(diffLive / 3600000);
            const minutesLive = Math.floor((diffLive % 3600000) / 60000);
            const secondsLive = Math.floor((diffLive % 60000) / 1000);

            // 格式化并更新显示 - 为分钟和秒添加前导零
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            const formattedMinutesLive = String(minutesLive).padStart(2, '0');
            const formattedSecondsLive = String(secondsLive).padStart(2, '0');
            
            // 只有当值真正改变时才更新DOM，减少重绘和闪烁
            // 使用HTML来为"时"、"分"、"秒"汉字添加白色样式
            // 将小时和分秒部分分开，以便在手机版时能正确实现两行显示效果
            const newTimeHtml = '<span class="timer-hours">'+hours+'<span class="timer-unit">时</span></span><span class="timer-minutes-seconds">'+formattedMinutes+'<span class="timer-unit">分</span>'+formattedSeconds+'<span class="timer-unit">秒</span></span>';
            const newTimeHtmlLive = '<span class="timer-hours">'+hoursLive+'<span class="timer-unit">时</span></span><span class="timer-minutes-seconds">'+formattedMinutesLive+'<span class="timer-unit">分</span>'+formattedSecondsLive+'<span class="timer-unit">秒</span></span>';
            
            // if (timerElement.innerHTML !== newTimeHtml) {
            //     timerElement.innerHTML = newTimeHtml;
            // }
            if (timerElement.innerHTML !== newTimeHtmlLive) {
                timerElement.innerHTML = newTimeHtmlLive;
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
    
    // 存储当前活跃的弹幕信息，用于避障计算
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
    
    // 获取一个可用的轨道，带避障逻辑、随机选择和密度控制
    function getAvailableTrack(messageWidth, messageSpeed) {
        // 如果没有轨道，返回默认位置
        if (messageTracks.length === 0) {
            return { top: Math.floor(window.innerHeight / 2), delay: 0 };
        }
        
        const screenWidth = window.innerWidth;
        const { safetyCoefficient, maxDelay, densityControl } = COUNTER_CONFIG.messageSystem;
        
        // 应用密度乘数到安全系数
        const adjustedSafetyCoefficient = safetyCoefficient / (densityControl?.enabled ? densityControl.densityMultiplier : 1.0);
        
        // 先检查是否有完全空闲的轨道
        const emptyTracks = messageTracks.filter(track => {
            const hasActiveMessages = activeMessages.some(msg => 
                Math.abs(msg.top - track.top) < MESSAGE_HEIGHT / 2 && 
                msg.speed && msg.width && msg.startTime
            );
            return !hasActiveMessages;
        });
        
        // 如果有空闲轨道，优先从中随机选择
        if (emptyTracks.length > 0) {
            // 避免连续使用同一条轨道
            let availableEmptyTracks = emptyTracks;
            if (lastTrackIndex !== -1 && emptyTracks.length > 1) {
                availableEmptyTracks = emptyTracks.filter(track => track.index !== lastTrackIndex);
                if (availableEmptyTracks.length === 0) {
                    availableEmptyTracks = emptyTracks;
                }
            }
            
            const randomIndex = Math.floor(Math.random() * availableEmptyTracks.length);
            const selectedTrack = availableEmptyTracks[randomIndex];
            lastTrackIndex = selectedTrack.index;
            
            // 空闲轨道延迟为0，直接显示弹幕
            return { top: selectedTrack.top, delay: 0 };
        }
        
        // 如果没有空闲轨道，计算所有轨道的延迟时间
        const trackDelays = messageTracks.map(track => {
            // 找到该轨道上的最后一条弹幕
            const trackMessages = activeMessages.filter(msg => 
                Math.abs(msg.top - track.top) < MESSAGE_HEIGHT / 2 && 
                msg.speed && msg.width && msg.startTime
            );
            
            let delay = 0;
            if (trackMessages.length > 0) {
                // 按开始时间排序，取最后一条
                trackMessages.sort((a, b) => b.startTime - a.startTime);
                const lastMessage = trackMessages[0];
                
                // 计算安全间距 S = 前车速度 V_prev × K + 前车宽度 L_prev
                const safetyDistance = lastMessage.speed * adjustedSafetyCoefficient + lastMessage.width;
                
                // 计算最后一条弹幕当前的位置
                const elapsedTime = Date.now() - lastMessage.startTime;
                const lastMessagePosition = screenWidth - (lastMessage.speed * elapsedTime);
                
                // 如果最后一条弹幕还在屏幕上，计算需要的延迟
                if (lastMessagePosition > -lastMessage.width) {
                    // 计算后车出发延迟 Delay = S / 当前弹幕速度 V_curr
                    const requiredDelay = safetyDistance / messageSpeed;
                    delay = Math.max(0, requiredDelay);
                    
                    // 应用最小间隔时间（如果启用了密度控制）
                    if (densityControl?.enabled) {
                        delay = Math.max(delay, densityControl.minIntervalBetweenMessages);
                    }
                }
            }
            
            return { track, delay };
        });
        
        // 首先检查是否有延迟小于等于maxDelay的轨道
        let availableTracks = trackDelays.filter(item => item.delay <= maxDelay);
        
        // 如果没有可用轨道，使用所有轨道
        if (availableTracks.length === 0) {
            availableTracks = trackDelays;
        }
        
        // 从可用轨道中随机选择一个，但避免连续使用同一条轨道
        let randomTracks = availableTracks;
        if (lastTrackIndex !== -1 && availableTracks.length > 1) {
            randomTracks = availableTracks.filter(item => item.track.index !== lastTrackIndex);
            // 如果过滤后没有轨道，再使用所有可用轨道
            if (randomTracks.length === 0) {
                randomTracks = availableTracks;
            }
        }
        
        // 随机选择一个轨道
        const randomIndex = Math.floor(Math.random() * randomTracks.length);
        const selectedTrackInfo = randomTracks[randomIndex];
        
        // 更新上次使用的轨道索引
        lastTrackIndex = selectedTrackInfo.track.index;
        
        return { top: selectedTrackInfo.track.top, delay: selectedTrackInfo.delay };
    }
    
    // 随机显示单条留言
    function displayMessage(name, content) {
        const { screenStayTime, densityControl } = COUNTER_CONFIG.messageSystem;
        
        // 检查是否启用了密度控制，并且当前弹幕数量是否超过最大限制
        if (densityControl?.enabled && activeMessages.length >= densityControl.maxConcurrentMessages) {
            // 如果弹幕数量已达到上限，暂时不显示新弹幕
            return false;
        }
        
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
        const screenWidth = window.innerWidth;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // 计算弹幕速度：V = (屏幕宽度 W + 弹幕文本宽度 L) / 停留时间 T
        const messageSpeed = (screenWidth + messageWidth) / screenStayTime; // 像素/毫秒
        
        let trackInfo;
        
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
            
            // 获取可用轨道位置和延迟时间
            trackInfo = getAvailableTrack(messageWidth, messageSpeed);
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
            
            // 获取可用轨道位置和延迟时间
            trackInfo = getAvailableTrack(messageWidth, messageSpeed);
        }
        
        messageElement.style.top = `${trackInfo.top}px`;
        
        // 计算动画时间（根据弹幕速度）
        const totalScrollDistance = screenWidth + messageWidth;
        const duration = totalScrollDistance / messageSpeed;
        
        // 记录当前弹幕的详细信息，用于避障计算
        const messageId = Date.now();
        const messageInfo = {
            id: messageId,
            top: trackInfo.top,
            width: messageWidth,
            speed: messageSpeed,
            startTime: Date.now() + trackInfo.delay,
            element: messageElement
        };
        
        // 根据密度乘数调整延迟时间
        const adjustedDelay = densityControl?.enabled ? 
            trackInfo.delay / densityControl.densityMultiplier : trackInfo.delay;
        
        // 显示并开始动画
        setTimeout(() => {
            // 将弹幕添加到活跃列表
            activeMessages.push(messageInfo);
            
            messageElement.style.opacity = '1';
            // 添加轻微的透明度动画和滚动动画
            messageElement.style.transition = `transform ${duration}ms linear, opacity 0.5s ease-out`;
            messageElement.style.transform = `translateX(-${totalScrollDistance}px)`;
            
            // 确保弹幕完全移动出屏幕后才消失
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
            }, duration);
        }, adjustedDelay + 50);
        
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
        const { minDisplayInterval, maxDisplayInterval, densityControl } = COUNTER_CONFIG.messageSystem;
        
        // 只从API获取留言
        fetchMessagesFromApi()
            .then(messages => {
                // 如果没有留言，等待一段时间后重试
                if (!messages || messages.length === 0) {
                    setTimeout(startRandomMessageDisplay, 5000);
                    return;
                }
                
                // 计算基础显示间隔
                let baseInterval = Math.random() * (maxDisplayInterval - minDisplayInterval) + minDisplayInterval;
                // 根据密度乘数调整显示间隔：密度越高，间隔越短
                const displayInterval = densityControl?.enabled ? 
                    baseInterval / densityControl.densityMultiplier : baseInterval;
                
                // 检查是否有空闲轨道，如果有则立即显示一条弹幕
                const hasEmptyTracks = messageTracks.some(track => {
                    return !activeMessages.some(msg => 
                        Math.abs(msg.top - track.top) < MESSAGE_HEIGHT / 2 && 
                        msg.speed && msg.width && msg.startTime
                    );
                });
                
                // 如果有空闲轨道，立即显示一条弹幕
                if (hasEmptyTracks) {
                    // 随机选择一条留言
                    const randomIndex = Math.floor(Math.random() * messages.length);
                    const randomMessage = messages[randomIndex];
                    if (randomMessage && randomMessage.name && randomMessage.content) {
                        displayMessage(randomMessage.name, randomMessage.content);
                    }
                }
                
                // 即使立即显示了一条弹幕，仍按照间隔安排下一次检查
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
        // 先检查版本更新
        checkForUpdates();
        
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


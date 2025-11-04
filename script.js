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
        console.log('开始初始化留言系统');
        const nameInput = document.getElementById('message-name');
        const contentTextarea = document.getElementById('message-content');
        const charCount = document.getElementById('char-count');
        const submitButton = document.getElementById('submit-message');
        const messagesContainer = document.getElementById('messages-container');
        const { maxLength, maxNameLength, warningThreshold } = COUNTER_CONFIG.messageSystem;
        
        console.log('留言系统元素状态:', {
            nameInput: !!nameInput,
            contentTextarea: !!contentTextarea,
            charCount: !!charCount,
            submitButton: !!submitButton,
            messagesContainer: !!messagesContainer
        });
        
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
            console.log('留言系统初始化完成');
            
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
                console.log('提交按钮被点击');
                const name = nameInput.value.trim();
                const content = contentTextarea.value.trim();
                let isValid = true;
                
                console.log('表单输入内容:', {name, content});
                
                // 验证输入并标红错误字段
                if (!name) {
                    console.log('表单验证失败：名字为空');
                    addErrorStyle(nameInput);
                    isValid = false;
                } else {
                    removeErrorStyle(nameInput);
                }
                
                if (!content) {
                    console.log('表单验证失败：内容为空');
                    addErrorStyle(contentTextarea);
                    isValid = false;
                } else {
                    removeErrorStyle(contentTextarea);
                }
                
                if (!isValid) {
                    return;
                }
                
                console.log('表单验证通过，准备调用submitMessage函数');
                // 调用API提交留言
                submitMessage(name, content)
                    .then(() => {
                        console.log('留言提交成功');
                        // 成功后清空表单
                        nameInput.value = '';
                        contentTextarea.value = '';
                        charCount.textContent = `0/${maxLength}`;
                        
                        // 显示新留言 - 直接在body中显示
                        displayMessage(name, content);
                        console.log('新留言已显示');
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
            console.error('留言系统初始化失败，缺少必要元素:', {
                submitButton: !!submitButton,
                nameInput: !!nameInput,
                contentTextarea: !!contentTextarea
            });
        }
        
        // 启动随机留言显示系统
        console.log('启动随机留言显示系统');
        startRandomMessageDisplay();
    }
    
    // 提交留言到API
    function submitMessage(name, content) {
        console.log('submitMessage函数被调用，参数:', {name, content});
        
        try {
            const { api } = COUNTER_CONFIG.messageSystem;
            console.log('获取配置:', {api});
            
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
            console.log('生成北京时间戳:', timestamp);
            
            // URL编码参数，确保中文正确传递
            const encodedName = encodeURIComponent(name);
            const encodedContent = encodeURIComponent(content);
            console.log('编码后的参数:', {encodedName, encodedContent});
            
            // 构建GET请求URL，带查询参数
            const apiUrl = `${baseUrl}/${submitAction}?name=${encodedName}&content=${encodedContent}&timestamp=${timestamp}`;
            console.log('构建的API URL:', apiUrl);
            
            // 真实API调用 - 改为GET请求
            return fetch(apiUrl)
                .then(response => {
                    console.log('API响应状态:', response.status);
                    if (!response.ok) {
                        throw new Error(`网络响应错误: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('API返回数据:', data);
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
    
    // 从API获取留言
    function fetchMessagesFromApi() {
        const { api } = COUNTER_CONFIG.messageSystem;
        const { baseUrl, getAction } = api;
        const apiUrl = `${baseUrl}/${getAction}`;
        
        return fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                // 确保从响应中提取正确的数据结构
                return response.json().then(data => {
                    // 确认API返回格式为 { success: true, data: [...] }，其中每个item包含id、name、content和timestamp字段
                    if (data && data.success && Array.isArray(data.data)) {
                        // 过滤并确保每个消息对象都包含必要的字段
                        return data.data.filter(message => 
                            message && 
                            message.id && 
                            message.name && 
                            message.content && 
                            message.timestamp
                        );
                    } else if (Array.isArray(data)) {
                        // 如果直接返回数组，也兼容处理
                        return data.filter(message => 
                            message && 
                            message.id && 
                            message.name && 
                            message.content && 
                            message.timestamp
                        );
                    }
                    return [];
                });
            });
    }
    
    // 存储当前活跃的弹幕位置
    const activeMessages = [];
    const MESSAGE_HEIGHT = 30; // 估计的弹幕高度
    const MIN_VERTICAL_SPACING = 20; // 最小垂直间距
    
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
        const viewportHeight = window.innerHeight;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // 限制弹幕范围在选中的div区域内显示
        const targetDiv = document.querySelector('.image-section');
        let top;
        let attempts = 0;
        const MAX_ATTEMPTS = 10; // 最大尝试次数
        let validPositionFound = false;
        
        if (targetDiv) {
            const divRect = targetDiv.getBoundingClientRect();
            const divTop = divRect.top + scrollY;
            const divHeight = divRect.height;
            const minTop = divTop;
            const maxTop = divTop + divHeight - MESSAGE_HEIGHT;
            
            // 尝试找到一个不与现有弹幕重叠的位置
            while (!validPositionFound && attempts < MAX_ATTEMPTS) {
                // 生成候选位置
                top = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
                
                // 检查是否与现有弹幕重叠
                let positionConflict = false;
                for (const msg of activeMessages) {
                    // 检查垂直位置冲突
                    if (Math.abs(top - msg.top) < MESSAGE_HEIGHT + MIN_VERTICAL_SPACING) {
                        positionConflict = true;
                        break;
                    }
                }
                
                // 如果没有冲突，接受这个位置
                if (!positionConflict) {
                    validPositionFound = true;
                }
                
                attempts++;
            }
            
            // 如果无法找到无冲突的位置，仍然使用随机位置
            if (!validPositionFound) {
                top = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
            }
        } else {
            // 后备方案：如果找不到目标div，使用视口范围
            const minTop = scrollY + 50;
            const maxTop = scrollY + viewportHeight - MESSAGE_HEIGHT;
            
            // 尝试找到一个不与现有弹幕重叠的位置
            while (!validPositionFound && attempts < MAX_ATTEMPTS) {
                // 生成候选位置
                top = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
                
                // 检查是否与现有弹幕重叠
                let positionConflict = false;
                for (const msg of activeMessages) {
                    // 检查垂直位置冲突
                    if (Math.abs(top - msg.top) < MESSAGE_HEIGHT + MIN_VERTICAL_SPACING) {
                        positionConflict = true;
                        break;
                    }
                }
                
                // 如果没有冲突，接受这个位置
                if (!positionConflict) {
                    validPositionFound = true;
                }
                
                attempts++;
            }
            
            // 如果无法找到无冲突的位置，仍然使用随机位置
            if (!validPositionFound) {
                top = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
            }
        }
        messageElement.style.top = `${top}px`;
        
        // 计算动画时间（根据弹幕长度）
        // 让动画时间与长度成反比，越长越快
        // 使用对数函数让速度变化更平滑，避免过长句子太快
        const duration = Math.max(minDuration, Math.min(maxDuration, baseDuration / (1 + Math.log10(messageWidth / 100))));
        
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
            
            // 动画结束后移除元素并从活跃弹幕列表中删除
            setTimeout(() => {
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
                }, 500);
            }, duration);
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
                    
                    // 递归调用，持续随机显示
                    startRandomMessageDisplay();
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


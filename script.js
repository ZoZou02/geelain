document.addEventListener('DOMContentLoaded', function() {
    // 全局点击计数功能 - API实现
    const counterElement = document.getElementById('global-click-counter');
    const clickButton = document.getElementById('click-button');
    const apiKey = '6c18b0cafb24205829af9e2fb75c3a2a';
    const counterId = '6200f7021fe890c7f925ff27cf10cabd';
    
    // 获取当前计数值 - 修复显示异常问题
    function getCount() {
        const url = 'https://js.ruseo.cn/api/counter.php?api_key=' + apiKey + '&action=get&counter_id=' + counterId;
        
        // 使用fetch API，设置无缓存
        fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应异常');
            }
            return response.text();
        })
        .then(text => {
            console.log('API响应:', text);
            // 清理响应文本，只保留数字部分
            const cleanText = text.replace(/[^0-9]/g, '');
            // 确保只解析有效的数字
            if (cleanText && cleanText.length < 15) { // 限制长度，防止异常大的数字
                const count = parseInt(cleanText);
                if (!isNaN(count)) {
                    counterElement.textContent = count.toLocaleString();
                    return;
                }
            }
            // 如果解析失败，显示合理的默认值
            counterElement.textContent = '0';
        })
        .catch(error => {
            console.error('获取计数失败:', error);
            // 错误情况下显示加载中
            counterElement.textContent = '加载中...';
        });
    }
    
    // 增加计数
    function incrementCount() {
        const url = 'https://js.ruseo.cn/api/counter.php?api_key=' + apiKey + '&action=increment&counter_id=' + counterId + '&value=1';
        
        // 禁用按钮防止重复点击
        clickButton.disabled = true;
        
        // 立即提供本地反馈，但不修改实际显示的数字
        counterElement.classList.add('counter-flash');
        setTimeout(() => counterElement.classList.remove('counter-flash'), 300);
        
        // 发送请求到API
        fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
        .then(() => {
            console.log('计数已增加');
            // 请求成功后获取最新计数值
            getCount();
        })
        .catch(error => {
            console.error('增加计数失败:', error);
        })
        .finally(() => {
            // 无论成功失败，都重新启用按钮
            setTimeout(() => {
                clickButton.disabled = false;
            }, 500);
        });
    }
    
    // 初始加载计数
    getCount();
    
    // 只添加按钮的点击事件
    clickButton.addEventListener('click', incrementCount);
    
    // 自动刷新计数
    setInterval(getCount, 5000);
    // 添加干扰层
    const interference = document.createElement('div');
    interference.className = 'interference';
    document.body.appendChild(interference);
    
    // 移除闪烁效果，保持视觉稳定
    
    // 文本轻微抖动效果
    const textShake = () => {
        const textElements = document.querySelectorAll('h1, h2, p');
        const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
        
        randomElement.style.transform = 'translateX(1px)';
        setTimeout(() => {
            randomElement.style.transform = 'translateX(-1px)';
            setTimeout(() => {
                randomElement.style.transform = 'translateX(0)';
            }, 50);
        }, 50);
        
        setTimeout(textShake, Math.random() * 2000 + 1000);
    };
    
    // 添加红移线元素
    const redShift = document.createElement('div');
    redShift.className = 'red-shift';
    document.body.appendChild(redShift);
    
    // 干扰效果
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
    
    // 文章点击效果 - 替换为闪烁填充效果
    const articleClickEffect = () => {
        const articles = document.querySelectorAll('article');
        
        articles.forEach(article => {
            article.addEventListener('click', () => {
                // 创建闪烁填充效果
                const originalBackground = article.style.backgroundColor;
                
                // 第一次闪烁 - 填充粉色背景
                article.style.transition = 'background-color 0.1s ease';
                article.style.backgroundColor = 'rgba(253, 45, 92, 0.2)';
                
                // 第二次闪烁 - 快速消失
                setTimeout(() => {
                    article.style.backgroundColor = 'rgba(253, 45, 92, 0.05)';
                }, 150);
                
                // 第三次闪烁 - 再次出现
                setTimeout(() => {
                    article.style.backgroundColor = 'rgba(253, 45, 92, 0.2)';
                }, 250);
                
                // 恢复原状
                setTimeout(() => {
                    article.style.transition = 'background-color 0.3s ease';
                    article.style.backgroundColor = originalBackground || 'rgba(253, 45, 92, 0.05)';
                }, 400);
                
                // 同时添加边框闪烁效果
                const originalBorder = article.style.borderColor;
                article.style.borderColor = '#fd2d5c';
                article.style.boxShadow = '0 0 10px #fd2d5c';
                
                setTimeout(() => {
                    article.style.boxShadow = 'none';
                    article.style.borderColor = originalBorder || '#fd2d5c';
                }, 400);
            });
        });
    };
    
    // 调用文章点击效果函数
    articleClickEffect();
    
    // 鼠标跟随效果
    const cursorEffect = () => {
        const cursor = document.createElement('div');
        cursor.style.position = 'fixed';
        cursor.style.width = '50px';
        cursor.style.height = '50px';
        cursor.style.border = '1px solid #fd2d5c';
        cursor.style.borderRadius = '50%';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '999';
        cursor.style.opacity = '0';
        cursor.style.transition = 'opacity 0.2s ease, transform 0.1s ease';
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX - 25}px`;
            cursor.style.top = `${e.clientY - 25}px`;
            cursor.style.opacity = '0.5';
        });
        
        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'scale(0.8)';
        });
        
        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'scale(1)';
        });
        
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    };
    
    // 移除了标题的所有动画效果
    
    // 页面滚动效果
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // 移除文章的视差移动效果
    });
    
    // 启动所有效果
    setTimeout(() => {
        // 移除闪烁效果调用和文本抖动效果
        // textShake();
        simpleInterference();
        cursorEffect();
        // 标题不使用任何动画效果
    }, 1000);
    
    // 页面加载时的效果
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // GBAR召唤系统 - 山东雄鹰队与野狗帮联合行动
    const gbarCountElement = document.getElementById('global-click-counter');
    const gbarButton = document.getElementById('click-button');
    const apiKey = '6c18b0cafb24205829af9e2fb75c3a2a';
    const counterId = '6200f7021fe890c7f925ff27cf10cabd';
    
    // 点击计数器，控制API请求频率
    let clickCount = 0;
    const apiRequestThreshold = 5;
    
    // 初始加载GBAR召唤能量
    function loadGbarCount() {
        const url = `https://js.ruseo.cn/api/counter.php?api_key=${apiKey}&action=get&counter_id=${counterId}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.success && data.counter && data.counter.current_count) {
                    const count = parseInt(data.counter.current_count);
                    if (!isNaN(count)) {
                        gbarCountElement.textContent = count.toLocaleString();
                        // 添加数字变化动画
                        gbarCountElement.classList.add('counter-flash');
                    setTimeout(() => gbarCountElement.classList.remove('counter-flash'), 500);
                    } else {
                        gbarCountElement.textContent = '0';
                    }
                } else {
                    gbarCountElement.textContent = '0';
                }
            })
            .catch(error => {
                console.error('加载GBAR召唤能量失败:', error);
                gbarCountElement.textContent = '0';
            });
    }
    
    // 呼叫GBAR - 优化版本，支持快速连续点击
    function callGeebar() {
        // 立即更新本地显示（+1），提供即时反馈
        const currentCount = parseInt(gbarCountElement.textContent.replace(/,/g, '')) || 0;
        gbarCountElement.textContent = (currentCount + 1).toLocaleString();
        gbarCountElement.classList.add('counter-flash');
        setTimeout(() => gbarCountElement.classList.remove('counter-flash'), 300);
        
        // 创建召唤特效
        createCallEffect();
        
        // 增加点击计数
        clickCount++;
        
        // 控制API请求频率，避免过于频繁的请求
        if (clickCount >= apiRequestThreshold) {
            sendApiRequest();
            clickCount = 0;
        }
    }
    
    // 发送API请求更新计数
    function sendApiRequest() {
        const url = `https://js.ruseo.cn/api/counter.php?api_key=${apiKey}&action=increment&counter_id=${counterId}&value=${apiRequestThreshold}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // API更新成功后，重新获取准确的计数值
                loadGbarCount();
            })
            .catch(error => {
                console.error('更新GBAR召唤能量失败:', error);
                // 失败时重新获取最新数据
                loadGbarCount();
            });
    }
    
    // 创建召唤特效 - 复古风格
    function createCallEffect(e) {
        const rect = gbarButton.getBoundingClientRect();
        const buttonX = rect.left + rect.width / 2;
        const buttonY = rect.top + rect.height / 2;
        
        // 创建多个特效元素
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                // 雄鹰队元素
                if (Math.random() > 0.5) {
                    createEagleEffect(buttonX, buttonY);
                }
                // 野狗帮元素
                else {
                    createWildDogEffect(buttonX, buttonY);
                }
                
                // 随机添加静态干扰效果
                if (Math.random() > 0.7) {
                    createStaticInterference();
                }
            }, i * 50);
        }
        
        // 按钮冲击效果 - 使用现有的复古按钮样式
        gbarButton.classList.add('counter-flash');
        setTimeout(() => {
            gbarButton.classList.remove('counter-flash');
        }, 200);
        
        // 全屏震动效果
        document.body.classList.add('screen-shake');
        setTimeout(() => {
            document.body.classList.remove('screen-shake');
        }, 100);
        
        // 添加复古故障效果
        const glitchOverlay = document.createElement('div');
        glitchOverlay.style.position = 'fixed';
        glitchOverlay.style.top = '0';
        glitchOverlay.style.left = '0';
        glitchOverlay.style.width = '100%';
        glitchOverlay.style.height = '100%';
        glitchOverlay.style.backgroundColor = '#fd2d5c';
        glitchOverlay.style.opacity = '0.05';
        glitchOverlay.style.pointerEvents = 'none';
        glitchOverlay.style.zIndex = '1001';
        glitchOverlay.style.animation = 'glitchFlash 0.3s ease-out';
        document.body.appendChild(glitchOverlay);
        
        setTimeout(() => {
            glitchOverlay.remove();
        }, 300);
    }
    
    // 创建静态干扰效果
    function createStaticInterference() {
        const staticOverlay = document.createElement('div');
        staticOverlay.style.position = 'fixed';
        staticOverlay.style.top = '0';
        staticOverlay.style.left = '0';
        staticOverlay.style.width = '100%';
        staticOverlay.style.height = '100%';
        staticOverlay.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.5\"/%3E%3C/svg%3E")';
        staticOverlay.style.pointerEvents = 'none';
        staticOverlay.style.zIndex = '1001';
        staticOverlay.style.animation = 'staticFlash 0.1s ease-out';
        document.body.appendChild(staticOverlay);
        
        setTimeout(() => {
            staticOverlay.remove();
        }, 100);
    }
    
    // 创建雄鹰队特效 - 复古风格
    function createEagleEffect(x, y) {
        const eagle = document.createElement('div');
        eagle.className = 'eagle-effect';
        
        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150 + 50;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        // 元素样式 - 复古像素风格
        eagle.style.left = `${x}px`;
        eagle.style.top = `${y}px`;
        eagle.style.fontSize = `${Math.random() * 20 + 15}px`;
        eagle.style.fontFamily = 'Pixel, monospace';
        eagle.style.color = '#fd2d5c';
        eagle.style.transform = 'scale(0)';
        
        // 随机雄鹰图标
        const eagles = ['🦅', '🐔', '✈️', '⚡'];
        eagle.textContent = eagles[Math.floor(Math.random() * eagles.length)];
        
        // 添加复古故障效果
        eagle.style.textShadow = '1px 0 0 #fd2d5c, -1px 0 0 #0000ff, 0 1px 0 #fd2d5c, 0 -1px 0 #0000ff';
        
        document.body.appendChild(eagle);
        
        // 触发动画 - 像素风格的线性动画
        setTimeout(() => {
            eagle.style.transition = 'all 1s linear';
            eagle.style.transform = `translate(${targetX - x}px, ${targetY - y}px) scale(1)`;
            eagle.style.opacity = '0';
            
            // 模拟信号衰减的闪烁效果
            let opacity = 1;
            const flickerInterval = setInterval(() => {
                opacity = opacity === 1 ? 0.7 : 1;
                eagle.style.opacity = opacity;
            }, 50);
            
            setTimeout(() => clearInterval(flickerInterval), 800);
        }, 10);
        
        // 动画结束后移除
        setTimeout(() => {
            eagle.remove();
        }, 1000);
    }
    
    // 创建野狗帮特效 - 复古风格
    function createWildDogEffect(x, y) {
        const dog = document.createElement('div');
        dog.className = 'dog-effect';
        
        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 120 + 40;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        // 元素样式 - 复古像素风格
        dog.style.left = `${x}px`;
        dog.style.top = `${y}px`;
        dog.style.fontSize = `${Math.random() * 20 + 15}px`;
        dog.style.fontFamily = 'Pixel, monospace';
        dog.style.color = '#fd2d5c';
        dog.style.transform = 'scale(0)';
        
        // 随机野狗图标
        const dogs = ['🐕', '🐶', '🏃', '🔥'];
        dog.textContent = dogs[Math.floor(Math.random() * dogs.length)];
        
        // 添加复古故障效果
        dog.style.textShadow = '1px 0 0 #0000ff, -1px 0 0 #fd2d5c, 0 1px 0 #0000ff, 0 -1px 0 #fd2d5c';
        
        document.body.appendChild(dog);
        
        // 触发动画 - 像素风格的线性动画
        setTimeout(() => {
            dog.style.transition = 'all 0.8s linear';
            dog.style.transform = `translate(${targetX - x}px, ${targetY - y}px) scale(1)`;
            dog.style.opacity = '0';
            
            // 模拟信号衰减的闪烁效果
            let opacity = 1;
            const flickerInterval = setInterval(() => {
                opacity = opacity === 1 ? 0.7 : 1;
                dog.style.opacity = opacity;
            }, 40);
            
            setTimeout(() => clearInterval(flickerInterval), 600);
        }, 10);
        
        // 动画结束后移除
        setTimeout(() => {
            dog.remove();
        }, 800);
    }
    
    // 添加双击和长按支持
    let pressTimer;
    let autoClickInterval;
    
    // 鼠标按下事件
    gbarButton.addEventListener('mousedown', () => {
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            autoClickInterval = setInterval(callGeebar, 100); // 每100ms自动点击一次
        }, 500); // 按下500ms后开始自动点击
    });
    
    // 鼠标释放事件
    function handleRelease() {
        clearTimeout(pressTimer);
        clearInterval(autoClickInterval);
    }
    
    gbarButton.addEventListener('mouseup', handleRelease);
    gbarButton.addEventListener('mouseleave', handleRelease);
    
    // 初始加载GBAR集结人数
    loadGbarCount();
    
    // 按钮点击事件
    gbarButton.addEventListener('click', callGeebar);
    
    // 添加复古风格的特效CSS
    const style = document.createElement('style');
    style.textContent = `
        /* 复古风格的召唤特效 */
        .eagle-effect {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            transform: scale(0);
            transition: all 1s linear;
            color: #fd2d5c;
            font-family: Pixel, monospace;
            text-shadow: 1px 0 0 #fd2d5c, -1px 0 0 #0000ff, 0 1px 0 #fd2d5c, 0 -1px 0 #0000ff;
        }
        
        .dog-effect {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            transform: scale(0);
            transition: all 0.8s linear;
            color: #fd2d5c;
            font-family: Pixel, monospace;
            text-shadow: 1px 0 0 #0000ff, -1px 0 0 #fd2d5c, 0 1px 0 #0000ff, 0 -1px 0 #fd2d5c;
        }
        
        /* 复古风格的震动和脉冲效果 */
        .screen-shake {
            animation: shake 0.1s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
        }
        
        /* 复古故障闪烁效果 */
        @keyframes glitchFlash {
            0% { opacity: 0; }
            20% { opacity: 0.05; }
            40% { opacity: 0.03; }
            60% { opacity: 0.08; }
            80% { opacity: 0.04; }
            100% { opacity: 0; }
        }
        
        @keyframes staticFlash {
            0% { opacity: 0; }
            50% { opacity: 0.2; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
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
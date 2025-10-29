// 计数器功能模块

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // GBAR召唤功能
    const gbarCountElement = document.getElementById('global-click-counter');
    const gbarButton = document.getElementById('click-button');
    const apiKey = '6c18b0cafb24205829af9e2fb75c3a2a';
    const counterId = '6200f7021fe890c7f925ff27cf10cabd';
    
    // 点击计数器，控制API请求频率
    let clickCount = 0;
    const apiRequestThreshold = 5;
    
    // 初始化全局点击计数器（本地存储）
    let globalClicks = localStorage.getItem('geebarGlobalClicks') ? parseInt(localStorage.getItem('geebarGlobalClicks')) : 0;
    
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
                        // 更新可视化效果
                        updateVisualization(count);
                    } else {
                        gbarCountElement.textContent = '0';
                        updateVisualization(0);
                    }
                } else {
                    gbarCountElement.textContent = '0';
                    updateVisualization(0);
                }
            })
            .catch(error => {
                console.error('加载GBAR能量失败:', error);
                gbarCountElement.textContent = '0';
                updateVisualization(0);
            });
    }
    
    // 呼叫GBAR - 优化版本，支持快速连续点击
    function callGeebar() {
        // 立即更新本地显示（+1），提供即时反馈
        const currentCount = parseInt(gbarCountElement.textContent.replace(/,/g, '')) || 0;
        const newValue = currentCount + 1;
        gbarCountElement.textContent = newValue.toLocaleString();
        
        // 更新可视化效果（每次点击都更新，提供即时反馈）
        updateVisualization(newValue);
        
        // 更新本地存储的点击计数
        globalClicks++;
        localStorage.setItem('geebarGlobalClicks', globalClicks);
        
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
    function sendApiRequest(count = apiRequestThreshold) {
        // 如果没有要发送的计数，直接返回
        if (count <= 0) return;
        
        const url = `https://js.ruseo.cn/api/counter.php?api_key=${apiKey}&action=increment&counter_id=${counterId}&value=${count}`;
        
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
    function createCallEffect() {
        const rect = gbarButton.getBoundingClientRect();
        
        // 创建多个特效元素
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                // 随机添加静态干扰效果
                if (Math.random() > 0.7) {
                    createStaticInterference();
                }
            }, i * 50);
        }
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
        document.body.appendChild(staticOverlay);
        
        setTimeout(() => {
            staticOverlay.remove();
        }, 100);
    }
    
    // 添加双击和长按支持
    let pressTimer;
    let autoClickInterval;
    
    // 处理释放事件（鼠标或触摸）
    function handleRelease() {
        clearTimeout(pressTimer);
        clearInterval(autoClickInterval);
        
        // 停止点击或长按后，立即发送剩余的点击次数
        if (clickCount > 0) {
            sendApiRequest(clickCount); // 发送实际的点击次数
            clickCount = 0; // 重置计数器
        }
    }
    
    // 鼠标事件
    gbarButton.addEventListener('mousedown', () => {
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            autoClickInterval = setInterval(callGeebar, 100); // 每100ms自动点击一次
        }, 500); // 按下500ms后开始自动点击
    });
    
    gbarButton.addEventListener('mouseup', handleRelease);
    gbarButton.addEventListener('mouseleave', handleRelease);
    
    // 触摸事件支持（移动端长按功能优化）
    gbarButton.addEventListener('touchstart', function(e) {
        // 仅在事件可取消时才阻止默认行为
        if (e.cancelable) {
            e.preventDefault(); // 阻止默认行为，防止触摸时页面滚动和触发点击事件
        }
        
        // 立即执行一次点击（确保点击有反馈）
        callGeebar();
        
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            autoClickInterval = setInterval(callGeebar, 80); // 每80ms自动点击一次（更快的频率增加体验）
        }, 300); // 按下300ms后开始自动点击（更快的响应）
    }, { passive: false }); // 明确指定passive为false以允许preventDefault
    
    document.addEventListener('touchend', handleRelease);
    
    // 触摸移出按钮区域事件
    gbarButton.addEventListener('touchmove', function(e) {
        const rect = gbarButton.getBoundingClientRect();
        const touch = e.touches[0];
        // 检查触摸点是否还在按钮内
        if (touch.clientX < rect.left || touch.clientX > rect.right || 
            touch.clientY < rect.top || touch.clientY > rect.bottom) {
            handleRelease();
        }
    }, { passive: true }); // 设为true以提高滚动性能，因为没有调用preventDefault
    
    document.addEventListener('touchcancel', handleRelease);
    
    // 按钮点击事件
    gbarButton.addEventListener('click', callGeebar);
    
    // 创建能量可视化元素 - 平行四边形网格样式
    function createVisualizationElements() {
        // 创建能量网格容器
        const gridContainer = document.createElement('div');
        gridContainer.id = 'energy-grid-container';
        gridContainer.className = 'energy-visualization';
        
        // 创建网格内容容器
        const gridContent = document.createElement('div');
        gridContent.id = 'energy-grid';
        gridContent.className = 'energy-grid';
        gridContainer.appendChild(gridContent);
        
        // 将可视化容器插入到计数器容器中
        const counterContainer = document.querySelector('.counter-container');
        if (counterContainer) {
            const titleElement = counterContainer.querySelector('h3');
            if (titleElement) {
                counterContainer.insertBefore(gridContainer, titleElement.nextSibling);
            }
        }
        
        // 添加可视化相关的CSS
        const style = document.createElement('style');
        style.textContent = `
            /* 能量可视化样式 - 平行四边形网格 */
            .energy-visualization {
                position: relative;
                width: 100%;
                margin: 20px 0;
                padding: 10px;
                min-height: 60px;
                overflow: hidden;
            }
            
            .energy-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                width: 100%;
            }
            
            .energy-cell {
                width: calc(20% - 4.8px); /* 一行5个，减去间距 */
                height: 20px;
                background-color: transparent;
                border: 1px solid #666;
                transform: skewX(-20deg); /* 斜着的平行四边形 */
                margin-bottom: 5px;
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }
            
            .energy-cell.filled {
                box-shadow: 0 0 10px rgba(253, 45, 92, 0.7);
            }
            
            .energy-cell::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
            }
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            /* 添加间歇性故障效果 */
            @keyframes glitchEffect {
                0%, 93%, 100% { transform: translateX(0); }
                94% { transform: translateX(-1px); }
                95% { transform: translateX(1px); }
                96% { transform: translateX(-1px); }
                97% { transform: translateX(1px); }
                98% { transform: translateX(-1px); }
                99% { transform: translateX(1px); }
            }
        
            
            /* 响应式调整 */
            @media (max-width: 768px) {
                .energy-visualization {
                    margin: 15px 0;
                    padding: 8px;
                }
                
                .energy-cell {
                    height: 18px;
                    gap: 6px;
                }
            }
            
            @media (max-width: 480px) {
                .energy-visualization {
                    margin: 10px 0;
                    padding: 6px;
                }
                
                .energy-cell {
                    height: 15px;
                    gap: 4px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 更新能量可视化 - 平行四边形网格
    function updateVisualization(count) {
        const grid = document.getElementById('energy-grid');
        if (!grid) return;
        
        // 每个格子代表1000点能量
        const pointsPerCell = 1000;
        // 每行5个格子
        const cellsPerRow = 5;
        // 计算需要的格子数量
        const cellsNeeded = Math.max(1, Math.ceil(count / pointsPerCell));
        // 计算需要的完整行数（向上取整）
        const rowsNeeded = Math.ceil(cellsNeeded / cellsPerRow);
        // 计算总共需要创建的格子数量（完整的行数 × 每行的格子数）
        const totalCells = rowsNeeded * cellsPerRow;
        
        // 清理现有的格子（保留结构）
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }
        
        // 创建所需数量的格子（每行5个，填满一行再显示下一行）
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'energy-cell';
            
            // 如果这个格子应该被填满（只有当count >= pointsPerCell时才会填充）
            if (i < Math.floor(count / pointsPerCell)) {
                cell.classList.add('filled');
                cell.style.borderColor = '#fd2d5c';
                // 创建完全填充的平行四边形元素
                const fill = document.createElement('div');
                fill.style.position = 'absolute';
                fill.style.top = '-5px';
                fill.style.left = '0px';
                fill.style.height = 'calc(100% + 10px)';
                fill.style.width = '100%';
                fill.style.backgroundColor = '#fd2d5c';
                fill.style.transform = 'skewX(0deg)'; // 与父元素相同的倾斜角度
                fill.style.transformOrigin = '0 0';
                cell.appendChild(fill);
            }
            // 如果是部分填充的格子（只对第一个格子进行部分填充，除非count >= pointsPerCell）
            else if (i === Math.floor(count / pointsPerCell)) {
                const fillPercentage = (count % pointsPerCell) / pointsPerCell;
                if (fillPercentage > 0) {
                    // 创建填充元素 - 调整为完全匹配平行四边形的样式
                    const fill = document.createElement('div');
                    fill.style.position = 'absolute';
                    fill.style.top = '-5px';
                    fill.style.left = '0px';
                    fill.style.height = 'calc(100% + 10px)';
                    fill.style.width = `${fillPercentage * 100}%`;
                    fill.style.backgroundColor = '#fd2d5c';
                    fill.style.transform = 'skewX(0deg)'; // 与父元素相同的倾斜角度
                    fill.style.transformOrigin = '0 0';
                    cell.appendChild(fill);
                    cell.style.borderColor = '#fd2d5c';
                }
            }
            
            grid.appendChild(cell);
        }
    }
    
    // 初始化可视化元素
    createVisualizationElements();
    
    loadGbarCount();
    
    // 添加复古风格的特效CSS
    const style = document.createElement('style');
    style.textContent = `
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
        
        /* 移除了计数器闪烁效果 */
    `;
    document.head.appendChild(style);
    
    // 添加定期自动更新功能，每30秒更新一次
    setInterval(loadGbarCount, 10000);
    
});
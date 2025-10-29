// 计数器功能模块

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    const gbarCountElement = document.getElementById('global-click-counter');
    const gbarButton = document.getElementById('click-button');
    
    // 模式切换配置 - 可以通过URL参数或直接修改此处切换模式
    // 从URL参数获取模式设置（例如：?mode=api 或 ?mode=local）
    const urlParams = new URLSearchParams(window.location.search);
    // const urlMode = urlParams.get('mode');
    const urlMode = 'api';

    
    // 配置参数
    const CONFIG = {
        // 默认模式: 'local' (本地测试) 或 'api' (API模式)
        mode: urlMode === 'api' ? 'api' : 'local',
        
        // API模式配置
        api: {
            key: '6c18b0cafb24205829af9e2fb75c3a2a',
            counterId: '6200f7021fe890c7f925ff27cf10cabd',
            baseUrl: 'https://js.ruseo.cn/api/counter.php'
        },
        
        // 本地测试模式配置
        local: {
            baseCount: 208000, // 模拟的基础计数值
            randomVariation: 500 // 随机变化范围
        },
        
        // 通用配置
        clickThreshold: 5, // 点击阈值，达到后更新数据
        autoUpdateInterval: 10000 // 自动更新间隔(毫秒)
    };
    
    // 显示当前模式信息
    console.log(`当前运行模式: ${CONFIG.mode.toUpperCase()} 模式`);
    
    // 点击计数器，控制数据更新频率
    let clickCount = 0;
    
    // 初始化本地点击计数器（本地存储）
    let localClickCount = localStorage.getItem('geebarLocalClicks') ? parseInt(localStorage.getItem('geebarLocalClicks')) : 0;
    
    // 加载GBAR召唤能量 - 根据模式选择不同的加载方式
    function loadGbarCount() {
        if (CONFIG.mode === 'local') {
            loadLocalGbarCount();
        } else {
            loadApiGbarCount();
        }
    }
    
    // 加载本地测试模式的GBAR召唤能量
    function loadLocalGbarCount() {
        // 本地模式：使用本地存储的点击数 + 基础计数 + 模拟的其他用户点击
        const simulatedOtherUsers = Math.floor(Math.random() * CONFIG.local.randomVariation);
        const totalCount = CONFIG.local.baseCount + localClickCount + simulatedOtherUsers;
        
        // 更新显示
        gbarCountElement.textContent = totalCount.toLocaleString();
        
        // 添加数字变化动画
        gbarCountElement.classList.add('counter-flash');
        setTimeout(() => gbarCountElement.classList.remove('counter-flash'), 500);
        
        // 更新可视化效果
        updateVisualization(totalCount);
        
        console.log(`[本地模式] 当前计数: ${totalCount} (基础: ${CONFIG.local.baseCount}, 本地点击: ${localClickCount}, 模拟其他用户: ${simulatedOtherUsers})`);
    }
    
    // 加载API模式的GBAR召唤能量
    function loadApiGbarCount() {
        const url = `${CONFIG.api.baseUrl}?api_key=${CONFIG.api.key}&action=get&counter_id=${CONFIG.api.counterId}`;
        
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
                        console.log(`[API模式] 成功加载计数: ${count}`);
                    } else {
                        handleApiError('计数数据无效');
                    }
                } else {
                    handleApiError('未返回有效数据');
                }
            })
            .catch(error => {
                handleApiError(`API请求失败: ${error.message}`);
            });
    }
    
    // 处理API错误，回退到本地模式临时显示
    function handleApiError(errorMsg) {
        console.error(`[API模式] ${errorMsg}`);
        
        // 临时使用本地数据作为显示
        const fallbackCount = CONFIG.local.baseCount + localClickCount;
        gbarCountElement.textContent = fallbackCount.toLocaleString();
        updateVisualization(fallbackCount);
        
        console.log(`[API模式] 临时使用本地数据显示: ${fallbackCount}`);
    }
    
    // 呼叫GBAR - 优化版本，支持快速连续点击
    function callGeebar() {
        // 如果处于按压会话且达到会话上限，则停止自动连点并忽略本次调用
        if (isPressing && sessionClickTotal >= SESSION_MAX_PER_PRESS) {
            if (autoClickInterval) clearInterval(autoClickInterval);
            return;
        }

        // 立即更新本地显示（+1），提供即时反馈
        const currentCount = parseInt(gbarCountElement.textContent.replace(/,/g, '')) || 0;
        const newValue = currentCount + 1;
        gbarCountElement.textContent = newValue.toLocaleString();
        
        // 更新可视化效果（每次点击都更新，提供即时反馈）
        updateVisualization(newValue);
        
        // 更新本地存储的点击计数
        localClickCount++;
        localStorage.setItem('geebarLocalClicks', localClickCount);
        
        createCallEffect();
        
        // 增加点击计数
        clickCount++;
        // 会话内累计计数（仅在按压会话中统计）
        if (isPressing) {
            sessionClickTotal++;
            // 如果刚好达到上限，立即停止自动连点
            if (sessionClickTotal >= SESSION_MAX_PER_PRESS && autoClickInterval) {
                clearInterval(autoClickInterval);
            }
        }
        
        // 达到阈值时更新数据（根据模式选择不同的更新方式）
        if (clickCount >= CONFIG.clickThreshold) {
            if (CONFIG.mode === 'local') {
                updateLocalData();
            } else {
                sendApiRequest();
            }
            clickCount = 0;
        }
    }
    
    // 更新本地数据（本地测试模式）
    function updateLocalData(count = CONFIG.clickThreshold) {
        // 如果没有要更新的计数，直接返回
        if (count <= 0) return;
        
        console.log(`[本地模式] 更新本地数据，增加点击数: ${count}`);
        
        // 保存到本地存储（已经在callGeebar中实时更新了，这里可以做一些额外的处理）
        localStorage.setItem('geebarLocalClicks', localClickCount);
        
        // 更新显示的数据
        loadLocalGbarCount();
    }
    
    // 发送API请求更新计数（API模式）
    function sendApiRequest(count = CONFIG.clickThreshold) {
        // 如果没有要发送的计数，直接返回
        if (count <= 0) return;
        
        console.log(`[API模式] 发送API请求，增加点击数: ${count}`);
        
        const url = `${CONFIG.api.baseUrl}?api_key=${CONFIG.api.key}&action=increment&counter_id=${CONFIG.api.counterId}&value=${count}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.success) {
                    console.log(`[API模式] API更新成功`);
                    // API更新成功后，重新获取准确的计数值
                    loadApiGbarCount();
                } else {
                    console.error(`[API模式] API更新失败: ${data ? JSON.stringify(data) : '未知错误'}`);
                    // 失败时也重新获取最新数据
                    loadApiGbarCount();
                }
            })
            .catch(error => {
                console.error(`[API模式] API请求失败: ${error.message}`);
                // 失败时重新获取最新数据
                loadApiGbarCount();
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
    // 会话内限制：连续点击/长按单次会话最多+100
    let isPressing = false;
    let sessionClickTotal = 0;
    const SESSION_MAX_PER_PRESS = 100;
    
    // 处理释放事件（鼠标或触摸）
    function handleRelease() {
        clearTimeout(pressTimer);
        clearInterval(autoClickInterval);
        autoClickInterval = null;
        isPressing = false;
        
        // 停止点击或长按后，立即更新剩余的点击次数
        if (clickCount > 0) {
            if (CONFIG.mode === 'local') {
                updateLocalData(clickCount); // 本地模式：更新本地数据
            } else {
                sendApiRequest(clickCount); // API模式：发送API请求
            }
            clickCount = 0; // 重置计数器
        }
        // 重置会话累计
        sessionClickTotal = 0;
    }
    
    // 鼠标事件
    gbarButton.addEventListener('mousedown', () => {
        isPressing = true;
        sessionClickTotal = 0;
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            autoClickInterval = setInterval(callGeebar, 1000); // 每1000ms自动点击一次
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
        
        isPressing = true;
        sessionClickTotal = 0;
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
        const pointsPerCell = 10000000;
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
    
    // 添加定期自动更新功能
    setInterval(loadGbarCount, CONFIG.autoUpdateInterval);
    
    // 添加模式切换UI（可选功能，可以在控制台手动调用）
    window.switchCounterMode = function(mode) {
        if (mode === 'local' || mode === 'api') {
            CONFIG.mode = mode;
            console.log(`模式已切换为: ${mode.toUpperCase()} 模式`);
            loadGbarCount(); // 立即加载新模式的数据
            return true;
        }
        console.error('无效的模式参数，请使用 "local" 或 "api"');
        return false;
    };
    
    // 调试函数：重置本地点击计数
    window.resetLocalClicks = function() {
        localClickCount = 0;
        localStorage.setItem('geebarLocalClicks', 0);
        console.log('本地点击计数已重置');
        if (CONFIG.mode === 'local') {
            loadLocalGbarCount();
        }
        return true;
    };
    
    console.log('=== 计数器系统调试帮助 ===');
    console.log('- 切换模式: window.switchCounterMode("local") 或 window.switchCounterMode("api")');
    console.log('- 重置本地计数: window.resetLocalClicks()');
    console.log('- 或使用URL参数: ?mode=local 或 ?mode=api');
    console.log('=======================');

    
});
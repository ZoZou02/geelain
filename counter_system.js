// 计数器功能模块
// 导入配置
import COUNTER_CONFIG from './counter_config.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取计数器元素
    const gbarCountElement = document.getElementById('global-click-counter');
    const gbarButton = document.getElementById('click-button');
    
    
    // 从URL参数获取模式设置（例如：?mode=api 或 ?mode=local）
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    
    // 合并URL模式设置和配置文件中的设置
    const CONFIG = {
        ...COUNTER_CONFIG,
        mode: urlMode === 'local' || urlMode === 'api' ? urlMode : COUNTER_CONFIG.mode
    };
    
    // 显示当前模式信息
    console.log(`当前运行模式: ${CONFIG.mode.toUpperCase()} 模式`);
    
    // 点击计数器，控制数据更新频率
    let clickCount = 0;
    
    // 初始化本地点击计数器（本地存储）
    let localClickCount = localStorage.getItem('geebarLocalClicks') ? parseInt(localStorage.getItem('geebarLocalClicks')) : 0;
    
    // 初始化本地第二个计数器（本地存储）
    let localSecondaryCount = localStorage.getItem('geebarSecondaryClicks') ? parseInt(localStorage.getItem('geebarSecondaryClicks')) : 0;
    
    // 加载计数器数据 - 根据模式选择不同的加载方式
    function loadCounters() {
        if (CONFIG.mode === 'local') {
            loadLocalCounters();
        } else {
            loadApiCounters();
        }
    }

    // 次计数器自增（带重试）
    function incrementSecondaryWithRetry(retries = 2) {
        const url = `${CONFIG.api.baseUrl}?api_key=${CONFIG.secondaryCounter.apiKey}&action=${CONFIG.api.incrementAction}&counter_id=${CONFIG.secondaryCounter.id}`;
        return fetch(url)
            .then(r => r.json())
            .then(data => {
                if (!(data && data.success)) {
                    if (retries > 0) {
                        console.warn(`[API模式] 第二计数器增加失败，重试剩余 ${retries} 次`);
                        return incrementSecondaryWithRetry(retries - 1);
                    }
                    throw new Error(data && data.message ? data.message : '第二计数器增加失败');
                }
                console.log('[API模式] 第二计数器增加成功');
                return true;
            })
            .catch(err => {
                if (retries > 0) {
                    console.warn(`[API模式] 第二计数器增加请求异常，重试剩余 ${retries} 次: ${err.message}`);
                    return incrementSecondaryWithRetry(retries - 1);
                }
                console.error(`[API模式] 第二计数器增加最终失败: ${err.message}`);
            });
    }

    // 兼容旧调用名
    function loadGbarCount() {
        loadCounters();
    }
    function loadLocalGbarCount() {
        loadLocalCounters();
    }
    
    // 加载本地测试模式的计数器数据
    function loadLocalCounters() {
        // 本地模式：使用本地存储的点击数 + 基础计数 + 模拟的其他用户点击
        const simulatedOtherUsers = Math.floor(Math.random() * CONFIG.local.randomVariation);
        const primaryCount = CONFIG.local.primaryBaseCount + localClickCount + simulatedOtherUsers;
        const secondaryCount = CONFIG.local.secondaryBaseCount + localSecondaryCount;
        const thresholdUnit = CONFIG.primaryCounter.resetThreshold || 1000000000;

        // 总能量 = 主计数 + 次计数 * 阈值单位
        const totalEnergy = primaryCount + secondaryCount * thresholdUnit;

        // 更新显示（总能量）
        gbarCountElement.textContent = totalEnergy.toLocaleString();

        // 添加数字变化动画
        gbarCountElement.classList.add('counter-flash');
        setTimeout(() => gbarCountElement.classList.remove('counter-flash'), 500);

        // 更新可视化效果（按主/次计数组件）
        updateVisualizationFromComponents(primaryCount, secondaryCount);

        console.log(`[本地模式] 主计数器(显示并入总能量): ${primaryCount}, 第二计数器: ${secondaryCount}, 总能量: ${totalEnergy}`);
    }
    
    // 加载API模式的计数器数据
    function loadApiCounters() {
        const primaryUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.getAction}&counter_id=${CONFIG.primaryCounter.id}`;
        const secondaryUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.secondaryCounter.apiKey}&action=${CONFIG.api.getAction}&counter_id=${CONFIG.secondaryCounter.id}`;

        Promise.all([
            fetch(primaryUrl).then(r => r.json()).catch(err => ({ error: err })),
            fetch(secondaryUrl).then(r => r.json()).catch(err => ({ error: err }))
        ])
        .then(([pRes, sRes]) => {
            const thresholdUnit = CONFIG.primaryCounter.resetThreshold || 1000000000;

            const validPrimary = pRes && pRes.success && pRes.counter && pRes.counter.current_count;
            const validSecondary = sRes && sRes.success && sRes.counter && sRes.counter.current_count;

            if (!validPrimary || !validSecondary) {
                if (!validPrimary) console.error('[API模式] 主计数数据无效或请求失败');
                if (!validSecondary) console.error('[API模式] 第二计数数据无效或请求失败');
                return handleApiError('计数器数据不完整');
            }

            const primaryCount = parseInt(pRes.counter.current_count) || 0;
            const secondaryCount = parseInt(sRes.counter.current_count) || 0;
            const totalEnergy = primaryCount + secondaryCount * thresholdUnit;

            // 显示总能量（不显示第二计数器独立数值）
            gbarCountElement.textContent = totalEnergy.toLocaleString();

            // 动画与可视化（主/次计数组件）
            gbarCountElement.classList.add('counter-flash');
            setTimeout(() => gbarCountElement.classList.remove('counter-flash'), 500);
            updateVisualizationFromComponents(primaryCount, secondaryCount);

            console.log(`[API模式] 主: ${primaryCount}, 次: ${secondaryCount}, 总能量: ${totalEnergy}`);
        })
        .catch((error) => {
            handleApiError(`计数器API并行请求失败: ${error.message}`);
        });
    }
    
    // 从 GET 接口解析计数值
    function parseCountFromGetResponse(data) {
        if (!data) return NaN;
        
        try {
            // 只处理特定格式: {"success":true,"counter":{"current_count":"911771794"}}
            if (data.success === true && data.counter && typeof data.counter.current_count !== 'undefined') {
                return parseInt(data.counter.current_count);
            }
        } catch (error) {
            console.error('解析计数值时出错:', error);
        }
        return NaN;
    }

    // 获取主/次计数（GET），返回 { primary, secondary }
    function getPrimarySecondaryCounts() {
        const primaryUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.getAction}&counter_id=${CONFIG.primaryCounter.id}`;
        const secondaryUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.secondaryCounter.apiKey}&action=${CONFIG.api.getAction}&counter_id=${CONFIG.secondaryCounter.id}`;
        return Promise.all([
            fetch(primaryUrl).then(r => r.json()).catch(() => null),
            fetch(secondaryUrl).then(r => r.json()).catch(() => null)
        ]).then(([pRes, sRes]) => {
            const primary = parseCountFromGetResponse(pRes);
            const secondary = parseCountFromGetResponse(sRes);
            return { primary: isNaN(primary) ? 0 : primary, secondary: isNaN(secondary) ? 0 : secondary };
        });
    }

    // 计算“进位阈值”使红色格在进位时恰好补满一行（5个）
    function getEffectiveResetThreshold(secondaryCount) {
        const thresholdUnit = CONFIG.primaryCounter.resetThreshold || 1000000000; // 1,000,000,000
        const pointsPerCell = 10000000; // 10,000,000
        const cellsPerRow = 5;
        const goldCells = Math.max(0, Math.floor(secondaryCount));
        const remainder = goldCells % cellsPerRow;
        if (remainder === 0) return thresholdUnit;
        const cellsToFillRow = cellsPerRow - remainder; // 需要补的红色格数量
        const adjusted = thresholdUnit - cellsToFillRow * pointsPerCell; // 向下取整，确保红色格补满一行
        return Math.max(pointsPerCell, adjusted);
    }

    // 处理API错误，回退到本地模式临时显示
    function handleApiError(errorMsg) {
        console.error(`[API模式] ${errorMsg}`);
        
        // 临时使用本地数据作为显示（总能量）
        const thresholdUnit = CONFIG.primaryCounter.resetThreshold || 1000000000;
        const fallbackPrimary = CONFIG.local.primaryBaseCount + localClickCount;
        const totalEnergy = fallbackPrimary + (localSecondaryCount * thresholdUnit);
        gbarCountElement.textContent = totalEnergy.toLocaleString();
        updateVisualizationFromComponents(fallbackPrimary, localSecondaryCount);
        
        console.log(`[API模式] 临时使用本地数据显示: 主计数器 ${fallbackPrimary}, 第二计数器 ${localSecondaryCount}, 总能量 ${totalEnergy}`);
    }
    
    // 优化版本，支持快速连续点击和阈值重置逻辑
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
                // 在API模式下，发送请求并检查阈值逻辑
                const url = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.incrementAction}&counter_id=${CONFIG.primaryCounter.id}&value=${clickCount}`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.success) {
                            console.log('[API模式] 主计数增加成功');
                            // 成功后主动拉取最新主/次计数再判断阈值
                            return getPrimarySecondaryCounts().then(({ primary, secondary }) => {
                                const effectiveThreshold = getEffectiveResetThreshold(secondary);
                                if (primary >= effectiveThreshold) {
                                    console.log('[API模式] 达到重置阈值，准备重置主计数器并增加第二计数器');
                                    const resetUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.resetAction || 'reset'}&counter_id=${CONFIG.primaryCounter.id}`;
                                    return fetch(resetUrl)
                                        .then(r => r.json())
                                        .then(resetData => {
                                            if (resetData && resetData.success) {
                                                console.log('[API模式] 主计数器重置成功');
                                                return incrementSecondaryWithRetry().finally(() => loadApiCounters());
                                            } else {
                                                console.error('[API模式] 主计数器重置失败:', resetData ? resetData.message : '未知错误');
                                                loadApiCounters();
                                            }
                                        })
                                        .catch(err => {
                                            console.error(`[API模式] 主计数器重置请求失败: ${err.message}`);
                                            loadApiCounters();
                                        });
                                } else {
                                    // 未达到阈值，直接刷新
                                    loadApiCounters();
                                }
                            });
                        } else {
                            console.error('[API模式] 主计数更新失败:', data ? data.message : '未知错误');
                        }
                    })
                    .catch(error => {
                        console.error(`[API模式] 主计数更新请求失败: ${error.message}`);
                        // 保持现状，等待下次自动刷新
                    });
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
        loadLocalCounters();
    }
    
    // 发送API请求更新计数（API模式）
    function sendApiRequest(count = CONFIG.clickThreshold) {
        // 如果没有要发送的计数，直接返回
        if (count <= 0) return;
        
        console.log(`[API模式] 发送API请求，增加点击数: ${count}`);
        
        const url = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.incrementAction}&counter_id=${CONFIG.primaryCounter.id}&value=${count}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.success) {
                    console.log('[API模式] 主计数增加成功');
                    // 成功后主动拉取最新主/次计数再判断阈值
                    return getPrimarySecondaryCounts().then(({ primary, secondary }) => {
                        const effectiveThreshold = getEffectiveResetThreshold(secondary);
                        if (primary >= effectiveThreshold) {
                            console.log('[API模式] 达到重置阈值，准备重置主计数器并增加第二计数器');
                            const resetUrl = `${CONFIG.api.baseUrl}?api_key=${CONFIG.primaryCounter.apiKey}&action=${CONFIG.api.resetAction || 'reset'}&counter_id=${CONFIG.primaryCounter.id}`;
                            return fetch(resetUrl)
                                .then(r => r.json())
                                .then(resetData => {
                                    if (resetData && resetData.success) {
                                        console.log('[API模式] 主计数器重置成功');
                                        return incrementSecondaryWithRetry().finally(() => loadApiCounters());
                                    } else {
                                        console.error('[API模式] 主计数器重置失败:', resetData ? resetData.message : '未知错误');
                                        loadApiCounters();
                                    }
                                })
                                .catch(err => {
                                    console.error(`[API模式] 主计数器重置请求失败: ${err.message}`);
                                    loadApiCounters();
                                });
                        } else {
                            // 未达到阈值，直接刷新
                            loadApiCounters();
                        }
                    });
                } else {
                    console.error('[API模式] 主计数更新失败:', data ? data.message : '未知错误');
                }
            })
            .catch(error => {
                console.error(`[API模式] 主计数更新请求失败: ${error.message}`);
                // 保持现状，等待下次自动刷新
            });
    }
    
    // 创建特效
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
    // 会话内限制：连续点击/长按单次会话最多+1000000
    let isPressing = false;
    let sessionClickTotal = 0;
    const SESSION_MAX_PER_PRESS = 1000000;
    
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
            
            // 为counter-container添加动画效果
            counterContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            counterContainer.style.transform = 'translateY(0)';
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
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0;
                transform: translateY(20px);
                animation: containerAppear 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
            .energy-cell.gold {
                border-color: #f4c542 !important;
                box-shadow: 0 0 10px rgba(244, 197, 66, 0.7);
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
            
            /* 容器出现动画 */
            @keyframes containerAppear {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* 格子出现动画 */
            @keyframes cellAppear {
                0% {
                    opacity: 0;
                    transform: skewX(-20deg) scale(0.8) translateY(10px);
                }
                100% {
                    opacity: 1;
                    transform: skewX(-20deg) scale(1) translateY(0);
                }
            }
            
            /* 格子填充动画 */
            @keyframes cellFill {
                0% {
                    transform: skewX(-20deg) scale(0.9);
                    box-shadow: 0 0 5px rgba(253, 45, 92, 0.3);
                }
                50% {
                    transform: skewX(-20deg) scale(1.05);
                    box-shadow: 0 0 15px rgba(253, 45, 92, 0.9);
                }
                100% {
                    transform: skewX(-20deg) scale(1);
                    box-shadow: 0 0 10px rgba(253, 45, 92, 0.7);
                }
            }
            
            /* 金块合成动画 */
            @keyframes cellGold {
                0% {
                    transform: skewX(-20deg) scale(0.8);
                    box-shadow: 0 0 5px rgba(244, 197, 66, 0.3);
                }
                30% {
                    transform: skewX(-20deg) scale(1.1);
                    box-shadow: 0 0 20px rgba(244, 197, 66, 1);
                }
                60% {
                    transform: skewX(-20deg) scale(0.95);
                    box-shadow: 0 0 15px rgba(244, 197, 66, 0.8);
                }
                100% {
                    transform: skewX(-20deg) scale(1);
                    box-shadow: 0 0 10px rgba(244, 197, 66, 0.7);
                }
            }
            
            /* 新金块特殊效果 */
            .energy-cell.new-gold {
                animation: newGoldEffect 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            @keyframes newGoldEffect {
                0% {
                    transform: skewX(-20deg) scale(0.5);
                    opacity: 0;
                    box-shadow: 0 0 0px rgba(244, 197, 66, 0);
                }
                20% {
                    transform: skewX(-20deg) scale(1.2);
                    opacity: 1;
                    box-shadow: 0 0 25px rgba(244, 197, 66, 1);
                }
                40% {
                    transform: skewX(-20deg) scale(0.9);
                    box-shadow: 0 0 20px rgba(244, 197, 66, 0.8);
                }
                60% {
                    transform: skewX(-20deg) scale(1.05);
                    box-shadow: 0 0 15px rgba(244, 197, 66, 0.9);
                }
                80% {
                    transform: skewX(-20deg) scale(0.98);
                    box-shadow: 0 0 12px rgba(244, 197, 66, 0.7);
                }
                100% {
                    transform: skewX(-20deg) scale(1);
                    box-shadow: 0 0 10px rgba(244, 197, 66, 0.7);
                }
            }
            
            /* 容器震动效果 */
            .counter-container.gold-synthesis {
                animation: containerShake 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes containerShake {
                0%, 100% { transform: translateY(0) translateX(0); }
                10% { transform: translateY(-2px) translateX(-1px); }
                20% { transform: translateY(2px) translateX(1px); }
                30% { transform: translateY(-1px) translateX(-1px); }
                40% { transform: translateY(1px) translateX(1px); }
                50% { transform: translateY(-1px) translateX(0); }
                60% { transform: translateY(1px) translateX(0); }
                70% { transform: translateY(-0.5px) translateX(0); }
                80% { transform: translateY(0.5px) translateX(0); }
                90% { transform: translateY(0) translateX(0); }
            }

            /* 网格在减少格子时的轻微收缩反馈 */
            .energy-grid.grid-collapse {
                animation: gridCollapse 0.3s ease;
            }
            @keyframes gridCollapse {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.98); opacity: 0.95; }
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
        
        // 每个格子代表10,000,000点能量
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

    // 新增：基于主/次计数组件更新可视化
    function updateVisualizationFromComponents(primaryCount, secondaryCount) {
        const grid = document.getElementById('energy-grid');
        if (!grid) return;

        const pointsPerCell = 10000000; // 10,000,000
        const cellsPerRow = 5;
        const thresholdUnit = CONFIG.primaryCounter.resetThreshold || 1000000000; // 1,000,000,000
        // 金色格单位直接等于 1,000,000,000（第二计数器每 +1 渲染 1 个金色格）
        const goldCells = Math.max(0, Math.floor(secondaryCount));
        const primaryFullCells = Math.floor(primaryCount / pointsPerCell);
        const primaryPartial = (primaryCount % pointsPerCell) / pointsPerCell;
        
        // 检查上次渲染的值
        const previousGoldCells = parseInt(grid.dataset.previousGoldCells || '0');
        const prevPrimaryFullCells = parseInt(grid.dataset.prevPrimaryFullCells || '0');
        const prevPrimaryPartial = parseFloat(grid.dataset.prevPrimaryPartial || '0');

        const hasNewGoldCell = goldCells > previousGoldCells;
        const redFullIncreased = primaryFullCells > prevPrimaryFullCells;
        const redDecreased = (primaryFullCells < prevPrimaryFullCells) || (primaryFullCells === prevPrimaryFullCells && primaryPartial < prevPrimaryPartial);

        // 记录本次值（用于下次对比）
        grid.dataset.previousGoldCells = goldCells.toString();
        grid.dataset.prevPrimaryFullCells = primaryFullCells.toString();
        grid.dataset.prevPrimaryPartial = primaryPartial.toString();
        
        // 如果有新金块合成或红色格减少（重置），触发容器震动效果
        if (hasNewGoldCell || redDecreased) {
            const counterContainer = document.querySelector('.counter-container');
            if (counterContainer) {
                counterContainer.classList.add('gold-synthesis');
                setTimeout(() => {
                    counterContainer.classList.remove('gold-synthesis');
                }, 600);
            }
        }
        // 红色格减少时给网格一个轻微收缩反馈
        if (redDecreased) {
            const gridEl = document.getElementById('energy-grid');
            if (gridEl) {
                gridEl.classList.add('grid-collapse');
                setTimeout(() => gridEl.classList.remove('grid-collapse'), 300);
            }
        }

        // 混合单位格子总数 = 金色格（以 1B 为单位）+ 红色满格 + 是否需要一个红色部分格
        const redCellsNeeded = primaryFullCells + (primaryPartial > 0 ? 1 : 0);
        const cellsNeeded = Math.max(1, goldCells + redCellsNeeded);
        const rowsNeeded = Math.ceil(cellsNeeded / cellsPerRow);
        const totalCells = rowsNeeded * cellsPerRow;

        while (grid.firstChild) grid.removeChild(grid.firstChild);

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'energy-cell';
            

            if (i < goldCells) {
                // 金色满格
                cell.classList.add('gold');
                
                // 如果是新合成的金块，仅对新增的金色格添加动画
                if (hasNewGoldCell && i >= previousGoldCells) {
                    const localIndex = i - previousGoldCells;
                    const delay = localIndex * 80;
                    cell.classList.add('new-gold');
                    setTimeout(() => {
                        cell.style.animation = 'cellGold 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                    }, delay);
                }
                
                const fill = document.createElement('div');
                fill.style.position = 'absolute';
                fill.style.top = '-5px';
                fill.style.left = '0px';
                fill.style.height = 'calc(100% + 10px)';
                fill.style.width = '100%';
                fill.style.backgroundColor = '#f4c542';
                fill.style.transform = 'skewX(0deg)';
                fill.style.transformOrigin = '0 0';
                fill.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                cell.appendChild(fill);
            } else if (i < goldCells + primaryFullCells) {
                // 红色满格（来自第一计数器）
                cell.classList.add('filled');
                cell.style.borderColor = '#fd2d5c';
                const fill = document.createElement('div');
                fill.style.position = 'absolute';
                fill.style.top = '-5px';
                fill.style.left = '0px';
                fill.style.height = 'calc(100% + 10px)';
                fill.style.width = '100%';
                fill.style.backgroundColor = '#fd2d5c';
                fill.style.transform = 'skewX(0deg)';
                fill.style.transformOrigin = '0 0';
                fill.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                cell.appendChild(fill);

                // 仅对新增的红色满格添加填充动画
                const redStartIndex = goldCells + prevPrimaryFullCells;
                if (redFullIncreased && i >= redStartIndex) {
                    const localIndex = i - redStartIndex;
                    const delay = localIndex * 60;
                    setTimeout(() => {
                        cell.style.animation = 'cellFill 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                    }, delay);
                }
            } else if (i === goldCells + primaryFullCells && primaryPartial > 0) {
                // 红色部分填充格
                const fill = document.createElement('div');
                fill.style.position = 'absolute';
                fill.style.top = '-5px';
                fill.style.left = '0px';
                fill.style.height = 'calc(100% + 10px)';
                fill.style.width = `${primaryPartial * 100}%`;
                fill.style.backgroundColor = '#fd2d5c';
                fill.style.transform = 'skewX(0deg)';
                fill.style.transformOrigin = '0 0';
                fill.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                cell.appendChild(fill);
                cell.style.borderColor = '#fd2d5c';
            }

            grid.appendChild(cell);
        }
    }
    
    // 初始化可视化元素
    createVisualizationElements();
    
    loadCounters();
    
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
    setInterval(loadCounters, CONFIG.autoUpdateInterval);
    
    // 添加模式切换UI（可选功能，可以在控制台手动调用）
    window.switchCounterMode = function(mode) {
        if (mode === 'local' || mode === 'api') {
            CONFIG.mode = mode;
            console.log(`模式已切换为: ${mode.toUpperCase()} 模式`);
            loadCounters(); // 立即加载新模式的数据
            return true;
        }
        console.error('无效的模式参数，请使用 "local" 或 "api"');
        return false;
    };
    
    // 调试函数：重置本地点击计数
    window.resetLocalClicks = function() {
        localClickCount = 0;
        localStorage.setItem('geebarLocalClicks', 0);
        console.log('本地主点击计数已重置');
        if (CONFIG.mode === 'local') {
            loadLocalCounters();
        }
        return true;
    };
    
    // 调试函数：重置第二个计数器
    window.resetLocalSecondaryClicks = function() {
        localSecondaryCount = 0;
        localStorage.setItem('geebarSecondaryClicks', 0);
        console.log('本地第二计数器已重置');
        if (CONFIG.mode === 'local') {
            loadLocalCounters();
        }
        return true;
    };
});
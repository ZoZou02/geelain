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
    // console.log(`当前运行模式: ${CONFIG.mode.toUpperCase()} 模式`);
    
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

        // console.log(`[本地模式] 主计数器(显示并入总能量): ${primaryCount}, 第二计数器: ${secondaryCount}, 总能量: ${totalEnergy}`);
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

        // 计算本次点击的能量值（考虑长按倍数）
        const energy = calculateClickEnergy();
        
        // 立即更新本地显示，提供即时反馈
        const currentCount = parseInt(gbarCountElement.textContent.replace(/,/g, '')) || 0;
        const newValue = currentCount + energy;
        
        // 更新真实数值（用于动画结束后恢复）
        realHundredsValue = Math.floor(newValue / 100); // 百位及以上
        realTenDigit = Math.floor((newValue % 100) / 10); // 十位数
        realUnitDigit = newValue % 10; // 个位数
        
        gbarCountElement.textContent = newValue.toLocaleString();
        
        // 优化动画触发逻辑：只有当动画未运行且满足条件时才启动动画
        // 这样可以避免在callGeebar频繁调用时反复创建/清除定时器
        // console.log(`[动画调试] 长按倍数: ${currentLongPressMultiplier}, 按压状态: ${isPressing}, 动画状态: ${digitAnimationInterval ? '运行中' : '已停止'}`);
        
        // 根据倍数决定是否需要动画
        const shouldAnimateUnits = isPressing && currentLongPressMultiplier >= 10; // 10倍以上动画个位数
        const shouldAnimateTens = isPressing && currentLongPressMultiplier >= 20;  // 20倍以上动画十位数
        // console.log(`[动画调试] 动画启动条件: 按压=${isPressing}, 倍数=${currentLongPressMultiplier}`);
        // console.log(`[动画调试] 个位数动画: ${shouldAnimateUnits}, 十位数动画: ${shouldAnimateTens}`);
        
        // 是否需要启动动画（至少需要动画个位数）
        const shouldAnimate = shouldAnimateUnits || shouldAnimateTens;
        
        if (shouldAnimate && !digitAnimationInterval) {
            // 仅当需要动画且动画未运行时，才启动动画
            console.log(`[动画调试] 启动数字动画，真实值: ${realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit}`);
            animateDigits(shouldAnimateTens); // 传递是否需要动画十位数
        } else if (!shouldAnimate && digitAnimationInterval) {
            // 当不需要动画但动画正在运行时，清除动画
            console.log(`[动画调试] 清除动画，条件不满足`);
            clearInterval(digitAnimationInterval);
            digitAnimationInterval = null;
            // 恢复真实数值显示
            const realValue = realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit;
            gbarCountElement.textContent = realValue.toLocaleString();
        } else if (shouldAnimate && digitAnimationInterval) {
            // 动画已经在运行，只更新真实值，不重新创建定时器
            console.log(`[动画调试] 动画已在运行，更新真实值: ${realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit}`);
        }
        
        // 更新本地存储的点击计数
        localClickCount += energy;
        localStorage.setItem('geebarLocalClicks', localClickCount);
        
        createCallEffect();
        
        // 增加点击计数
        clickCount += energy;
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
                console.log(`[API模式] 发送API请求，增加点击数: ${clickCount}`);
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
    
    // 添加变量记录上一次的长按倍数
    // let lastLongPressMultiplier = 1;
    
    // 计算长按倍数
    function calculateLongPressMultiplier() {
        if (!CONFIG.funFeatures?.longPressAcceleration?.enabled || !isPressing || pressStartTime === 0) {
            // 重置记录的倍数
            if (lastLongPressMultiplier !== 1) {
                lastLongPressMultiplier = 1;
            }
            return 1;
        }
        
        const pressDuration = Date.now() - pressStartTime;
        const timeMultipliers = CONFIG.funFeatures.longPressAcceleration.timeMultipliers;
        
        // 找到对应的长按倍数
        let multiplier = 1;
        for (let i = timeMultipliers.length - 1; i >= 0; i--) {
            if (pressDuration >= timeMultipliers[i].time) {
                multiplier = timeMultipliers[i].multiplier;
                break;
            }
        }
        
        // 限制最大倍数
        const maxMultiplier = CONFIG.funFeatures.longPressAcceleration.maxMultiplier;
        const finalMultiplier = Math.min(multiplier, maxMultiplier);
        
        // 只有当倍数发生变化时才显示提示
        if (finalMultiplier !== lastLongPressMultiplier) {
            // 更新记录的倍数
            lastLongPressMultiplier = finalMultiplier;
            
            // 显示倍数变化提示
            console.log(`[长按加速] 当前长按时间: ${Math.floor(pressDuration/1000)}秒，获得${finalMultiplier}倍加速效果`);
            
            // 如果达到最大倍数，额外提示
            if (finalMultiplier === maxMultiplier && multiplier >= maxMultiplier) {
                console.log(`[长按加速] 已达到最大${maxMultiplier}倍加速！`);
            }
        }
        
        return finalMultiplier;
    }
    
    // 更新长按加速（优化版）
    function updateLongPressAcceleration() {
        if (!CONFIG.funFeatures?.longPressAcceleration?.enabled || !isPressing) return;
        
        const now = Date.now();
        // 节流控制：限制更新频率
        if (now - lastUpdateTime < UPDATE_THROTTLE_INTERVAL) return;
        lastUpdateTime = now;
        
        const pressDuration = now - pressStartTime;
        const config = CONFIG.funFeatures.longPressAcceleration;
        
        // 缓存配置值，避免重复访问对象属性
        const accelerationRate = config.accelerationRate;
        const baseInterval = config.baseInterval;
        const minInterval = Math.max(MIN_CLICK_INTERVAL, config.minInterval || 5); // 确保最小间隔不太小
        
        // 优化的间隔计算 - 使用查表法代替重复的指数运算
        // 预计算常用的时间点对应的间隔值
        let newInterval = baseInterval;
        if (pressDuration >= 2000) {
            // 只在长按时间较长时才计算指数，避免频繁的昂贵运算
            newInterval = Math.max(
                minInterval,
                baseInterval * Math.pow(1 - accelerationRate, pressDuration / 100)
            );
        } else if (pressDuration >= 1000) {
            // 中等长按时间使用简化计算
            newInterval = baseInterval * (1 - accelerationRate * 0.5);
        } else if (pressDuration >= 500) {
            // 短按使用更小的加速率
            newInterval = baseInterval * (1 - accelerationRate * 0.2);
        }
        
        // 计算新的长按倍数（只计算一次）
        const newMultiplier = calculateLongPressMultiplier();
        currentLongPressMultiplier = newMultiplier;
        
        // 只在间隔有显著变化时才重新创建定时器
        // 并且只有在定时器存在时才更新
        if (Math.abs(newInterval - currentClickInterval) > 5 && autoClickInterval) {
            // 先清除旧定时器
            clearInterval(autoClickInterval);
            
            // 更新间隔并创建新定时器
            currentClickInterval = newInterval;
            autoClickInterval = setInterval(() => {
                if (sessionClickTotal < SESSION_MAX_PER_PRESS) {
                    callGeebar();
                } else {
                    clearInterval(autoClickInterval);
                    autoClickInterval = null;
                }
            }, currentClickInterval);
        }
    }
    
    // 计算点击能量（优化版）
    function calculateClickEnergy() {
        // 基础能量为1
        let energy = 1;
        
        // 如果启用了长按加速功能且正在按压，应用长按倍数
        // 直接使用缓存的currentLongPressMultiplier，避免重复计算
        if (CONFIG.funFeatures?.longPressAcceleration?.enabled && isPressing && pressStartTime > 0) {
            energy = Math.floor(energy * currentLongPressMultiplier);
        }
        
        return Math.max(1, energy); // 确保最小能量为1
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
    // 长按加速相关变量
    let pressStartTime = 0; // 按压开始时间
    let currentClickInterval = CONFIG.funFeatures?.longPressAcceleration?.baseInterval || 100; // 当前点击间隔
    let currentLongPressMultiplier = 1; // 当前长按倍数
    let lastLongPressMultiplier = 1; // 记录上一次的长按倍数
    let lastUpdateTime = 0; // 上次更新时间
    const UPDATE_THROTTLE_INTERVAL = 50; // 更新节流间隔（毫秒）
    const MIN_CLICK_INTERVAL = 20; // 最小点击间隔（提高性能）
    // 数字动画相关变量
    let digitAnimationInterval = null;
    let realHundredsValue = 0; // 保存百位及以上的真实数值
    let realTenDigit = 0; // 保存真实的十位数
    let realUnitDigit = 0; // 保存真实的个位数
    
    // 数字动画函数 - 根据倍数为不同位数添加随机变化动画
    function animateDigits(animateTens) {
        // 停止之前可能存在的动画
        if (digitAnimationInterval) {
            // console.log(`[动画调试] 清除已存在的动画定时器`);
            clearInterval(digitAnimationInterval);
            digitAnimationInterval = null;
        }
        
        // 创建固定间隔的动画，确保动画稳定
        const intervalTime = 10; // 使用较快的固定间隔，动画效果更明显
        // console.log(`[动画调试] 创建动画定时器，间隔: ${intervalTime}ms, 动画位数: ${animateTens ? '十位+个位' : '个位'}`);
        
        digitAnimationInterval = setInterval(() => {
            // 双重检查按压状态和动画状态
            if (!isPressing || !digitAnimationInterval) {
                if (digitAnimationInterval) {
                    // console.log(`[动画调试] 按压状态结束，停止动画，恢复真实值: ${realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit}`);
                    clearInterval(digitAnimationInterval);
                    digitAnimationInterval = null;
                    // 恢复真实数值显示
                    const realValue = realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit;
                    gbarCountElement.textContent = realValue.toLocaleString();
                }
                return;
            }
            
            // 获取当前显示值
            const currentDisplayed = parseInt(gbarCountElement.textContent.replace(/,/g, '')) || 0;
            
            // 生成随机个位数
            const currentDisplayedUnit = currentDisplayed % 10;
            let randomUnit;
            do {
                randomUnit = Math.floor(Math.random() * 10);
            } while (randomUnit === currentDisplayedUnit);
            
            // 根据是否需要动画十位数生成随机十位数
            let randomTen = realTenDigit;
            if (animateTens) {
                const currentDisplayedTen = Math.floor((currentDisplayed % 100) / 10);
                do {
                    randomTen = Math.floor(Math.random() * 10);
                } while (randomTen === currentDisplayedTen);
            }
            
            // 计算带随机数的显示值
            const animatedValue = realHundredsValue * 100 + randomTen * 10 + randomUnit;
            // console.log(`[动画调试] 动画更新，显示值: ${animatedValue}, 十位数: ${randomTen}, 个位数: ${randomUnit}`);
            
            // 更新显示
            gbarCountElement.textContent = animatedValue.toLocaleString();
        }, intervalTime);
    }
    
    // 处理释放事件（鼠标或触摸）
    function handleRelease() {
        clearTimeout(pressTimer);
        clearInterval(autoClickInterval);
        autoClickInterval = null;
        
        // 清除长按加速更新定时器
        if (window.longPressUpdateInterval) {
            clearInterval(window.longPressUpdateInterval);
            window.longPressUpdateInterval = null;
        }
        
        // 清除数字动画定时器并恢复真实数值
        if (digitAnimationInterval) {
            // console.log(`[动画调试] handleRelease中清除动画，恢复真实值: ${realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit}`);
            clearInterval(digitAnimationInterval);
            digitAnimationInterval = null;
            // 恢复真实数值显示
            const realValue = realHundredsValue * 100 + realTenDigit * 10 + realUnitDigit;
            gbarCountElement.textContent = realValue.toLocaleString();
        }
        
        isPressing = false;
        
        // 重置长按相关变量
        currentLongPressMultiplier = 1;
        lastLongPressMultiplier = 1;
        lastUpdateTime = 0;
        
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
    gbarButton.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isPressing = true;
        pressStartTime = Date.now();
        lastUpdateTime = Date.now(); // 初始化更新时间
        
        // 移除旧的定时器
        if (window.rippleTimer) {
            clearTimeout(window.rippleTimer);
        }
        sessionClickTotal = 0;
        
        // 重置点击间隔和长按倍数
        currentClickInterval = CONFIG.funFeatures?.longPressAcceleration?.baseInterval || 80;
        currentLongPressMultiplier = 1;
        lastLongPressMultiplier = 1;
        
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            // 使用更合理的初始间隔
            currentClickInterval = Math.max(MIN_CLICK_INTERVAL, CONFIG.funFeatures?.longPressAcceleration?.baseInterval || 80);
            
            autoClickInterval = setInterval(() => {
                if (sessionClickTotal < SESSION_MAX_PER_PRESS) {
                    callGeebar();
                } else {
                    clearInterval(autoClickInterval);
                    autoClickInterval = null;
                }
            }, currentClickInterval);
            
            // 使用单独的定时器更新长按加速，而不是每次点击都更新
            // 这样可以控制更新频率，提高性能
            window.longPressUpdateInterval = setInterval(updateLongPressAcceleration, UPDATE_THROTTLE_INTERVAL);
            
            // 额外设置一个加速更新定时器，专门用于处理长按加速
            if (CONFIG.funFeatures?.longPressAcceleration?.enabled) {
                window.longPressUpdateInterval = setInterval(updateLongPressAcceleration, 50);
            }
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
        pressStartTime = Date.now();
        // 移除旧的定时器
        if (window.rippleTimer) {
            clearTimeout(window.rippleTimer);
        }
        sessionClickTotal = 0;
        
        // 重置点击间隔和长按倍数
        currentClickInterval = CONFIG.funFeatures?.longPressAcceleration?.baseInterval || 80;
        currentLongPressMultiplier = 1;
        
        // 立即执行一次点击（确保点击有反馈）
        callGeebar();
        
        // 长按开始自动点击
        pressTimer = setTimeout(() => {
            autoClickInterval = setInterval(() => {
                if (sessionClickTotal < SESSION_MAX_PER_PRESS) {
                    callGeebar();
                    // 每次点击后更新长按加速
                    updateLongPressAcceleration();
                } else {
                    clearInterval(autoClickInterval);
                    autoClickInterval = null;
                }
            }, currentClickInterval);
            
            // 额外设置一个加速更新定时器，专门用于处理长按加速
            if (CONFIG.funFeatures?.longPressAcceleration?.enabled) {
                window.longPressUpdateInterval = setInterval(updateLongPressAcceleration, 50);
            }
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
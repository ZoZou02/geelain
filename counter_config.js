// 全局计数配置
// 通过 URL 可用 ?mode=local 或 ?mode=api 覆盖默认模式
const COUNTER_CONFIG = {
    // 默认运行模式：local 本地模拟；api 为真实接口
    mode: 'api',

    // 本地定时刷新间隔（毫秒）
    autoUpdateInterval: 15000,

    // 本地批量发送阈值（点击累积到该值时触发一次更新逻辑）
    clickThreshold: 9113,  //g11 QAQ

    // API 配置
    api: {
        baseUrl: 'https://js.ruseo.cn/api/counter.php',
        getAction: 'get',
        incrementAction: 'increment',
        // 明确使用 reset 动作名
        resetAction: 'reset'
    },

    // 主计数器配置 geebar/geebar03
    primaryCounter: {
        id: '6200f7021fe890c7f925ff27cf10cabd',
        apiKey: '6c18b0cafb24205829af9e2fb75c3a2a',
        // 当主计数到达该阈值时：重置主计数并让第二计数 +1
        resetThreshold: 1000000000
    },

    // 第二计数器配置 geebar02/测试04
    secondaryCounter: {
        id: '2f1e44e1a5e35dccc26b9d7e492c9004',
        apiKey: '6c18b0cafb24205829af9e2fb75c3a2a'
    },

    // 本地模式模拟参数
    local: {
        primaryBaseCount: 0,
        secondaryBaseCount: 0,
        randomVariation: 0
    },

   
    funFeatures: {
        // 连击系统配置
        comboSystem: {
            enabled: true,
            maxCombo: 20,           // 最大连击数
            comboTimeWindow: 500,   // 连击时间窗口（毫秒）
            comboMultiplier: 0.1,   // 每连击增加10%能量
            baseComboMultiplier: 1  // 基础连击倍数
        },
        
        // 长按加速系统配置
        longPressAcceleration: {
            enabled: true,
            baseInterval: 100,      // 基础点击间隔（毫秒）
            minInterval: 5,         // 最小点击间隔（毫秒）
            accelerationRate: 0.05, // 加速率（每次减少5%的间隔时间）
            maxMultiplier: 50,      // 最大长按倍数
            // 长按时间对应的奖励倍数
            timeMultipliers: [
                { time: 1000, multiplier: 2 },  // 长按1秒，2倍能量
                { time: 3000, multiplier: 3 },  // 长按3秒，3倍能量
                { time: 5000, multiplier: 5 },  // 长按5秒，5倍能量
                { time: 10000, multiplier: 10 },  // 长按10秒，10倍能量
                { time: 20000, multiplier: 20 }, // 长按20秒，20倍能量
                { time: 30000, multiplier: 40 } // 长按30秒，40倍能量

            ]
        },
        
        // 暴击系统配置
        criticalSystem: {
            enabled: true,
            baseChance: 0.05,       // 基础暴击概率5%
            maxCriticalMultiplier: 10, // 最大暴击倍数
            comboCriticalBonus: 0.01,  // 每连击增加1%暴击率
            minCriticalMultiplier: 2   // 最小暴击倍数
        }
    }
};

export default COUNTER_CONFIG;



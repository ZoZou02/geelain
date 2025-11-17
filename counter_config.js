// 全局计数配置
// 通过 URL 可用 ?mode=local 或 ?mode=api 覆盖默认模式
const COUNTER_CONFIG = {
    // 默认运行模式：api 为真实接口
    mode: 'api',

    // 本地定时刷新间隔（毫秒）
    autoUpdateInterval: 15000,

    // 本地批量发送阈值（点击累积到该值时触发一次更新逻辑）
    clickThreshold: 9113,  //g11 QAQ

    // API 配置
    api: {
        baseUrl: 'https://5c4312e2.r37.cpolar.top/api/counter',
        // baseUrl: 'https://4ee22add.r37.cpolar.top/api/counter',
        getAction: 'get',
        incrementAction: 'increment',
        resetAction: 'reset'
    },

    // 主计数器配置
    primaryCounter: {
        id: '1001',
        apiKey: '911612',
        // 当主计数到达该阈值时：重置主计数并让第二计数 +1
        resetThreshold: 1000000000
    },

    // 第二计数器配置 
    secondaryCounter: {
        id: '1002',
        apiKey: '911612',
    },
    
    // 访问次数计数器配置
    viewCounter: {
        id: 'views',
        apiKey: '911612',
        // 是否使用本地存储避免重复计数（基于会话）
        useLocalStorage: true,
        storageKey: 'geebarPageViewed'
    },

    // 本地模式模拟参数（保留以备将来可能的调试需要）
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
            maxMultiplier: 12,      // 最大长按倍数
            maxMultiplier: 30,      // 最大长按倍数
            // 长按时间对应的奖励倍数
            timeMultipliers: [
                { time: 1000, multiplier: 2 },  // 长按1秒，2倍能量
                { time: 3000, multiplier: 3 },  // 长按3秒，3倍能量
                { time: 5000, multiplier: 5 },  // 长按5秒，5倍能量
                { time: 10000, multiplier: 8 },  // 长按10秒，8倍能量
                { time: 20000, multiplier: 12 }, // 长按20秒，12倍能量
                { time: 10000, multiplier: 10 },  // 长按10秒，10倍能量
                { time: 20000, multiplier: 20 }, // 长按20秒，20倍能量
                { time: 30000, multiplier: 30 } // 长按30秒，30倍能量
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
    },
    
    // 留言功能配置
    messageSystem: {
        // 留言API配置
        api: {
            baseUrl: 'https://5c4312e2.r37.cpolar.top/api/message/',
            // baseUrl: 'https://4ee22add.r37.cpolar.top/api/message',
            getAction: 'get',
            submitAction: 'submit'
        },
        
        // 留言字数限制
        maxLength: 50,
        
        // 昵称字数限制
        maxNameLength: 10,
        
        // 字符计数警告阈值
        warningThreshold: 40,
        
        // 随机显示间隔范围（毫秒）
        minDisplayInterval: 500,
        maxDisplayInterval: 1000,
        
        // 弹幕显示配置
        screenStayTime: 9000, // 屏幕停留时间（毫秒）
        safetyCoefficient: 0.4, // 安全系数（0.3~0.5）
        maxDelay: 10, // 最大延迟时间，超过此值会切换轨道（毫秒）
        // 弹幕密度控制
        densityControl: {
            enabled: true, // 是否启用密度控制
            maxConcurrentMessages: 20, // 屏幕上同时显示的最大弹幕数量
            minIntervalBetweenMessages: 10, // 同轨道弹幕之间的最小间隔（毫秒）
            densityMultiplier: 1.0 // 密度乘数，范围0.5-2.0，越小密度越低，越大密度越高
        },
        // 分页配置
        pagination: {
            enabled: true, // 是否启用分页
            defaultPageSize: 20, // 默认每页消息数量
            preloadThreshold: 5 // 剩余消息数量少于此值时预加载下一页
        },
        // 保留原有配置以兼容现有逻辑
        baseDuration: 15000,
        minDuration: 10000,
        maxDuration: 12000,
        
        // 获取留言频率限制配置
        fetchLimit: {
            enabled: true,
            // 两次获取留言之间的最小间隔时间（毫秒）
            cooldownTime: 60000, // 60秒
            // localStorage中存储最后获取时间的键名
            lastFetchKey: 'geebarLastMessagesFetched',
            // localStorage中存储缓存留言的键名
            cachedMessagesKey: 'geebarCachedMessages',
            // 缓存有效期（毫秒）
            cacheExpiry: 300000 // 5分钟
        }
    }
};

export default COUNTER_CONFIG;



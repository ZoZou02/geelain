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
        baseUrl: 'https://53b2a406.r37.cpolar.top/api/counter',
        getAction: 'get',
        incrementAction: 'increment',
        resetAction: 'reset'
    },

    // 主计数器配置 geebar/geebar03
    primaryCounter: {
        // id: '52fc88631b4d439c28796dfb288cc707',
        // apiKey: '8100e6e798e1423f1e4952564c034315',
        id: '1001',
        apiKey: '911612',
        // 当主计数到达该阈值时：重置主计数并让第二计数 +1
        resetThreshold: 1000000000
    },

    // 第二计数器配置 geebar02/测试04
    secondaryCounter: {
        // id: 'aa26cb1069bd10e685306fe9662556ae',
        // apiKey: '8100e6e798e1423f1e4952564c034315'
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
    
    // 留言功能配置
    messageSystem: {
        // 留言API配置
        api: {
            baseUrl: 'https://53b2a406.r37.cpolar.top/api/message',
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
        maxDisplayInterval: 2500,
        
        // 弹幕动画时长（毫秒）
        baseDuration: 15000,
        minDuration: 10000,
        maxDuration: 12000
    }
};

export default COUNTER_CONFIG;



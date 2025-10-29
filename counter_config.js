// 全局计数配置
// 通过 URL 可用 ?mode=local 或 ?mode=api 覆盖默认模式
const COUNTER_CONFIG = {
    // 默认运行模式：local 本地模拟；api 为真实接口
    mode: 'api',

    // 本地定时刷新间隔（毫秒）
    autoUpdateInterval: 15000,

    // 本地批量发送阈值（点击累积到该值时触发一次更新逻辑）
    clickThreshold: 100,

    // API 配置
    api: {
        baseUrl: 'https://js.ruseo.cn/api/counter.php',
        getAction: 'get',
        incrementAction: 'increment',
        // 明确使用 reset 动作名
        resetAction: 'reset'
    },

    // 主计数器配置 geebar
    primaryCounter: {
        id: '6200f7021fe890c7f925ff27cf10cabd',
        apiKey: '6c18b0cafb24205829af9e2fb75c3a2a',
        // 当主计数到达该阈值时：重置主计数并让第二计数 +1
        resetThreshold: 1000000000
    },

    // 第二计数器配置 geebar02
    secondaryCounter: {
        id: '2f1e44e1a5e35dccc26b9d7e492c9004',
        apiKey: '6c18b0cafb24205829af9e2fb75c3a2a'
    },

    // 本地模式模拟参数
    local: {
        primaryBaseCount: 0,
        secondaryBaseCount: 0,
        // 本地随机扰动，模拟其他用户贡献
        randomVariation: 0
    }
};

export default COUNTER_CONFIG;



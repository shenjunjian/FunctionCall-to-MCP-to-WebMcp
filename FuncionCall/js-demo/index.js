const axios = require('axios');

// 天气查询工具函数
function getWeather(city) {
  // MOCK 天气数据
  const mockWeatherData = {
    '北京': { temperature: '25°C', condition: '晴', humidity: '45%' },
    '上海': { temperature: '28°C', condition: '多云', humidity: '60%' },
    '广州': { temperature: '30°C', condition: '雷阵雨', humidity: '75%' },
    '深圳': { temperature: '29°C', condition: '晴', humidity: '65%' },
    '杭州': { temperature: '26°C', condition: '阴', humidity: '55%' }
  };
  
  return mockWeatherData[city] || { temperature: '未知', condition: '未知', humidity: '未知' };
}

// 大模型配置信息（从 readme.md 获取）
const config = {
  baseUrl: 'https://api.deepseek.com', // 从 readme.md 获取
  apiKey: 'sk-b462f8de7b364629b3136312c106655a', // 从 readme.md 获取
  modelId: 'deepseek-chat' // 从 readme.md 获取
};

// 工具定义
const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: '查询指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称，例如：北京、上海、广州等'
          }
        },
        required: ['city']
      }
    }
  }
];

// 示例用户请求
const userQuery = '北京的天气怎么样？';

// 模拟大模型调用
async function callModel(query) {
  try {
    const response = await axios.post(
      `${config.baseUrl}/v1/chat/completions`,
      {
        model: config.modelId,
        messages: [
          {
            role: 'user',
            content: query
          }
        ],
        tools: tools,
        tool_choice: 'auto'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );
    
    const modelResponse = response.data;
    return modelResponse;
  } catch (error) {
    console.error('调用大模型失败:', error.message);
    return null;
  }
}

// 处理工具调用
async function handleToolCall(toolCall) {
  if (toolCall.function.name === 'getWeather') {
    const city = JSON.parse(toolCall.function.arguments).city;
    const weatherData = getWeather(city);
    return {
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(weatherData)
    };
  }
  return null;
}

// 主函数
async function main() {
  console.log('用户查询:', userQuery);
  
  // 第一次调用大模型
  const firstResponse = await callModel(userQuery);
  
  if (firstResponse && firstResponse.choices[0].message.tool_calls) {
    // 处理工具调用
    const toolCalls = firstResponse.choices[0].message.tool_calls;
    const toolResponses = [];
    
    for (const toolCall of toolCalls) {
      const toolResponse = await handleToolCall(toolCall);
      if (toolResponse) {
        toolResponses.push(toolResponse);
      }
    }
    
    // 第二次调用大模型，包含工具执行结果
    if (toolResponses.length > 0) {
      const messages = [
        {
          role: 'user',
          content: userQuery
        },
        firstResponse.choices[0].message,
        ...toolResponses
      ];
      
      try {
        const secondResponse = await axios.post(
          `${config.baseUrl}/v1/chat/completions`,
          {
            model: config.modelId,
            messages: messages
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.apiKey}`
            }
          }
        );
        
        console.log('大模型最终回复:', secondResponse.data.choices[0].message.content);
      } catch (error) {
        console.error('第二次调用大模型失败:', error.message);
      }
    }
  } else if (firstResponse) {
    // 大模型直接回复
    console.log('大模型回复:', firstResponse.choices[0].message.content);
  }
}

// 启动程序
main();
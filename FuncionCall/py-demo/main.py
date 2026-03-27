import openai

# 从 readme.md 中获取的大模型配置信息
BASE_URL = "https://api.deepseek.com"
API_KEY = "sk-b462f8de7b364629b3136312c106655a"
MODEL_ID = "deepseek-chat"

# 配置 openai 客户端
client = openai.OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

def get_weather(city: str) -> str:
    """
    查询指定城市的天气信息
    
    Args:
        city: 城市名称
    
    Returns:
        天气信息字符串
    """
    # MOCK 天气数据
    weather_data = {
        "北京": "晴，20-28℃，微风",
        "上海": "多云，18-25℃，东风3级",
        "广州": "阴，25-30℃，南风2级",
        "深圳": "晴，26-32℃，微风",
        "杭州": "小雨，16-22℃，东北风4级"
    }
    
    return weather_data.get(city, f"抱歉，暂未找到{city}的天气信息")

# 定义工具列表
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，例如：北京、上海"
                    }
                },
                "required": ["city"]
            }
        }
    }
]

# 工具映射
tool_map = {
    "get_weather": get_weather
}

# 主函数
def main():
    print("欢迎使用天气查询助手！")
    print("您可以输入类似：'北京的天气怎么样？' 来查询天气")
    print("输入 '退出' 结束对话")
    
    # 对话历史
    messages = []
    
    while True:
        user_input = input("请输入您的问题：")
        if user_input.lower() in ["退出", "exit", "quit"]:
            print("再见！")
            break
        
        # 添加用户消息到对话历史
        messages.append({"role": "user", "content": user_input})
        
        # 发送请求到大模型
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        # 获取大模型的响应
        response_message = response.choices[0].message
        
        # 检查是否需要调用工具
        if response_message.tool_calls:
            # 处理工具调用
            for tool_call in response_message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = eval(tool_call.function.arguments)
                
                # 调用对应的工具函数
                if tool_name in tool_map:
                    tool_result = tool_map[tool_name](**tool_args)
                    
                    # 添加工具调用结果到对话历史
                    messages.append({
                        "role": "assistant",
                        "tool_calls": [tool_call]
                    })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": tool_result
                    })
                    print(f"工具调用结果：{tool_name}: {tool_result}")  
            

            # 再次发送请求，获取最终响应
            final_response = client.chat.completions.create(
                model=MODEL_ID,
                messages=messages
            )
            
            # 打印最终响应
            print(final_response.choices[0].message.content)
            
            # 添加助手响应到对话历史
            messages.append({
                "role": "assistant",
                "content": final_response.choices[0].message.content
            })
        else:
            # 直接打印大模型的响应
            print(response_message.content)
            
            # 添加助手响应到对话历史
            messages.append({
                "role": "assistant",
                "content": response_message.content
            })

if __name__ == "__main__":
    main()
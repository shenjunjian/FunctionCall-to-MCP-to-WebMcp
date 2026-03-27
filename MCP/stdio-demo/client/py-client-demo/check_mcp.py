from mcp import ClientSession

# 查看 ClientSession 类的所有方法
methods = [method for method in dir(ClientSession) if not method.startswith('_')]
print("ClientSession methods:", methods)

# 查看 BaseSession 类的所有方法
from mcp.shared.session import BaseSession
base_methods = [method for method in dir(BaseSession) if not method.startswith('_')]
print("BaseSession methods:", base_methods)

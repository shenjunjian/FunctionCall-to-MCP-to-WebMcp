# 对话框窗口的UI层

它有以下多个目的

## 1. 一个UI界面

使用最新的TinyRobot 的组件， 使用最新的GEN UI的版本

但不使用它的 `useConversation, 会话管理`等 方法。

## 2. 连接用户页面

1. onPage则传入window,
2. onIframe则传入iframe.parent.window,
3. onWebAgent则传入url, sessionId可选。

## 3. 连接 （`Agent`, 消息管理 ，会话管理）

> 消息管理 ，会话管理是不是可以放到Agent层？

## 4. 提供webServer的注册入口

webServer有一些是内部集成的。 这里是强调用户可以自定义接入的：

1. 扫码或手工添加6位sessionId
2. 从mcp市场手工选择。

自定义的server通过参数传入`Agent层`, 再与 Agent内部的server进行合并。

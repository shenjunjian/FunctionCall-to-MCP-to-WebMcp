// 构造 SuggestionPills 对象
export const mapMake = (str: string, id: number) => {
  const [text, inputMessage] = str.split("#");
  return { id: id.toString(), text: text, inputMessage };
};

// 默认的 pillItems
export const pillItems = [
  {
    id: "office",
    text: "办公助手",
    menus: [
      "接收邮件#请同步邮箱的新邮件。",
      "编写邮件#请新建一个邮件，收件人为 opentiny-next@meeting.com, 内容为举办一个临时会议。",
      "安排会议#创建一个临时的在线会议，主题为讨论问题，时长为1小时。",
      "整理文档#请分析附件中的销售情况，把销售额绘制成折线图。",
    ].map(mapMake),
  },
  {
    id: "development",
    text: "开发支持",
    menus: [
      "遇到代码问题#请检查当前位置的报错原因。",
      "架构建议#请使用NodeJs实现一个分块上传文件的模块。",
      "最新的技术趋势#请分析Vue与React 框架的优劣分别是什么？",
    ].map(mapMake),
  },
  {
    id: "management",
    text: "项目管理",
    menus: [
      "项目规划#如何开展品牌推广的活动？",
      "任务分配#将本季度的销售任务分配给三个人，并生成甘特图进行跟踪。",
      "进度跟踪#分析团队的任务完成情况。",
    ].map(mapMake),
  },
];

export type PillItem = (typeof pillItems)[number];
export type PillItemMenu = (typeof pillItems)[number]["menus"][number];

window.GROWTH_DATA = {
  summary: {
    allRegistrations: 14328,
    validRegistrations: 12840,
    excluded: 1488,
    confirmed: 2326,
    assisted: 947,
    unidentified: 10514,
    confirmedRate: 18.1,
    unidentifiedRate: 81.9
  },
  attributionTree: {
    id: "all",
    name: "所有注册量",
    value: 14328,
    note: "全站注册总量",
    children: [
      {
        id: "growth",
        name: "用增部分",
        value: 3273,
        note: "确定的（100%） + 大概率的（>60%） + 有可能的",
        children: [
          { id: "geo", name: "GEO", value: 728, note: "AI 问答来源域名" },
          { id: "content", name: "内容运营", value: 516, note: "内容平台 Referer / UTM" },
          { id: "kol", name: "社群&站外运营", value: 382, note: "外链合作 / KOL" },
          { id: "community", name: "开发者运营", value: 344, note: "开发者产品与社区来源" },
          { id: "offline", name: "活动运营", value: 147, note: "线上 / 广告 / 线下活动" },
          { id: "event", name: "热点响应", value: 209, note: "事件营销 campaign" },
          { id: "other", name: "other", value: 947, note: "大概率的（>60%） + 有可能的" }
        ]
      },
      { id: "sales", name: "销售自拓", value: 5480, note: "销售自主拓展" },
      { id: "sem", name: "SEM投流", value: 3942, note: "搜索广告投放" },
      { id: "ambassador", name: "U大使", value: 1633, note: "大使推荐注册" }
    ]
  },
  exclusions: [
    { name: "明确广告注册", value: 923 },
    { name: "内部账号", value: 164 },
    { name: "测试账号", value: 219 },
    { name: "机器人及爬虫账号", value: 182 }
  ],
  dates: ["08/06", "08/07", "08/08", "08/09", "08/10", "08/11", "08/12", "08/13", "08/14", "08/15", "08/16", "08/17", "08/18", "08/19"],
  trends: {
    valid: [812, 856, 794, 905, 918, 842, 899, 931, 884, 956, 902, 975, 1018, 1148],
    growth: [187, 198, 170, 225, 214, 203, 225, 244, 223, 262, 247, 276, 297, 342],
    sales: [347, 365, 339, 386, 392, 359, 384, 397, 377, 408, 385, 416, 435, 490],
    sem: [249, 263, 244, 278, 282, 259, 276, 286, 271, 293, 277, 299, 313, 352],
    ambassador: [103, 109, 101, 115, 117, 107, 114, 118, 112, 122, 115, 124, 130, 146],
    confirmed: [129, 136, 121, 154, 148, 139, 156, 171, 162, 186, 177, 194, 208, 245],
    assisted: [58, 62, 49, 71, 66, 64, 69, 73, 61, 76, 70, 82, 89, 97],
    unidentified: [683, 720, 673, 751, 770, 703, 743, 760, 722, 770, 725, 781, 810, 903],
    geo: [39, 43, 38, 48, 46, 44, 49, 54, 51, 58, 55, 61, 65, 77],
    content: [29, 30, 27, 34, 33, 31, 35, 38, 36, 41, 39, 43, 46, 54],
    kol: [21, 22, 20, 25, 24, 23, 26, 28, 27, 31, 29, 32, 34, 40],
    community: [18, 20, 18, 23, 22, 21, 23, 25, 24, 28, 26, 29, 31, 36],
    offline: [8, 9, 8, 10, 9, 9, 10, 11, 10, 12, 11, 12, 13, 15],
    event: [14, 12, 10, 14, 14, 11, 13, 15, 14, 16, 17, 17, 19, 23],
    other: [58, 62, 49, 71, 66, 64, 69, 73, 61, 76, 70, 82, 89, 97]
  },
  channels: [
    { id: "geo", name: "GEO", confirmed: 728, assisted: 312, rate: 31.3, color: "#2F6FED", note: "AI 问答来源域名命中" },
    { id: "content", name: "内容运营", confirmed: 516, assisted: 201, rate: 22.2, color: "#5B8FF9", note: "完整归因链接或内容平台 Referer" },
    { id: "kol", name: "社群&站外运营", confirmed: 382, assisted: 149, rate: 16.4, color: "#7556D8", note: "外链合作或 KOL 专属链接" },
    { id: "community", name: "开发者运营", confirmed: 344, assisted: 186, rate: 14.8, color: "#12A594", note: "开发者产品与社区来源命中" },
    { id: "offline", name: "活动运营", confirmed: 147, assisted: 42, rate: 6.3, color: "#E9A23B", note: "线上 / 广告 / 线下活动来源" },
    { id: "event", name: "热点响应", confirmed: 209, assisted: 57, rate: 9.0, color: "#E55B5B", note: "事件营销 campaign 命中" }
  ],
  details: {
    geo: [
      { source: "kimi", evidence: "来源标识：kimi", confirmed: 180, assisted: 68, rate: "24.7%" },
      { source: "豆包", evidence: "来源标识：豆包", confirmed: 154, assisted: 59, rate: "21.2%" },
      { source: "千问", evidence: "来源标识：千问", confirmed: 132, assisted: 54, rate: "18.1%" },
      { source: "deepseek", evidence: "来源标识：deepseek", confirmed: 118, assisted: 48, rate: "16.2%" },
      { source: "文心一言", evidence: "来源标识：文心一言", confirmed: 82, assisted: 35, rate: "11.3%" },
      { source: "混元", evidence: "来源标识：混元", confirmed: 62, assisted: 28, rate: "8.5%" }
    ],
    content: [
      { source: "文章中心", evidence: "Referer / UTM", confirmed: 112, assisted: 42, rate: "21.7%" },
      { source: "社区公众号", evidence: "Referer / UTM", confirmed: 74, assisted: 31, rate: "14.3%" },
      { source: "知乎", evidence: "Referer / UTM", confirmed: 70, assisted: 29, rate: "13.6%" },
      { source: "CSDN", evidence: "Referer / UTM", confirmed: 58, assisted: 24, rate: "11.2%" },
      { source: "头条号", evidence: "Referer / UTM", confirmed: 44, assisted: 18, rate: "8.5%" },
      { source: "百家号", evidence: "Referer / UTM", confirmed: 42, assisted: 17, rate: "8.1%" },
      { source: "51CTO", evidence: "Referer / UTM", confirmed: 34, assisted: 14, rate: "6.6%" },
      { source: "思否", evidence: "Referer / UTM", confirmed: 28, assisted: 11, rate: "5.4%" },
      { source: "稀土掘金", evidence: "Referer / UTM", confirmed: 24, assisted: 9, rate: "4.7%" },
      { source: "twitter", evidence: "Referer / UTM", confirmed: 16, assisted: 4, rate: "3.1%" },
      { source: "博客园", evidence: "Referer / UTM", confirmed: 14, assisted: 2, rate: "2.7%" }
    ],
    kol: [
      { source: "外链合作", evidence: "合作外链 / UTM", confirmed: 224, assisted: 86, rate: "58.6%" },
      { source: "KOL", evidence: "专属链接 / UTM", confirmed: 158, assisted: 63, rate: "41.4%" }
    ],
    community: [
      { source: "AI 游乐场社区", evidence: "Referer / UTM / 专属路径", confirmed: 132, assisted: 69, rate: "38.4%" },
      { source: "github社区合作", evidence: "Referer / UTM / 专属链接", confirmed: 88, assisted: 49, rate: "25.6%" },
      { source: "产品文档引流 docs", evidence: "文档来源 Referer / UTM", confirmed: 70, assisted: 39, rate: "20.3%" },
      { source: "开发者工具引流", evidence: "工具来源 Referer / UTM", confirmed: 54, assisted: 29, rate: "15.7%" }
    ],
    offline: [
      { source: "线上活动", evidence: "活动 tag / UTM", confirmed: 68, assisted: 21, rate: "46.3%" },
      { source: "浩客广告", evidence: "广告 tag / 归因链接", confirmed: 46, assisted: 13, rate: "31.3%" },
      { source: "线下活动", evidence: "活动 tag / 二维码", confirmed: 33, assisted: 8, rate: "22.4%" }
    ],
    event: [],
    other: []
  }
};

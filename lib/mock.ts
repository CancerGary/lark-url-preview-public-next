import { CollectionData } from "@/lib/collection-types";

export const newVar: CollectionData = {
  result: [
    {
      name: "@at用户",
      images: [
        {
          key: "img_v3_02b4_7d920256-21e4-4801-88c7-4dc2cb3c8a5g",
          description: "@at",
        },
      ],
    },
  ],
  textPresetResult: [
    {
      name: "距离给定时间点的差值 {{time_diff}}",
      presets: [
        {
          value: '在字节已经搬砖 {{time_diff t="2024-01-01"}} 天',
          description: "在职天数（需要自己改下入职日期）",

          imageKey: "",
        },
        {
          value:
            '在字节已经搬砖 {{multiply (time_diff m="from" t="2024-01-01") 3}} 人间天',
          description: "在职天数，但人间三年.jpg",

          imageKey: "",
        },
        {
          value: '距离 2024 国庆还有 {{time_diff m="to" t="2024-10-01"}} 天',
          description: "2024 国庆倒数",

          imageKey: "",
        },
        {
          value: '距离退休还有 {{time_diff m="to" t="2064-10-01"}} 天',
          description: "假设 2064 年 10 月 1 日退休",

          imageKey: "",
        },
      ],
    },
  ],
};

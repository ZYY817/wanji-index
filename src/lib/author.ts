// 作者信息：作者页、页脚、游戏库说明都从这里取。改联系方式只改这一处。
export const AUTHOR = {
  handle: 'ZYY817',
  bilibili: 'https://space.bilibili.com/41173761',
  github: 'https://github.com/ZYY817',
  kitRepo: 'https://github.com/ZYY817/wanji-kit',
  /** 赞赏码（public/author/），作者本人提供 */
  tips: [
    { id: 'alipay', zh: '支付宝', en: 'Alipay', src: '/author/alipay.webp', w: 640, h: 725 },
    { id: 'wechat', zh: '微信', en: 'WeChat', src: '/author/wechat.webp', w: 640, h: 640 },
  ],
} as const;

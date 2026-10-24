// 一键装机工具（开发中）界面示意数据——检测结果为演示用，不代表任何真实机器
export type KitStatus = 'ok' | 'missing' | 'outdated';
export const KIT_ITEMS: { group: string; name: string; arch?: string; status: KitStatus }[] = [
  { group: 'VC++', name: 'Visual C++ 2015–2022 运行库', arch: 'x64', status: 'ok' },
  { group: 'VC++', name: 'Visual C++ 2015–2022 运行库', arch: 'x86', status: 'ok' },
  { group: 'VC++', name: 'Visual C++ 2013 运行库', arch: 'x64', status: 'outdated' },
  { group: 'VC++', name: 'Visual C++ 2010 运行库', arch: 'x86', status: 'missing' },
  { group: 'DirectX', name: 'DirectX 9.0c 最终用户运行时', status: 'missing' },
  { group: '.NET', name: '.NET Framework 4.8', status: 'ok' },
  { group: '.NET', name: '.NET Framework 3.5（含 2.0 / 3.0）', status: 'ok' },
  { group: '其他', name: 'XNA Framework 4.0', status: 'ok' },
  { group: '其他', name: 'OpenAL', status: 'ok' },
];

export const KIT_FEATURES = [
  { no: '01', title: '一次检测，全部列出', desc: '扫描 VC++ 2005–2022、DirectX 9.0c 旧组件、.NET Framework、XNA、OpenAL 等常见游戏运行库，缺什么、旧什么一屏看清。' },
  { no: '02', title: '只用官方安装包', desc: '所有运行库都来自微软等原始发布方的官方安装程序，不打包、不魔改、不捆绑任何第三方软件。' },
  { no: '03', title: '一键修复，可回看日志', desc: '勾选后顺序静默安装，失败项单独标出原因；每一次操作都写入本地日志，方便排查。' },
  { no: '04', title: '与教程互通', desc: '常见报错（如缺少 VCRUNTIME140.dll、d3dx9_43.dll）直接对应到站内排障教程，知道为什么缺、修了什么。' },
];

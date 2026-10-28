// 首页装机章的动画演示数据——检测结果为演示用，不代表任何真实机器（真实组件清单见 kit-release.ts）
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

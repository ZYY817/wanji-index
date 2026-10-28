// 「我的电脑能玩吗」：显卡相对性能表 + 配置要求解析 + 判定。
// 分数是粗略的相对性能（GTX 1060 6GB = 100），按公开跑分大致换算，只用来分「流畅 / 能玩 / 吃力」三档，不做精确对比。
// 服务端（解析每款游戏的配置要求）与浏览器（识别本机显卡）共用同一套解析，保证两边口径一致。

export type Gpu = { id: string; name: string; score: number };

// [显示名, 分数]；id 由显示名小写化得到，解析器产出的候选 id 与它对上即命中
const TABLE: [string, number][] = [
  // NVIDIA RTX
  ['RTX 5090', 400], ['RTX 5080', 360], ['RTX 5070 Ti', 330], ['RTX 5070', 300], ['RTX 5060 Ti', 240], ['RTX 5060', 220],
  ['RTX 4090', 385], ['RTX 4080 Super', 350], ['RTX 4080', 345], ['RTX 4070 Ti Super', 325], ['RTX 4070 Ti', 315], ['RTX 4070 Super', 300], ['RTX 4070', 268], ['RTX 4060 Ti', 225], ['RTX 4060', 197], ['RTX 4050', 160],
  ['RTX 3090 Ti', 290], ['RTX 3090', 265], ['RTX 3080 Ti', 268], ['RTX 3080', 250], ['RTX 3070 Ti', 235], ['RTX 3070', 223], ['RTX 3060 Ti', 203], ['RTX 3060', 170], ['RTX 3050', 128],
  ['RTX 2080 Ti', 218], ['RTX 2080 Super', 195], ['RTX 2080', 189], ['RTX 2070 Super', 182], ['RTX 2070', 162], ['RTX 2060 Super', 160], ['RTX 2060', 140],
  // NVIDIA GTX
  ['GTX 1660 Ti', 128], ['GTX 1660 Super', 127], ['GTX 1660', 115], ['GTX 1650 Super', 100], ['GTX 1650', 78], ['GTX 1630', 48],
  ['GTX 1080 Ti', 185], ['GTX 1080', 154], ['GTX 1070 Ti', 145], ['GTX 1070', 135], ['GTX 1060', 100], ['GTX 1050 Ti', 63], ['GTX 1050', 50], ['GT 1030', 26],
  ['GTX Titan X', 135], ['GTX 980 Ti', 135], ['GTX 980', 110], ['GTX 970', 96], ['GTX 960', 60], ['GTX 950', 53],
  ['GTX 780 Ti', 90], ['GTX 780', 77], ['GTX 770', 60], ['GTX 760', 50], ['GTX 750 Ti', 39], ['GTX 750', 34], ['GT 740', 15], ['GT 730', 9],
  ['GTX 690', 70], ['GTX 680', 60], ['GTX 670', 56], ['GTX 660 Ti', 50], ['GTX 660', 44], ['GTX 650 Ti', 28], ['GTX 650', 18], ['GT 640', 12],
  ['GTX 590', 45], ['GTX 580', 47], ['GTX 570', 41], ['GTX 560 Ti', 37], ['GTX 560', 33], ['GTX 550 Ti', 24], ['GTS 450', 17], ['GTX 480', 40], ['GTX 470', 34], ['GTX 465', 30], ['GTX 460', 29],
  ['GTX 285', 15], ['GTX 280', 14], ['GTX 275', 14], ['GTX 260', 12], ['GTS 250', 11], ['9800 GT', 11], ['9600 GT', 9], ['8800 GT', 10], ['8800 GTX', 10], ['7900 GT', 4], ['7800 GT', 3], ['6800', 2],
  // AMD RX
  ['RX 9070 XT', 320], ['RX 9070', 300], ['RX 9060 XT', 210],
  ['RX 7900 XTX', 305], ['RX 7900 XT', 287], ['RX 7900 GRE', 260], ['RX 7800 XT', 250], ['RX 7700 XT', 230], ['RX 7600 XT', 182], ['RX 7600', 175],
  ['RX 6950 XT', 270], ['RX 6900 XT', 260], ['RX 6800 XT', 255], ['RX 6800', 230], ['RX 6750 XT', 205], ['RX 6700 XT', 197], ['RX 6700', 185], ['RX 6650 XT', 180], ['RX 6600 XT', 175], ['RX 6600', 163], ['RX 6500 XT', 88], ['RX 6400', 70],
  ['RX 5700 XT', 165], ['RX 5700', 145], ['RX 5600 XT', 130], ['RX 5500 XT', 90], ['RX 5500', 85],
  ['RX Vega 64', 140], ['RX Vega 56', 130], ['RX 590', 96], ['RX 580', 88], ['RX 570', 79], ['RX 560', 36], ['RX 550', 29], ['RX 480', 86], ['RX 470', 77], ['RX 460', 42],
  // AMD R9 / R7 / HD
  ['R9 Fury X', 110], ['R9 Fury', 100], ['R9 390X', 95], ['R9 390', 90], ['R9 380X', 72], ['R9 380', 68], ['R9 290X', 90], ['R9 290', 85], ['R9 285', 65], ['R9 280X', 67], ['R9 280', 60], ['R9 270X', 50], ['R9 270', 45],
  ['R7 370', 40], ['R7 360', 29], ['R7 265', 38], ['R7 260X', 30], ['R7 260', 26], ['R7 250', 17], ['R7 240', 11],
  ['HD 7970', 67], ['HD 7950', 56], ['HD 7870', 53], ['HD 7850', 43], ['HD 7790', 36], ['HD 7770', 27], ['HD 7750', 23],
  ['HD 8800', 53], ['HD 6970', 37], ['HD 6950', 33], ['HD 6870', 33], ['HD 6850', 26], ['HD 6790', 21], ['HD 6770', 18], ['HD 6670', 11],
  ['HD 5870', 30], ['HD 5850', 26], ['HD 5770', 18], ['HD 5750', 15], ['HD 5670', 9], ['HD 5570', 7], ['HD 5450', 2.5], ['HD 4890', 15], ['HD 4870', 14], ['HD 4850', 12], ['HD 4830', 11], ['HD 4810', 11],
  ['X1900', 5], ['X800', 2],
  // 核显 / 掌机
  ['Radeon 890M', 85], ['Radeon 780M', 70], ['Radeon 680M', 60], ['Radeon Vega 8', 19], ['Radeon R3', 6],
  ['Intel Arc B580', 175], ['Intel Arc B570', 160], ['Intel Arc A770', 140], ['Intel Arc A750', 130], ['Intel Arc A580', 115], ['Intel Arc A380', 65], ['Intel Arc 140V', 55],
  ['Intel Iris Xe', 27], ['Intel UHD 770', 17], ['Intel UHD 730', 14], ['Intel UHD 630', 13], ['Intel UHD 620', 9],
  ['Intel HD 630', 12.5], ['Intel HD 620', 9], ['Intel HD 530', 9.5], ['Intel HD 520', 8], ['Intel HD 4600', 6.5], ['Intel HD 4400', 5.5], ['Intel HD 4000', 4.5], ['Intel HD 3000', 2.5],
];

export const GPUS: Gpu[] = TABLE.map(([name, score]) => ({ id: name.toLowerCase(), name, score }));
const BY_ID = new Map(GPUS.map((g) => [g.id, g]));

// 英特尔 HD 的四位型号（与 AMD HD 区分）
const INTEL_HD4 = new Set(['2000', '2500', '3000', '4000', '4400', '4600', '5000', '5500', '6000']);

/** 从一段文字（配置要求一行 / WebGL 渲染器名）里找出所有能识别的显卡 */
export function findGpus(raw: string): Gpu[] {
  const t = ` ${raw.toLowerCase().replace(/\((r|tm)\)/g, ' ').replace(/英特尔高清显卡\s*/g, 'intel hd ').replace(/[®™©]/g, ' ').replace(/(\d)(ti|super|xtx|xt|gre)\b/g, '$1 $2').replace(/[,/|()（）、]/g, ' ').replace(/\s+/g, ' ')} `;
  const ids: string[] = [];
  const add = (id: string) => { if (BY_ID.has(id)) ids.push(id); };
  const suffix = (s?: string) => (s ? ` ${s === 'super' ? 'Super' : s}`.toLowerCase() : '');

  // NVIDIA：带前缀的 RTX / GTX / GTS / GT
  for (const m of t.matchAll(/\b(rtx|gtx|gts|gt)\s*-?\s*(\d{3,4})(?:\s+(ti|super))?(?:\s+(super))?/g)) {
    const n = m[2], s = [m[3], m[4]].filter(Boolean).join(' ');
    const fam = Number(n) >= 2000 && Number(n) < 6000 ? 'rtx' : m[1];
    if (BY_ID.has(`${fam} ${n}${s ? ' ' + s : ''}`)) add(`${fam} ${n}${s ? ' ' + s : ''}`);
    else for (const f of ['gtx', 'gt', 'gts', 'rtx']) if (BY_ID.has(`${f} ${n}${s ? ' ' + s : ''}`)) { add(`${f} ${n}${s ? ' ' + s : ''}`); break; }
  }
  // NVIDIA：只写了「GeForce 760」「nVidia 450」「GeForce 1080 Ti」「9800 GT」
  for (const m of t.matchAll(/\b(?:nvidia|geforce)\s+(?:geforce\s+)?(\d{3,4})(?:\s+(ti|super|gt|gtx))?\b/g)) {
    const n = m[1], s = m[2];
    if (s === 'gt' || s === 'gtx') { add(`${n} ${s}`); continue; }
    for (const f of ['rtx', 'gtx', 'gts', 'gt']) { const id = `${f} ${n}${suffix(s)}`; if (BY_ID.has(id)) { add(id); break; } }
    add(n);
  }
  for (const m of t.matchAll(/\b(9800|9600|8800|7900|7800)\s*(gt|gtx)\b/g)) add(`${m[1]} ${m[2]}`);

  // AMD RX / Vega
  for (const m of t.matchAll(/\brx\s*-?\s*(\d{3,4})(?:\s*-?\s*(xtx|xt|gre))?\b/g)) add(`rx ${m[1]}${m[2] ? ' ' + m[2] : ''}`) ;
  for (const m of t.matchAll(/\b(?:rx\s+)?vega\s*(56|64)\b/g)) add(`rx vega ${m[1]}`);
  // 「AMD 6600 XT」「AMD 7970」「AMD 5570」这类省略系列名的写法
  for (const m of t.matchAll(/\b(?:amd|ati|radeon)\s+(?:radeon\s+)?(\d{4})(?:\s+(xtx|xt|gre))?\b/g)) {
    const n = m[1], s = m[2];
    if (s || Number(n) >= 5000 && /^[5-9]\d00$/.test(n)) add(`rx ${n}${s ? ' ' + s : ''}`);
    add(`hd ${n}`);
  }
  for (const m of t.matchAll(/\b(r9|r7)\s*(\d{3})(\s*x)?\b/g)) add(`${m[1]} ${m[2]}${m[3] ? 'x' : ''}`);
  for (const m of t.matchAll(/\br9\s+fury(\s+x)?\b/g)) add(`r9 fury${m[1] ? ' x' : ''}`);
  for (const m of t.matchAll(/\b(?:radeon\s+)?r3\b/g)) if (m) add('radeon r3');
  for (const m of t.matchAll(/\b(890m|780m|680m)\b/g)) add(`radeon ${m[1]}`);
  for (const m of t.matchAll(/\bvega\s*8\b/g)) if (m) add('radeon vega 8');
  for (const m of t.matchAll(/\b(x1900|x800)\b/g)) add(m[1]);

  // Radeon HD / Intel HD：四位型号按表区分
  for (const m of t.matchAll(/\bhd\s*(?:graphics\s*)?(\d{4})\b/g)) {
    if (INTEL_HD4.has(m[1]) && !/\b(amd|ati|radeon)\s+hd\s*\d/.test(t)) add(`intel hd ${m[1]}`);
    else add(`hd ${m[1]}`);
  }
  // Intel 三位型号核显、Iris Xe、Arc
  for (const m of t.matchAll(/\b(uhd|hd)\s*(?:graphics\s*)?(\d{3})\b/g)) add(`intel ${m[1]} ${m[2]}`);
  if (/\biris\s*xe\b/.test(t)) add('intel iris xe');
  for (const m of t.matchAll(/\barc\s*(?:graphics\s*)?([ab]\d{3}|140v)\b/g)) add(`intel arc ${m[1]}`);

  return [...new Set(ids)].map((id) => BY_ID.get(id)!);
}

/** WebGL 渲染器名 → 本机显卡（取识别到的第一块；笔记本版本打八折） */
export function gpuFromRenderer(renderer: string): Gpu | null {
  const g = findGpus(renderer)[0];
  if (!g) return null;
  return /laptop|mobile|max-q|\bm\b/i.test(renderer) ? { ...g, name: `${g.name}（笔记本）`, score: Math.round(g.score * 0.8) } : g;
}

export type Req = { gpu?: { score: number; names: string[] }; ramGb?: number };
export type Reqs = { min?: Req; rec?: Req };

/** 一段 Steam 配置要求文本 → 显卡门槛（列出的几块里最弱那块就够）+ 内存 */
export function parseReq(text?: string): Req | undefined {
  if (!text) return undefined;
  const lines = text.split('\n');
  const gpuLine = lines.find((l) => /^\s*(显卡|图形|graphics|video)/i.test(l)) ?? '';
  const ramLine = lines.find((l) => /^\s*(内存|memory|ram)/i.test(l)) ?? '';
  const gpuText = gpuLine.replace(/^[^:：]*[:：]/, '');
  const gpus = findGpus(gpuText);
  // 老游戏常写成一行：「最低配置：500 mhz 处理器，96mb 内存，16mb 显卡…」
  const ram = /(\d+(?:\.\d+)?)\s*(gb|mb)/i.exec(ramLine) ?? /(\d+(?:\.\d+)?)\s*(gb|mb)\s*(?:内存|ram)/i.exec(text);
  const out: Req = {};
  if (gpus.length) {
    const weakest = gpus.reduce((a, b) => (b.score < a.score ? b : a));
    out.gpu = { score: weakest.score, names: gpus.map((g) => g.name) };
  } else {
    // 没写型号、只写显存或 DirectX 版本时按显存粗估：显存越小、年代越早，门槛越低
    const vram = /(\d+(?:\.\d+)?)\s*(gb|mb)/i.exec(gpuText || (/[，,]\s*([^，,]*显卡)/.exec(text)?.[1] ?? ''));
    const gb = vram ? (vram[2].toLowerCase() === 'mb' ? Number(vram[1]) / 1024 : Number(vram[1])) : null;
    const old = /directx\s*(?:&reg;)?\s*[789]\b|shader model [123]/i.test(gpuText || text);
    const score = gb != null ? (gb <= 0.5 ? 3 : gb <= 1 ? 10 : gb <= 2 ? 30 : gb <= 4 ? 60 : 100) : old ? 3 : null;
    if (score != null) out.gpu = { score, names: [gb != null ? `${gb >= 1 ? gb + ' GB' : Math.round(gb * 1024) + ' MB'} 显存级别` : '早期 DirectX 显卡'] };
  }
  if (ram) out.ramGb = ram[2].toLowerCase() === 'mb' ? Number(ram[1]) / 1024 : Number(ram[1]);
  return out.gpu || out.ramGb ? out : undefined;
}

export function parseReqs(r?: { minimum?: string; recommended?: string }): Reqs | undefined {
  if (!r) return undefined;
  const min = parseReq(r.minimum), rec = parseReq(r.recommended);
  return min || rec ? { ...(min ? { min } : {}), ...(rec ? { rec } : {}) } : undefined;
}

export type Rig = { gpu?: Gpu; ramGb?: number };
export type Verdict = 'smooth' | 'playable' | 'weak' | 'unknown';
export const VERDICT_LABEL: Record<Verdict, string> = { smooth: '流畅', playable: '能玩', weak: '吃力', unknown: '无法判断' };
export const VERDICT_EN: Record<Verdict, string> = { smooth: 'Smooth', playable: 'Playable', weak: 'Struggles', unknown: 'Unknown' };

// 跑分表本身是估算，留 5% 余量，免得「差一点点」被判成不行
const meets = (rig: Rig, req?: Req) => {
  if (!req) return null;
  const gpuOk = req.gpu && rig.gpu ? rig.gpu.score >= req.gpu.score * 0.95 : null;
  const ramOk = req.ramGb && rig.ramGb ? rig.ramGb >= req.ramGb : null;
  if (gpuOk === null && ramOk === null) return null;
  return { ok: gpuOk !== false && ramOk !== false, gpuOk, ramOk };
};

/** 判定：达到推荐 → 流畅；达到最低 → 能玩；连最低都不够 → 吃力（并说明差在哪） */
const UNKNOWN = { verdict: 'unknown' as const, reason: '这款游戏的配置要求里没有能识别的显卡或内存', reasonEn: 'No recognizable GPU or RAM in the requirements' };

export function judge(rig: Rig, reqs?: Reqs): { verdict: Verdict; reason: string; reasonEn: string } {
  if (!reqs || !rig.gpu && !rig.ramGb) return UNKNOWN;
  const rec = meets(rig, reqs.rec), min = meets(rig, reqs.min);
  if (rec?.ok) return { verdict: 'smooth', reason: '达到推荐配置', reasonEn: 'Meets recommended specs' };
  if (min?.ok) return rec
    ? { verdict: 'playable', reason: '达到最低配置，画质需要调低一些', reasonEn: 'Meets minimum specs — lower the settings' }
    : { verdict: 'playable', reason: '达到最低配置', reasonEn: 'Meets minimum specs' };
  if (min || rec) {
    const r = min ?? rec!;
    const short = [r.gpuOk === false && '显卡', r.ramOk === false && '内存'].filter(Boolean).join('和');
    const shortEn = [r.gpuOk === false && 'GPU', r.ramOk === false && 'RAM'].filter(Boolean).join(' and ');
    return { verdict: 'weak', reason: `${short}低于${min ? '最低' : '推荐'}配置`, reasonEn: `${shortEn} below ${min ? 'minimum' : 'recommended'} specs` };
  }
  return UNKNOWN;
}

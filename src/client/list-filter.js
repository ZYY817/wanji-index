// 通用列表筛选（客户端，原生 JS）——games/free/resources/tools/guides 索引页共用
// 职责：URL 参数 ↔ 表单 ↔ 行显隐 ↔ 条件标签(chips) ↔ 计数 ↔ 空态
// 用法：行元素带 data-row 与匹配用 data-* 属性；表单控件带 data-param="参数名"
//   initListFilter({ filters: { q: (v,row)=>bool, genre: (v,row)=>bool },
//                    labels: { genre: {rpg:'RPG'} }, multi: ['type'] })
export function initListFilter({ filters, labels = {}, multi = [], emptyText } = {}) {
  const rows = [...document.querySelectorAll('[data-row]')];
  const inputs = [...document.querySelectorAll('[data-param]')];
  const chipsEl = document.querySelector('[data-chips]');
  const countEl = document.querySelector('[data-count]');
  const emptyEl = document.querySelector('[data-empty]');
  const clearEl = document.querySelector('[data-clear]');
  const state = {};

  // URL → state（multi 参数逗号分隔为数组）
  const url = new URL(location.href);
  for (const inp of inputs) {
    const p = inp.dataset.param;
    if (state[p] === undefined) {
      const raw = url.searchParams.get(p) ?? '';
      state[p] = multi.includes(p) ? raw.split(',').filter(Boolean) : raw;
    }
    // 回填表单
    if (inp.type === 'checkbox') inp.checked = state[p].includes?.(inp.value) ?? false;
    else if (inp.type === 'radio') inp.checked = state[p] === inp.value;
    else inp.value = state[p];
  }

  const isActive = (p) => (multi.includes(p) ? state[p].length > 0 : state[p] !== '');

  function apply(sync = true) {
    let visible = 0;
    for (const row of rows) {
      const show = Object.keys(filters).every((p) => !isActive(p) || filters[p](state[p], row));
      row.hidden = !show;
      if (show) visible++;
    }
    if (countEl) countEl.textContent = visible;
    if (emptyEl) {
      emptyEl.hidden = visible !== 0;
      const t = emptyEl.querySelector('[data-empty-text]');
      if (t && emptyText) t.textContent = emptyText(state);
    }
    renderChips();
    if (sync) syncUrl();
  }

  function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    for (const p of Object.keys(state)) {
      if (!isActive(p)) continue;
      const vals = multi.includes(p) ? state[p] : [state[p]];
      for (const v of vals) {
        const label = labels[p]?.[v] ?? v;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'fchip';
        chip.innerHTML = `${label} <span aria-hidden="true">×</span>`;
        chip.setAttribute('aria-label', `移除筛选 ${label}`);
        chip.onclick = () => {
          if (multi.includes(p)) state[p] = state[p].filter((x) => x !== v);
          else state[p] = '';
          syncInputs();
          apply();
        };
        chipsEl.appendChild(chip);
      }
    }
  }

  function syncInputs() {
    for (const inp of inputs) {
      const p = inp.dataset.param;
      if (inp.type === 'checkbox') inp.checked = state[p].includes(inp.value);
      else if (inp.type === 'radio') inp.checked = state[p] === inp.value;
      else inp.value = state[p];
    }
  }

  function syncUrl() {
    const u = new URL(location.href);
    for (const p of Object.keys(state)) {
      const v = multi.includes(p) ? state[p].join(',') : state[p];
      v ? u.searchParams.set(p, v) : u.searchParams.delete(p);
    }
    history.replaceState(null, '', u);
  }

  for (const inp of inputs) {
    inp.addEventListener(inp.type === 'checkbox' || inp.type === 'radio' ? 'change' : 'input', () => {
      const p = inp.dataset.param;
      if (inp.type === 'checkbox') {
        state[p] = inputs.filter((i) => i.dataset.param === p && i.checked).map((i) => i.value);
      } else state[p] = inp.value;
      apply();
    });
  }
  clearEl?.addEventListener('click', () => {
    for (const p of Object.keys(state)) state[p] = multi.includes(p) ? [] : '';
    syncInputs();
    apply();
  });

  apply(false);
}

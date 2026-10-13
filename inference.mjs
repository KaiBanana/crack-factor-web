export function predictTarget(target, input) {
  let value = target.base;
  for (const tree of target.trees) {
    let i = 0;
    while (!tree[i][5]) {
      const n = tree[i];
      // sklearn's ExtraTrees uses float32 inputs; HGB uses float64.
      const x = target.kind === 'extra' ? Math.fround(input[n[1]]) : input[n[1]];
      i = x <= n[2] ? n[3] : n[4];
    }
    value += tree[i][0];
  }
  if (target.kind === 'extra') value /= target.trees.length;
  if (target.scale != null) value = Math.expm1(value) * target.scale;
  return Math.max(0, target.max == null ? value : Math.min(target.max, value));
}
export function balanceComposition(elements, composition) {
  const others = elements.filter(e => e !== 'Ni');
  for (const e of others) {
    const value = composition[e];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100)
      throw new Error('请为每个成分填写 0–100 之间的有效含量。');
  }
  const remainder = 100 - others.reduce((sum, e) => sum + composition[e], 0);
  if (remainder < -1e-9) throw new Error('其他成分总量不能超过 100 wt.%，Ni 余量不能为负。');
  return elements.map(e => e === 'Ni' ? Math.max(0, remainder) : composition[e]);
}
export function validateComposition(model, values) {
  if (values.length !== model.elements.length || values.some(v => !Number.isFinite(v) || v < 0 || v > 100))
    throw new Error('请为每个成分填写 0–100 之间的有效含量。');
  const sum = values.reduce((a,b) => a+b, 0);
  if (model.niMode === 'balance' && Math.abs(sum-100) > .02) throw new Error('成分总量应为 100 wt.%。');
  if (model.niMode === 'raw' && sum > 100.02) throw new Error('成分总量不能超过 100%。');
  if (sum <= 0) throw new Error('请至少输入一个非零成分。');
  return model.elements.filter((e,i) => values[i] < model.ranges[e][0]-1e-8 || values[i] > model.ranges[e][1]+1e-8);
}

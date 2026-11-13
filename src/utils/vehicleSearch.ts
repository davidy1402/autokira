const aliases: Record<string, string> = {
  '迈威': 'myvi', '迈薇': 'myvi', '美薇': 'myvi', '贝莎': 'bezza', '贝萨': 'bezza',
  '阿西亚': 'axia', '赛佳': 'saga', '沙加': 'saga', '宝腾': 'proton', '第二国产车': 'perodua',
  '本田': 'honda', '丰田': 'toyota', '比亚迪': 'byd', '特斯拉': 'tesla',
};

function normalize(text: string): string {
  let value = text.toLowerCase();
  for (const [alias, replacement] of Object.entries(aliases)) value = value.split(alias).join(` ${replacement} `);
  value = value.replace(/\b(hr|cr)[\s-]*v\b/g, '$1v');
  return value.normalize('NFKD').replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').trim();
}

function closeWord(query: string, candidate: string): boolean {
  if (/\d/.test(query) || /\d/.test(candidate) || query.length < 4 || Math.abs(query.length - candidate.length) > 1) return false;
  let i = 0, j = 0, errors = 0;
  while (i < query.length && j < candidate.length) {
    if (query[i] === candidate[j]) { i++; j++; continue; }
    if (++errors > 1) return false;
    if (query.length >= candidate.length) i++;
    if (query.length <= candidate.length) j++;
  }
  return errors + (i < query.length || j < candidate.length ? 1 : 0) <= 1;
}

export function matchesVehicle(query: string, ...fields: (string | undefined)[]): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const words = normalize(fields.filter(Boolean).join(' ')).split(/\s+/);
  return terms.every(term => words.some(word => word.includes(term) || closeWord(term, word)));
}

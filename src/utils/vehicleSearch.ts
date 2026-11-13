const aliases: Record<string, string> = {
  // Brand aliases (Chinese & local colloquial names)
  '宝腾': 'proton', '普腾': 'proton',
  '第二国产车': 'perodua', '北鹿大': 'perodua', '派洛多': 'perodua',
  '本田': 'honda', '丰田': 'toyota',
  '比亚迪': 'byd', '特斯拉': 'tesla',
  '极氪': 'zeekr', '小鹏': 'xpeng', '蔚来': 'nio',
  '长城': 'gwm', '欧拉': 'ora', '奇瑞': 'chery',
  '现代': 'hyundai', '起亚': 'kia',
  '宝马': 'bmw', '奔驰': 'mercedes', '平治': 'mercedes',
  '马自达': 'mazda', '万事得': 'mazda',
  '日产': 'nissan', '尼桑': 'nissan',
  '三菱': 'mitsubishi', '五十铃': 'isuzu',
  '福特': 'ford', '名爵': 'mg', '哪吒': 'neta',
  '沃尔沃': 'volvo', '富豪': 'volvo',

  // Model aliases
  '迈威': 'myvi', '迈薇': 'myvi', '美薇': 'myvi',
  '贝莎': 'bezza', '贝萨': 'bezza',
  '阿西亚': 'axia', '赛佳': 'saga', '沙加': 'saga',
  '威驰': 'vios', '雅力士': 'yaris',
  '卡罗拉': 'corolla', '雷凌': 'corolla',
  '凯美瑞': 'camry', '佳美': 'camry',
  '海拉克斯': 'hilux', '海拉': 'hilux',
  '海狮': 'sealion', '海豚': 'dolphin', '海豹': 'seal',
  '元plus': 'atto 3', '元': 'atto',
  '好猫': 'good cat', '闪电猫': 'ora 07',
  '思域': 'civic', '飞度': 'jazz', '雅阁': 'accord',
  '缤智': 'hrv', '艾力绅': 'elysion', '奥德赛': 'odyssey',
  '轩逸': 'sylphy', '骐达': 'tiida', '天籁': 'teana',
  '昂克赛拉': 'mazda 3', '阿特兹': 'mazda 6',
  '博越': 'x70', '缤越': 'x50',
};

function normalize(text: string): string {
  let value = text.toLowerCase();
  for (const [alias, replacement] of Object.entries(aliases)) {
    value = value.split(alias).join(` ${replacement} `);
  }
  // Model & naming normalizations
  value = value.replace(/\b(hr|cr)[\s-]*v\b/g, '$1v');
  value = value.replace(/\bcx[\s-]*(\d+)\b/g, 'cx$1');
  value = value.replace(/\bd[\s-]*max\b/g, 'dmax');
  value = value.replace(/\bx[\s-]*trail\b/g, 'xtrail');
  value = value.replace(/\be[\s.]*mas[\s-]*(\d+)?\b/g, 'emas $1');
  value = value.replace(/\batto[\s-]*3\b/g, 'atto 3');
  value = value.replace(/\bgood[\s-]*cat\b/g, 'good cat');
  value = value.replace(/\bmodel[\s-]*([3ysx])\b/g, 'model $1');
  value = value.replace(/\btesla\s+m3\b/g, 'tesla model 3');
  value = value.replace(/\btesla\s+my\b/g, 'tesla model y');
  return value.normalize('NFKD').replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').trim();
}

function closeWord(query: string, candidate: string): boolean {
  if (/\d/.test(query) || /\d/.test(candidate) || query.length < 4 || Math.abs(query.length - candidate.length) > 1) {
    return false;
  }
  let i = 0, j = 0, errors = 0;
  while (i < query.length && j < candidate.length) {
    if (query[i] === candidate[j]) {
      i++;
      j++;
      continue;
    }
    if (++errors > 1) return false;
    if (query.length >= candidate.length) i++;
    if (query.length <= candidate.length) j++;
  }
  return errors + (i < query.length || j < candidate.length ? 1 : 0) <= 1;
}

export function matchesVehicle(query: string, ...fields: (string | undefined)[]): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const words = normalize(fields.filter(Boolean).join(' ')).split(/\s+/);
  return terms.every(term => words.some(word => word.includes(term) || closeWord(term, word)));
}

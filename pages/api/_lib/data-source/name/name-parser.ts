export function getLarkUserShorterName(name: string): string {
  let isFullChineseName = /^[\u4e00-\u9fa5]+$/.test(name);
  let chineseNameAndEnglish = /^([\u4e00-\u9fa5]+)\s*([a-zA-Z]+)$/.exec(name);
  let twoWordEnglish = /^([a-zA-Z]+)\s+([a-zA-Z]+)$/.exec(name);
  if (isFullChineseName) {
    for (let compoundSurname of compoundSurnames) {
      if (name.startsWith(compoundSurname)) {
        // 如果名字以复姓开头，则按复姓分割
        return name.substring(compoundSurname.length);
      }
    }

    // 三字名默认姓氏为名字的第一个字
    if (name.length === 3) {
      return name.substring(1);
    }

    // 两字还是返回两字作为短名
    return name;
  } else if (chineseNameAndEnglish) {
    return chineseNameAndEnglish[2];
  } else if (twoWordEnglish) {
    return twoWordEnglish[1];
  }
  return name;
}

export function getLarkUserLastName(name: string): string {
  let isFullChineseName = /^[\u4e00-\u9fa5]+$/.test(name);
  let chineseNameAndEnglish = /^([\u4e00-\u9fa5]+)\s*([a-zA-Z]+)$/.exec(name);
  let twoWordEnglish = /^([a-zA-Z]+)\s+([a-zA-Z]+)$/.exec(name);
  if (isFullChineseName) {
    for (let compoundSurname of compoundSurnames) {
      if (name.startsWith(compoundSurname)) {
        // 如果名字以复姓开头，则按复姓分割
        return compoundSurname;
      }
    }

    if (name.length === 2 || name.length === 3) {
      // 否则，默认姓氏为名字的第一个字
      return name.substring(0, 1);
    }

    return name;
  } else if (chineseNameAndEnglish) {
    return getLarkUserLastName(chineseNameAndEnglish[1]);
  } else if (twoWordEnglish) {
    return twoWordEnglish[2];
  }

  return name;
}

const compoundSurnames = [
  "欧阳",
  "太史",
  "上官",
  "端木",
  "司马",
  "东方",
  "独孤",
  "南宫",
  "万俟",
  "闻人",
  "夏侯",
  "诸葛",
  "尉迟",
  "公羊",
  "赫连",
  "澹台",
  "皇甫",
  "宗政",
  "濮阳",
  "公冶",
  "太叔",
  "申屠",
  "公孙",
  "慕容",
  "仲孙",
  "钟离",
  "长孙",
  "宇文",
  "司徒",
  "鲜于",
  "司空",
  "闾丘",
  "子车",
  "亓官",
  "司寇",
  "巫马",
  "公西",
  "颛孙",
  "壤驷",
  "公良",
  "漆雕",
  "乐正",
  "宰父",
  "谷梁",
  "拓跋",
  "夹谷",
  "轩辕",
  "令狐",
  "段干",
  "百里",
  "呼延",
  "东郭",
  "南门",
  "羊舌",
  "微生",
  "公户",
  "公玉",
  "公仪",
  "梁丘",
  "公仲",
  "公上",
  "公门",
  "公山",
  "公坚",
  "左丘",
  "公伯",
  "西门",
  "公祖",
  "第五",
  "公乘",
  "贯丘",
  "公皙",
  "南荣",
  "东里",
  "东宫",
  "仲长",
  "子书",
  "子桑",
  "即墨",
  "达奚",
  "褚师",
  "吴铭",
];

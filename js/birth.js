(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.YikouBirth = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SURNAMES = [
    ["王", 74], ["李", 70], ["张", 65], ["刘", 54], ["陈", 45], ["杨", 31], ["黄", 28], ["赵", 25],
    ["吴", 24], ["周", 23], ["徐", 20], ["孙", 18], ["马", 17], ["朱", 16], ["胡", 15], ["郭", 14],
    ["何", 13], ["高", 12], ["林", 12], ["罗", 10], ["郑", 10], ["梁", 9], ["谢", 8], ["宋", 8],
    ["唐", 7], ["许", 7], ["邓", 7], ["冯", 6], ["韩", 6], ["曹", 6], ["彭", 5], ["曾", 5],
    ["萧", 4], ["田", 4], ["董", 4], ["袁", 4], ["潘", 4], ["于", 3], ["蒋", 3], ["蔡", 3],
    ["余", 3], ["杜", 3], ["叶", 3], ["程", 3], ["魏", 3], ["苏", 2], ["吕", 2], ["丁", 2],
    ["任", 2], ["卢", 2], ["姚", 2], ["沈", 2]
  ];
  const MALE_OLD = ["安", "信", "义", "德", "和", "清", "远", "正", "昌", "寿", "康", "宁", "武", "文", "忠", "宽", "毅", "恒"];
  const FEMALE_OLD = ["兰", "菊", "贞", "淑", "惠", "玉", "珠", "凤", "云", "月", "英", "莲", "琴", "巧"];
  const MALE_NEW = ["伟", "强", "磊", "杰", "涛", "浩", "宇", "博", "轩", "鹏", "明", "华", "军", "勇", "斌"];
  const FEMALE_NEW = ["芳", "娜", "敏", "静", "丽", "艳", "娟", "霞", "婷", "慧", "颖", "雪", "琳", "燕", "红"];

  function pick(rng, pairs) {
    let total = 0;
    pairs.forEach((p) => { total += p[1]; });
    let x = rng() * total;
    for (let i = 0; i < pairs.length; i++) {
      x -= pairs[i][1];
      if (x <= 0) return pairs[i][0];
    }
    return pairs[pairs.length - 1][0];
  }

  function countryOf(period, place, year) {
    if (period.id === "sanguo") {
      if (place.state === "魏") return year >= 266 ? "西晋" : "魏";
      if (place.state === "蜀") return year >= 266 ? "西晋" : year >= 263 ? "魏" : year >= 221 ? "蜀汉" : "刘备治下";
      if (place.state === "吴") return year >= 229 ? "吴" : "孙权治下";
    }
    if ((period.id === "song" || period.id === "songnan") && place.ancient === "析津") return "辽";
    const map = {
      qin: "秦", chuhan: "楚汉", hanw: "汉", xin: "新", hane: "汉",
      jin: "晋", nanbei: "南北朝", sui: "隋", tang: "唐", wudai: "五代",
      song: "宋", songnan: "宋", yuan: "元", ming: "明",
      qing: "清", qingwan: "清", roc: "中华民国",
      prc1: "中国", prc2: "中国", prc3: "中国"
    };
    return map[period.id] || period.name;
  }

  function given(rng, sex, year) {
    const old = sex === "男" ? MALE_OLD : FEMALE_OLD;
    const modern = sex === "男" ? MALE_NEW : FEMALE_NEW;
    const pool = year < 900 ? old : modern.concat(old);
    const a = pool[Math.floor(rng() * pool.length)];
    const single = year < 900 ? rng() < 0.72 : rng() < 0.18;
    if (single) return a;
    let b = pool[Math.floor(rng() * pool.length)];
    if (b === a) b = pool[(pool.indexOf(a) + 3) % pool.length];
    return a + b;
  }

  function motherAge(rng, year) {
    const pairs = year >= 1980
      ? [[22, 3], [24, 6], [26, 10], [28, 14], [30, 12], [32, 7], [34, 4], [36, 2], [38, 1]]
      : [[18, 5], [20, 12], [22, 16], [24, 14], [26, 10], [28, 6], [30, 4], [33, 2], [36, 1], [40, 1]];
    return pick(rng, pairs);
  }

  function fatherGap(rng) {
    return pick(rng, [[1, 2], [2, 8], [3, 12], [4, 10], [5, 6], [7, 3], [9, 2], [12, 1]]);
  }

  function job(rng, year, sex) {
    if (year < 1950) {
      return sex === "女"
        ? pick(rng, [["务农", 78], ["纺织", 12], ["帮佣", 6], ["小贩", 4]])
        : pick(rng, [["务农", 74], ["匠人", 9], ["小商", 6], ["吏", 3], ["当兵", 5], ["雇工", 3]]);
    }
    if (year < 1980) {
      return sex === "女"
        ? pick(rng, [["农民", 68], ["工人", 14], ["家务", 10], ["教师", 4], ["干部", 4]])
        : pick(rng, [["农民", 62], ["工人", 22], ["干部", 8], ["教师", 4], ["士兵", 4]]);
    }
    if (year < 2000) {
      return sex === "女"
        ? pick(rng, [["农民", 42], ["工人", 18], ["个体", 14], ["家务", 12], ["教师", 8], ["职员", 6]])
        : pick(rng, [["农民", 40], ["工人", 24], ["个体", 16], ["职员", 10], ["教师", 5], ["干部", 5]]);
    }
    return sex === "女"
      ? pick(rng, [["务工", 22], ["农民", 16], ["职员", 16], ["个体", 14], ["家务", 14], ["教师", 8], ["服务业", 10]])
      : pick(rng, [["务工", 28], ["农民", 16], ["工人", 14], ["职员", 16], ["个体", 14], ["教师", 4], ["服务业", 8]]);
  }

  function draw(rng, year, period, place, sex) {
    const surname = pick(rng, SURNAMES);
    const name = surname + given(rng, sex, year);
    const ma = motherAge(rng, year);
    const fa = Math.min(62, ma + fatherGap(rng));
    const boyHeavy = year >= 1980 && year <= 2015;
    return {
      name: name,
      country: countryOf(period, place, year),
      dynasty: period.name,
      mother: { age: ma, job: job(rng, year, "女") },
      father: { age: fa, job: job(rng, year, "男") },
      sexNote: boyHeavy ? "1980–2015年中国出生性别比偏高，这里用115比100，是粗口径。" : "出生性别用105比100。没有证据的时代不另改。",
      nameNote: "姓按常见姓氏的大致权重抽取，不是某次普查的原表。"
    };
  }

  function sexOf(rng, year) {
    const boys = year >= 1980 && year <= 2015 ? 115 : 105;
    return rng() < boys / (boys + 100) ? "男" : "女";
  }

  return { draw: draw, sexOf: sexOf };
});

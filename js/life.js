(function () {
  const M = typeof module !== "undefined" && module.exports ? require("./model.js") : globalThis.YikouModel;
  const PERIODS = [
    { id: "qin", name: "秦", start: -221, end: -207, e0: 25, annual: 18, grade: "估", strata: [["编户", 6], ["吏", 1], ["戍卒", 2], ["刑徒", 1]] },
    { id: "chuhan", name: "楚汉", start: -206, end: -202, e0: 24, annual: 16, grade: "估", strata: [["编户", 5], ["兵", 3], ["吏", 1]] },
    { id: "hanw", name: "西汉", start: -201, end: 8, e0: 28, annual: 40, grade: "估", strata: [["编户", 6], ["吏", 1], ["商", 1]] },
    { id: "xin", name: "两汉之间", start: 9, end: 24, e0: 26, annual: 28, grade: "估", strata: [["编户", 6], ["兵", 2], ["吏", 1]] },
    { id: "hane", name: "东汉", start: 25, end: 219, e0: 28, annual: 42, grade: "估", strata: [["编户", 6], ["吏", 1], ["宾客", 2], ["兵", 1]] },
    { id: "sanguo", name: "三国", start: 220, end: 279, e0: 24, annual: 26, grade: "估", strata: [["编户", 5], ["兵", 3], ["吏", 1], ["客", 2]] },
    { id: "jin", name: "两晋", start: 280, end: 419, e0: 27, annual: 32, grade: "估", strata: [["编户", 5], ["佃客", 3], ["兵", 2]] },
    { id: "nanbei", name: "南北朝", start: 420, end: 580, e0: 27, annual: 34, grade: "估", strata: [["编户", 5], ["佃客", 3], ["兵", 2]] },
    { id: "sui", name: "隋", start: 581, end: 617, e0: 29, annual: 40, grade: "估", strata: [["编户", 6], ["兵", 2], ["吏", 1]] },
    { id: "tang", name: "唐", start: 618, end: 907, e0: 30, annual: 48, grade: "估", strata: [["编户", 6], ["客户", 2], ["士族", 1]] },
    { id: "wudai", name: "五代十国", start: 908, end: 959, e0: 29, annual: 46, grade: "估", strata: [["编户", 5], ["兵", 3], ["商", 1]] },
    { id: "song", name: "北宋", start: 960, end: 1126, e0: 32, annual: 68, grade: "估", strata: [["主户", 5], ["客户", 3], ["军兵", 1]] },
    { id: "songnan", name: "南宋", start: 1127, end: 1270, e0: 32, annual: 72, grade: "估", strata: [["主户", 5], ["客户", 3], ["军兵", 1]] },
    { id: "yuan", name: "元", start: 1271, end: 1367, e0: 30, annual: 60, grade: "估", strata: [["民", 6], ["军户", 2], ["匠", 1]] },
    { id: "ming", name: "明", start: 1368, end: 1643, e0: 32, annual: 90, grade: "估", strata: [["民", 6], ["军户", 2], ["匠户", 1]] },
    { id: "qing", name: "清前期", start: 1644, end: 1839, e0: 35, annual: 200, grade: "估", strata: [["自耕农", 4], ["佃农", 3], ["雇工", 2], ["商", 1]] },
    { id: "qingwan", name: "晚清", start: 1840, end: 1911, e0: 32, annual: 260, grade: "估", strata: [["自耕农", 4], ["佃农", 3], ["雇工", 2], ["商", 1]] },
    { id: "roc", name: "民国", start: 1912, end: 1948, e0: 33, annual: 380, grade: "估", strata: [["自耕农", 3], ["佃农", 3], ["工人", 2], ["士兵", 1]] },
    { id: "prc1", name: "共和国", start: 1949, end: 1979, e0: 58, annual: 900, grade: "估", strata: [["农民", 6], ["工人", 2], ["干部", 1]] },
    { id: "prc2", name: "共和国", start: 1980, end: 1999, e0: 70, annual: 1100, grade: "估", strata: [["农村", 5], ["城镇职工", 3], ["个体", 1]] },
    { id: "prc3", name: "共和国", start: 2000, end: 2026, e0: 77, annual: 800, grade: "估", strata: [["农村", 3], ["进城务工", 3], ["城镇", 3]] }
  ];
  const ERA_NOTES = {
    qin: "统一之后，户籍、度量衡和徭役一起落到编户头上。多数人种粟麦，夜里点油灯。",
    chuhan: "五年之间旗号数次更换。日子先看谁来征粮，不看殿上坐的是谁。",
    hanw: "算赋按口征收，铁器出自官炉，边郡的消息顺着驿路进集市。",
    xin: "钱、田和官名都在改，乡里仍用旧斗量粮。流民往往比官文先到。",
    hane: "豪族田庄与编户名册并存。识字的路在郡学，多数人仍按季节种粟麦。",
    sanguo: "魏、蜀、吴按你落脚的地方分开，不并成一个政权。军屯和粮道决定这一年紧不紧。",
    jin: "两晋先是短暂统一，永嘉之后北人南渡。士族与编户不是同一套差役。",
    nanbei: "南北两个朝廷并存。平城一带吃麦，建康一带吃稻，赋税看你落在哪一边。",
    sui: "运河、驰道和整齐的户籍一起到来。科举刚出现，多数人仍去服役。",
    tang: "坊市按时开关。租庸调到建中年间多改为两税，不再只按丁口摊役。",
    wudai: "政权换得快。乡里不问年号，只问今年谁来收粮、路断不断。",
    song: "北宋的东京靠汴河运粮，桌上多是饼和粟。析津在辽境，不按宋的市镇来算。",
    songnan: "南宋偏安江南。临安有夜市和一年两熟的稻，会子在大地方流通，乡里仍数铜钱。",
    yuan: "军户、站户、匠户分开当差。驿站上的急递比商队先把官文送到。",
    ming: "里甲把每户编进册子。军户世代当差，晚明不少徭役折成银子。",
    qing: "清前期丁银逐渐并进田赋。洋货还没进乡里，日子主要看漕运和收成。",
    qingwan: "1840年以后口岸先看见洋货。厘金、赔款和1905年停科举，改变的是税和出路，不是每家人的伙食。",
    roc: "报纸、新式学堂和反复更换的纸币同时存在。县城能上学，乡下多数人仍下地。",
    prc1: "户口分开城里和乡下。粮票只在本地流通，队里记工分，年终才分粮。",
    prc2: "包产到户之后收成看自家的田。乡镇企业、长途车和电视进入一部分人家。",
    prc3: "手机、高铁和春运把进城与返乡连在一起。学区、看病和房子是家里反复算的账。"
  };

  const RAW = [
    ["qin", "咸阳", "今陕西咸阳一带", "", 5],
    ["qin", "丽邑", "今陕西西安临潼一带", "", 2],
    ["qin", "琅邪", "今山东青岛一带", "", 2],
    ["qin", "南郡", "今湖北荆州一带", "", 2],
    ["qin", "陇西", "今甘肃临洮一带", "", 2],
    ["qin", "会稽", "今江苏苏州一带", "", 2],
    ["qin", "成都", "今四川成都一带", "", 2],
    ["chuhan", "彭城", "今江苏徐州一带", "", 4],
    ["chuhan", "南阳", "今河南南阳一带", "", 3],
    ["chuhan", "咸阳", "今陕西咸阳一带", "", 2],
    ["chuhan", "长安", "今陕西西安一带", "", 3],
    ["hanw", "长安", "今陕西西安一带", "", 5],
    ["hanw", "洛阳", "今河南洛阳一带", "", 3],
    ["hanw", "成都", "今四川成都一带", "", 3],
    ["hanw", "临淄", "今山东淄博一带", "", 3],
    ["hanw", "宛", "今河南南阳一带", "", 2],
    ["hanw", "番禺", "今广东广州一带", "", 2],
    ["hanw", "蓟", "今北京一带", "", 2],
    ["xin", "长安", "今陕西西安一带", "", 4],
    ["xin", "洛阳", "今河南洛阳一带", "", 3],
    ["xin", "成都", "今四川成都一带", "", 2],
    ["xin", "宛", "今河南南阳一带", "", 2],
    ["hane", "洛阳", "今河南洛阳一带", "", 5],
    ["hane", "长安", "今陕西西安一带", "", 3],
    ["hane", "宛", "今河南南阳一带", "", 2],
    ["hane", "成都", "今四川成都一带", "", 3],
    ["hane", "吴", "今江苏苏州一带", "", 2],
    ["hane", "许", "今河南许昌一带", "", 2],
    ["sanguo", "洛阳", "今河南洛阳一带", "魏", 4],
    ["sanguo", "邺", "今河北临漳一带", "魏", 3],
    ["sanguo", "许昌", "今河南许昌一带", "魏", 3],
    ["sanguo", "长安", "今陕西西安一带", "魏", 2],
    ["sanguo", "寿春", "今安徽寿县一带", "魏", 2],
    ["sanguo", "襄阳", "今湖北襄阳一带", "魏", 2],
    ["sanguo", "成都", "今四川成都一带", "蜀", 4],
    ["sanguo", "汉中", "今陕西汉中一带", "蜀", 2],
    ["sanguo", "建业", "今江苏南京一带", "吴", 5],
    ["sanguo", "武昌", "今湖北鄂州一带", "吴", 3],
    ["sanguo", "江陵", "今湖北荆州一带", "吴", 3],
    ["sanguo", "番禺", "今广东广州一带", "吴", 2],
    ["jin", "建康", "今江苏南京一带", "", 4],
    ["jin", "洛阳", "今河南洛阳一带", "", 3],
    ["jin", "长安", "今陕西西安一带", "", 2],
    ["jin", "平城", "今山西大同一带", "", 3],
    ["jin", "邺", "今河北临漳一带", "", 2],
    ["jin", "成都", "今四川成都一带", "", 2],
    ["nanbei", "建康", "今江苏南京一带", "", 4],
    ["nanbei", "平城", "今山西大同一带", "", 3],
    ["nanbei", "洛阳", "今河南洛阳一带", "", 3],
    ["nanbei", "邺", "今河北临漳一带", "", 2],
    ["nanbei", "长安", "今陕西西安一带", "", 2],
    ["nanbei", "成都", "今四川成都一带", "", 2],
    ["sui", "长安", "今陕西西安一带", "", 5],
    ["sui", "洛阳", "今河南洛阳一带", "", 4],
    ["sui", "江都", "今江苏扬州一带", "", 2],
    ["sui", "成都", "今四川成都一带", "", 2],
    ["tang", "长安", "今陕西西安一带", "", 5],
    ["tang", "洛阳", "今河南洛阳一带", "", 4],
    ["tang", "扬州", "今江苏扬州一带", "", 3],
    ["tang", "成都", "今四川成都一带", "", 3],
    ["tang", "广州", "今广东广州一带", "", 2],
    ["tang", "幽州", "今北京一带", "", 2],
    ["tang", "敦煌", "今甘肃敦煌一带", "", 2],
    ["wudai", "汴州", "今河南开封一带", "", 4],
    ["wudai", "洛阳", "今河南洛阳一带", "", 3],
    ["wudai", "成都", "今四川成都一带", "", 3],
    ["wudai", "金陵", "今江苏南京一带", "", 3],
    ["wudai", "扬州", "今江苏扬州一带", "", 2],
    ["song", "东京", "今河南开封一带", "", 4],
    ["song", "成都", "今四川成都一带", "", 2],
    ["song", "江陵", "今湖北荆州一带", "", 2],
    ["song", "析津", "今北京一带", "辽", 2],
    ["songnan", "临安", "今浙江杭州一带", "", 5],
    ["songnan", "成都", "今四川成都一带", "", 2],
    ["songnan", "泉州", "今福建泉州一带", "", 3],
    ["songnan", "江陵", "今湖北荆州一带", "", 2],
    ["songnan", "建康", "今江苏南京一带", "", 2],
    ["yuan", "大都", "今北京一带", "", 5],
    ["yuan", "上都", "今内蒙古正蓝旗一带", "", 2],
    ["yuan", "杭州", "今浙江杭州一带", "", 3],
    ["yuan", "泉州", "今福建泉州一带", "", 2],
    ["yuan", "成都", "今四川成都一带", "", 2],
    ["ming", "应天", "今江苏南京一带", "", 3],
    ["ming", "顺天", "今北京一带", "", 5],
    ["ming", "苏州", "今江苏苏州一带", "", 3],
    ["ming", "成都", "今四川成都一带", "", 2],
    ["ming", "西安", "今陕西西安一带", "", 2],
    ["ming", "广州", "今广东广州一带", "", 2],
    ["qing", "京师", "今北京一带", "", 5],
    ["qing", "江宁", "今江苏南京一带", "", 3],
    ["qing", "苏州", "今江苏苏州一带", "", 4],
    ["qing", "成都", "今四川成都一带", "", 2],
    ["qing", "汉口", "今湖北武汉汉口一带", "", 2],
    ["qing", "盛京", "今辽宁沈阳一带", "", 2],
    ["qingwan", "京师", "今北京一带", "", 4],
    ["qingwan", "江宁", "今江苏南京一带", "", 3],
    ["qingwan", "苏州", "今江苏苏州一带", "", 3],
    ["qingwan", "广州", "今广东广州一带", "", 4],
    ["qingwan", "汉口", "今湖北武汉汉口一带", "", 3],
    ["qingwan", "成都", "今四川成都一带", "", 2],
    ["qingwan", "盛京", "今辽宁沈阳一带", "", 2],
    ["roc", "北京", "今北京一带", "", 4],
    ["roc", "北平", "今北京一带", "", 4],
    ["roc", "南京", "今江苏南京一带", "", 4],
    ["roc", "上海", "今上海一带", "", 4],
    ["roc", "广州", "今广东广州一带", "", 2],
    ["roc", "重庆", "今重庆一带", "", 3],
    ["roc", "汉口", "今湖北武汉汉口一带", "", 2],
    ["prc1", "北京", "今北京一带", "", 4],
    ["prc1", "上海", "今上海一带", "", 4],
    ["prc1", "广州", "今广东广州一带", "", 2],
    ["prc1", "成都", "今四川成都一带", "", 2],
    ["prc1", "武汉", "今湖北武汉一带", "", 2],
    ["prc1", "西安", "今陕西西安一带", "", 2],
    ["prc1", "南阳", "今河南南阳一带", "", 3],
    ["prc1", "迪化", "今新疆乌鲁木齐一带", "", 1],
    ["prc1", "归绥", "今内蒙古呼和浩特一带", "", 1],
    ["prc1", "乌鲁木齐", "今新疆乌鲁木齐一带", "", 1],
    ["prc1", "呼和浩特", "今内蒙古呼和浩特一带", "", 1],
    ["prc2", "北京", "今北京一带", "", 4],
    ["prc2", "上海", "今上海一带", "", 4],
    ["prc2", "广州", "今广东广州一带", "", 3],
    ["prc2", "成都", "今四川成都一带", "", 2],
    ["prc2", "武汉", "今湖北武汉一带", "", 2],
    ["prc2", "驻马店", "今河南驻马店一带", "", 3],
    ["prc2", "温州", "今浙江温州一带", "", 2],
    ["prc2", "乌鲁木齐", "今新疆乌鲁木齐一带", "", 1],
    ["prc3", "北京", "今北京一带", "", 3],
    ["prc3", "上海", "今上海一带", "", 3],
    ["prc3", "深圳", "今广东深圳一带", "", 3],
    ["prc3", "广州", "今广东广州一带", "", 2],
    ["prc3", "成都", "今四川成都一带", "", 2],
    ["prc3", "郑州", "今河南郑州一带", "", 2],
    ["prc3", "驻马店", "今河南驻马店一带", "", 3],
    ["prc3", "西安", "今陕西西安一带", "", 2],
    ["prc3", "呼和浩特", "今内蒙古呼和浩特一带", "", 1]
  ];
  const PLACES = RAW.map(([period, ancient, modern, state, weight]) => ({ period, ancient, modern, state, weight }));
  const FOCI = [["帮家里", "干活"], ["读书", "认字"], ["手艺", "学做"], ["人情", "看人"], ["养身体", "养着"]];

  const shiftCache = new Map();
  function q0of(e0) { return Math.min(0.42, Math.max(0.012, (80 - e0) / 180)); }
  function qxBase(age, e0, shift, q0) {
    if (age === 0) return q0;
    if (age < 5) return Math.min(0.2, q0 * 0.12);
    return Math.min(0.6, 0.0022 * Math.exp(0.1 * (age - shift)));
  }
  function lifeAt(e0, shift) {
    const q0 = q0of(e0);
    let surv = 1, years = 0;
    for (let a = 0; a < 110; a++) {
      const q = qxBase(a, e0, shift, q0);
      years += surv * (1 - q) + surv * q * 0.5;
      surv *= 1 - q;
    }
    return years;
  }
  function shiftFor(e0) {
    if (shiftCache.has(e0)) return shiftCache.get(e0);
    let lo = 0, hi = e0 + 8;
    for (let i = 0; i < 36; i++) {
      const mid = (lo + hi) / 2;
      if (lifeAt(e0, mid) > e0) hi = mid; else lo = mid;
    }
    const shift = (lo + hi) / 2;
    shiftCache.set(e0, shift);
    return shift;
  }
  function birthMass(period) { return period.annual * (period.end - period.start + 1); }
  function mass(period) {
    const births = birthMass(period);
    if (period.start >= 1949) return births * 0.45;
    const early = PERIODS.filter((item) => item.start < 1949);
    const totalEarly = early.reduce((sum, item) => sum + birthMass(item), 0);
    return births * 0.6 + totalEarly * 0.4 / early.length;
  }
  function periodOf(year) {
    return PERIODS.find((p) => year >= p.start && year <= p.end) || PERIODS[PERIODS.length - 1];
  }
  function e0For(year, period) {
    let e = period.e0;
    if (year >= 1851 && year <= 1864) e = Math.min(e, 28);
    if (year >= 1937 && year <= 1945) e = Math.min(e, 30);
    if (year >= 1959 && year <= 1961) e = Math.min(e, 45);
    return e;
  }
  function hazard(age, year, period, health) {
    const e0 = e0For(year, period);
    let q = qxBase(age, e0, shiftFor(e0), q0of(e0));
    q *= 1 + (42 - health) / 260;
    // Regional shocks are applied once in the yearly model, not twice here.
    return Math.max(0.001, Math.min(0.75, q));
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, items, w) {
    let total = 0;
    items.forEach((it) => { total += w(it); });
    let x = rng() * total;
    for (let i = 0; i < items.length; i++) {
      x -= w(items[i]);
      if (x <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  function placesFor(periodId, year) {
    const id = periodId === "songnan" && year < 1127 ? "song" : periodId === "song" && year >= 1127 ? "songnan" : periodId;
    let list = PLACES.filter((p) => p.period === id);
    if (periodId === "roc") list = list.filter((p) => (year >= 1928 ? p.ancient !== "北京" : p.ancient !== "北平"));
    if (periodId === "prc1") list = list.filter((p) => (year >= 1954 ? p.ancient !== "迪化" && p.ancient !== "归绥" : p.ancient !== "乌鲁木齐" && p.ancient !== "呼和浩特"));
    return list;
  }
  function yearText(y) { return y < 0 ? "前" + (-y) + "年" : "公元" + y + "年"; }
  function placeNow(p) {
    if (p.ancient === "武昌" && p.state === "吴") return "今湖北鄂州一带，不是今天武汉的武昌";
    return p.modern;
  }
  function causeOf(age, year, sex, rng, context) {
    const war = context && context.war;
    const modern = year >= 1990;
    const mid = year >= 1949;
    if (year >= 1959 && year <= 1961 && rng() < 0.55) return "饥荒";
    if (war && rng() < (year < 1949 ? 0.42 : 0.3)) return "战乱";
    if (sex === "女" && context && context.birthThisYear && year < 1970 && rng() < 0.15) return "产褥";
    if (age >= 15 && age < 70 && rng() < (modern ? 0.012 : 0.03)) return "自尽";
    if (age >= 75 && rng() < (modern ? 0.62 : 0.35)) return "衰老";
    if (modern) {
      if (age >= 45 && rng() < 0.4) return "慢性病";
      if (rng() < 0.18) return "意外";
      return age >= 60 ? "慢性病" : "急症";
    }
    if (mid) {
      if (rng() < 0.4) return "疫病";
      if (age >= 50 && rng() < 0.45) return "慢性病";
      return "外伤";
    }
    if (rng() < 0.62) return "疫病";
    return "外伤";
  }
  let YikouTurns;
  let YikouBirth;
  if (typeof require === "function" && typeof document === "undefined") {
    YikouTurns = require("./turns.js");
    require("./decide.js");
    require("./strategy.js");
    YikouBirth = require("./birth.js");
  } else {
    YikouTurns = globalThis.YikouTurns;
    YikouBirth = globalThis.YikouBirth;
  }

  function createLife(seed, choices) {
    const rng = mulberry32(seed);
    const period0 = pick(rng, PERIODS, mass);
    const birthYears = [];
    for(let y=period0.start;y<=period0.end;y++) if(y !== 0) birthYears.push(y);
    const birthYear = birthYears[Math.floor(rng()*birthYears.length)];
    const period = periodOf(birthYear);
    const place = pick(rng, placesFor(period.id, birthYear), (p) => p.weight);
    const sex = YikouBirth.sexOf(rng, birthYear);
    const stratum = pick(rng, period.strata, (s) => s[1])[0];
    const profile = YikouBirth.draw(rng, birthYear, period, place, sex);
    const life = {
      seed: seed, birthYear: birthYear, sex: sex, stratum: stratum, place: place, originPlace: place,
      name: profile.name, country: profile.country, dynasty: profile.dynasty,
      mother: profile.mother, father: profile.father, sexNote: profile.sexNote, nameNote: profile.nameNote,
      health: 58, happy: 55, learning: /吏|士族|干部/.test(stratum) ? 22 : 8, skill: 14, bond: 48,
      literate: false, married: false, children: 0, rank: "",
      alive: true, age: 0, rows: [], e0: e0For(birthYear, period),
      focus: "balance", done: {}, job: "还没单独做事", jobMul: 1, volatile: false,
      route: "",
      inSchool: false, edu: "还没入学", spouse: "", marriedAge: null, courting: "", jobStarted: false,
      wealthRank: 40, money: 0, income: 0, peers: [], plans: [], planYear: -1,
      childrenList: [], happiestYear: null, focusYears: {}, assetPeak: 0,
      memories: [], opportunities: {}, careerRoute: "", educationUntil: null
    };
    life.wealthRank = Math.floor(rng() * 100);
    if (/吏|士|干部|城镇/.test(stratum)) life.wealthRank = Math.min(99, life.wealthRank + 22);
    if (/刑徒|佃|雇|戍/.test(stratum)) life.wealthRank = Math.max(1, life.wealthRank - 18);
    life.money = Math.round(YikouTurns.baseIncome(birthYear, stratum) * (0.25 + life.wealthRank / 140));
    const deps = { periodOf: periodOf, placesFor: placesFor, hazard: hazard, causeOf: causeOf, pick: pick };
    YikouTurns.applyBirth(life, deps);
    (choices || []).forEach((id) => {
      if (!life.alive && String(id).indexOf("focus:") !== 0) return;
      YikouTurns.applyChoice(life, id, rng, deps);
    });
    return life;
  }
  function rowNote(row) { return row.note || ""; }

  function sanguoShare() {
    const total = PERIODS.reduce((s, p) => s + mass(p), 0);
    return mass(PERIODS.find((p) => p.id === "sanguo")) / total;
  }
  function birthShare(period) {
    const total = PERIODS.reduce((s, p) => s + mass(p), 0);
    return total ? mass(period) / total : 0;
  }
  function underFiveRisk(year, period) {
    let survive = 1;
    for (let age = 0; age < 5; age++) survive *= 1 - hazard(age, year, period, 55);
    return 1 - survive;
  }
  function makeDeps() {
    return { periodOf: periodOf, placesFor: placesFor, hazard: hazard, causeOf: causeOf, pick: pick, yearText: yearText, placeNow: placeNow };
  }
  const api = { PERIODS, createLife, yearText, placeNow, rowNote, sanguoShare, birthShare, underFiveRisk, FOCI, placesFor, makeDeps: makeDeps };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  const byId = (id) => document.getElementById(id);
  let seed = 1;
  let choices = [];
  let life = null;
  let speed = 1;
  let paused = true;
  let awaiting = false;
  let timer = null;
  let fast = false;
  let autoOn = false;
  let planningWasPaused = true;

  let phase = "cover";
  function readHash() {
    const q = new URLSearchParams(location.hash.replace(/^#/, ""));
    const n = Number(q.get("s"));
    const drawn = q.get("b") === "1";
    seed = Number.isFinite(n) && n > 0 ? (n >>> 0) : 0;
    const rawC = q.get("c") || "";
    if (rawC.indexOf("|") >= 0 || rawC.indexOf("~") >= 0 || rawC.indexOf("focus:") === 0 || rawC.indexOf("plan:") === 0) {
      choices = rawC.split("|").map(function (part) {
        try { return decodeURIComponent(part); } catch (e) { return ""; }
      }).filter(Boolean);
    } else {
      choices = rawC.split("").map((ch) => YikouTurns.IDS[parseInt(ch, 36)]).filter(Boolean);
    }
    if (choices.length) phase = "play";
    else if (drawn && seed) phase = "cert";
    else phase = "cover";
    paused = true;
  }
  function writeHash() {
    const c = choices.map(encodeURIComponent).join("|");
    const born = phase === "cover" ? "" : "&b=1";
    history.replaceState(null, "", "#s=" + seed + born + (c ? "&c=" + c : ""));
  }
  function cardFor(place) {
    const blob = place.ancient + place.modern;
    if (/\u5357\u4eac|\u5efa\u4e1a|\u5efa\u5eb7|\u6c5f\u5b81|\u5e94\u5929|\u91d1\u9675/.test(blob)) {
      return ["assets/2024apr-nanjing-city-wall-south-section-img.jpg", "\u4eca\u5929\u7684\u5357\u4eac\u57ce\u5899\uff0c\u660e\u521d\u6240\u7b51\u3002\u5efa\u4e1a\u3001\u5efa\u5eb7\u3001\u6c5f\u5b81\u90fd\u5728\u8fd9\u4e00\u5e26\u3002"];
    }
    if (place.ancient === "\u6d1b\u9633" || place.ancient === "\u4e3d\u9091") {
      return ["assets/bronze-gui.jpg", "\u6d1b\u9633\u51fa\u571f\u7684\u6625\u79cb\u9752\u94dc\u7c0b\uff0c\u4e0d\u662f\u6c49\u9b4f\u6d1b\u9633\u57ce\u7684\u7167\u7247\u3002"];
    }
    return ["assets/summer-mountains.jpg", "\u5317\u5b8b\u5c48\u9f0e\u300a\u590f\u5c71\u56fe\u300b\u7684\u5c71\u6c34\uff0c\u4e0d\u662f\u8fd9\u5ea7\u57ce\u7684\u7167\u7247\u3002"];
  }

  function strongNum(text) {
    const el = document.createElement("strong");
    el.textContent = text;
    return el;
  }
  function pct(value) {
    const n = value * 100;
    if (n < 0.1) return n.toFixed(2) + "%";
    if (n < 1) return n.toFixed(1) + "%";
    return Math.round(n) + "%";
  }
  function birthMetrics() {
    const period = periodOf(life.birthYear);
    return {
      share: birthShare(period),
      underFive: underFiveRisk(life.birthYear, period),
      e0: life.e0
    };
  }
  function nextDecision(lifeState) {
    if (!lifeState || !lifeState.alive) return null;
    const current = YikouTurns.peek(lifeState, makeDeps());
    if (current) return { age: lifeState.age, title: current.title };
    for (let age = lifeState.age + 1; age < 106; age++) {
      const probe = Object.assign({}, lifeState, { age: age });
      const dec = YikouTurns.peek(probe, makeDeps());
      if (dec) return { age: age, title: dec.title };
    }
    return null;
  }
  function storyPath() {
    if (!life.alive) return "这一生已经写到尽头。";
    if (life.age < 5) return "还在家里长大，下一步先看你会把时间放在哪里。";
    if (life.route === "study") return "你把路押在读书和认字上，下一处会看这条路能不能继续。";
    if (life.route === "craft") return "你把路押在手艺上，下一处会看它能不能换来更稳的日子。";
    if (life.route === "hobby") return "你把路留给喜欢的事，日子未必更宽，但会留下自己的痕迹。";
    if (life.route === "kin") return "你把路留给身边的人，手里的事会慢一点，人情会留下。";
    if (life.route === "road") return "你把路放到了家门外，下一处会看你能不能在别处落脚。";
    if (life.route === "body") return "你把身子放在前面，钱和手里的事会跟着重新排队。";
    if (life.route === "work") return "你把路押在营生上，下一处会看这门活能不能走远。";
    const last = life.rows[life.rows.length - 1];
    const choice = last && last.choiceLabel ? last.choiceLabel : "";
    if (/识字|读|学堂|书|应试|考学|把话说完|翻来覆去|有字/.test(choice)) return "你刚把时间押在认知和读书上，下一处会看这条路能不能继续。";
    if (/手艺|做事|做出来|做深|工|营生/.test(choice)) return "你刚把时间押在一门手艺上，下一处会看它能不能换来更稳的日子。";
    if (/家里|邻里|熟悉|让给|照看|亲属/.test(choice)) return "你刚把时间留给身边的人，手里的事会慢一点，人情会留下。";
    if (/出门|离乡|外走|留下|换个/.test(choice)) return "你刚把路放到了家门外，下一处会看你能不能在别处落脚。";
    if (/治|看|养|扛/.test(choice)) return "你刚把身子放在前面，钱和手里的事会跟着重新排队。";
    if (life.inSchool || /在学|大学|复读|进学/.test(life.edu || "")) return "读书这条线正在打开，家里的活也没有消失。";
    if (life.married && life.jobStarted) return "家里和手里的营生绑在一起，接下来每个选择都有两边的代价。";
    if (life.jobStarted) return "已经靠" + (life.job || "手里的活") + "过日子，下一步会看这条路能不能走远。";
    if (life.place !== life.originPlace) return "已经离开" + life.originPlace.ancient + "，在" + life.place.ancient + "一带重新落脚。";
    const focus = (YikouTurns.FOCI.find((item) => item.id === life.focus) || {}).label;
    return "现在把时间压在" + (focus || "日子") + "上，出身的底子仍在。";
  }
  function trimStory(text, max) {
    const value = String(text || "").replace(/\s+/g, "");
    return value.length > max ? value.slice(0, max) + "……" : value;
  }
  function countMeaningfulRows() {
    return life.rows.filter((row) => row.choiceLabel && row.choiceLabel !== "出生" && row.choiceLabel !== "时间自己走" && row.choiceLabel.indexOf("规划：") !== 0).length;
  }
  function focusStats() {
    const counts = {};
    (life.rows || []).forEach((row) => {
      if (!row || row.age <= 0 || row.choiceLabel === "出生") return;
      if (row.age < 18 || row.annualFocus === "auto" || row.choiceLabel === "时间自己走") return;
      const key = row.annualFocus || row.focus || "balance";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }
  function happiestYear() {
    const rows = (life.rows || []).filter((row) => row.age > 0 && row.meters);
    if (!rows.length) return null;
    return rows.reduce((best, row) => {
      const score = (row.meters.happy || 0) + (row.meters.bond || 0) * 0.35 + (row.meters.health || 0) * 0.2;
      return !best || score > best.score ? { row: row, score: score } : best;
    }, null);
  }
  function lifeYears() {
    const last = life.rows[life.rows.length - 1];
    return last && last.dead ? last.age : life.age;
  }
  function uniquePlaces() {
    const seen = [];
    (life.rows || []).forEach((row) => {
      if (!row.place || seen.some((item) => item.ancient === row.place.ancient)) return;
      seen.push(row.place);
    });
    return seen;
  }
  function historyMoments() {
    const rows = (life.rows || []).filter((row) => row.note && row.age > 0 && row.age < 100 && row.historyKey);
    const marked = [];
    const seen = new Set();
    rows.forEach((row) => {
      if (seen.has(row.historyKey)) return;
      seen.add(row.historyKey);
      marked.push(row);
    });
    return marked.slice(0, 6);
  }
  function endSummary() {
    const born = life.rows[0];
    const last = life.rows[life.rows.length - 1];
    const years = lifeYears();
    const moments = historyMoments();
    const places = uniquePlaces();
    const periodNames = [];
    life.rows.forEach((row) => {
      const name = row.period && row.period.name;
      if (name && periodNames.indexOf(name) < 0) periodNames.push(name);
    });
    const route = [];
    const modelSummary = M.summary(life);
    if (modelSummary.route) route.push((M.ROUTES[modelSummary.route] || [modelSummary.route])[0]);
    if (life.married || life.children) route.push("家庭");
    if (places.length > 1) route.push("迁徙");
    const lastChoice = M.summary(life).highlights[0] || life.rows.slice().reverse().find((row) => row.choiceLabel && row.choiceLabel !== "时间自己走" && row.choiceLabel !== "出生");
    const childList = life.childrenList || [];
    const livingChildren = childList.filter((child) => child.alive).length;
    const happy = happiestYear();
    const focusCounts = focusStats();
    const focusLabels = { work: "营生", balance: "两边都顾", kin: "家里和邻里", body: "养身子", study: "读书", hobby: "喜欢的事", auto: "时间自己走" };
    const mainFocus = Object.keys(focusCounts).sort((a, b) => focusCounts[b] - focusCounts[a])[0];
    const cohabitingYears = life.married && life.marriedAge != null ? Math.max(0, years - life.marriedAge) : 0;
    const endFacts = [
      ["最后的营生", life.job || "没有单独留下的营生"],
      ["教育阶段", M.educationStage(life)],
      ["家庭", life.married ? ((life.spouse ? "与" + life.spouse + "共同生活" : "成过家") + (life.children ? "，有" + life.children + "个孩子" : "")) : "没有成家"],
      ["婚后年数", life.married ? cohabitingYears + "年（按同住模型）" : "没有配偶记录"],
      ["孩子", childList.length ? ("共" + childList.length + "个，" + livingChildren + "个活到结尾") : "没有孩子"],
      ["照护关系", life.spouse ? "有配偶记录，未模拟配偶寿命与送终" : "未逐一模拟"],
      ["最幸福的一年", happy ? yearText(happy.row.year) + " · " + happy.row.age + "岁" : "没有足够记录"],
      ["成年后时间最多放在", mainFocus ? focusLabels[mainFocus] : "把日子过下去"],
      ["真正改变路线的选择", modelSummary.highlights.length ? modelSummary.highlights[0].choiceLabel + "（" + modelSummary.highlights[0].age + "岁）" : "没有记录"],
      ["计划回声", modelSummary.echoes.length ? modelSummary.echoes.length + "次已兑现" : "没有计划回声"],
      ["留下的余钱", YikouTurns.yuan(Math.max(0, Math.round(life.money))) + "点余资"],
      ["最重要的一次选择", lastChoice ? lastChoice.choiceLabel : "时间自己走"]
    ];
    return {
      years: years,
      days: Math.round(years * 365.24),
      born: born,
      last: last,
      moments: moments,
      places: places,
      periodNames: periodNames,
      route: route,
      choices: countMeaningfulRows(),
      livingPeers: (life.peers || []).filter((peer) => peer.alive).length,
      livingChildren: livingChildren,
      childList: childList,
      cohabitingYears: cohabitingYears,
      happy: happy,
      focusCounts: focusCounts,
      endFacts: endFacts,
      highlights: modelSummary.highlights,
      echoes: modelSummary.echoes
    };
  }
  function renderEndSummary() {
    if (!life || life.alive) return;
    const summary = endSummary();
    const stats = byId("endStats");
    if (stats) {
      stats.replaceChildren();
      [
        [summary.years + "岁", "走过的年头"],
        [summary.days.toLocaleString("zh-CN") + "天", "换算成日子"],
        [summary.choices + "次", "真正停下来做过的选择"],
        [summary.livingPeers + "/4", "同一轮还在的人"]
      ].forEach((item) => {
        const card = document.createElement("div");
        card.className = "end-stat";
        const value = document.createElement("strong");
        value.textContent = item[0];
        const label = document.createElement("span");
        label.textContent = item[1];
        card.append(value, label);
        stats.append(card);
      });
    }
    const history = byId("endHistory");
    if (history) {
      history.textContent = summary.periodNames.length
        ? "你走过了" + summary.periodNames.join("、") + "。" + (summary.moments.length ? "这一生遇到过：" + summary.moments.map((row) => yearText(row.year) + "的" + row.note.replace(/。.*$/, "")).join("；") + "。" : "")
        : "这段人生没有留下足够的时代转折记录。";
    }
    const route = byId("endRoute");
    if (route) {
      const routeText = summary.route.length ? summary.route.join("、") : "把日子过下去";
      const childText = summary.childList.length ? "家里一共" + summary.childList.length + "个孩子，其中" + summary.livingChildren + "个活到结尾。" : "没有孩子留下记录。";
      route.textContent = "你把时间主要放在" + routeText + "上。" + (life.spouse ? "和" + life.spouse + "共同生活。" : "") + childText;
    }
    const choicesBox = byId("endChoices");
    const keyChoices = byId("keyChoices");
    const echoesBox = byId("endEchoes");
    if (choicesBox && keyChoices && echoesBox) {
      keyChoices.replaceChildren();
      (summary.highlights || []).slice().sort((a, b) => a.age - b.age).forEach((row) => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = yearText(row.year) + " · " + row.age + "岁：" + (row.choiceLabel || "做了一次选择");
        const detail = document.createElement("span");
        const delta = row.delta && M.deltaText(row.delta) ? "变化：" + M.deltaText(row.delta) : "";
        detail.textContent = delta ? " · " + delta : "";
        li.append(strong, detail);
        keyChoices.append(li);
      });
      echoesBox.replaceChildren();
      (summary.echoes || []).slice(-6).forEach((echo) => {
        const p = document.createElement("p");
        p.className = "end-echo";
        const label = echo.label || "此前的一步";
        const when = echo.resultAge != null ? yearText(M.yearAt(life.birthYear, echo.resultAge)) + " · " : "";
        p.textContent = when + label + "：" + (echo.result || "这一步留下了后续影响。");
        echoesBox.append(p);
      });
      choicesBox.hidden = !keyChoices.childElementCount && !echoesBox.childElementCount;
    }
    const facts = byId("endFacts");
    if (facts) {
      facts.replaceChildren();
      summary.endFacts.forEach((item) => {
        const dt = document.createElement("dt");
        dt.textContent = item[0];
        const dd = document.createElement("dd");
        dd.textContent = item[1];
        facts.append(dt, dd);
      });
    }
    const look = byId("endLook");
    if (look) {
      const gap = summary.years - life.e0;
      const kept = [];
      const lost = [];
      if (life.spouse) kept.push("和" + life.spouse + "的日子");
      if (summary.livingChildren) kept.push(summary.livingChildren + "个还在的孩子");
      if (summary.places.length > 1) kept.push("离开过" + summary.places[0].ancient);
      if (!kept.length) kept.push("把日子过完了");
      if (life.married && !life.spouse) lost.push("家里的人没有逐一模拟到送终");
      (life.peers || []).filter((p) => !p.alive).forEach((p) => lost.push(p.name + "先走了"));
      look.textContent = "这一时代的预期寿命约 " + life.e0 + " 岁（估）。这一生活了 " + summary.years + " 岁，" + (gap >= 0 ? "多" : "少") + Math.abs(gap) + " 年。保住了：" + kept.join("、") + "。失去了：" + (lost.length ? lost.slice(0, 3).join("、") : "没有单独记下的失去") + "。";
    }
    const map = byId("lifeMap");
    if (map) {
      map.replaceChildren();
      (life.rows || []).filter((row) => row.age > 0).forEach((row) => {
        const cell = document.createElement("i");
        const happy = row.meters && row.meters.happy != null ? row.meters.happy : 50;
        cell.dataset.tone = happy >= 70 ? "3" : happy >= 55 ? "2" : happy >= 40 ? "1" : "0";
        cell.title = row.age + "岁 · 幸福 " + Math.round(happy);
        map.append(cell);
      });
    }
    const endPeers = byId("endPeers");
    if (endPeers) {
      endPeers.replaceChildren();
      const you = document.createElement("div");
      you.className = "end-peer";
      const youName = document.createElement("strong");
      youName.textContent = life.name + " · 这一生的你 · " + summary.years + "岁";
      const youBody = document.createElement("span");
      youBody.textContent = (life.job || "没有单独的营生") + " · " + (summary.last && summary.last.cause ? summary.last.cause : "还在");
      you.append(youName, youBody);
      endPeers.append(you);
      (life.peers || []).forEach((p) => {
        const card = document.createElement("div");
        card.className = "end-peer";
        const name = document.createElement("strong");
        name.textContent = p.name + " · " + p.place + " · " + (p.alive ? p.age + "岁还在" : p.age + "岁");
        const body = document.createElement("span");
        body.textContent = (p.job || "还没单独做事") + (p.alive ? "" : " · " + (p.cause || "已故"));
        card.append(name, body);
        endPeers.append(card);
      });
    }
    const placesEl = byId("endPlaces");
    if (placesEl) placesEl.textContent = "你的人生地图：" + summary.places.map((place) => place.ancient + "（" + placeNow(place) + "）").join(" → ") + "。";
    const shareLine = byId("endShareLine");
    if (shareLine) shareLine.textContent = "这不是命运，也不是预言。是出生年代、家庭、时代和几次选择共同留下的一页。";
  }
  function delay() {
    if (fast) return 45;
    const delays = { 1: 4200, 2: 2100, 4: 1050, 8: 525, 12: 350, 16: 260 };
    return delays[speed] || 6000;
  }
  function stopClock() { if (timer) { clearTimeout(timer); timer = null; } }
  function armClock() {
    stopClock();
    if (paused || awaiting || !life || !life.alive) return;
    timer = setTimeout(stepYear, delay());
  }
  function commit(id, keepFast) {
    choices.push(id);
    writeHash();
    awaiting = false;
    const box = byId("decision");
    if (box) box.hidden = true;
    if (!keepFast) fast = false;
    rebuild();
    armClock();
  }
  function showDecision(dec) {
    awaiting = true;
    stopClock();
    const box = byId("decision");
    box.hidden = false;
    byId("decKicker").textContent = dec.kicker || "";
    byId("decTitle").textContent = dec.title || "";
    byId("decBody").textContent = dec.body || "";
    const sourceLink = byId("decSource");
    if (sourceLink) { sourceLink.hidden = !dec.source; sourceLink.textContent = dec.source ? "查看历史背景来源：" + dec.source.label : ""; sourceLink.href = dec.source ? dec.source.url : "#"; }
    const cite = byId("decCite");
    if (cite) {
      cite.hidden = !dec.cite;
      cite.textContent = dec.cite || "";
    }
    const reflect = byId("reflectBox");
    const input = byId("reflectLine");
    if (reflect) reflect.hidden = !dec.reflect;
    if (input) input.value = "";
    const host = byId("decOptions");
    host.replaceChildren();
    dec.options.forEach((opt, index) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = String(index + 1);
      const txt = document.createElement("span");
      txt.className = "txt";
      const lbl = document.createElement("span");
      lbl.className = "lbl";
      lbl.textContent = opt.label;
      const stk = document.createElement("span");
      stk.className = "stk";
      stk.textContent = opt.stake || "";
      txt.append(lbl, stk);
      b.append(num, txt);
      b.addEventListener("click", () => {
        let id = dec.id + "~" + opt.key;
        if (dec.reflect && opt.key === "mark" && input && input.value.trim()) {
          id += "~" + encodeURIComponent(input.value.trim().slice(0, 40));
        }
        fast = false;
        commit(id, false);
      });
      host.append(b);
    });
  }
  function stepYear() {
    if (!life || !life.alive) { stopClock(); return; }
    const dec = YikouTurns.peek(life, makeDeps());
    if (dec) {
      if (autoOn) {
        const picked = YikouTurns.autoOption(dec, life);
        commit(dec.id + "~" + picked.key, true);
        return;
      }
      showDecision(dec);
      render();
      return;
    }
    commit("auto", true);
  }
  function fillCert() {
    const box = byId("cert");
    if (!box) return;
    box.hidden = false;
    const rows = [
      ["年份", yearText(life.birthYear)],
      ["朝代", life.dynasty],
      ["国家", life.country],
      ["出生地", life.place.ancient + "，" + placeNow(life.place)],
      ["姓名", life.name],
      ["性别", life.sex === "男" ? "男" : "女"],
      ["母亲", life.mother.age + "岁 · " + life.mother.job],
      ["父亲", life.father.age + "岁 · " + life.father.job]
    ];
    box.replaceChildren();
    rows.forEach((pair) => {
      const dt = document.createElement("dt");
      dt.textContent = pair[0];
      const dd = document.createElement("dd");
      dd.textContent = pair[1];
      box.append(dt, dd);
    });
    const note = document.createElement("p");
    note.className = "cert-note";
    const reg = "YS-" + String(life.seed).slice(-6);
    note.textContent = "登记号 " + reg + " · 家境第 " + life.wealthRank + " 档。档位按模型抽取，不是收入排名。";
    box.append(note);
  }
  function setRedraw(on) {
    ["redraw", "redrawTop"].forEach((id) => {
      const el = byId(id);
      if (!el) return;
      el.hidden = !on;
      el.disabled = false;
    });
  }
  function renderCover() {
    document.body.dataset.phase = "cover";
    delete document.body.dataset.era;
    const cert = byId("cert");
    if (cert) cert.hidden = true;
    const context = byId("birthContext");
    if (context) context.hidden = true;
    const share = byId("shareBirth");
    if (share) share.hidden = true;
    const title = byId("hero-title");
    title.replaceChildren(document.createTextNode("我生在"), document.createElement("br"), document.createTextNode("哪一年"));
    byId("hero-stand").textContent = "秦到今，抽一次。";
    byId("who").textContent = "秦到现在。地名用故名，并写今天的哪里一带。";
    byId("pin-fact").textContent = "还没抽";
    const rank = byId("eraRank");
    if (rank) {
      const top = PERIODS.map((p) => [p.name, birthShare(p)]).sort((a, b) => b[1] - a[1]).slice(0, 5);
      rank.textContent = "按模型里的出生规模，较容易抽到：" + top.map((item) => item[0] + " " + pct(item[1])).join("、") + "。短时代另有保底。成色是估。";
    }
  document.querySelectorAll("[data-advance]").forEach((btn) => {
      btn.disabled = false;
      btn.textContent = "开始";
      btn.dataset.mode = "draw";
    });
    setRedraw(false);
  }
  function renderCert() {
    document.body.dataset.phase = "cert";
    const born = life.rows[0];
    const title = byId("hero-title");
    title.replaceChildren(document.createTextNode(life.name), document.createElement("br"), document.createTextNode(life.dynasty + " · " + life.country));
    byId("hero-stand").textContent = "我生在" + yearText(life.birthYear) + "，" + life.place.ancient + "，" + placeNow(life.place) + "。这一次是" + life.sex + "的。";
    byId("who").textContent = "母亲" + life.mother.age + "岁，" + life.mother.job + "。父亲" + life.father.age + "岁，" + life.father.job + "。" + (ERA_NOTES[born.period.id] || "");
    document.body.dataset.era = born.period.id;
    byId("pin-fact").textContent = "成色是" + born.period.grade;
    fillCert();
    const metrics = birthMetrics();
    const context = byId("birthContext");
    if (context) context.hidden = false;
    const stats = byId("birthStats");
    if (stats) {
      stats.replaceChildren();
      [
        [pct(metrics.share), "这个时代的出生占比 · 估"],
        [metrics.e0 + "岁", "这时代的平均寿命 · 估"],
        [pct(metrics.underFive), "五岁前离世机率 · 估"]
      ].forEach((item) => {
        const card = document.createElement("div");
        card.className = "birth-stat";
        const value = document.createElement("b");
        value.textContent = item[0];
        const label = document.createElement("span");
        label.textContent = item[1];
        card.append(value, label);
        stats.append(card);
      });
    }
    const compare = byId("birthCompare");
    if (compare) compare.textContent = "你不是单独被抽出来的一个人：同一时代里，还有四个人从别处出生。你们会沿着各自的统计走下去，之后的选择才会把这条线拉开。";
    const birthPeers = byId("birthPeers");
    if (birthPeers) {
      birthPeers.replaceChildren();
      const kicker = document.createElement("p");
      kicker.className = "birth-peers-note";
      kicker.textContent = "同一轮出生的四个人";
      birthPeers.append(kicker);
      (life.peers || []).forEach((peer) => {
        const row = document.createElement("div");
        row.className = "birth-peer";
        const name = document.createElement("span");
        name.textContent = peer.name;
        const where = document.createElement("span");
        where.textContent = peer.place + " · " + (peer.sex === "男" ? "男" : "女");
        row.append(name, where);
        birthPeers.append(row);
      });
    }
    const share = byId("shareBirth");
    if (share) share.hidden = false;
    const card = cardFor(life.place);
    byId("card-place-img").src = card[0];
    byId("card-place-img").alt = card[1];
    byId("card-place-title").textContent = life.place.ancient;
  document.querySelectorAll("[data-advance]").forEach((btn) => {
      btn.disabled = false;
      btn.textContent = "开始这一生";
      btn.dataset.mode = "enter";
    });
    setRedraw(true);
  }
  let drawTimer = null;
  function stopDraw() {
    if (drawTimer) { clearTimeout(drawTimer); drawTimer = null; }
  }
  const SLIPS = [
    ["年份", "year"], ["朝代", "dynasty"], ["国家", "country"], ["出生地", "place"],
    ["姓名", "name"], ["性别", "sex"], ["母亲", "mother"], ["父亲", "father"]
  ];
  function flickerSlip(rng) {
    const period0 = PERIODS[Math.floor(rng() * PERIODS.length)];
    const year = period0.start + Math.floor(rng() * (period0.end - period0.start + 1));
    const period = periodOf(year);
    const places = placesFor(period.id, year);
    const place = places[Math.floor(rng() * places.length)] || life.place;
    const sex = YikouBirth.sexOf(rng, year);
    const profile = YikouBirth.draw(rng, year, period, place, sex);
    return {
      year: yearText(year),
      dynasty: profile.dynasty,
      country: profile.country,
      place: place.ancient + "，" + placeNow(place),
      name: profile.name,
      sex: sex,
      mother: profile.mother.age + "岁 · " + profile.mother.job,
      father: profile.father.age + "岁 · " + profile.father.job
    };
  }
  function finalSlip() {
    return {
      year: yearText(life.birthYear),
      dynasty: life.dynasty,
      country: life.country,
      place: life.place.ancient + "，" + placeNow(life.place),
      name: life.name,
      sex: life.sex === "男" ? "男" : "女",
      mother: life.mother.age + "岁 · " + life.mother.job,
      father: life.father.age + "岁 · " + life.father.job
    };
  }
  function paintSlip(values, locked) {
    document.body.dataset.phase = "draw";
    const cert = byId("cert");
    cert.hidden = false;
    cert.replaceChildren();
    SLIPS.forEach((pair, i) => {
      const dt = document.createElement("dt");
      dt.textContent = pair[0];
      const dd = document.createElement("dd");
      dd.textContent = values[pair[1]];
      dd.className = i < locked ? "is-set" : i === locked ? "is-hot" : "is-spin";
      cert.append(dt, dd);
    });
    const title = byId("hero-title");
    const hot = SLIPS[Math.min(locked, SLIPS.length - 1)];
    title.replaceChildren(document.createTextNode(locked >= SLIPS.length ? "抽定了" : hot[0]), document.createElement("br"), document.createTextNode(values[hot[1]]));
    byId("hero-stand").textContent = locked >= SLIPS.length ? "这一生落下来了。" : "先转一轮，再一门一门落下。";
    byId("who").textContent = "按出生人数往下抽。1949年之后压低一些，短时代另有保底。";
  document.querySelectorAll("[data-advance]").forEach((btn) => {
      btn.disabled = true;
      btn.textContent = "抽取中";
      btn.dataset.mode = "drawing";
    });
  }
  function runDraw() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      phase = "cert";
      renderCert();
      return;
    }
    const rng = mulberry32((seed ^ 0x5a17) >>> 0);
    const finalV = finalSlip();
    let frame = 0;
    let locked = 0;
    const spinFrames = 16;
    const lockEvery = 5;
    const tick = () => {
      frame += 1;
      if (frame > spinFrames) locked = Math.min(SLIPS.length, Math.floor((frame - spinFrames) / lockEvery));
      if (locked >= SLIPS.length) {
        paintSlip(finalV, SLIPS.length);
        drawTimer = setTimeout(() => {
          drawTimer = null;
          phase = "cert";
          renderCert();
        }, 480);
        return;
      }
      const values = flickerSlip(rng);
      for (let i = 0; i < locked; i++) values[SLIPS[i][1]] = finalV[SLIPS[i][1]];
      paintSlip(values, locked);
      drawTimer = setTimeout(tick, locked === 0 ? 58 : 72);
    };
    paintSlip(flickerSlip(rng), 0);
    drawTimer = setTimeout(tick, 58);
  }
  function beginDraw() {
    stopClock();
    stopDraw();
    seed = Math.floor(Math.random() * 1e9) + 1;
    choices = [];
    phase = "draw";
    paused = true;
    awaiting = false;
    fast = false;
    const box = byId("decision");
    if (box) box.hidden = true;
    writeHash();
    life = createLife(seed, choices);
    window.scrollTo({ top: 0, behavior: "auto" });
    setRedraw(false);
    runDraw();
  }
  function paintChrome() {
    const meters = byId("meters");
    if (meters) {
      meters.replaceChildren();
      [["健康", life.health], ["幸福", life.happy], ["知识", life.learning], ["人际", life.bond]].forEach((pair) => {
        const row = document.createElement("div");
        row.className = "meter";
        const name = document.createElement("span");
        name.textContent = pair[0];
        const bar = document.createElement("i");
        const fill = document.createElement("b");
        fill.style.width = Math.max(0, Math.min(100, pair[1] || 0)) + "%";
        bar.append(fill);
        const num = document.createElement("span");
        num.textContent = String(Math.round(pair[1] || 0));
        row.append(name, bar, num);
        meters.append(row);
      });
    }
    const money = byId("moneyLine");
    if (money) {
      const main = document.createElement("span");
      const tight = life.money < 200 ? "很紧" : life.money < 800 ? "紧" : "还过得去";
      if (life.age < 16) main.textContent = "家里的日子" + tight;
      else main.textContent = "日子" + tight + " · 一年进项大约 " + YikouTurns.yuan(life.income);
      const fine = document.createElement("span");
      fine.className = "fine";
      fine.textContent = " 余资是玩法里的点数，不是工资。";
      money.replaceChildren(main, fine);
    }
    const progressFill = byId("lifeProgressFill");
    const progressText = byId("lifeProgressText");
    if (progressFill || progressText) {
      const shownAge = life.alive ? life.age : lifeYears();
      const progress = Math.max(0, Math.min(100, (shownAge / 90) * 100));
      if (progressFill) progressFill.style.width = progress.toFixed(1) + "%";
      if (progressText) progressText.textContent = life.alive ? (life.age + "岁 · " + yearText(M.yearAt(life.birthYear, life.age))) : ("写到" + shownAge + "岁");
    }
    const status = byId("statusLine");
    if (status) {
      const bits = [life.stratum, M.educationStage(life), life.job, life.married ? ("已成家" + (life.spouse ? " · " + life.spouse : "")) : "还没成家"];
      if (life.children) bits.push("孩子" + life.children);
      if (life.rank) bits.push(life.rank);
      status.textContent = bits.filter(Boolean).join(" · ");
    }
      const story = byId("lifeStory");
    if (story) {
      story.hidden = awaiting;
      const arc = byId("arcLine");
      if (arc) arc.textContent = storyPath();
      const impact = byId("impactLine");
      const lastRow = life.rows[life.rows.length - 1];
      const meaningful = lastRow && lastRow.choiceLabel && lastRow.choiceLabel !== "时间自己走" && lastRow.choiceLabel !== "出生";
      const routeLine = byId("routeLine");
      if (routeLine) {
        const route = M.routeOf(life);
        const label = M.ROUTES[route] ? M.ROUTES[route][0] : "把日子过下去";
        routeLine.textContent = label + "。" + (M.ROUTES[route] ? M.ROUTES[route][1] : "");
      }
      if (impact) {
        impact.hidden = !meaningful;
        impact.textContent = meaningful ? "刚才你选了“" + lastRow.choiceLabel + "”：" + trimStory(lastRow.note, 54) : "";
      }
      const next = byId("nextStop");
      if (next) {
        const upcoming = nextDecision(life);
        next.textContent = upcoming
          ? (upcoming.age === life.age ? "现在停在这里：" : "下一次停在" + upcoming.age + "岁：") + upcoming.title
          : "后面的路暂时没有要停下来的地方。";
      }
    }
    const family = byId("familyBox");
    if (family) {
      family.replaceChildren();
      const title = document.createElement("p");
      title.className = "peers-note";
      title.textContent = "家里";
      family.append(title);
      const home = document.createElement("p");
      home.className = "family-line";
      home.textContent = life.place.ancient + " · " + life.stratum + (life.spouse ? " · 与" + life.spouse + "同住" : " · 还没成家");
      family.append(home);
      const parents = document.createElement("p");
      parents.className = "family-line";
      parents.textContent = "母亲" + life.mother.job + " · 父亲" + life.father.job;
      family.append(parents);
      (life.childrenList || []).forEach((child) => {
        const line = document.createElement("p");
        line.className = "family-line" + (child.alive ? "" : " peer-line is-gone");
        line.textContent = child.name + " · " + (child.alive ? child.age + "岁" : (child.age + "岁已故"));
        family.append(line);
      });
    }
    const peers = byId("peers");
    if (peers) {
      peers.replaceChildren();
      const kicker = document.createElement("p");
      kicker.className = "peers-note";
      kicker.textContent = "同一年出生的另外四个人";
      peers.append(kicker);
      (life.peers || []).forEach((p) => {
        const line = document.createElement("p");
        line.className = "peer-line" + (p.alive ? "" : " is-gone");
        line.textContent = p.alive
          ? (p.name + " · " + p.place + " · " + p.age + "岁 · " + p.job)
          : (p.name + " · " + p.place + " · " + (p.age <= 0 ? "没过开头" : p.age + "岁已故 · " + (p.cause || "")));
        peers.append(line);
      });
    }
    const focusNote = byId("focusNote");
    if (focusNote) focusNote.hidden = awaiting;
    const focus = byId("focusRow");
    if (focus) {
      focus.replaceChildren();
      focus.hidden = awaiting;
      if (life.alive && !awaiting) {
        YikouTurns.FOCI.forEach((item) => {
          const b = document.createElement("button");
          b.type = "button";
          b.classList.toggle("is-on", life.focus === item.id);
          const strong = document.createElement("span");
          strong.textContent = item.label;
          const small = document.createElement("small");
          small.textContent = item.stake;
          b.append(strong, small);
          b.addEventListener("click", () => {
            if (!life || life.focus === item.id) return;
            choices.push("focus:" + item.id);
            writeHash();
            const pending = awaiting;
            rebuild();
            if (pending) {
              const dec = YikouTurns.peek(life, makeDeps());
              if (dec) showDecision(dec);
            }
          });
          focus.append(b);
        });
      }
    }
    const planBtn = byId("planBtn");
    if (planBtn) {
      planBtn.hidden = !life.alive;
      planBtn.disabled = false;
      const currentPlan = (life.plans || []).find((item) => item.age === life.age && !item.done);
      planBtn.textContent = currentPlan ? "查看本年计划" : "给未来留一步";
      planBtn.setAttribute("aria-label", currentPlan ? "查看本年已经留下的计划" : "为未来留下一个计划");
    }
    const planningTools = byId("planningTools");
    if (planningTools) planningTools.hidden = !life.alive;
    const planState = byId("planState");
    if (planState) {
      const pending = (life.plans || []).filter((item) => !item.done);
      planState.textContent = pending.length
        ? "在等兑现：" + pending.map((item) => item.label + "（" + (item.payAt - life.age) + "年后）").join("、")
        : "还没有给未来留下一步安排。";
    }
    const autoBtn = byId("autoBtn");
    if (autoBtn) autoBtn.classList.toggle("is-on", autoOn);
    const titleLife = byId("life-title");
    if (titleLife && document.body.dataset.phase === "play") {
      titleLife.replaceChildren();
      const soft = document.createElement("span");
      soft.className = "soft";
      soft.textContent = life.alive ? "今年的重心" : "这一生";
      titleLife.append(soft, document.createTextNode(life.alive ? "随时可以改" : "写完了"));
    }
    const runbar = byId("runbar");
    const runbarNote = byId("runbarNote");
    if (runbar) runbar.classList.toggle("is-over", !life.alive);
    if (runbarNote) runbarNote.hidden = life.alive;
  }


  function render() {
    if (phase === "cover" || !life) { renderCover(); return; }
    if (phase === "cert") { renderCert(); return; }
    document.body.dataset.phase = "play";
    const certBox = byId("cert");
    if (certBox) certBox.hidden = true;
    const birthContext = byId("birthContext");
    if (birthContext) birthContext.hidden = true;
    const shareBirth = byId("shareBirth");
    if (shareBirth) shareBirth.hidden = true;
    const born = life.rows[0];
    const last = life.rows[life.rows.length - 1];
    const title = byId("hero-title");
    title.replaceChildren(document.createTextNode("生在" + born.place.ancient), document.createElement("br"), document.createTextNode("过完这一生"));
    const state = born.place.state ? "，属" + born.place.state : "";
    byId("hero-stand").textContent = "从秦朝走到现在。出身不能自己选。时间会自己往前走，遇到要你定的事才停。你人在" + born.place.ancient + state + "，" + placeNow(born.place) + "。";
    byId("pin-fact").textContent = "成色是" + born.period.grade;
    byId("who").textContent = life.age + "岁，" + life.sex + "，" + life.stratum + "，" + born.period.name + (life.rank ? "，" + life.rank : "") + (life.married ? "，已成家" : "");
    const nowAge = life.alive ? life.age : Math.max(0, life.age - 1);
    const nowPeriod = periodOf(M.yearAt(life.birthYear, nowAge));
    document.body.dataset.era = nowPeriod ? nowPeriod.id : "";
    byId("life-now").textContent = life.alive ? (life.age + "岁 · " + yearText(M.yearAt(life.birthYear, life.age)) + " · " + life.place.ancient + "，" + placeNow(life.place)) : ("这一生写完了。" + (last && last.cause ? "死于" + last.cause + "。" : ""));
    const eraNote = byId("eraNote");
    if (eraNote) eraNote.textContent = nowPeriod && ERA_NOTES[nowPeriod.id] ? nowPeriod.name + "：" + ERA_NOTES[nowPeriod.id] : "";
    paintChrome();
    const card = cardFor(last.place);
    byId("card-place-img").src = card[0];
    byId("card-place-img").alt = card[1];
    byId("card-place-title").textContent = last.place.ancient;
    document.querySelectorAll("[data-advance]").forEach((btn) => {
      if (!life.alive) { btn.textContent = "换一生"; btn.dataset.mode = "again"; }
      else if (paused && life.rows.length > 1) { btn.textContent = "接着过"; btn.dataset.mode = "start"; }
      else if (paused) { btn.textContent = "开始这一生"; btn.dataset.mode = "start"; }
      else { btn.textContent = "快转到下一个抉择"; btn.dataset.mode = "ff"; }
    });
    document.querySelectorAll("[data-speed]").forEach((btn) => btn.classList.toggle("is-on", Number(btn.dataset.speed) === speed && !fast));
    const pauseBtn = byId("pauseBtn");
    if (pauseBtn) { pauseBtn.textContent = paused ? "已暂停" : "暂停"; pauseBtn.disabled = paused; }
    const end = byId("endcard");
    if (end) {
      end.hidden = !!life.alive;
      const shareLife = byId("shareLife");
      if (shareLife) shareLife.hidden = !!life.alive;
      if (!life.alive) {
        const diedAge = last && last.dead ? last.age : life.age;
        const endTitle = byId("endTitle");
        const endBody = byId("endBody");
        const endFine = byId("endFine");
        if (endTitle) endTitle.textContent = "我生在" + yearText(life.birthYear) + "，" + born.place.ancient;
        const bits = ["活了" + diedAge + "岁", M.educationStage(life), life.job];
        if (life.married) bits.push(life.spouse ? "和" + life.spouse + "成过家" : "成过家");
        if (life.children) bits.push(life.children + "个孩子");
        if (last && last.cause) bits.push("死于" + last.cause);
        if (endBody) endBody.textContent = bits.filter(Boolean).join("，") + "。";
        if (endFine) endFine.textContent = placeNow(born.place) + "。出身是" + life.stratum + "。这是模型，不是户籍。";
        renderEndSummary();
      }
    }
    const bands = byId("bands");
    bands.replaceChildren();
    life.rows.slice().reverse().forEach((row) => {
      const el = document.createElement("article");
      el.className = "band" + (row.dead ? " is-dead" : "") + (row.historyKey ? " is-era" : "");
      el.id = "y" + String(row.year).replace("-", "b");
      const time = document.createElement("p");
      time.className = "when";
      time.textContent = row.age + "岁 · " + yearText(row.year);
      const mid = document.createElement("div");
      const note = document.createElement("p");
      note.className = "what";
      note.textContent = row.note || rowNote(row);
      mid.append(note);
      if (row.delta && M.deltaText(row.delta)) {
        const delta = document.createElement("p");
        delta.className = "delta-line";
        delta.textContent = "变化：" + M.deltaText(row.delta);
        mid.append(delta);
      }
      if (row.cite) {
        const cite = document.createElement("p");
        cite.className = "cite";
        cite.textContent = row.cite;
        mid.append(cite);
      }
      const where = document.createElement("p");
      where.className = "where";
      const ancient = document.createElement("span");
      ancient.className = "ancient";
      ancient.textContent = row.place.ancient + (row.place.state ? " · " + row.place.state : "");
      const modern = document.createElement("span");
      modern.textContent = placeNow(row.place);
      where.append(ancient, modern);
      el.append(time, mid, where);
      bands.append(el);
    });
    const tabs = byId("tabs");
    if (tabs) tabs.replaceChildren();
    const stats = byId("stats-copy");
    const line1 = document.createElement("span");
    const line2 = document.createElement("span");
    const ageShown = String(last.dead ? last.age : life.age);
    line1.append(document.createTextNode(life.birthYear < 0 ? "前" : "公元"), strongNum(String(Math.abs(life.birthYear))), document.createTextNode("\u00a0年，" + (last.dead ? "死于" : "已经")), strongNum(ageShown), document.createTextNode("\u00a0岁"));
    line2.append(document.createTextNode("预期"), strongNum(String(life.e0)), document.createTextNode("\u00a0岁，成色"), strongNum(born.period.grade));
    stats.replaceChildren(line1, line2);
    const share = byId("sg-share");
    if (share) share.textContent = (Math.round(sanguoShare() * 1000) / 10) + "%";
    const foot = byId("foot-places");
    foot.replaceChildren();
    const seen = new Set();
    life.rows.forEach((row) => {
      if (seen.has(row.place.ancient)) return;
      seen.add(row.place.ancient);
      const a = document.createElement("a");
      a.href = "#places";
      a.textContent = row.place.ancient;
      foot.append(a);
    });
  }
  function rebuild() { life = createLife(seed, choices); render(); }
  function reroll() {
    stopClock();
    seed = 0;
    choices = [];
    phase = "cover";
    paused = true;
    awaiting = false;
    fast = false;
    const box = byId("decision");
    if (box) box.hidden = true;
    stopDraw();
    writeHash();
    life = null;
    renderCover();
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  ["redraw", "redrawTop"].forEach((id) => {
    const el = byId(id);
    if (!el) return;
    el.addEventListener("click", () => {
      if (phase === "draw") return;
      beginDraw();
    });
  });
  document.querySelectorAll("[data-advance]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (phase === "draw") return;
      if (btn.dataset.mode === "draw" || phase === "cover") { beginDraw(); return; }
      if (btn.dataset.mode === "enter" || phase === "cert") { phase = "play"; paused = true; stopClock(); render(); return; }
      if (!life || !life.alive || btn.dataset.mode === "again") { reroll(); return; }
      if (paused) { paused = false; fast = false; render(); armClock(); document.getElementById("life").scrollIntoView({ behavior: "smooth" }); return; }
      fast = true;
      paused = false;
      render();
      armClock();
    });
  });
  const pauseBtn = byId("pauseBtn");
  if (pauseBtn) pauseBtn.addEventListener("click", () => { paused = !paused; fast = false; render(); if (!paused && !awaiting) armClock(); else stopClock(); });
  const autoBtn = byId("autoBtn");
  if (autoBtn) autoBtn.addEventListener("click", () => {
    autoOn = !autoOn;
    autoBtn.classList.toggle("is-on", autoOn);
    if (autoOn && awaiting && life && life.alive) {
      const dec = YikouTurns.peek(life, makeDeps());
      if (dec) commit(dec.id + "~" + YikouTurns.autoOption(dec, life).key, true);
    } else if (!paused && !awaiting) armClock();
  });
  const planBtn = byId("planBtn");
  const planDialog = byId("planning");
  const planOptions = byId("planOptions");
  const planClose = byId("planClose");
  function closePlanning() {
    if (planDialog) planDialog.hidden = true;
    if (life && life.alive && !planningWasPaused && !awaiting) {
      paused = false;
      render();
      armClock();
    }
  }
    function appendPlanReceipt(plan) {
      const item = document.createElement("div");
      item.className = "plan-choice plan-receipt";
      const title = document.createElement("strong");
      title.textContent = plan.label;
      const now = document.createElement("span");
      now.textContent = "已留下：" + (plan.cost ? "投入约" + YikouTurns.yuan(plan.cost) + "点余资" : "投入时间与照料");
      const future = document.createElement("small");
      future.textContent = plan.done ? ("已在" + plan.resultAge + "岁兑现：" + (plan.result || "留下了影响。")) : ("兑现时间：" + plan.payAt + "岁 · 还要等" + Math.max(0, plan.payAt - life.age) + "年");
      item.append(title, now, future);
      planOptions.append(item);
    }
    function showPlanning() {
    if (!life || !life.alive || !planDialog || !planOptions) return;
    planningWasPaused = paused;
    paused = true;
    stopClock();
    render();
      if (life.planYear === life.age) {
      const note = byId("planLead");
        if (note) note.textContent = "这一年已经留下一步。这里可以查看它的代价、兑现时间和还在等待的回声。";
      planOptions.replaceChildren();
        (life.plans || []).filter((plan) => plan.age === life.age).forEach(appendPlanReceipt);
      planDialog.hidden = false;
      return;
    }
    const options = YikouTurns.planningOptions(life, makeDeps());
    planOptions.replaceChildren();
    const note = byId("planLead");
    if (!options.length) {
      if (note) note.textContent = life.age < 6 ? "还没到能自己安排的年纪。六岁之后，才能把钱和时间留给以后。" : "这一年没有可以留下的新安排。";
      planDialog.hidden = false;
      return;
    }
      if (note) note.textContent = "时间已暂停。先看见代价，再决定把钱、时间和机会留给哪一边。两年后，这一步会回来找你。";
    options.forEach((plan) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "plan-choice";
      b.disabled = plan.locked || !plan.available;
      const title = document.createElement("strong");
      title.textContent = plan.label;
      const now = document.createElement("span");
      now.textContent = plan.cost ? "现在：" + plan.now + " · 约" + YikouTurns.yuan(plan.cost) + "点余资" : "现在：" + plan.now;
      const future = document.createElement("small");
      future.textContent = "两年后：" + plan.future + (plan.chance < 1 ? " · 机会不是保证" : "");
      if (!plan.available) {
        const unavailable = document.createElement("small");
        unavailable.className = "plan-unavailable";
        unavailable.textContent = "钱不够 · 现在约有" + YikouTurns.yuan(life.money) + "点余资";
        b.append(unavailable);
      }
      b.append(title, now, future);
      b.addEventListener("click", () => {
        if (YikouTurns.applyPlan(life, plan.key, makeDeps())) {
          choices.push("plan:" + plan.key);
          writeHash();
          closePlanning();
          rebuild();
          if (life && life.alive && !planningWasPaused && !awaiting) {
            paused = false;
            render();
            armClock();
          }
        }
      });
      planOptions.append(b);
    });
    planDialog.hidden = false;
  }
  if (planBtn) planBtn.addEventListener("click", showPlanning);
  if (planClose) planClose.addEventListener("click", closePlanning);
  document.querySelectorAll("[data-speed]").forEach((btn) => {
    btn.addEventListener("click", () => { speed = Number(btn.dataset.speed); fast = false; if (paused) paused = false; render(); armClock(); });
  });
  const again = byId("again");
  if (again) again.addEventListener("click", (event) => { event.preventDefault(); reroll(); });
  const againLife = byId("againLife");
  if (againLife) againLife.addEventListener("click", () => reroll());
  const shareBirth = byId("shareBirth");
  if (shareBirth) shareBirth.addEventListener("click", async () => {
    if (!life) return;
    const text = "我生在" + yearText(life.birthYear) + "，" + life.place.ancient + "（" + placeNow(life.place) + "）。“我生在”人生模拟中的出生记录：" + life.name + "，" + life.sex + "，" + life.dynasty + " · " + life.country + "。";
    try {
      if (navigator.share) await navigator.share({ title: "我生在 · 出生卡", text: text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
      shareBirth.textContent = navigator.share ? "已分享" : "已复制出生卡";
      setTimeout(() => { shareBirth.textContent = "分享出生卡"; }, 1800);
    } catch (e) {
      shareBirth.textContent = "可以截图分享";
      setTimeout(() => { shareBirth.textContent = "分享出生卡"; }, 1800);
    }
  });
  const shareLife = byId("shareLife");
  if (shareLife) shareLife.addEventListener("click", async () => {
    if (!life || life.alive) return;
    const born = life.rows[0];
    const last = life.rows[life.rows.length - 1];
    const diedAge = last && last.dead ? last.age : life.age;
    const summary = endSummary();
    const route = summary.route.length ? summary.route.join("、") : "把日子过下去";
    const eras = summary.periodNames.length ? summary.periodNames.join("、") : "这段年月";
    const places = summary.places.map((place) => place.ancient + "（" + placeNow(place) + "）").join("、");
    const childText = summary.childList.length ? "有" + summary.childList.length + "个孩子，其中" + summary.livingChildren + "个活到结尾，" : "";
    const text = "我生在" + yearText(life.birthYear) + "，" + born.place.ancient + "（" + placeNow(born.place) + "）。" + life.name + "，" + life.sex + "，活了" + diedAge + "岁，走过" + eras + "，把时间放在" + route + "上，" + (places ? "去过" + places + "，" : "") + childText + "死于" + (last && last.cause ? last.cause : "衰老") + "。这是“我生在”的一次模拟人生。";
    try {
      if (navigator.share) await navigator.share({ title: "我生在 · 这一生", text: text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
      shareLife.textContent = navigator.share ? "已分享" : "已复制人生摘要";
      setTimeout(() => { shareLife.textContent = "分享这一生"; }, 1800);
    } catch (e) {
      shareLife.textContent = "可以截图分享";
      setTimeout(() => { shareLife.textContent = "分享这一生"; }, 1800);
    }
  });

  const frames = Array.from(document.querySelectorAll(".hero-media img"));
  let frame = 0;
  if (frames.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      if (document.hidden) return;
      frames[frame].classList.remove("is-on");
      frame = (frame + 1) % frames.length;
      frames[frame].classList.add("is-on");
    }, 6800);
  }
  readHash();
  if (phase === "cover") renderCover();
  else rebuild();
})();
















(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.YikouTurns = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const M = typeof module !== "undefined" && module.exports ? require("./model.js") : globalThis.YikouModel;
  const IDS = ["home", "study", "craft", "kin", "body", "leave", "exam", "marry", "wait", "doctor", "endure", "flee", "hold", "serve", "hide", "temperA", "temperB", "temperC", "hobbyA", "hobbyB", "hobbyC", "reflect", "reflectMark", "schoolGo", "auto"];
  const FOCI = [
    { id: "work", label: "埋头做事", stake: "进项↑ 健康·人际↓" },
    { id: "balance", label: "两边都顾", stake: "每样动一点" },
    { id: "kin", label: "家里和邻里", stake: "人际↑ 幸福↑" },
    { id: "body", label: "养身子", stake: "健康↑ 余钱略↓" },
    { id: "study", label: "认字读书", stake: "知识↑ 进项先慢" },
    { id: "hobby", label: "做喜欢的事", stake: "幸福↑ 手艺↑" }
  ];
  const SURNAMES = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗", "郑", "梁", "宋", "唐", "许", "邓", "冯", "韩", "曹", "彭"];
  const MALE = ["安", "德", "文", "武", "远", "昌", "宁", "康", "毅", "明", "华", "强", "军", "正", "清", "寿"];
  const FEMALE = ["兰", "惠", "玉", "云", "英", "芳", "敏", "静", "秀", "珍", "贞", "淑", "月", "凤", "巧"];
  const scenes = [];

  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function yuan(n) {
    const v = Math.round(n);
    const sign = v < 0 ? "-" : "";
    return sign + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function addScene(scene) { scenes.push(scene); scenes.sort((a,b) => (b.priority || 0) - (a.priority || 0)); }
  function where(life) {
    const p = life.place;
    const modern = p.ancient === "武昌" && p.state === "吴" ? "今湖北鄂州一带，不是今天武汉的武昌" : p.modern;
    return p.ancient + "，" + modern;
  }
  function isWar(period, year) {
    if (!period) return false;
    if (period.id === "sanguo" || period.id === "chuhan" || period.id === "wudai") return true;
    if (year >= 1937 && year <= 1945) return true;
    if (year >= 1851 && year <= 1864) return true;
    return false;
  }
  function isFamine(year) { return year >= 1959 && year <= 1961; }
  function examEra(period, year) {
    if (!period) return false;
    if (["sui", "tang", "song", "songnan", "ming"].indexOf(period.id) >= 0) return true;
    return period.id === "qing" && year < 1905;
  }
  function baseIncome(year, stratum) {
    let v = 900;
    if (year >= 2020) v = 52000;
    else if (year >= 2000) v = 22000;
    else if (year >= 1990) v = 9000;
    else if (year >= 1980) v = 4200;
    else if (year >= 1949) v = 2000;
    else if (year >= 1912) v = 1400;
    else if (year >= 1368) v = 1100;
    else v = 800;
    const s = stratum || "";
    const boost = /吏|士|干部|城镇/.test(s) ? 1.85 : /匠|工|个体|商|军户/.test(s) ? 1.28 : /刑徒|佃|雇|戍|兵/.test(s) ? 0.78 : 0.92;
    return v * boost;
  }
  function personName(rng, sex, year) {
    const sur = SURNAMES[Math.floor(rng() * SURNAMES.length)];
    const pool = sex === "男" ? MALE : FEMALE;
    const a = pool[Math.floor(rng() * pool.length)];
    if (year < 900 || rng() < 0.62) return sur + a;
    let b = pool[Math.floor(rng() * pool.length)];
    if (b === a) b = pool[(pool.indexOf(a) + 3) % pool.length];
    return sur + a + b;
  }
  function helpFor(cause, year) {
    if (cause === "自尽") return "角色死因按模型归类，不等于玩家本人。如果你很难受，可以拨打心理援助热线 12356，紧急时拨打 120 或 110。";
    if (year >= 1990 && (cause === "慢性病" || cause === "急症")) return "这是模型里的死因大类，不是诊断。身体不舒服请尽快就医。";
    return "";
  }
  function tryMove(life, rng, deps, year, chance) {
    if (rng() > chance) return null;
    const per = deps.periodOf(year);
    const options = deps.placesFor(per.id, year).filter((p) => p.ancient !== life.place.ancient);
    if (!options.length) return null;
    const from = life.place;
    life.place = deps.pick(rng, options, (p) => p.weight);
    return from;
  }
  function pushRow(life, row) {
    life.rows.push(row);
    if (row.dead) life.alive = false;
    else life.age += 1;
  }
  function tickFocus(life) {
    if (life.age < 6) return;
    const f = life.focus, w = M.world(life);
    life.focusStreak = life.previousFocus === f ? (life.focusStreak || 0) + 1 : 1;
    life.previousFocus = f;
    const gain = (key, n) => { life[key] = clamp(life[key] + Math.max(1, Math.round(n * (1 - life[key] / 135) * (life.focusStreak > 5 ? .7 : 1)))); };
    // State returns toward a baseline: balanced play cannot make every meter saturate.
    life.happy = clamp(life.happy + Math.round((55 - life.happy) * .06));
    life.bond = clamp(life.bond + Math.round((48 - life.bond) * .04));
    life.health = clamp(life.health - (life.age > 60 ? 2 : life.age > 40 ? 1 : 0));
    if (f === "work") { gain("skill",3); life.health=clamp(life.health-2); life.bond=clamp(life.bond-1); }
    if (f === "balance") { if(life.health<65) gain("health",1); if(life.bond<65) gain("bond",1); }
    if (f === "kin") { gain("bond",4); gain("happy",2); }
    if (f === "body") { gain("health",5); gain("happy",1); }
    if (f === "study") { if(life.inSchool || life.literate || life.learning<24) gain("learning", (life.inSchool ? 4 : 2)*w.study); life.happy=clamp(life.happy-1); }
    if (f === "hobby") { gain("happy",4); gain("skill",2); }
    if (life.inSchool && f !== "study") gain("learning", 2*w.study);
    if(life.learning >= 36) life.literate=true;
  }

  function tickEconomy(life, year, rng) {
    if (life.age < 16) {
      life.income = 0;
      life.money += Math.round((rng() - 0.48) * 30);
      return;
    }
    let inc = baseIncome(year, life.stratum) * (0.42 + life.wealthRank / 95) * (life.jobMul || 1);
    if (life.focus === "work") inc *= 1.12;
    if (life.focus === "study") inc *= 0.9;
    if (life.focus === "kin" || life.focus === "hobby") inc *= 0.95;
    if (life.volatile) inc *= rng() < 0.5 ? 1.45 : 0.62;
    inc *= M.world(life).income;
    if (!life.jobStarted) inc *= life.inSchool ? .3 : .6;
    inc = Math.round(inc);
    const burn = Math.round(inc * (0.78 + Math.min(0.28, (life.childrenList || []).filter(c => c.alive && c.age < 18).length * 0.07)));
    const extra = life.focus === "body" ? Math.round(inc * 0.05) : 0;
    life.income = inc;
    life.money += inc - burn - extra;
  }
  function planCost(life, ratio, floor) {
    const reference = Math.max(80, life.income || Math.round(baseIncome(M.yearAt(life.birthYear, life.age), life.stratum) * 0.24));
    return Math.max(floor || 30, Math.round(reference * ratio));
  }
  function makePlan(life, key, label, cost, now, future, kind, chance) {
    return {
      key: key, label: label, cost: cost, now: now, future: future, kind: kind,
      chance: chance == null ? 1 : chance, available: cost <= 0 || life.money >= cost
    };
  }
  function planningOptions(life, deps) {
    if (!life || !life.alive || life.age < 6) return [];
    const year = M.yearAt(life.birthYear, life.age);
    const oldWorld = year < 1949;
    const late = year >= 1990;
    const plans = [];
    if (life.age < 12) {
      plans.push(makePlan(life, "family", "把时间留给家里", 0, "家人会更依赖你", "两年后，人情会留下，读书会慢一点", "family"));
      plans.push(makePlan(life, "health", "先把身子养好", planCost(life, 0.22, 40), "看病或买药，余钱先紧", "两年后，健康更有底子", "health"));
      plans.push(makePlan(life, "school", "把钱用在认字上", planCost(life, 0.3, 60), "学堂、纸笔或请人教你", "两年后，认字的机会可能变多", "school", 0.72));
    } else if (life.age < 18) {
      plans.push(makePlan(life, "school", "把钱用在读书上", planCost(life, 0.32, 80), "读书会占掉帮家里的时间", "两年后，知识可能变成一条更窄但更远的路", "school", 0.74));
      plans.push(makePlan(life, "craft", oldWorld ? "跟一位匠人学手艺" : "学一项能吃饭的手艺", planCost(life, 0.24, 60), "先花在工具、拜师或练习上", "两年后，手艺可能换来更稳的活", "craft", 0.82));
      plans.push(makePlan(life, "health", "先把身子养好", planCost(life, 0.2, 50), "看病、买药或少做一阵重活", "两年后，少一点病会让路更长", "health"));
    } else if (life.age < 31) {
      plans.push(makePlan(life, "craft", late ? "学一项新技能" : "把手艺做深", planCost(life, 0.26, 100), "工具、师傅或一段没有进项的时间", "两年后，手里的活可能更值钱", "craft", 0.84));
      plans.push(makePlan(life, "study", late ? "继续读书或考证" : (examEra(deps.periodOf(year), year) ? (examEra(deps.periodOf(year), year) ? "为一次考试留时间" : "找识字的人继续学") : "找识字的人继续学"), planCost(life, 0.34, 120), "眼前少挣一些，换一条可能的路", "两年后，知识可能打开新的营生", "study", 0.62));
      plans.push(makePlan(life, "move", late ? "为搬到另一座城攒一笔" : "为出门谋生留盘缠", planCost(life, 0.38, 140), "钱先不动，人也要离开熟人圈", "两年后，可能在别处重新落脚", "move", oldWorld ? 0.48 : 0.68));
      plans.push(makePlan(life, "health", "把健康放在前面", planCost(life, 0.18, 80), "看病、休息或改善吃食", "两年后，少一点病会让营生更稳", "health"));
    } else if (life.age < 56) {
      plans.push(makePlan(life, "business", late ? "给营生添一把力" : "添置工具，把营生做大", planCost(life, 0.42, 160), "先花在工具、货物或一间更像样的屋子上", "两年后，进项可能更高，起伏也会更大", "business", 0.7));
      plans.push(makePlan(life, "family", life.children ? "把钱和时间留给孩子" : "把钱和时间留给家里", planCost(life, 0.28, 100), "眼前少一点余钱，家里有人被照看", "两年后，家人的关系可能更稳", "family"));
      plans.push(makePlan(life, "health", "给自己留一笔看病钱", planCost(life, 0.22, 100), "余钱先锁住，不能随手花掉", "两年后，病来时不必立刻卖掉手里的东西", "reserve"));
      plans.push(makePlan(life, "move", late ? "为换个地方生活做准备" : "为家里换个更稳的地方", planCost(life, 0.36, 140), "先攒钱，也要承担离开熟人的代价", "两年后，可能迁到另一处重新开始", "move", oldWorld ? 0.42 : 0.58));
    } else {
      plans.push(makePlan(life, "health", "把余下的钱用在身子上", planCost(life, 0.2, 80), "看病、买药或少做重活", "两年后，日子可能过得更轻一点", "health"));
      plans.push(makePlan(life, "family", "给家里人留一笔", planCost(life, 0.24, 80), "现在少一点，家里人多一层缓冲", "两年后，这笔钱可能在你不在时继续起作用", "family"));
      plans.push(makePlan(life, "reserve", "把余钱收好", planCost(life, 0.3, 100), "眼前不买东西，也不扩营生", "两年后，遇到病或灾时会多一条退路", "reserve"));
    }
    return plans.filter(item => item.kind !== "business" || life.jobStarted).map(item => {
      const pending = (life.plans || []).some(p => !p.done && p.kind === item.kind);
      return Object.assign(item, { locked: life.planYear === life.age || pending, reason: pending ? "已有同类计划在进行" : life.planYear === life.age ? "今年已选择，请明年再安排" : !item.available ? "余资不足" : "" });
    });
  }
  function applyPlanFx(life, plan) {
    if (plan.kind === "health") {
      life.health = clamp(life.health + 4);
      life.happy = clamp(life.happy + 1);
    } else if (plan.kind === "school" || plan.kind === "study") {
      life.learning = clamp(life.learning + (plan.kind === "study" ? 4 : 3));
      life.happy = clamp(life.happy - 1);
    } else if (plan.kind === "craft") {
      life.skill = clamp(life.skill + 3);
    } else if (plan.kind === "family") {
      life.bond = clamp(life.bond + 3);
      life.happy = clamp(life.happy + 2);
    } else if (plan.kind === "business") {
      life.skill = clamp(life.skill + 2);
      life.bond = clamp(life.bond - 1);
    } else if (plan.kind === "move") {
      life.bond = clamp(life.bond - 2);
    }
  }
  function resolvePlans(life, rng, deps) {
    const due = (life.plans || []).filter((plan) => !plan.done && plan.payAt <= life.age);
    const notes = [];
    due.forEach((plan) => {
      plan.done = true;
      const before = M.snapshot(life);
      const startNotes = notes.length;
      const pr = mulberry32((life.seed ^ (plan.age * 4099) ^ plan.key.length * 97) >>> 0);
      const success = pr() < plan.chance;
      if (plan.kind === "school" || plan.kind === "study") {
        if (success) {
          life.learning = clamp(life.learning + 5);
          if (life.age < 18 && !life.jobStarted) { life.inSchool = true; life.edu = life.age <= 11 ? "小学在读" : life.age <= 14 ? "初中在读" : "高中在读"; life.educationUntil = 21; }
          life.literate = life.learning >= 24 || life.literate;
          life.opportunities.study = true;
          notes.push("你前两年留给读书的安排有了回声：这年又多学了一些。");
        } else {
          notes.push("你前两年想留给读书的钱没有换来一条完整的路，认得的字还是留在手上。");
        }
      } else if (plan.kind === "craft") {
        life.skill = clamp(life.skill + (success ? 5 : 2));
        if (success) life.opportunities.craft = true;
        if (success) life.jobMul = Math.min(1.65, (life.jobMul || 1) + 0.08);
        notes.push(success ? "你前两年投在手艺上的东西开始回本，做事比以前更有把握。" : "你前两年学的手艺没有立刻换来大路，但手上确实熟了一点。");
      } else if (plan.kind === "business") {
        life.jobMul = Math.min(1.9, (life.jobMul || 1) + (success ? 0.12 : 0.03));
        life.volatile = true;
        if (success) life.opportunities.trade = true;
        notes.push(success ? "你前两年添在营生上的东西开始见效，进项上去，起伏也跟着变大。" : "你前两年添的工具没有带来想象中的进项，仍只能慢慢做。");
      } else if (plan.kind === "move") {
        const from = success ? tryMove(life, pr, deps, M.yearAt(life.birthYear, life.age), 1) : null;
        life.money += from ? 0 : Math.round(plan.cost * .8);
        if (from) { life.yearMoved = from; life.opportunities.road = true; }
        notes.push(from ? "你前两年为出门留的盘缠终于派上用场，到了" + life.place.ancient + "一带。" : "这次没有走成；扣除准备消耗后，八成盘缠回到余资。");
      } else if (plan.kind === "reserve") {
        const year = M.yearAt(life.birthYear, life.age);
        const relief = plan.cost;
        life.money += relief;
        notes.push(isFamine(year) ? "你前两年收好的余钱在紧日子里派上用场。" : "你前两年收好的余钱还在，遇到小事不用立刻借钱。");
      } else if (plan.kind === "health") {
        life.health = clamp(life.health + 4);
        notes.push("你前两年留给身子的安排起了作用，这年少受了一点病拖。");
      } else if (plan.kind === "family") {
        life.bond = clamp(life.bond + 4);
        life.happy = clamp(life.happy + 1);
        notes.push("你前两年留给家里的时间和钱没有白留，家里有人在你身边搭了一把手。");
      }
      plan.result = notes.slice(startNotes).join("");
      plan.resultAge = life.age;
      plan.delta = M.changes(before, M.snapshot(life));
    });
    return notes;
  }
  function applyPlan(life, key, deps) {
    if (life.planYear === life.age) return false;
    const plan = planningOptions(life, deps).find((item) => item.key === key);
    if (!plan || plan.locked || !plan.available) return false;
    life.money -= plan.cost;
    applyPlanFx(life, plan);
    if (!life.plans) life.plans = [];
    life.plans.push({ key: plan.key, kind: plan.kind, label: plan.label, cost: plan.cost, age: life.age, payAt: life.age + 2, chance: plan.chance, done: false });
    life.planYear = life.age;
    life.currentPlanNote = "你决定" + plan.label + "。" + (plan.cost ? "先拿出约" + yuan(plan.cost) + "点余资。" : "这次不花钱，但要把时间留给家里。") + "两年后再看这一步有没有兑现。";
    life.currentPlanCite = "规划不会改掉出身，只会把一部分余钱、时间和机会留给后面的自己。";
    return true;
  }
  function tickPeers(life, deps, year, per) {
    (life.peers || []).forEach((p) => {
      if (!p.alive) return;
      const pr = mulberry32((life.seed ^ (p.salt || 1) ^ (p.age * 997)) >>> 0);
      const q = deps.hazard(p.age, year, per, 48);
      if (p.age >= 1 && pr() < q) {
        p.alive = false;
        p.cause = deps.causeOf(p.age, year, p.sex, pr);
        return;
      }
      p.age += 1;
      if (p.age === 16) {
        const jobs = ["农活", "手艺", "小买卖", "给人帮工"];
        p.job = jobs[Math.floor(pr() * jobs.length)];
      }
    });
  }
  function tickChildren(life, deps, year, per) {
    (life.childrenList || []).forEach((child) => {
      if (!child.alive) return;
      const pr = mulberry32((life.seed ^ (child.salt || 1) ^ (child.age * 733)) >>> 0);
      const q = deps.hazard(child.age, year, per, 55);
      if (pr() < Math.min(0.75, q)) {
        child.alive = false;
        child.cause = deps.causeOf(child.age, year, child.sex, pr);
        return;
      }
      child.age += 1;
    });
  }
  function maybeChild(life, rng, year) {
    life.birthThisYear = false;
    if (!life.married || life.age < 18 || life.age > 42) return "";
    const p = year >= 1990 ? 0.06 : year >= 1970 ? 0.11 : 0.18;
    if (rng() < p) {
      const sex = rng() < 0.51 ? "男" : "女";
      const child = {
        name: personName(rng, sex, year), sex: sex, birthYear: year,
        age: 0, alive: true, cause: "", salt: 500 + life.children * 31
      };
      life.childrenList.push(child);
      life.children = life.childrenList.length;
      life.birthThisYear = true;
      return "家里添了孩子" + child.name + "。";
    }
    return "";
  }
  function historyEvent(life, year, period) {
    const place = life.place.ancient;
    const nearNorth = /北京|北平|天津|保定|石家庄|太原|徐州|济南/.test(place);
    const nearCoast = /上海|广州|汉口|泉州|福州|南京|天津/.test(place);
    if (year === -221) return { key: "qin-unification", text: "秦并天下。郡县、户籍和徭役一起压到人的日子里。", cite: "前221年，秦统一六国；此处只写制度变化，不等同于某一人的原始户籍。" };
    if (year === 220) return { key: "three-kingdoms", text: "曹魏建立；刘备于次年称帝，孙权至229年称帝。此时不能把三国都写成已经建国。", cite: "220年前后，汉魏之际；三国归属按故地模型处理。" };
    if (year === 280) return { key: "jin-unification", text: "三国结束，新的统一又把人和粮册重新编在一起。", cite: "280年，西晋灭吴；这里按时代转折写，不把它当作个人亲历的单一事件。" };
    if (year === 618) return { key: "tang-founding", text: "唐朝建立。旧的旗号换了，关中和各地的路还在重新安定。", cite: "618年，唐建立。" };
    if (year === 755) return { key: "an-lushan", text: "安史之乱起。兵、粮和逃难的消息开始沿路传来。", cite: "755—763年，安史之乱；不描写战场画面。" };
    if (year === 907) return { key: "tang-fall", text: "唐亡，旧的秩序松开了。各地的旗号和征发都不再一样。", cite: "907年，唐亡；五代十国时期的政权由地点决定。" };
    if (year === 960) return { key: "song-founding", text: "宋朝建立。有人盼着路重新通起来，也有人继续躲着征发。", cite: "960年，北宋建立。" };
    if (year === 1127) return { key: "jingkang", text: "北方失守，难民、军队和粮价一起向南移动。" + place + "也听见了这场变化。", cite: "1127年，靖康之变；不把迁徙写成某个家族的确证。" };
    if (year === 1271) return { key: "yuan-founding", text: "元朝改号。驿路、军户和地方官府都换了称呼。", cite: "1271年，元建国。" };
    if (year === 1368) return { key: "ming-founding", text: "明朝建立。户籍、里甲和征役重新落到各家门口。", cite: "1368年，明建立；明初人口数存在漏报，使用模型估计。" };
    if (year === 1644) return { key: "ming-qing", text: "明清鼎革。旗号、官府和征发规则一起改变。", cite: "1644年前后，明清鼎革；此处只描述制度转折。" };
    if (year === 1840) return { key: "opium-war", text: (nearCoast ? "海口的战事打断了" + place + "一带的贸易和差事，不等于家里人人都看见了炮火。" : "海上的战事改变了沿海口岸，消息随后传到" + place + "。"), cite: "1840—1842年，第一次鸦片战争；只写社会影响，不写成个人亲历。" };
    if (year === 1905) return { key: "exam-abolished", text: "科举停了。原来靠应试安排的路断了，新式学堂还没有铺到每个县。", cite: "1905年，清廷诏废科举。" };
    if (year === 1977) return { key: "gaokao", text: "高考恢复。停了十年的升学路重新打开，能不能去考仍看年龄、学历和名额。", cite: "1977年，高等学校招生考试恢复。" };
    if (year === 1851) return { key: "taiping", text: "兵乱从南方扩散。逃难、粮价和团练让许多地方的日子都变紧。", cite: "1851—1864年，太平天国运动及相关战乱；不描写暴力场面。" };
    if (year === 1894) return { key: "sino-japanese-war", text: "海上的战争让沿海的军费、贸易和去留都变得不安。", cite: "1894—1895年，中日甲午战争；此处只写社会影响。" };
    if (year === 1900 && nearNorth) return { key: "boxer-war", text: "兵进了北方的城镇。" + place + "这一带的秩序先乱了。", cite: "1900年，义和团运动与八国联军侵华；不描写战场画面。" };
    if (year === 1911) return { key: "xinhai", text: "辛亥革命爆发，各地政局变化。清帝退位发生在次年。", cite: "1911—1912年，辛亥革命与清帝退位。" };
    if (year === 1926) return { key: "northern-expedition", text: "北伐开始。军队、交通和地方政权都在移动。", cite: "1926—1928年，国民革命军北伐；此处只写社会流动。" };
    if (year === 1937) return { key: "war-of-resistance", text: "全面抗日战争开始。征发、逃难和物资短缺进入这一代人的生活。", cite: "1937—1945年，全面抗日战争；不描写战场画面。" };
    if (year === 1949) return { key: "founding-prc", text: "新的国家建立。土地、单位和身份的规则开始重新排列。", cite: "1949年，中华人民共和国成立。" };
    if (year === 1959) return { key: "famine", text: "粮食变得非常紧。这一代人的饭量、身体和家庭安排都被影响。", cite: "1959—1961年严重困难时期；此处只写统计后果，不描写过程。" };
    if (year === 1966) return { key: "cultural-revolution", text: "学校和单位改变了。原来的教育、工作和家庭计划被时代重新安排。", cite: "1966—1976年，文化大革命时期。" };
    if (year === 1978) return { key: "reform", text: "生活开始换一种走法。考试、工厂、城市和外出谋生逐渐成为新的选择。", cite: "1978年后，改革开放初期；具体经历仍由模型和选择共同决定。" };
    return null;
  }
  function worldLine(life, year, period) {
    const event = historyEvent(life, year, period);
    return event ? event.text : "";
  }
  const ERA_LIFE = {
    qin: {
      grain: "粟与麦", meal: "一钵粟饭", light: "油灯", tax: "更役与口赋", road: "驰道",
      lines: [
        "郡县的名籍落到门口，家里要把丁口和田亩说清楚。",
        "驰道上有传车经过，徭役的期限比收成更让人算计。",
        "度量衡刚统一，集上量粮的斗和从前不一样。"
      ]
    },
    chuhan: {
      grain: "粟", meal: "稀粟粥", light: "火塘", tax: "军粮摊派", road: "被军队占着的官道",
      lines: [
        "旗号几个月一换，先问的是谁来征粮。",
        "青壮被点走之后，田里只剩老人和半大孩子。",
        "逃户从西边过来，带着还没改口的秦时称呼。"
      ]
    },
    hanw: {
      grain: "粟麦", meal: "粟饭配葱", light: "油灯", tax: "算赋与更役", road: "驿路",
      lines: [
        "算赋按口来收，家里多一口人就多一笔账。",
        "铁器从官炉里出来，犁铧比父辈用的厚。",
        "边郡的消息顺着驿路传来，集上的盐价跟着动。"
      ]
    },
    xin: {
      grain: "粟", meal: "掺糠的粟饭", light: "火塘", tax: "还没改顺的新法", road: "时断时续的驿路",
      lines: [
        "钱和田的名目改了，乡里还在用旧斗量粮。",
        "新朝的印信传到县里，差役却按旧册来点人。",
        "流民比官文先到，邻里先腾出一角屋。"
      ]
    },
    hane: {
      grain: "粟麦", meal: "麦饭", light: "油灯", tax: "更赋", road: "驿道",
      lines: [
        "豪族的田庄围在城外，编户仍要按名册服役。",
        "太学和郡学的消息只传到识字的人那里。",
        "集市照常开，远处的兵讯让人不敢一次卖光余粮。"
      ]
    },
    sanguo: {
      grain: "军屯的粟", meal: "掺豆的稀饭", light: "松明", tax: "军粮与徭役", road: "粮道",
      lines: [
        "户口和粮道都不稳，能带走的东西放在手边。",
        "屯田的收成先入军仓，自家的瓮留得浅。",
        "路过的队伍换了旗号，乡里先把牲口赶进林子。"
      ]
    },
    jin: {
      grain: "麦与粟", meal: "麦粥", light: "油灯", tax: "租调", road: "南北来往的水路",
      lines: [
        "永嘉之后北人南渡，地契要重新写主人。",
        "士族的籍册和编户不是一回事，差役仍落在后者头上。",
        "洛阳和建康不是同一套官，乡里先问今年的租调交给谁。"
      ]
    },
    nanbei: {
      grain: "麦或稻", meal: "北面南米", light: "油灯", tax: "租调", road: "长江和黄河各自的路",
      lines: [
        "南北两个朝廷同时存在，赋税和年号都看你落在哪一边。",
        "平城一带仍吃麦，建康一带桌上已经是稻米。",
        "寺院和豪族收容逃户，官府的册子对不上门口的人。"
      ]
    },
    sui: {
      grain: "粟麦", meal: "粟饭", light: "油灯", tax: "租庸调的前身", road: "新修的驰道与运河",
      lines: [
        "大运河和驰道的征发名单贴到乡里，家里先数还能留下几双手。",
        "科举的消息第一次传到识字的人耳朵里，多数人仍去服役。",
        "统一的户籍比前代整齐，漏报一口人更难。"
      ]
    },
    tang: {
      grain: "粟麦", meal: "饼与粟饭", light: "油灯", tax: "租庸调，建中以后多按两税", road: "驿路",
      lines: [
        "坊市按时开关，夜里想出城门得等晨鼓。",
        "胡饼和香料出现在市上，自家桌上仍是粟麦。",
        "两税法之后，按户收钱，不再只按丁口摊役。"
      ]
    },
    wudai: {
      grain: "麦", meal: "麦粥", light: "松明", tax: "随军而来的科配", road: "常常被截断的官道",
      lines: [
        "旗号换得快，不问谁坐殿上，只问今年谁来收粮。",
        "节度使的人马过境，集市提前收摊。",
        "路断的消息比收成先到，余粮藏进夹壁。"
      ]
    },
    song: {
      grain: "北麦南稻", meal: "开封吃饼，江南才是米饭", light: "油灯", tax: "两税与免役钱", road: "汴河",
      lines: [
        "东京靠汴河运粮，市上有纸和书，自家桌上仍多是饼和粟。",
        "析津在辽境，不按宋的市镇来过。",
        "免役钱让有钱的人可以不服差，没钱的人仍要去。"
      ]
    },
    songnan: {
      grain: "稻米", meal: "米饭", light: "油灯", tax: "两税与经总制钱", road: "运河与海路",
      lines: [
        "临安的市镇夜里还有市声，早稻可以一年两熟。",
        "会子在大地方流通，乡里买一顿饭仍数铜钱。",
        "泉州的海船带来远处的货，多数人家只看见粮价跟着动。"
      ]
    },
    yuan: {
      grain: "粟与稻", meal: "面食或米饭", light: "油灯", tax: "科差", road: "驿站",
      lines: [
        "站户和军户的名籍分开，差事按户籍落到人头上。",
        "驿路上的急递比商队跑得快，地方上先看见官文。",
        "匠户的手艺被点去官作，自家的活计排在后面。"
      ]
    },
    ming: {
      grain: "稻米", meal: "米饭", light: "油灯", tax: "里甲徭役，晚明多折成银", road: "漕运",
      lines: [
        "里甲把每户排进册子，漏报一个名字要连坐到甲首。",
        "卫所的军户世代当差，民户则轮流去应役。",
        "一条鞭之后，不少差事折成银子，手里没银子的人家更紧。"
      ]
    },
    qing: {
      grain: "稻米与麦", meal: "米饭或面食", light: "油灯", tax: "丁银与田赋，雍正以后多并成地丁", road: "漕河与官道",
      lines: [
        "摊丁入亩之后，人头税并进田赋，没田的人少了一笔丁银。",
        "茶馆里谈论粮价和河工，洋货还没有进乡里。",
        "漕船沿运河北上，盛京和江南不是同一套日子。"
      ]
    },
    qingwan: {
      grain: "稻米与麦", meal: "米饭或面食", light: "油灯，口岸才多见洋油", tax: "地丁之外还有厘金和赔款摊派", road: "轮船、铁路和旧官道并存",
      lines: [
        "广州、上海一类口岸先看见洋布和洋油，乡里仍用土布和铁锅。",
        "厘金设在路口，货还没进城先被抽一道。",
        "科举在1905年停掉之前，仍是识字的人能走的一条窄路。"
      ]
    },
    roc: {
      grain: "米面", meal: "米饭或窝头", light: "煤油灯", tax: "田赋与各种捐", road: "公路与尚未修到的土路",
      lines: [
        "报纸和电报把远处的仗带到茶馆，家里先算这一季的粮。",
        "新式学堂在县城开学，乡下的孩子多数仍下地。",
        "法币和后来的金圆券让手里的钱说变就变。"
      ]
    },
    prc1: {
      grain: "口粮", meal: "按定量来的饭", light: "电灯或煤油灯", tax: "公粮与工分", road: "还不多的公路",
      lines: [
        "户口把人分成城里和乡下，粮票只在本地方能换到吃的。",
        "工分记在队里的本子上，年终才知道能分多少粮。",
        "广播喇叭在村口响，上学和工作都要先过队里或单位。"
      ]
    },
    prc2: {
      grain: "米面", meal: "米饭或馒头", light: "电灯", tax: "还不高的农业税", road: "进城的长途车",
      lines: [
        "包产到户之后，收成先看自家的田，不再只看工分。",
        "乡镇企业招工的消息贴在乡政府门口。",
        "电视进入一部分人家，城里的物价成了饭桌上的话题。"
      ]
    },
    prc3: {
      grain: "米面", meal: "一桌家常菜", light: "电灯", tax: "农业税取消以后的各种缴费", road: "高铁和高速公路",
      lines: [
        "手机把招工和快递送到饭桌上，人可以不进城也听见城里的价。",
        "学区、看病和房子成了家里反复算的三笔账。",
        "返乡和进城都要赶春运，车票比收成更让人提前打算。"
      ]
    }
  };
  function eraLife(period) {
    if (!period) return null;
    return ERA_LIFE[period.id] || null;
  }
  function eraDaily(life, period) {
    const era = eraLife(period);
    if (!era) return "";
    const place = life.place.ancient;
    const pool = era.lines.concat([
      place + "这年桌上主要是" + era.meal + "，灯用的是" + era.light + "。",
      "要交的是" + era.tax + "，人出门走的是" + era.road + "。"
    ]);
    return pickFresh(life, pool);
  }
  function pickFresh(life, lines) {
    const year = M.yearAt(life.birthYear, life.age);
    const n = lines.length;
    return lines[Math.abs((year + life.seed) % n)];
  }
  function focusLine(life) {
    const place = life.place.ancient;
    const schooling = life.inSchool;
    if (life.age < 4) return pickFresh(life, ["你在家人的照看下长大，已经认得常来的人。", "家里人抱着你看门外的天，你还不能替自己作决定。", "你开始学着说话，也学着认回家的路。"]);
    const craft = life.edu === "未入学" || life.edu === "停学" || /手艺|匠/.test(life.job || "");
    const bent = life.bent || "";
    if (life.focus === "study" && schooling) {
      return pickFresh(life, [
        "你在" + place + "的学堂里又坐了一年，认得的字比春天多。",
        "先生留的功课你带回家里，灯火底下又看了一遍。",
        "这年书没落下。下学之后，家里的活还等着你。",
        place + "的学堂这年教得紧，你有几天跟不上，后来又跟上了。"
      ]);
    }
    if (life.focus === "study") {
      return pickFresh(life, [
        "你想认字，" + place + "没有学堂可去，只跟着别人问了几个字。",
        "识字的人这年不多见。你记住的，还是口头上的几句。",
        "你把听到的字在手上比划，没有人正式教你。"
      ]);
    }
    if (life.focus === "work") {
      const job = life.job && life.job !== "还没单独做事" ? life.job : "手里的活";
      return pickFresh(life, [
        "你把" + job + "做在前面，人比去年累。",
        job + "这年单子多。你少出门，手上的茧厚了一层。",
        "忙完一季，" + place + "的" + job + "还是你的。没有换成另一条路。"
      ]);
    }
    if (life.focus === "kin") {
      return pickFresh(life, [
        "你常去邻里坐坐，手头的活就慢了一截。",
        "家里有人病了几天，你守在旁边，集市没去成。",
        place + "有一家办席，你去帮忙，自己的事推到后面。"
      ]);
    }
    if (life.focus === "body") {
      return pickFresh(life, [
        "你这年先养身子，重活都让了让。",
        "病尾拖着，你没出远门，饭也吃得小心。",
        "你把日子过慢了一点。人还在，活没有做深。"
      ]);
    }
    if (life.focus === "hobby" && !craft) {
      return pickFresh(life, bentLines(life, place));
    }
    if (craft && life.age > 8 && !schooling) {
      return pickFresh(life, [
        "你跟着做手艺的人看，书没有捡回来。",
        place + "的匠人这年收了你几天活。手比嘴记得清楚。",
        "你把一件东西做完了。它不值钱，但比去年像样。"
      ]);
    }
    if (schooling) {
      const lines = [
        "你仍然去" + place + "的学堂。下学之后，家里的活还要你搭手。",
        "字认了一些。集上的事、家里的饭，你也跟着过。",
        "雨天路不好走，你还是去了学堂。",
        "这年没有一门特别精，学堂的门你还在进。"
      ];
      if (bent === "sing") lines.push("空下来你仍爱唱。先生听见了，没把你赶出学堂。");
      if (bent === "out") lines.push("放了学你就往" + place + "城外跑，天黑才回来。");
      return pickFresh(life, lines);
    }
    return pickFresh(life, [
      place + "这年收成平常。你把家里的活做完，没有多出一块名声。",
      "春天忙种，秋天忙收。" + place + "的日子就这么过去。",
      "市上的粮价吵过一阵，后来又静了。",
      "邻里有人生病，你去看了两次。",
      "冬天天黑得早，一家人挤着说话，第二年还记得几句。",
      "官面上来量过一次地。你家的数没改，人忙了几天。",
      bent === "sing" ? "你仍会在" + place + "的席上唱两句，正事并没有因此改掉。" : place + "的路上你又走熟了一段，没有走到别的城里。"
    ].filter(Boolean));
  }
  function worldPulse(life, year, period) {
    if (!period || life.age < 6 || life.age % 5 !== 0 || year > 2026) return "";
    const place = life.place.ancient;
    const lines = {
      qin: ["郡县的文书一层层落到" + place + "，家里要把名字和田亩说清。", "徭役的消息从官道传来，家里先盘算谁能留下。"],
      chuhan: ["旗号还在换，" + place + "的路上先看见的是征发和逃户。", "旧的官名还没说顺，新的人马已经到了附近。"],
      hanw: ["驿路和集市都还通着，" + place + "的人开始把日子算得更细。", "官府收上来的名册比从前整齐，家里更难藏住一块田。"],
      xin: ["新朝的称呼传到" + place + "，旧的规矩和新的命令撞在一起。", "地方上的人还在改口，粮和差役却没有等称呼。"],
      hane: [place + "的集市照常开，远处的兵讯让人不敢把余粮一次卖光。", "豪族、官府和乡里都在争一块安稳的地方。"],
      sanguo: ["兵家的旗号更换得快，" + place + "的人先学会看路上来的是什么队伍。", "这一带的户口和粮道都不稳，家里把能带走的东西放在手边。"],
      jin: ["南北的消息沿着水路和驿道传来，" + place + "的人开始习惯迁来迁去。", "一张新的籍册落下来，家里要重新说自己属于哪里。"],
      nanbei: ["南北两个朝廷的年号不一样，" + place + "只认来收租的那一边。", "麦和稻的界线比旗号更清楚。"],
      sui: ["修路、征发和新官名一起落到地方，" + place + "的人盼着统一，也怕统一带来的差事。", "大工程的消息传到乡里，家里先数还能留下几双手。"],
      tang: ["长安的命令沿驿路传开，" + place + "的货和人比前代走得更远。", "市上见到的东西多了，官府要的名册和差役也更细。"],
      wudai: ["旗号换得快，" + place + "的人不问谁坐殿上，只问今年谁来收粮。", "兵乱没有天天写在纸上，却写在了路断和粮价里。"],
      song: ["汴河把粮运往东京，" + place + "的人先看见粮价，后看见书和纸。", "析津不在宋境，不能按开封的市镇来过。"],
      songnan: ["临安的夜市和早稻传到" + place + "的谈话里。", "会子在大地方用，乡里买饭仍数铜钱。"],
      yuan: ["驿站和军户的规矩传到" + place + "，人的身份比从前更像一张牌。", "北来的官名落到地方，旧的乡里关系还在慢慢适应。"],
      ming: ["里甲、徭役和粮册把每家每户重新排好，" + place + "的人不敢漏报一个名字。", "城门和水路都更规整了，家里的差事也更有定数。"],
      qing: ["粮价、河运和官府的消息一起进了" + place + "的茶馆。", "家里的日子看似平常，远处的军报和灾情总会绕一圈回来。"],
      qingwan: ["口岸的洋货和厘金先改变" + place + "的物价。", "科举还在的时候，识字是一条窄路；停了以后，这条路也断了。"],
      roc: ["新式学校、报纸和兵站让" + place + "听见了更远的消息。", "旗号在换，铁路和电报也在来，家里还得先解决一顿饭。"],
      prc1: ["单位、户口和集体的称呼进入" + place + "，人的去处开始由新的规则安排。", "粮票、工分和分配让家里的日子有了另一套算法。"],
      prc2: ["工厂和学校把一部分年轻人带离" + place + "，留下的人也开始想别的活法。", "电视、市场和进城的路慢慢进入家里的谈话。"],
      prc3: ["手机、城市和平台把远处的工作带到" + place + "的饭桌边。", "房子、教育和医疗成了家里反复计算的三件事。"]
    };
    const pool = lines[period.id] || [place + "的日子在时代的缝隙里继续。"];
    return pickFresh(life, pool);
  }
  function bentLines(life, place) {
    const bent = life.bent || "";
    if (bent === "sing") return ["你把听到的调子哼了一路。", "席上有人让你开口，你唱了，也没有因此离开" + place + "。", "这年你记得的歌，比记得的账多。"];
    if (bent === "out") return ["你一有空就往" + place + "城外跑。", "田埂和河边你又去了。鞋子坏了一双。", "你把日子耗在路上，家里的人开始念你。"];
    if (bent === "make" || bent === "craft") return ["你盯着别人怎么把东西做出来，自己也试了一次。", place + "的匠人骂过你手慢，你第二天还是去了。", "你做出一件粗糙的东西，舍不得扔。"];
    if (bent === "word" || bent === "book") return ["你缠着识字的人问了好久。", "有字的东西你还不放手，正事因此慢了。", "你又认了几个字，离学堂仍远。"];
    return ["你把喜欢的事又磨了一点，" + place + "的正事还在。", "空下来的时候，你还是回到那一件事上。", "这年你记得最清的，不是收成，是自己爱做的那一点。"];
  }
  function stratumLine(life) {
    if (life.age % 6 !== 2) return "";
    const s = life.stratum || "";
    if (/兵|士兵|戍/.test(s)) return "家里吃的是当兵的差事，人常常不在屋里。";
    if (/吏|干部/.test(s)) return "家里有人在公门办事，识字比邻里容易一点。";
    if (/佃|雇|刑|客/.test(s)) return "地不全是自己的，收成要先交出去一截。";
    if (/商|个体/.test(s)) return "家里的进项看买卖，不看田里的收成。";
    return "";
  }
  function peerLine(life) {
    if (life.age % 4 !== 1) return "";
    const alive = (life.peers || []).filter((p) => p.alive);
    if (!alive.length) return "";
    const p = alive[life.age % alive.length];
    return "同一年的" + p.name + "还在" + p.place + "，" + p.job + "。";
  }
  function flavor(life, rng) {
    const year = M.yearAt(life.birthYear, life.age);
    const period = null;
    rng();
    const bits = [];
    const eventLine = worldLine(life, year, life._yearPeriod);
    if (eventLine) bits.push(eventLine);
    else if (life.age >= 6) {
      const daily = eraDaily(life, life._yearPeriod);
      if (daily) bits.push(daily);
    }
    bits.push(focusLine(life));
    const house = stratumLine(life);
    if (house) bits.push(house);
    const peer = peerLine(life);
    if (peer) bits.push(peer);
    if (life.health < 40) bits.push("病拖了好些天。");
    if (life.money < 0 && life.age >= 16) bits.push("日子见了底，饭先紧着人。");
    return bits.filter(Boolean).join("");
  }
  function rollDeath(life, rng, deps, year, per, mul) {
    if (life.age < 6) return { dead: false, cause: "" };
    let q = deps.hazard(life.age, year, per, life.health) * (mul == null ? 1 : mul) * M.world(life).risk;
    if (M.routeOf(life) === "soldier") q *= 1.18;
    if (life.sex === "女" && life.birthThisYear) q *= 1.08;
    q = Math.max(0.001, Math.min(0.8, q));
    const dead = life.age >= 110 || rng() < q;
    const cause = dead ? deps.causeOf(life.age, year, life.sex, rng, { birthThisYear: life.birthThisYear, war: M.world(life).war }) : "";
    return { dead, cause };
  }

  function closeYear(life, rng, deps, extra) {
    const year = M.yearAt(life.birthYear, life.age), per = deps.periodOf(year);
    const before = extra.before || M.snapshot(life);
    M.normalizeEducation(life);
    const planNotes = resolvePlans(life, rng, deps);
    const echoes = resolveMemories(life);
    tickEconomy(life, year, rng);
    tickFocus(life);
    const w = M.world(life);
    life.health = clamp(life.health + w.health);
    tickPeers(life, deps, year, per);
    tickChildren(life, deps, year, per);
    const child = maybeChild(life, rng, year);
    life._yearPeriod = per;
    let note = extra.note || flavor(life, rng);
    const planNote = life.currentPlanNote, planCite = life.currentPlanCite;
    life.currentPlanNote = ""; life.currentPlanCite = "";
    if (extra.note && !worldLine(life, year, per)) { const daily = eraDaily(life, per); if (daily) note = daily + note; }
    if(planNotes.length) note = planNotes.join("") + note;
    if(echoes.length) note = echoes.join("") + note;
    if(planNote) note = planNote + note;
    if(child) note += child;
    if(w.key) note += "【时代影响】" + w.text;
    const event = historyEvent(life, year, per);
    const roll = rollDeath(life, rng, deps, year, per, extra.risk);
    if(roll.dead) note += "这一年没有过去，死于" + roll.cause + "。" + helpFor(roll.cause, year);
    const moved = extra.moved || life.yearMoved || null;
    life.yearMoved = null;
    const rowDelta = M.changes(before, M.snapshot(life));
    if (M.deltaText(rowDelta)) note += "【这一年有变化】" + M.deltaText(rowDelta) + "。";
    const row = {
      year, age: life.age, place: life.place, focus: extra.focus || life.focus, annualFocus: life.focus,
      path: M.routeOf(life), choiceLabel: extra.choiceLabel || "时间自己走", decision: extra.decision || "",
      choiceDelta: extra.choiceDelta || {}, delta: rowDelta, jobChanged: before.job !== life.job,
      consequenceId: extra.consequenceId || "", echoes, dead: roll.dead, cause: roll.cause, moved, period: per,
      note, cite: extra.cite || planCite || (event ? event.cite : ""), help: roll.dead ? helpFor(roll.cause, year) : (extra.help || ""),
      historyKey: event ? event.key : w.key, historyTitle: event ? event.text.split("。")[0] : w.title,
      world: w.key ? w : null, birthThisYear: !!life.birthThisYear, meters: M.snapshot(life)
    };
    pushRow(life, row);
  }
  function resolveMemories(life) {
    const out=[];
    (life.memories || []).filter(m => !m.done && m.due <= life.age).forEach(m => {
      m.done=true;
      const same = M.routeOf(life) === m.route || life.focus === m.focus;
      const boost = same ? 4 : 2;
      const metric = {study:"learning",craft:"skill",farm:"skill",trade:"skill",soldier:"skill",kin:"bond",road:"bond",body:"health"}[m.route];
      if(metric) life[metric]=clamp(life[metric]+boost);
      life.opportunities[m.route]=true;
      m.result = "“"+m.label+"”留下回声："+(same ? "你没有中断这条路，积累开始打开新的机会。" : "虽然后来换了重心，当时学到的仍留下一点底子。");
      m.resultAge=life.age;
      out.push(m.result);
    });
    return out;
  }

  function applyBirth(life, deps) {
    const year = life.birthYear;
    const per = deps.periodOf(year);
    const rng = mulberry32((life.seed ^ 0x51ec) >>> 0);
    const places = deps.placesFor(per.id, year);
    life.peers = [];
    for (let i = 0; i < 4; i++) {
      const pr = mulberry32((life.seed ^ (0x9e37 + i * 17)) >>> 0);
      const sex = pr() < 0.51 ? "男" : "女";
      const place = places[Math.floor(pr() * places.length)] || life.place;
      const peer = {
        name: personName(pr, sex, year), sex: sex, place: place.ancient, salt: 100 + i,
      job: "还在家里", alive: true, age: 0, cause: ""
      };
      const q0 = deps.hazard(0, year, per, 55);
      if (pr() < q0) {
        peer.alive = false;
        peer.cause = deps.causeOf(0, year, sex, pr);
      } else peer.age = 1;
      life.peers.push(peer);
    }
    const lost = life.peers.filter((p) => !p.alive).length;
    let note = "名籍上添了你。这一年还轮不到你选。";
    if (lost) note += "同一年里有人过不了开头。你还在。";
    life.rows.push({
      year: year, age: 0, place: life.place, focus: "birth", choiceLabel: "出生",
      dead: false, cause: "", moved: null, period: per, note: note, cite: "", help: ""
    });
    life.age = 1;
    if (!life.done) life.done = {};
    if (!life.focus) life.focus = "balance";
  }
  function applyAuto(life, rng, deps) {
    closeYear(life, rng, deps, { risk: 1, choiceLabel: "时间自己走", focus: "auto" });
  }
  function applyFx(life, rng, deps, fx) {
    const year = M.yearAt(life.birthYear, life.age);
    const out = { movedFrom: null };
    if (!fx) return out;
    if (fx.health) life.health = clamp(life.health + fx.health);
    if (fx.happy) life.happy = clamp(life.happy + fx.happy);
    if (fx.learning) life.learning = clamp(life.learning + fx.learning);
    if (fx.bond) life.bond = clamp(life.bond + fx.bond);
    if (fx.skill) life.skill = clamp(life.skill + fx.skill);
    if (fx.money) life.money += fx.money;
    if (fx.job && fx.job !== "还没单独做事") { life.job = fx.job; life.jobStarted = true; life.careerRoute = M.jobRoute(fx.job) || life.careerRoute; }
    if (fx.jobMul) life.jobMul = fx.jobMul;
    if (fx.volatile != null) life.volatile = fx.volatile;
    if (fx.school != null) { life.inSchool = fx.school; if(fx.school && !fx.job) { life.jobStarted = false; life.job = "求学中"; life.educationUntil = life.age < 18 ? 21 : life.age + 4; } }
    if (fx.bent) life.bent = fx.bent;
    if (fx.edu) life.edu = fx.edu;
    if (fx.literate) life.literate = true;
    if (fx.rank) life.rank = fx.rank;
    if (fx.marry) { life.married = true; life.spouse = fx.marry; life.marriedAge = life.age; life.courting = ""; }
    if (fx.court) life.courting = fx.court;
    if (fx.clearCourt) life.courting = "";
    if (fx.move) out.movedFrom = tryMove(life, rng, deps, year, fx.move);
    if (life.learning >= 36) life.literate = true;
    M.normalizeEducation(life);
    return out;
  }
  function setRoute(life, sceneId, key) {
    if (["school", "school2", "exam"].indexOf(sceneId) >= 0 || sceneId === "temper" && ["listen", "look"].indexOf(key) >= 0) life.route = "study";
    else if (sceneId === "hobby" && ["make", "craft"].indexOf(key) >= 0) life.route = "craft";
    else if (sceneId === "hobby") life.route = "hobby";
    else if (["marry", "court", "care", "house", "famine"].indexOf(sceneId) >= 0) life.route = "kin";
    else if (["war", "move", "road"].indexOf(sceneId) >= 0 || ["flee", "leave", "go", "out"].indexOf(key) >= 0) life.route = "road";
    else if (sceneId === "ill" || ["doctor", "home", "hold"].indexOf(key) >= 0) life.route = "body";
    else if (sceneId === "job" || sceneId === "shift") life.route = "work";
  }
  function legacyFx(id) {
    const map = {
      temperA: { learning: 8, note: "你把听到的话重复了很多遍。", risk: 0 },
      temperB: { bond: 8, happy: 4, note: "你把吃的分给了旁边的人。", risk: 0 },
      temperC: { health: 6, note: "你天亮就往门外走。", risk: 0 },
      hobbyA: { learning: 6, health: 3, note: "你有空就跟着会做事的人看。", risk: 0.95 },
      hobbyB: { bond: 6, happy: 4, note: "你爱听人讲，自己也讲。", risk: 0.95 },
      hobbyC: { learning: 2, health: -3, note: "你宁可一个人待着。", risk: 1.05 },
      reflect: { note: "这一岁你没写下来，人继续往前走。", risk: 1 },
      reflectMark: { bond: 3, note: "你在纪录里标上了这一岁。", risk: 1 },
      schoolGo: { learning: 10, school: true, edu: "高中在读", note: "你继续把书读下去。家里少了一个帮手。", risk: 1 },
      study: { learning: 8, note: "你去认字。出身没有因此改掉。", risk: 1 },
      home: { bond: 6, health: 2, note: "你留在家里。", risk: 0.94 },
      craft: { skill: 8, job: "手艺", jobMul: 1.12, note: "手艺深了一点。", risk: 1 },
      kin: { bond: 8, happy: 3, note: "你把时间花在人身上。", risk: 1 },
      body: { health: 8, note: "你这一年主要在养身子。", risk: 0.86 },
      leave: { move: 0.8, bond: -4, note: "你想离开。", risk: 1 },
      exam: { learning: 4, note: "你去应试。成与不成，出身都还在。", risk: 1 },
      marry: { marry: "家里定的人", bond: 6, note: "你成了家。", risk: 0.96 },
      wait: { bond: -1, note: "你先不成家。", risk: 1 },
      doctor: { health: 12, bond: -4, note: "你求了医。", risk: 0.75 },
      endure: { health: -4, note: "你选择硬扛。", risk: 1.12 },
      flee: { move: 0.55, bond: -3, note: "你往外走。", risk: 0.82 },
      hold: { bond: 6, health: -3, note: "你把粮留在家里。", risk: 1.2 },
      serve: { skill: 4, note: "你去当差。", risk: 1.48 },
      hide: { bond: -4, note: "你躲开了征发。", risk: 0.82 }
    };
    return map[id] || null;
  }
  function applyChoice(life, raw, rng, deps) {
    if (!life.alive) return;
    const id = String(raw);
    if (id.indexOf("focus:") === 0) {
      const f = id.slice(6);
      if (FOCI.some((x) => x.id === f)) life.focus = f;
      return;
    }
    if (id.indexOf("plan:") === 0) {
      applyPlan(life, id.slice(5), deps);
      return;
    }
    if (id === "auto") { applyAuto(life, rng, deps); return; }
    if (!life.done) life.done = {};
    if (id.indexOf("~") < 0) {
      const fx = legacyFx(id);
      if (!fx) { applyAuto(life, rng, deps); return; }
      const ctx = applyFx(life, rng, deps, fx);
      let note = fx.note;
      if (fx.move && ctx.movedFrom) note += "你离开" + ctx.movedFrom.ancient + "，到了" + life.place.ancient + "。";
      if (fx.move && !ctx.movedFrom) note += "这一年没有走成。";
      closeYear(life, rng, deps, { note: note, risk: fx.risk, choiceLabel: id, focus: id, moved: ctx.movedFrom });
      return;
    }
    const i1 = id.indexOf("~");
    const i2 = id.indexOf("~", i1 + 1);
    const sceneId = id.slice(0, i1);
    const key = i2 < 0 ? id.slice(i1 + 1) : id.slice(i1 + 1, i2);
    let extra = "";
    if (i2 >= 0) {
      try { extra = decodeURIComponent(id.slice(i2 + 1)); } catch (e) { extra = ""; }
      extra = extra.replace(/\s+/g, " ").slice(0, 40);
    }
    const scene = scenes.find((s) => s.id === sceneId);
    const built = scene && scene.test(life, deps) ? scene.make(life, deps) : null;
    const opt = built && built.options ? built.options.find((o) => o.key === key) : null;
    if (!opt || opt.disabled || (opt.fx && opt.fx.money < 0 && life.money < -opt.fx.money)) return;
    const before = M.snapshot(life);
    setRoute(life, sceneId, key);
    life.done[built.mark || scene.id] = true;
    const ctx = applyFx(life, rng, deps, opt.fx || {});
    let note = typeof opt.note === "function" ? opt.note(life, rng, deps, ctx) : (opt.note || "这一年你做了选择。");
    if (opt.fx && opt.fx.move && typeof opt.note !== "function") {
      note += ctx.movedFrom ? "你离开" + ctx.movedFrom.ancient + "，到了" + life.place.ancient + "。" : "人还在原地。";
    }
    if (extra) note += "你写下：" + extra + "。";
    M.normalizeEducation(life);
    let consequenceId = "";
    if (["school", "school2", "job", "shift", "move", "marry", "care", "war", "opportunity", "recovery"].includes(sceneId)) {
      const route = (sceneId === "school" || sceneId === "school2") ? (key === "go" ? "study" : key === "craft" ? "craft" : "kin") : sceneId === "marry" || sceneId === "care" ? "kin" : sceneId === "move" ? (ctx.movedFrom ? "road" : M.routeOf(life)) : M.routeOf(life);
      consequenceId = sceneId + ":" + life.age;
      life.memories.push({ id: consequenceId, label: opt.label, age: life.age, due: life.age + 2, route, focus: life.focus, done: false });
      note += "两年后会再看到这一步留下的回声。";
    }
    closeYear(life, rng, deps, {
      note: note, risk: opt.risk, choiceLabel: opt.label, focus: sceneId,
      before, choiceDelta: M.changes(before,M.snapshot(life)), decision: sceneId, consequenceId,
      moved: ctx.movedFrom, cite: opt.cite || "", help: opt.help || ""
    });
  }
  function peek(life, deps) {
    if (!life || !life.alive) return null;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.test(life, deps)) continue;
      const built = scene.make(life, deps);
      if (!built || !built.options || !built.options.length) continue;
      built.id = scene.id;
      built.options.forEach(o => {
        if(o.fx && o.fx.money < 0 && life.money < -o.fx.money) { o.disabled=true; o.stake=(o.stake || "") + " · 余资不足"; }
      });
      return built;
    }
    return null;
  }
  function autoOption(dec, life) {
    const bias = {
      work: { skill: 2, money: 1 },
      balance: { health: 1, bond: 1, learning: 1, happy: 1 },
      kin: { bond: 3, happy: 2 },
      body: { health: 3 },
      study: { learning: 3 },
      hobby: { happy: 3, skill: 1 }
    }[life.focus] || { bond: 1 };
    let best = dec.options[0];
    let score = -1e9;
    dec.options.filter(opt => !opt.disabled).forEach((opt) => {
      const fx = opt.fx || {};
      let s = 0;
      ["health", "happy", "learning", "bond", "skill"].forEach((k) => { s += (fx[k] || 0) * (bias[k] || 0.15); });
      const risk = opt.risk == null ? 1 : opt.risk;
      if (risk > 1.15) s -= 5;
      if (risk < 0.9) s += 2;
      if (fx.money && fx.money < 0 && life.money < 0) s -= 3;
      if (s > score) { score = s; best = opt; }
    });
    return best;
  }

  return {
    IDS: IDS, FOCI: FOCI, addScene: addScene, applyBirth: applyBirth, applyAuto: applyAuto,
    applyChoice: applyChoice, peek: peek, autoOption: autoOption, yuan: yuan, where: where,
    isWar: isWar, isFamine: isFamine, examEra: examEra, baseIncome: baseIncome,
    personName: personName, mulberry32: mulberry32, helpFor: helpFor,
    planningOptions: planningOptions, applyPlan: applyPlan, model: M
  };
});










(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.YikouModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const VERSION = "2";
  const ROUTES = {
    farm: ["耕作", "留住收成，也留住生活的根。"],
    craft: ["手艺", "把手上的本事，做成能立住的营生。"],
    trade: ["商贸", "多一份本钱，也多一份不确定。"],
    study: ["读书与文事", "把认得的字，变成下一扇门。"],
    soldier: ["军旅", "军役带来进项，也带来持续的风险。"],
    kin: ["家庭", "眼前少做一些，换来有人相互照应。"],
    road: ["迁徙谋生", "离开熟悉的地方，重新建立生活。"],
    body: ["休养", "先保全自己，不以一时的进项换身子。"]
  };
  const SOURCES = {
    ancient: { label: "中国国家博物馆 · 古代中国", url: "https://www.chnmuseum.cn/portals/0/web/zt/gudai/default.html" },
    anshi: { label: "故宫博物院 · 安禄山", url: "https://www.dpm.org.cn/lemmas/243350.html" },
    transition: { label: "故宫博物院 · 清廷迁都北京", url: "https://www.dpm.org.cn/court/event/159873.html" },
    resistance: { label: "国家档案局 · 卢沟桥事变", url: "https://www.saac.gov.cn/zt/2014-08/22/content_63601_2.htm" },
    famine: { label: "国家统计局 · 人口总量适度增长结构明显改善", url: "https://www.stats.gov.cn/zt_18555/ztfx/qzxzgcl60zn/202303/t20230301_1920384.html" },
    exam: { label: "教育部 · 恢复高考", url: "https://www.moe.gov.cn/jyb_xwfb/xw_zt/moe_357/s3580/moe_2448/moe_2450/moe_2451/tnull_39621.html" },
    wu: { label: "鄂州市政府 · 孙权登基大典纪念铜镜", url: "https://www.ezhou.gov.cn/zjez/ezrw/ezss/201501/t20150112_44655.html" }
  };
  const POLICY = "历史年份与机制分开：资料支持时代背景，不支持某个人的经历。出生权重为偏向古代的体验权重；寿命、收入、生育、职业成功率均为游戏模型，尚未接入逐年分地区生命表。主角六岁前免除死亡，同行者不享有此保护；2026年后的经历是虚构延展，不是联合国预测。金额为游戏资源点，不是历史货币或经验证的PPP换算。";
  function yearAt(birth, age) {
    const y = birth + age;
    return birth < 0 && y >= 0 ? y + 1 : y;
  }
  function snapshot(life) {
    const out = {};
    ["health", "happy", "learning", "skill", "bond", "money", "job", "edu", "inSchool"].forEach(k => { out[k] = life[k]; });
    out.place = life.place.ancient;
    return out;
  }
  function changes(before, after) {
    const d = {};
    ["health", "happy", "learning", "skill", "bond", "money"].forEach(k => {
      const n = Math.round((after[k] || 0) - (before[k] || 0));
      if (n) d[k] = n;
    });
    return d;
  }
  function deltaText(d) {
    const labels = { health: "健康", happy: "幸福", learning: "知识", skill: "手艺", bond: "人际", money: "余资" };
    return Object.keys(labels).filter(k => d && d[k]).map(k => labels[k] + (d[k] > 0 ? "+" : "") + d[k]).join(" · ");
  }
  function jobRoute(job) {
    if (/兵|军|当差|征|徭役/.test(job)) return "soldier";
    if (/商|贩|买卖|个体/.test(job)) return "trade";
    if (/匠|手艺|工坊|师傅/.test(job)) return "craft";
    if (/书|账|职员|公职|文|教/.test(job)) return "study";
    if (/农|种地|社员/.test(job)) return "farm";
    if (/外出|进城/.test(job)) return "road";
    return "";
  }
  function routeOf(life) {
    return life.careerRoute || jobRoute(life.job || "") || life.route || ({ study: "study", kin: "kin", body: "body", hobby: "craft" }[life.focus]) || "farm";
  }
  function normalizeEducation(life) {
    if (life.jobStarted && life.inSchool) life.inSchool = false;
    if (!life.inSchool && /^(在学|复读|大学在读|小学在读|初中在读|高中在读)$/.test(life.edu)) {
      if (life.edu === "大学在读") life.edu = "大学肄业";
      else if (life.birthYear >= 1905) life.edu = life.age <= 11 ? "小学阶段，已离校" : life.age <= 14 ? "初中阶段，已离校" : "高中阶段，已离校";
      else life.edu = "读过书，已离校";
    }
    if (life.inSchool && life.educationUntil != null && life.age >= life.educationUntil) {
      life.inSchool = false;
      life.edu = life.edu === "大学在读" ? "大学毕业" : "结束学业";
    }
  }
  // Modern education is shown with the school stages players actually recognize;
  // old-era records keep their period-appropriate wording instead of borrowing
  // today's school system.
  function educationStage(life) {
    if (!life) return "未留下学历";
    const year = yearAt(life.birthYear, life.age);
    const edu = String(life.edu || "");
    if (year < 1905) return edu || (life.inSchool ? "跟读中" : "未入学");
    if (/大学毕业/.test(edu)) return "大学毕业";
    if (/大学肄业/.test(edu)) return "大学肄业";
    if (/大学在读/.test(edu)) return "大学在读";
    if (/录取/.test(life.rank || "")) return life.inSchool ? "大学在读" : "大学";
    if (/复读/.test(edu)) return "高中毕业后复读";
    if (!life.inSchool) {
      if (/中学毕业|结束学业/.test(edu)) return life.age >= 15 ? "高中毕业" : "初中毕业";
      if (/读过书/.test(edu)) return life.age >= 15 ? "高中阶段，已离校" : "初中阶段，已离校";
      return edu || "未入学";
    }
    if (life.age <= 11) return "小学在读";
    if (life.age <= 14) return "初中在读";
    if (life.age <= 17) return "高中在读";
    return "高中毕业后继续求学";
  }
  // Regions and multipliers below are deliberately coarse gameplay assumptions, not estimated causal effects.
  function world(life) {
    const y = yearAt(life.birthYear, life.age), p = life.place.modern || "";
    const w = { key: "", title: "", text: "", income: 1, risk: 1, health: 0, study: 1, war: false, source: null };
    const set = (key, title, text, income, risk, health, study, war, source) => Object.assign(w, { key, title, text, income, risk, health, study, war, source: SOURCES[source] });
    const north = /河南|陕西|河北|山西|北京|山东/.test(p);
    const south = /江苏|浙江|湖北|湖南|江西|安徽|福建|广东/.test(p);
    const coast = /上海|江苏|浙江|福建|广东|天津|山东/.test(p);
    if (y >= -206 && y <= -202) {
      set("chuhan-war", "楚汉相争", "模型把这几年的征发和粮道中断算进营生：进项下降，出门的风险上升。", .75, 1.28, -1, .7, true, "ancient");
    } else if (y >= 184 && y <= 205 && /河南|河北|山东|湖北/.test(p)) {
      set("yellow-turban", "黄巾前后的战乱", "这一带的集市和徭役都受战乱影响。不是写成你亲历某一场战斗。", .78, 1.25, -1, .75, true, "ancient");
    } else if (y >= 220 && y <= 279) {
      const exposed = /湖北|河南|陕西|四川|江苏|安徽/.test(p);
      set("sanguo", "三国之间", exposed ? "模型将这一带设为军粮与交通易受影响区；营生收缩，出门多一层风险。" : "远离模型的主要军粮通道，仍可能受到征发与贸易中断影响。", exposed ? .82 : .94, exposed ? 1.22 : 1.06, 0, .8, exposed, "ancient");
    } else if (y >= 311 && y <= 316 && north) {
      set("yongjia", "永嘉前后", "北方的秩序松了。模型把迁徙和征发放进收入与风险，不写成某个家族的逃难路线。", .72, 1.32, -1, .6, true, "ancient");
    } else if (y >= 755 && y <= 763 && north) {
      set("anshi", "安史之乱期间", "这一带的往来与生计受到战乱冲击。收入与学习效率下降，可考虑迁居。", .68, 1.4, -1, .55, true, "anshi");
    } else if (y >= 860 && y <= 884 && /河南|山东|安徽|江苏|浙江/.test(p)) {
      set("huangchao", "唐末兵乱", "兵乱沿运河和中原扩散。粮价和路途比年号先变。", .74, 1.3, -1, .65, true, "ancient");
    } else if (y >= 1126 && y <= 1130 && (north || /湖北|江苏|安徽/.test(p))) {
      set("jingkang-shock", "靖康之变前后", "北方失守后的几年，模型降低收入、提高迁徙压力。不等于你一定南渡。", .7, 1.34, -1, .6, true, "ancient");
    } else if (y >= 1274 && y <= 1279 && south) {
      set("song-yuan", "宋元交替", "江南的战事和改籍同时发生。营生先紧，学堂也断一阵。", .76, 1.24, -1, .7, true, "ancient");
    } else if (y >= 1351 && y <= 1367 && south) {
      set("yuan-end", "元末兵乱", "江南和江淮的路与粮都不稳。模型只调整风险和收入。", .73, 1.28, -1, .7, true, "ancient");
    } else if (y >= 1644 && y <= 1646 && (north || /江苏|浙江/.test(p))) {
      set("transition", "明清鼎革", "政权更换的几年，旧营生受挫，家里需要多留余资。", .74, 1.26, -1, .68, true, "transition");
    } else if (y >= 1673 && y <= 1681 && /云南|贵州|湖南|四川|福建|广东|广西|江西/.test(p)) {
      set("sanfan", "三藩之乱期间", "西南和东南的军需压到地方。进项下降，不是写成你参加了某一次战役。", .78, 1.22, 0, .8, true, "ancient");
    } else if (y >= 1851 && y <= 1864 && south) {
      set("taiping", "太平天国期间", "南方战乱影响到粮价、征发和去留。模型不描写战斗场面。", .66, 1.42, -2, .55, true, "ancient");
    } else if (y >= 1840 && y <= 1842 && coast) {
      set("opium", "第一次鸦片战争期间", "口岸的贸易和差事受影响。内地下调得少，不等于人人看见炮火。", .84, 1.12, 0, .9, true, "ancient");
    } else if (y >= 1937 && y <= 1945) {
      const exposed = /北京|上海|江苏|湖北|山西|河南|浙江|湖南|重庆/.test(p);
      set("resistance", "全面抗战期间", exposed ? "模型把这一带的战时生计冲击设得更强；这不表示角色亲历某场战役。" : "这里并非模型中的主要受冲击区，但战时运输和谋生仍受影响。", exposed ? .65 : .88, exposed ? 1.5 : 1.12, exposed ? -2 : 0, exposed ? .5 : .85, true, "resistance");
    } else if (y >= 1959 && y <= 1961) {
      const rural = /农|农村|佃/.test(life.stratum + life.job);
      set("famine", "粮食紧缺的年份", "吃食和生活资源变紧。此前储备与家人照料能够缓冲，但不能抵消时代的影响。", rural ? .58 : .75, rural ? 1.7 : 1.3, rural ? -4 : -2, .65, false, "famine");
    } else if (y >= 1977 && y <= 1979) {
      set("exam-return", "高考恢复以后", "新的求学机会出现。已积累知识的人，可以在谋生与备考之间再作选择。", 1, 1, 0, 1.15, false, "exam");
    }
    return w;
  }
  function summary(life) {
    const rows = life.rows || [], last = rows[rows.length - 1];
    const choices = rows.filter(r => r.decision && r.decision !== "reflect");
    const scored = choices.map(row => ({ row, score: Object.values(row.choiceDelta || {}).reduce((s, n) => s + Math.min(12, Math.abs(n)), 0) + (row.moved ? 20 : 0) + (row.jobChanged ? 15 : 0) + (row.consequenceId ? 8 : 0) })).sort((a, b) => b.score - a.score || a.row.age - b.row.age);
    const counts = {}, routeCounts = {}, places = [], eras = [];
    rows.forEach(r => {
      if (r.age >= 18) {
        counts[r.annualFocus] = (counts[r.annualFocus] || 0) + 1;
        if (r.path) routeCounts[r.path] = (routeCounts[r.path] || 0) + 1;
      }
      if (!places.some(p => p.modern === r.place.modern)) places.push(r.place);
      if (r.period && !eras.includes(r.period.name)) eras.push(r.period.name);
    });
    const route = Object.keys(routeCounts).sort((a, b) => routeCounts[b] - routeCounts[a])[0];
    const happy = rows.filter(r => r.meters).reduce((best, r) => !best || r.meters.happy > best.meters.happy ? r : best, null);
    const echoes = [
      ...(life.memories || []).filter(m => m.done).map(m => Object.assign({ type: "choice" }, m)),
      ...(life.plans || []).filter(p => p.done).map(p => Object.assign({ type: "plan" }, p))
    ].sort((a, b) => (a.resultAge || a.age || 0) - (b.resultAge || b.age || 0));
    return { last, years: last ? last.age : 0, choices, highlights: scored.slice(0, 3).map(s => s.row), route, routeCounts, focusCounts: counts, mainFocus: Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0], happy, places, eras, children: life.childrenList || [], pending: (life.plans || []).filter(p => !p.done), echoes };
  }
  return { VERSION, ROUTES, SOURCES, POLICY, yearAt, snapshot, changes, deltaText, jobRoute, routeOf, normalizeEducation, educationStage, world, summary };
});

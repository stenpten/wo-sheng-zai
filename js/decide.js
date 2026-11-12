(function () {
  const T = typeof module !== "undefined" && module.exports ? require("./turns.js") : globalThis.YikouTurns;

  function opt(key, label, stake, fx, note, risk) {
    const o = { key: key, label: label, stake: stake, fx: fx || {}, note: note };
    if (risk != null) o.risk = risk;
    return o;
  }
  function yearOf(life) { return T.model.yearAt(life.birthYear, life.age); }
  function periodOf(life, deps) { return deps.periodOf(yearOf(life)); }
  function costOf(life, year, frac) {
    const base = T.baseIncome(year, life.stratum) * (0.42 + (life.wealthRank || 40) / 95);
    return Math.round(Math.max(60, base * frac));
  }
  function suitor(life) {
    const rng = T.mulberry32((life.seed ^ 0x51ed) >>> 0);
    const sex = life.sex === "男" ? "女" : "男";
    const year = life.birthYear;
    const jobs = year >= 1980
      ? ["种地", "进厂", "做小买卖", "在单位做事", "在家"]
      : year >= 1949 ? ["种地", "做工", "当兵", "在社里办事"]
      : ["种地", "做手艺", "小买卖", "在衙门帮闲", "在家纺织"];
    return {
      name: T.personName(rng, sex, year),
      sex: sex,
      gap: (sex === "男" ? 2 : -1) + Math.floor(rng() * 5),
      job: jobs[Math.floor(rng() * jobs.length)],
      purse: Math.round(T.baseIncome(year, life.stratum) * (0.3 + rng()))
    };
  }
  function marryAge(life) {
    const late = life.birthYear >= 1990 ? 8 : life.birthYear >= 1980 ? 6 : life.birthYear >= 1950 ? 3 : 0;
    const base = life.sex === "女" ? 17 : 19;
    return base + late + (life.seed % 4);
  }
  function schoolWindow(life) {
    const start = life.birthYear >= 1949 ? 7 : 8;
    return life.age >= start && life.age <= start + 2 && !life.done.school && !life.inSchool;
  }

  T.addScene({
    id: "famine",
    test: function (life) { return T.isFamine(yearOf(life)) && life.age >= 8 && !life.done.famine; },
    make: function (life) {
      const w = T.where(life);
      return {
        mark: "famine",
        kicker: yearOf(life) + "年 · 要你定",
        title: "这一年粮比前后紧",
        body: "人在" + w + "。这一年的口粮，先给谁。",
        cite: "1959到1961年，不少地方死亡率高于前后。这里只改这一年的风险。",
        options: [
          opt("share", "口粮先给家里", "人际↑ 自己的风险↑", { bond: 6, health: -4 }, "你把口粮先留给家里。这一年你自己更险。", 1.28),
          opt("self", "自己先吃上", "健康略↑ 人际↓", { health: 2, bond: -6, happy: -2 }, "你先把自己的那口保住。家里会记得。", 0.9),
          opt("leave", "往外找粮", "可能换地方 风险略↓", { move: 0.6, bond: -3 }, "你往外找粮。", 0.84)
        ]
      };
    }
  });

  T.addScene({
    id: "war",
    test: function (life, deps) {
      const year = yearOf(life);
      return life.age >= 16 && !life.done.war && T.model.world(life).war;
    },
    make: function (life, deps) {
      const year = yearOf(life);
      const period = periodOf(life, deps);
      let title = "有人来拉当差";
      let cite = "战乱年的风险更高。";
      if (year >= 1937 && year <= 1945) { title = "仗打到这一带"; cite = "1937到1945年。这里只改风险，不写战场。"; }
      else if (year >= 1851 && year <= 1864) { title = "有人来拉人"; cite = "1851到1864年。不是每个人都在战场上。"; }
      else if (period.id === "sanguo") { title = "州里来要人"; cite = "只改这一年的风险。"; }
      return {
        mark: "war",
        kicker: life.age + "岁 · 要你定",
        title: title,
        body: "人在" + T.where(life) + "。去或不去，都不保证能回来。",
        cite: cite,
        options: [
          opt("serve", "去当差", "死亡风险明显↑ 见识↑", { skill: 5, bond: -2, job: "当差", jobMul: 1.05, volatile: false }, "你去当差。能不能回来，不由这句话决定。", 1.55),
          opt("hide", "躲开征发", "风险↓ 人际↓", { bond: -5 }, "你躲开了。险小一点，地方上会记得。", 0.8),
          opt("flee", "带着能带的人往外走", "可能换地方", { move: 0.62, bond: -2 }, "你选择离开。", 0.9)
        ]
      };
    }
  });

  T.addScene({
    id: "ill",
    test: function (life) {
      if (life.age < 12 || life.health >= 50) return false;
      if (life.age % 7 !== (life.seed % 7)) return false;
      return !life.done["ill" + life.age];
    },
    make: function (life) {
      const year = yearOf(life);
      const cost = costOf(life, year, year >= 1980 ? 0.28 : 0.45);
      return {
        mark: "ill" + life.age,
        kicker: life.age + "岁 · 要你定",
        title: "这个病现在治不治",
        body: "人在" + T.where(life) + "。去看，大约要花 " + T.yuan(cost) + " 点余资。不看，险留在自己身上。",
        cite: "看病的花费按时代粗算：越早越靠自己掏。这不是某一年的账单。",
        options: [
          opt("doc", "现在去看", "健康↑ 死亡风险↓ 余钱↓", { health: 14, bond: -3, money: -cost }, "你去找人看了，大约花掉 " + T.yuan(cost) + " 点余资。身子缓一点，余钱薄了。", 0.72),
          opt("home", "在家养", "花费少 好得慢", { health: 4, bond: 1 }, "你在家里养。花费少，好得慢。", 0.9),
          opt("hold", "先扛着", "健康↓ 死亡风险↑", { health: -6 }, "你先不去治。钱省下了，险留在身上。", 1.22)
        ]
      };
    }
  });

  T.addScene({
    id: "reflect",
    test: function (life) {
      if (!life.done.temper && life.age <= 6) return false;
      return [5, 15, 30, 50, 70].some(function (a) { return life.age >= a && !life.done["r" + a]; });
    },
    make: function (life, deps) {
      const age = [5, 15, 30, 50, 70].find(function (a) { return life.age >= a && !life.done["r" + a]; });
      const year = yearOf(life);
      const period = periodOf(life, deps);
      let fact = "按这一档预期寿命，日子长短仍看这一年的风险，不看愿望。";
      if (age === 5 && deps.hazard) {
        let survive = 1;
        for (let i = 0; i < 5; i++) survive *= 1 - deps.hazard(i, year, period, 55);
        fact = "按这一时代的估计，大约 " + Math.round((1 - survive) * 1000) / 10 + "% 的孩子过不了五岁。";
      } else if (age === 15) fact = "十五岁以前的路主要还是家里的，识字和手艺从这里才开始分叉。";
      else if (age === 30) fact = "三十岁这一档，营生和成家通常已经绑在一起。改重心改得动后面，改不掉出身。";
      else if (age === 50) fact = "五十岁之后，健康的权重比新的出路更大。";
      else if (age === 70) fact = "这一时代的预期寿命约 " + (life.e0 || "未知") + " 岁（估）。走到这里，已经比模型里的多数人更远。";
      return {
        mark: "r" + age,
        reflect: true,
        kicker: age + "岁 · 停一下",
        title: "这一岁，先看这一代人",
        body: "人在" + T.where(life) + "。" + fact + "可以留下一句，也可以什么都不写。",
        cite: "",
        options: [
          opt("mark", "把这句话收进纪录", "不改数字", {}, "你在这一岁停下，写了一句。", 1),
          opt("skip", "什么都不写，继续", "不改数字", {}, "这一岁你没写下来，人继续往前。", 1)
        ]
      };
    }
  });

  T.addScene({
    id: "temper",
    test: function (life) { return life.age >= 4 && life.age <= 6 && !life.done.temper; },
    make: function (life) {
      const n = life.seed % 3;
      const w = T.where(life);
      if (n === 1) {
        return {
          mark: "temper",
          kicker: "4岁 · 要你定",
          title: "大人叫你的时候",
          body: "人在" + w + "。这一下只是偏向，不会改掉你是谁家的孩子。",
          options: [
            opt("listen", "跟着把话说完", "知识↑", { learning: 6 }, "你跟着大人把话说完。", 0),
            opt("hide", "躲到熟悉的人身边", "人际↑", { bond: 6, happy: 2, bent: "kin" }, "你躲到熟悉的人身边。", 0),
            opt("stay", "不肯过去", "自己待着 幸福略↓", { learning: 2, happy: -2, bond: -1 }, "你不肯过去，自己待着。", 0)
          ]
        };
      }
      if (n === 2) {
        return {
          mark: "temper",
          kicker: "4岁 · 要你定",
          title: "只有一碗的时候",
          body: "人在" + w + "。让给谁，改不了这个家的底子。",
          options: [
            opt("give", "让给更小的", "人际↑ 健康略↓", { bond: 7, health: -2, happy: 2 }, "你把那口让给更小的。", 0),
            opt("eat", "自己吃完", "健康↑ 人际↓", { health: 4, bond: -4 }, "你自己吃完了。", 0),
            opt("keep", "留到下一顿", "数字几乎不动", { happy: 1 }, "你把那口留到下一顿。", 0)
          ]
        };
      }
      return {
        mark: "temper",
        kicker: "4岁 · 要你定",
        title: "手里多了一件东西",
        body: "人在" + w + "。这一下只是偏向，不会改掉你是谁家的孩子。",
        options: [
          opt("look", "翻来覆去看它怎么动", "知识↑", { learning: 7, bent: "word" }, "你把那样东西翻来覆去看了很久。", 0),
          opt("share", "分给旁边的孩子", "人际↑ 幸福↑", { bond: 7, happy: 4 }, "你把东西分给旁边的孩子。", 0),
          opt("run", "拿着往门外跑", "健康↑", { health: 6 }, "你拿着它往门外跑。", 0)
        ]
      };
    }
  });

  T.addScene({
    id: "school",
    test: function (life) { return schoolWindow(life); },
    make: function (life, deps) {
      const year = yearOf(life);
      const period = periodOf(life, deps);
      const w = T.where(life);
      let title = "家里要不要送你去识字";
      let cite = "能把书读完的，在旧时是少数。模型按这个量级收窄，不是学籍档案。";
      let go = "去识字";
      if (year >= 1993) { title = "要不要继续升学"; go = life.age <= 11 ? "读小学" : life.age <= 14 ? "读初中" : life.age <= 17 ? "读高中" : "继续升学"; cite = "近现代教育按小学、初中、高中、大学等阶段表达；是否读完仍看家庭与机会。"; }
      else if (year >= 1978) { title = "学还上不上"; go = life.age <= 11 ? "继续读小学" : life.age <= 14 ? "继续读初中" : life.age <= 17 ? "继续读高中" : "继续上学"; cite = "入学比以前普遍，能不能读完仍看家里。"; }
      else if (year >= 1949) { title = "村里有了学堂"; go = life.age <= 11 ? "去小学" : life.age <= 14 ? "去初中" : "去中学"; cite = "近现代教育阶段按当时可理解的学校层级表达，学堂有了不等于每个人都能读完。"; }
      else if (year >= 1905) { title = "新式学堂开到这一带"; go = life.age <= 11 ? "去初等小学堂" : life.age <= 14 ? "去初级中学堂" : "去高等学堂"; cite = "1905年科举停了。新式学堂是另一条路，仍然不是人人都进得去。"; }
      else if (T.examEra(period, year)) { title = "有人愿意教你认字"; go = "跟着认字"; }
      const clerk = /吏|士|干部/.test(life.stratum);
      const options = [
        opt("go", go, "知识↑ 家里少一个帮手", { learning: clerk ? 14 : 9, bond: -2, school: true, edu: life.age <= 11 ? "小学在读" : life.age <= 14 ? "初中在读" : "高中在读" }, clerk ? "你去读书。家里本来就有人识字，这条路比别家宽一点，也还不是稳的。" : "你去识字。家里少了一个帮手，能不能读下去还不一定。", 1),
        opt("craft", year >= 1949 ? "先去学做事" : "改去学手艺", "手艺↑ 书先停", { skill: 8, school: false, edu: "未入学", job: life.age >= 16 ? "手艺" : life.job, jobMul: life.age >= 16 ? 1.1 : life.jobMul }, "你没有把时间放在书上，手艺先接上。", 1),
        opt("home", "留在家里干活", "人际↑ 知识停住", { bond: 5, school: false, edu: "未入学" }, "你留在家里。口粮和人都还在原处，字没有因此多起来。", 0.96)
      ];
      if (year < 1905 && clerk) {
        options[0] = opt("go", "去学吏事和写字", "知识↑ 仍看门第", { learning: 16, bond: -1, school: true, edu: life.age <= 11 ? "小学在读" : life.age <= 14 ? "初中在读" : "高中在读", literate: true }, "你去学写字和吏事。门第还在，路只宽了一点。", 1);
      }
      return { mark: "school", kicker: life.age + "岁 · 要你定", title: title, body: "人在" + w + "。选读书会抬知识，抬不掉出身。", cite: cite, options: options };
    }
  });

  T.addScene({
    id: "hobby",
    test: function (life) { return life.age >= 9 && life.age <= 11 && !life.done.hobby; },
    make: function (life) {
      const n = life.seed % 3;
      const w = T.where(life);
      const common = { mark: "hobby", kicker: life.age + "岁 · 要你定", body: "人在" + w + "。喜欢的事会跟着你，不会替你改掉出身。", cite: "" };
      if (n === 1) {
        common.title = "你开始迷上一件事";
        common.options = [
          opt("sing", "爱听人唱，自己也唱", "幸福↑ 人际↑", { happy: 6, bond: 4, bent: "sing" }, "你爱听人唱，自己也唱。", 0),
          opt("make", "爱看东西怎么做出来", "手艺↑ 知识↑", { skill: 6, learning: 3, bent: "make" }, "你爱看东西是怎么做出来的。", 0),
          opt("alone", "宁可一个人待着", "幸福略↑ 人际↓", { happy: 2, bond: -3, learning: 2, bent: "alone" }, "你宁可一个人待着。", 0)
        ];
      } else if (n === 2) {
        common.title = "空下来你往哪里钻";
        common.options = [
          opt("out", "往田埂和河边跑", "健康↑", { health: 6, happy: 3, bent: "out" }, "空下来你就往外跑。", 0),
          opt("word", "缠着识字的人问", "知识↑", { learning: 7, bent: "word" }, "你缠着识字的人问个不停。", 0),
          opt("kin", "跟在大人身边听", "人际↑", { bond: 6, happy: 2, bent: "kin" }, "你跟在大人身边听。", 0)
        ];
      } else {
        common.title = "有人肯让你跟着看";
        common.options = [
          opt("craft", "跟着会做手艺的人看", "手艺↑ 知识↑", { skill: 7, learning: 3, bent: "craft" }, "你跟着会做手艺的人看。", 0),
          opt("talk", "爱听街坊说话", "人际↑ 幸福↑", { bond: 5, happy: 4, bent: "talk" }, "你爱听街坊说话，自己也插一句。", 0),
          opt("book", "有字的东西就不放手", "知识↑ 健康略↓", { learning: 8, health: -1, bent: "book" }, "有字的东西你就不放手。", 0)
        ];
      }
      return common;
    }
  });

  T.addScene({
    id: "school2",
    test: function (life) { return life.inSchool && life.age >= 13 && life.age <= 15 && !life.done.school2; },
    make: function (life) {
      const year = yearOf(life);
      const goLabel = year >= 1949 ? "继续读下去" : "把书再读一阵";
      return {
        mark: "school2",
        kicker: life.age + "岁 · 要你定",
        title: "书还读不读",
        body: "人在" + T.where(life) + "。再读，家里少一个帮手。停下来，手艺或田里的活会接上。",
        cite: "读不读得完，看家里的余粮和这一年的身子，不看愿望。",
        options: [
          opt("go", goLabel, "知识↑ 家里更紧", { learning: 10, bond: -2, edu: life.age <= 14 ? "初中在读" : "高中在读" }, "你把书继续读下去。家里少了一个帮手。", 1),
          opt("craft", "停学，去学手艺", "手艺↑ 知识停住", { skill: 8, school: false, edu: "停学", jobMul: 1.08 }, "你放下书，改去学手艺。", 1),
          opt("home", "回家把活接上", "人际↑", { bond: 6, school: false, edu: "停学" }, "你回家把活接上。字还认得一些，路窄了。", 0.97)
        ]
      };
    }
  });

  T.addScene({
    id: "exam",
    test: function (life, deps) {
      const year = yearOf(life);
      const period = periodOf(life, deps);
      if (life.done.exam) return false;
      if (year < 1905 && life.sex !== "男") return false;
      if (life.age < 17 || life.age > 20) return false;
      if (life.learning < 24 && !life.literate) return false;
      if (year >= 1977 && (life.inSchool || life.learning >= 28)) return true;
      return T.examEra(period, year);
    },
    make: function (life) {
      const year = yearOf(life);
      if (year >= 1977) {
        return {
          mark: "exam",
          kicker: life.age + "岁 · 要你定",
          title: "要不要去考学",
          body: "人在" + T.where(life) + "。考上的是少数。考不上，活还得找。",
          cite: "恢复高考的头几年，几十个人里才取一个。这是量级，不是你这张卷子的分数。",
          options: [
            opt("try", "去考", "知识↑ 录取仍很小", { learning: 4 }, function (life, rng) {
              const p = 0.05 + life.learning / 280;
              if (rng() < p) {
                life.edu = "大学在读";
                life.inSchool = true;
                life.jobStarted = false;
                life.educationUntil = life.age + 4;
                life.learning = Math.min(100, life.learning + 8);
                life.rank = "录取";
                return "你考上了。不是人人都有的结果，路仍从原来的家里出发。";
              }
              life.inSchool = false;
              if (life.edu === "在学") life.edu = "中学毕业";
              return "你没考上。家里供不起再读一年的话，就得去找活。";
            }, 1),
            opt("work", "不考，直接找活", "进项先有 知识停住", { school: false, edu: "不再升学", job: "找活", jobMul: 1 }, "你不去考，开始找活。", 1),
            opt("again", "再读一年", "知识↑ 进项再等", { learning: 6, school: true, edu: "复读" }, "你再读一年。录取仍然小。", 1)
          ]
        };
      }
      return {
        mark: "exam",
        kicker: life.age + "岁 · 要你定",
        title: "这一科要不要去应",
        body: "人在" + T.where(life) + "。去试，只有很小的机会多一条窄路。不去，手艺和田还在。",
        cite: "旧时能进学的是少数。模型把这条路收得很窄。",
        options: [
          opt("try", "去应试", "知识略↑ 多半仍在原地", { learning: 3 }, function (life, rng) {
            const p = 0.035 + life.learning / 420;
            if (rng() < p) {
              life.rank = "进学";
              life.edu = "进学";
              life.bond = Math.min(100, life.bond + 2);
              return "你的名字被写下了。不是高官，只是比同乡多一条窄路。";
            }
            return "试考完了，人还在原地。识字还在，出身没动。";
          }, 1),
          opt("craft", "不考，把手艺做深", "手艺↑", { skill: 7, school: false, edu: "弃考" }, "你不去应试，手艺还在。", 1),
          opt("home", "不考，回家", "人际↑", { bond: 4, school: false }, "你回家。那条窄路先关上。", 0.98)
        ]
      };
    }
  });

  T.addScene({
    id: "job",
    test: function (life) {
      if (life.jobStarted || life.done.job) return false;
      const late = life.inSchool || life.edu === "大学在读" || life.edu === "复读";
      const start = life.inSchool && life.educationUntil ? life.educationUntil : late ? 21 : 16;
      return life.age >= start;
    },
    make: function (life, deps) {
      const year = yearOf(life);
      const period = periodOf(life, deps);
      const place = life.place.ancient;
      const literate = life.literate || life.learning >= 30;
      let options;
      if (year >= 2000) {
        options = [
          opt("farm", "留在" + place + "打零工", "稳 进项少", { job: "零工", jobMul: 0.86, volatile: false, health: 1 }, "你留在本地打零工。稳，也难离开这个出身。", 0.96),
          opt("city", "进城找活", "进项↑ 人际先薄 可能换地方", { job: "进城务工", jobMul: 1.42, volatile: false, move: 0.78, bond: -4 }, "你进城找活。", 1.02),
          opt("trade", "自己做点买卖", "进项起伏大", { job: "小买卖", jobMul: 1.25, volatile: true, bond: -1 }, "你做买卖。好的年头和差的年头差得远。", 1),
          opt("desk", literate ? "去坐办公室" : "先补识字再找坐着的活", literate ? "要识字 进项中等 风险略↓" : "知识↑ 进项先慢", literate
            ? { job: "职员", jobMul: 1.3, volatile: false, learning: 2 }
            : { job: "见习", jobMul: 0.95, learning: 6, volatile: false }, literate ? "你去做文书一类的活。人不如种地自由。" : "你先把字补上，坐着的活还不一定有。", 0.94)
        ];
      } else if (year >= 1980) {
        options = [
          opt("farm", "留在村里", "稳 进项少", { job: "农活", jobMul: 0.84, health: 1, volatile: false }, "你留在村里。稳，出身还在。", 0.95),
          opt("factory", "进厂", "进项↑ 健康↓", { job: "工人", jobMul: 1.32, health: -3, volatile: false }, "你进厂。钱比地里稳一点，身子更累。", 1.04),
          opt("trade", "做买卖", "起伏大", { job: "个体", jobMul: 1.28, volatile: true }, "你做买卖。成的时候钱多，败的时候先失人情。", 1),
          opt("out", "出门找活", "可能换地方 进项↑", { job: "外出做工", jobMul: 1.36, move: 0.7, bond: -3, volatile: false }, "你出门找活。", 1.02)
        ];
      } else if (year >= 1949) {
        options = [
          opt("farm", "在村里干活", "稳", { job: "社员", jobMul: 0.9, health: 1, volatile: false }, "你在村里干活。", 0.94),
          opt("factory", "想办法进厂", "进项↑ 名额少", { job: "工人", jobMul: 1.22, health: -2, volatile: false }, "在这次模型推演中，你找到了一份厂里的工作。", 1.02),
          opt("army", "去当兵", "死亡风险↑", { job: "士兵", jobMul: 1.05, skill: 4, volatile: false }, "你去当兵。", 1.28),
          opt("desk", literate ? "争取留在公家单位" : "继续下地", literate ? "要识字 风险略↓" : "稳", literate
            ? { job: "公职", jobMul: 1.25, learning: 2, volatile: false }
            : { job: "农活", jobMul: 0.88, volatile: false }, literate ? "你留在公家单位。识字派上用场，人却不自由。" : "字不够，你还是下地。", literate ? 0.92 : 0.96)
        ];
      } else if (T.examEra(period, year) || period.id === "qing") {
        options = [
          opt("farm", "接着种" + place + "的地", "稳 难改出身", { job: "种地", jobMul: 0.88, health: 1, volatile: false }, "你接着种地。稳，也难离开这个出身。", 0.95),
          opt("craft", "靠手艺吃饭", "手艺↑ 进项看手", { job: "手艺", jobMul: 1.16, skill: 6, volatile: false }, "你靠手艺吃饭。收入看手，不看门第。", 1),
          opt("trade", "去做买卖", "起伏大 人际不稳", { job: "商贩", jobMul: 1.22, volatile: true, bond: -1 }, "你去做买卖。", 1.04),
          opt("clerk", literate ? "去给衙门或铺子管账" : "去应徭役", literate ? "知识↑ 人较不自由" : "死亡风险↑", literate
            ? { job: "书手", jobMul: 1.18, learning: 3, bond: -2, volatile: false }
            : { job: "徭役", jobMul: 0.8, skill: 2, volatile: false }, literate ? "你去管账。识字有用，人却不自由。" : "你去应徭役。", literate ? 0.96 : 1.24)
        ];
      } else {
        options = [
          opt("farm", "守在" + place + "种地", "稳", { job: "种地", jobMul: 0.86, health: 1, volatile: false }, "你守在本地种地。", 0.95),
          opt("craft", "学一门手艺", "手艺↑", { job: "匠人", jobMul: 1.12, skill: 7, volatile: false }, "你学手艺。", 1),
          opt("levy", period.id === "sanguo" ? "去当兵" : "去应征", "死亡风险↑", { job: "兵役", jobMul: 0.9, skill: 4, volatile: false }, "你去应征。", 1.36),
          opt("trade", "做点小买卖", "起伏大", { job: "小贩", jobMul: 1.15, volatile: true }, "你做小买卖。", 1.05)
        ];
      }
      return {
        mark: "job",
        kicker: life.age + "岁 · 要你定",
        title: "靠什么吃饭",
        body: "人在" + T.where(life) + "。选得越稳，越难离开出身；选得越险，起伏越大。出身仍是底子。",
        cite: "进项按出身拉开，营生只能挪一点。金额是游戏资源点，不是历史货币或PPP换算。",
        options: options
      };
    }
  });

  T.addScene({
    id: "marry",
    test: function (life) {
      if (life.married || life.done.marry || life.courting) return false;
      const a = marryAge(life);
      return life.age >= a && life.age <= a + 3;
    },
    make: function (life) {
      const s = suitor(life);
      const age = Math.max(16, life.age + s.gap);
      return {
        mark: "marry",
        kicker: life.age + "岁 · 要你定",
        title: "有人来提亲",
        body: s.name + "，" + age + "岁，" + s.job + "。人在" + life.place.ancient + "一带。对方家里的余钱大约 " + T.yuan(s.purse) + " 点余资。成亲会占掉出门和读书的空档。",
        cite: "婚龄按时代后移：越晚的年月，这一题来得越迟。十六岁以前不在这里问。",
        options: [
          opt("yes", "成亲", "人际↑ 幸福↑ 出门先放下", { marry: s.name, bond: 8, happy: 5 }, "你和" + s.name + "成了亲。出门的念头先放下。", 0.97),
          opt("court", "先往来，不定亲", "暂缓 幸福略↑", { court: s.name, happy: 2, bond: 2 }, "你先和" + s.name + "往来，亲事没有定。", 1),
          opt("no", "回绝", "路还在 家里不高兴", { bond: -4, clearCourt: true }, "你回绝了。路还在，家里会再问。", 1)
        ]
      };
    }
  });

  T.addScene({
    id: "court",
    test: function (life) { return !!life.courting && !life.married && life.age >= marryAge(life) + 2 && !life.done.court; },
    make: function (life) {
      const name = life.courting;
      return {
        mark: "court",
        kicker: life.age + "岁 · 要你定",
        title: "这门亲事还定不定",
        body: "人在" + T.where(life) + "。" + name + "还在。再不定，这事会自己凉掉。",
        cite: "",
        options: [
          opt("yes", "定下来", "人际↑ 幸福↑", { marry: name, bond: 7, happy: 4 }, "你和" + name + "把亲事定了。", 0.97),
          opt("no", "到此为止", "人际↓", { bond: -3, clearCourt: true }, "你把这门亲事停了。", 1),
          opt("wait", "再拖一年", "不改大数", { happy: -1 }, "你又拖了一年。", 1)
        ]
      };
    }
  });

  T.addScene({
    id: "care",
    test: function (life) { return life.children > 0 && life.age >= 22 && life.age <= 40 && !life.done.care; },
    make: function (life) {
      return {
        mark: "care",
        kicker: life.age + "岁 · 要你定",
        title: "孩子和手里的活撞上了",
        body: "人在" + T.where(life) + "。两边同时抓，总有一边松。",
        cite: "谁来照看，会改你这一阵的进项和人际，不改孩子的出身。",
        options: [
          opt("self", "自己停下来照看", "人际↑ 进项停住", { bond: 8, jobMul: Math.max(0.7, (life.jobMul || 1) - 0.15) }, "你放下手里的活，自己照看孩子。", 0.95),
          opt("work", "继续做事，孩子交给家里别人", "进项还在 和孩子疏一点", { skill: 3, bond: -4 }, "你继续做事，孩子交给家里别人。", 1.02),
          opt("kin", "请亲属搭手，自己两头跑", "两边都只顾到一半", { bond: 2, skill: 1 }, "你请亲属搭手，自己两头跑。", 1)
        ]
      };
    }
  });

  T.addScene({
    id: "move",
    test: function (life) {
      if (life.done.move) return false;
      const a = 22 + (life.seed % 5);
      return life.age >= a && life.age <= a + 2;
    },
    make: function (life) {
      const year = yearOf(life);
      const place = life.place.ancient;
      let title = "还留在" + place + "吗";
      let cite = "离开会改地名，不会改你生在什么人家。";
      let options;
      if (year >= 1958 && year <= 1978) {
        title = "人可以走，户口多半还在";
        cite = "这些年离乡不容易。走得成，也不等于户籍跟着走。模型只让一部分人走成。";
        options = [
          opt("go", "还是往外走", "多半走不成 走成了也生疏", { move: 0.28, bond: -3 }, "你想往外走。", 1),
          opt("stay", "留在" + place, "人际↑ 稳", { bond: 4 }, "你留下。熟人还在。", 0.97),
          opt("near", "只在附近换个营生", "手艺↑ 地方不变", { skill: 4 }, "你在附近换了营生，人还在" + place + "。", 1)
        ];
      } else if (year >= 1980) {
        options = [
          opt("go", "出门找活", "进项↑ 可能换地方 人际先薄", { move: 0.74, bond: -4, job: "外出做工", jobMul: Math.max(life.jobMul || 1, 1.3), volatile: false }, "你出门找活。", 1.02),
          opt("stay", "留在" + place + "做原来的", "稳", { bond: 3 }, "你留在原地。", 0.96),
          opt("wait", "再看一年", "不改大数", {}, "你再看一年。", 1)
        ];
      } else {
        options = [
          opt("go", "离乡", "可能换地方 熟人变少", { move: 0.55, bond: -5, skill: 2 }, "你离开家乡。", 1.04),
          opt("stay", "留下", "人际↑", { bond: 5 }, "你留下。", 0.96),
          opt("near", "只在附近换个营生", "手艺↑", { skill: 5 }, "你在附近换了营生。", 1)
        ];
      }
      return { mark: "move", kicker: life.age + "岁 · 要你定", title: title, body: "人在" + T.where(life) + "。", cite: cite, options: options };
    }
  });

  T.addScene({
    id: "debt",
    test: function (life) {
      if (life.done.debt || life.age < 18) return false;
      const line = T.baseIncome(yearOf(life), life.stratum) * 0.35;
      return life.money < -line;
    },
    make: function (life) {
      const year = yearOf(life);
      const bite = costOf(life, year, 0.2);
      return {
        mark: "debt",
        kicker: life.age + "岁 · 要你定",
        title: "余钱见了底",
        body: "人在" + T.where(life) + "。欠的大约 " + T.yuan(Math.abs(life.money)) + " 点余资。怎么补，是这一年的策略。",
        cite: "借、省、卖，都只挪这一年的余钱，挪不掉出身那一层。",
        options: [
          opt("borrow", "向熟人借一笔", "余钱先回来 人情要还", { money: bite * 2, bond: -5 }, "你借到一笔。余钱松一点，人情要还。", 1),
          opt("cut", "省吃，把开销压下去", "余钱缓一点 幸福↓ 健康↓", { money: bite, happy: -6, health: -3 }, "你省吃。余钱缓一点，人和身子都紧。", 1.06),
          opt("sell", "变卖还能卖的", "余钱↑ 家里空一块", { money: Math.round(bite * 1.4), bond: -2, happy: -2 }, "你变卖了一些东西。", 1)
        ]
      };
    }
  });

  T.addScene({
    id: "road",
    test: function (life) {
      if (life.done.road || life.age < 18) return false;
      return life.age === 19 + (life.seed % 11);
    },
    make: function (life) {
      const year = yearOf(life);
      const cost = costOf(life, year, 0.12);
      return {
        mark: "road",
        kicker: life.age + "岁 · 要你定",
        title: "路上有人倒着",
        body: "人在" + T.where(life) + "。停下来会误自己的事。这里不写场面。",
        cite: "",
        options: [
          opt("help", "送到能救人的地方", "人际↑ 自己损耗一点", { bond: 6, health: -1, happy: 2 }, "你停下来把人送到能救人的地方。", 1.04),
          opt("pass", "没有停", "事情会留下来", { bond: -3, happy: -2 }, "你没有停。这件事会留在后面的日子里。", 1),
          opt("self", "先确认自己没有染上", "健康↑ 余钱↓", { health: 4, money: -cost }, "你先去看自己的身子，大约花掉 " + T.yuan(cost) + " 点余资。", 0.9)
        ]
      };
    }
  });

  T.addScene({
    id: "shift",
    test: function (life) {
      if (!life.jobStarted || life.done.shift) return false;
      if (life.age < 30 || life.age > 36) return false;
      return life.learning >= 26 || life.skill >= 24;
    },
    make: function (life) {
      const better = life.literate || life.learning >= 34 ? "去管事、管账" : "把手艺做成营生";
      return {
        mark: "shift",
        kicker: life.age + "岁 · 要你定",
        title: "有一个更重的活法",
        body: "人在" + T.where(life) + "。现在的营生是" + (life.job || "原来的活") + "。换，进项和劳累一起变；不换，还是这条路。",
        cite: "换得成，也还在原来的出身里挪。",
        options: [
          opt("up", better, "进项↑ 健康↓ 人际更紧", { job: life.literate || life.learning >= 34 ? "管事" : "营生", jobMul: Math.min(1.8, (life.jobMul || 1) + 0.22), health: -2, bond: -2, volatile: false }, "你换了更重的活法。进项上去一点，人和身子都更紧。", 1.04),
          opt("stay", "守住现在的", "起伏小", { bond: 2 }, "你守住现在的营生。", 0.97),
          opt("risk", "接一注不稳的", "可能变好 也可能先失", { volatile: true, jobMul: Math.min(1.9, (life.jobMul || 1) + 0.1) }, "你接了一注不稳的。好年头和差年头会拉开。", 1.08)
        ]
      };
    }
  });

  T.addScene({
    id: "house",
    test: function (life) { return life.married && life.age >= 32 && life.age <= 40 && life.bond < 46 && !life.done.house; },
    make: function (life) {
      const who = life.spouse ? "和" + life.spouse : "家里";
      return {
        mark: "house",
        kicker: life.age + "岁 · 要你定",
        title: "家里吵到收不住",
        body: "人在" + T.where(life) + "，" + who + "。动手能让场面停，人会更远。这里不写场面。",
        cite: "如果家里有人动手，可以拨打 110，妇联维权热线 12338。",
        options: [
          opt("talk", "坐下把话说完", "人际↑", { bond: 6, happy: 1 }, "你坐下把话说完，没有先动手。", 0.98),
          opt("leave", "先离开，等气平了再回来", "不伤人 事情还在", { bond: -1 }, "你先离开现场。事情还在。", 1),
          opt("hit", "用打让它停", "人际大降", { bond: -12, happy: -6, health: -2 }, "你用打压住场面。家里安静了一阵，人也远了。如果家里有人动手，可以拨打 110，妇联维权热线 12338。", 1.06)
        ]
      };
    }
  });

  if (typeof module !== "undefined" && module.exports) module.exports = T;
})();
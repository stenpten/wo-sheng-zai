(function () {
  const T = typeof module !== "undefined" && module.exports ? require("./turns.js") : globalThis.YikouTurns;
  const M = T.model;
  const opt = (key,label,stake,fx,note,risk=1) => ({key,label,stake,fx,note,risk});
  T.addScene({
    id:"history-response", priority:20,
    test(l) { const w=M.world(l); return l.age>=6 && !!w.key && w.income<1 && !l.done["world:"+w.key]; },
    make(l) {
      const w=M.world(l), cost=Math.max(40,Math.round(T.baseIncome(M.yearAt(l.birthYear,l.age),l.stratum)*.12));
      const family=l.age<16;
      return { mark:"world:"+w.key, kicker:w.title, title:"先保住什么",
        body:w.text,
        cite:"背景有出处。选项里的加减是玩法。", source:w.source,
        options:[
          opt("reserve","拿出积蓄，先稳住吃住","余资−"+cost+" · 健康+5 · 本年风险降低",{money:-cost,health:5,bond:2},"家里动用了积蓄，先把吃住稳住。",.8),
          opt("kin","和亲友合力过这一阵","人际+5 · 手艺−2 · 谋生慢一点",{bond:5,skill:-2},"家里与亲友互相搭手，原来的营生放慢了。",.9),
          opt("move",family?"随家里试着迁往别处":"试着迁往别处","可能迁居 · 人际−4 · 不保证更安全",{move:.7,bond:-4},"你们试着避开原来的困境。",.95)
        ] };
    }
  });
  T.addScene({
    id:"recovery",priority:10,
    test(l) { const y=M.yearAt(l.birthYear,l.age); return y>=1977&&y<=1979&&l.age>=18&&l.age<=35&&l.learning>=24&&!l.done.recovery; },
    make(l) { return { mark:"recovery",kicker:"旧积累，新机会",title:"还要把书捡回来吗？",
      body:"高考恢复的消息传来。你已经认得的字、做过的准备没有白费，但回到书桌前也意味着少一份进项。",
      cite:"恢复高考的时间为史实；个人入学和收入变化为模型推演。",source:M.SOURCES.exam,
      options:[opt("study","停下工作，留时间备考","结束现职 · 知识+8 · 两年后再看机会",{school:true,edu:"复读",learning:8},"你把书重新摊开，暂时不再做原来的工作。"),
        opt("night","一边做事，一边自学","知识+3 · 健康−2 · 保留职业",{learning:3,health:-2},"你白天做事，晚上把字和题重新捡起来。"),
        opt("work","先守住眼前的营生","手艺+3 · 保留进项",{skill:3},"你暂时不再升学，把精力留给手里的活。")]
    }; }
  });
  function opportunity(l) {
    if(l.age<18||l.age>75) return null;
    const levels=l.routeLevels||{};
    const eligible=[];
    const route=M.routeOf(l);
    const add=(r,ok)=>{ const level=levels[r]||0; if(ok&&level<2&&l.opportunities[r]&&!l.done["path:"+r+":"+level]&&(l.age-(l.lastOpportunityAge||0)>=4)) eligible.push(r); };
    add("craft",l.skill>=25&&(route==="craft"||l.opportunities.craft));
    add("study",l.learning>=28&&(l.literate||l.inSchool));
    add("trade",l.jobStarted&&route==="trade"&&l.skill>=24);
    add("farm",l.jobStarted&&route==="farm"&&l.skill>=24);
    add("soldier",l.jobStarted&&route==="soldier"&&l.skill>=24);
    add("kin",l.married&&l.bond>=55);
    add("road",l.place.modern!==l.originPlace.modern);
    add("body",l.focus==="body"&&l.health>=40);
    return eligible.find(r=>r===route)||eligible[0]||null;
  }
  const BRANCHES={
    craft:["手艺有人来问了","接更难的活，还是先把基本功做牢？", "独立接活", "带一位学徒", "匠人", "手艺师傅"],
    study:["有人来请你写字","账册和信件都要人写。识字换不来官职，能换一份差事。", "去写账", "把字教给别人", "书手", "教书"],
    trade:["老客愿意再托一批货","扩大进项需要本钱，行情也不会年年相同。", "把买卖做大一点", "守住老客", "商贩", "商贩"],
    farm:["田里的活可以换种做法","添工具要花钱，熟悉土地的经验也能换成更稳的日子。", "添置农具", "和邻里合做", "种地", "种地"],
    soldier:["你已经熟悉军中的差事","继续接更重的差事，还是转去做较稳定的后勤？", "接更重的差事", "转做后勤", "军役", "后勤"],
    kin:["家里开始有了余力","是把时间留给孩子与家人，还是帮他们接上谋生的路？", "把时间留给照料", "帮家人学会一门活", null, null],
    road:["在异乡，有人记住了你","留在这里扎根，还是带着新经验继续往外走？", "在这里扎根", "再试着走远一点", "本地帮工", "外出做工"],
    body:["身子缓过来了一些","这几年养下的底子，要换回更多进项，还是留住较轻的日子？", "继续做较轻的活", "逐渐回到原来的营生", null, null]
  };
  T.addScene({
    id:"opportunity",priority:5,test:l=>!!opportunity(l),
    make(l) {
      const r=opportunity(l), level=(l.routeLevels||{})[r]||0, b=BRANCHES[r];
      const cost=Math.max(50,Math.round(T.baseIncome(M.yearAt(l.birthYear,l.age),l.stratum)*.2));
      const grow={money:-cost,skill:5,health:-2,jobMul:Math.min(1.9,(l.jobMul||1)+.12)};
      const steady={skill:3,bond:4,jobMul:Math.min(1.7,(l.jobMul||1)+.04)};
      if(b[4])grow.job=b[4]; if(b[5])steady.job=b[5];
      if(r==="study") {grow.learning=4;steady.learning=3;}
      if(r==="kin") {delete grow.jobMul; grow.bond=7;steady.bond=3;steady.skill=5;}
      if(r==="road")steady.move=.65;
      if(r==="body") {grow.health=5; delete grow.skill; delete grow.jobMul;steady.health=-2;}
      const result=(key)=>(life)=>{
        if(!life.routeLevels)life.routeLevels={};
        life.routeLevels[r]=level+1;life.lastOpportunityAge=life.age;
        if(key!=="defer")life.careerRoute=r;
        return key==="defer"?"你没有接下这次机会。已有的本事还在，下次要等新的积累。":"这次机会来自此前的积累。你选择了“"+b[key==="grow"?2:3]+"”，代价和收获都已经记入这一年。";
      };
      return {mark:"path:"+r+":"+level,kicker:M.ROUTES[r][0],title:b[0],body:b[1],cite:"这次机会来自你已经走过的路。",
        options:[opt("grow",b[2],"余资 −"+cost+" · 两年后再看",grow,result("grow"),r==="soldier"?1.3:1),
          opt("steady",b[3],"不花钱 · 走得慢一些",steady,result("steady"),.95),
          opt("defer","这次先不接","保留现状 · 本次机会关闭",{},result("defer"))]};
    }
  });
  if(typeof module!=="undefined"&&module.exports)module.exports=T;
})();

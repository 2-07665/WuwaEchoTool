const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js'),W=require('../js/weapon-catalog.js'),M=require('../js/convene-i18n.js'),V=require('../js/convene-visuals.js');
const info={uid:'799999980',server:'new-achievements',region:'cn'};
// 合成记录经过正式导入与统计流程，五星/四星身份均以资源 ID 区分。
function build(pool,events){const last=Math.max(...Object.keys(events).map(Number)),raw=Array.from({length:last+1},(_,i)=>{const event=events[i],item=typeof event==='object'?event.item:event;return {time:new Date(Date.UTC(2026,8,30,9,0,i)).toISOString().slice(0,19).replace('T',' '),resourceId:String(item||21010013),name:'合成测试',resourceType:Number(item)<100000?'角色':'武器',qualityLevel:event?(event.rank||5):3,cardPoolType:'generic'};}).reverse();return C.mergeAccount(null,info,pool,raw).account;}
const merge=(...accounts)=>accounts.reduce((a,b)=>a?C.combine({version:1,accounts:[a]},{version:1,accounts:[b]}).accounts[0]:b,null);
const get=(account,key)=>C.achievementDetails(C.analyse(account)).find(a=>a.baseKey===key);

test('逆命而行略过大保底，第三次歪后的下一小保胜利才解锁，未知与缺口重置',()=>{
 const a=build(1,{0:1104,10:1311,20:1203,30:1311,40:1301,50:1311,60:1311});A.equal(get(a,'characterRecovery').state,'unlocked');A.equal(get(a,'characterRecovery').date,a.records[60].time);
 const s=C.analyse(a);s.five[2].effectiveResult='unknown';A.equal(C.achievementDetails(s).find(a=>a.baseKey==='characterRecovery').state,'notReached');
 a.spans=[{pool:1,first:a.records[0].id,last:a.records[45].id},{pool:1,first:a.records[46].id,last:a.records.at(-1).id}];A.equal(get(a,'characterRecovery').state,'notReached');
 A.equal(get(build(1,{0:1104,10:1311,20:1203,30:1311,40:1311}),'characterRecovery').state,'notReached');
});

test('不期而遇按不同角色去重，30含等号，首段与常驻取得不能补足',()=>{
 const a=build(1,{0:1311,30:1304,60:1205,90:1505});A.equal(get(a,'characterVisitors').state,'unlocked');A.equal(get(a,'characterVisitors').date,a.records[90].time);
 A.equal(get(build(1,{0:1311,30:1304,60:1304,90:1304}),'characterVisitors').progress,1);
 A.equal(get(build(1,{0:1304,30:1205,61:1505,91:1311}),'characterVisitors').progress,2);
 const partial=build(1,{0:1311,30:1304,60:1205}),standard=build(3,{0:1505});A.equal(get(merge(partial,standard),'characterVisitors').progress,2);
});

test('百兵皆备只采限定武器池已识别五星武器类别，常驻与未知不能补缺',()=>{
 const types=[...new Set(W.weapons.map(w=>w.category))],items=types.map(type=>W.weapons.find(w=>w.category===type&&w.rarity===5).resourceId),events=Object.fromEntries(items.map((item,i)=>[i,item]));
 A.equal(get(build(2,events),'weaponArsenal').state,'unlocked');
 delete events[4];const partial=build(2,events);A.equal(get(merge(partial,build(4,{0:items[4]})),'weaponArsenal').progress,4);
 events[4]='999999';A.equal(get(build(2,events),'weaponArsenal').progress,4);
});

test('铸造奇迹需要同武器五个完整间隔，200含等号，201、首段和断档不得解锁',()=>{
 const item=W.weapons.find(w=>w.rarity===5).resourceId,events=Object.fromEntries([0,40,80,120,160,200].map(i=>[i,item])),a=build(2,events);
 A.equal(get(a,'weaponMiracle').state,'unlocked');A.equal(get(a,'weaponMiracle').date,a.records[200].time);
 A.equal(get(build(2,Object.fromEntries([0,40,80,120,160].map(i=>[i,item]))),'weaponMiracle').state,'notReached');
 delete events[200];events[201]=item;A.equal(get(build(2,events),'weaponMiracle').state,'notReached');
 a.spans=[{pool:2,first:a.records[0].id,last:a.records[99].id},{pool:2,first:a.records[100].id,last:a.records.at(-1).id}];A.equal(get(a,'weaponMiracle').state,'notReached');
});

test('双轨星光需两个常驻池分别出五星，重复同池与限定不替代',()=>{
 const weapon=W.weapons.find(w=>w.rarity===5).resourceId,a=build(3,{0:1104,10:1203});A.equal(get(a,'standardDualStar').progress,1);
 A.equal(get(merge(a,build(2,{0:weapon})),'standardDualStar').progress,1);
 A.equal(get(merge(a,build(4,{0:weapon})),'standardDualStar').state,'unlocked');
});

test('故人齐聚限定常驻角色池名单中的三个不同五星，四星、重复与限定均不补计',()=>{
 const a=build(3,{0:1104,10:1203,20:1301});A.equal(get(a,'standardReunion').state,'unlocked');A.equal(get(a,'standardReunion').date,a.records[20].time);
 A.equal(get(build(3,{0:1104,10:1104,20:{item:1301,rank:4}}),'standardReunion').progress,1);
 A.equal(get(merge(build(3,{0:1104,10:1203}),build(1,{0:1301})),'standardReunion').progress,2);
});

test('四星宝库严格区分星级和物品，十种可来自两个常驻池，其他池不补数',()=>{
 const items=W.weapons.filter(w=>w.rarity===4).slice(0,10).map(w=>w.resourceId),a=build(3,Object.fromEntries(items.slice(0,5).map((item,i)=>[i,{item,rank:4}]))),b=build(4,Object.fromEntries(items.slice(5).map((item,i)=>[i,{item,rank:4}])));
 A.equal(get(merge(a,b),'standardFourVault').state,'unlocked');
 A.equal(get(merge(a,build(2,{0:{item:items[5],rank:4}})),'standardFourVault').progress,5);
 A.equal(get(build(4,{0:{item:items[0],rank:4},1:{item:items[0],rank:4},2:{item:items[1],rank:5}}),'standardFourVault').progress,1);
});

test('七项新成就均有三语与独立图示，空档不解锁，重复重算不改存档或评分',()=>{
 const keys=['characterRecovery','characterVisitors','weaponArsenal','weaponMiracle','standardDualStar','standardReunion','standardFourVault'],all=C.achievementDetails(C.analyse(null)),shapes=new Set();
 for(const key of keys){const a=all.find(a=>a.baseKey===key);A.equal(a.state,'insufficient');A.equal(a.date,null);for(const lang of ['zh-TW','zh-CN','en']){const t=M.create(lang);A.notEqual(t(a.key),a.key);A.notEqual(t('condition.'+a.key),'condition.'+a.key);}shapes.add(JSON.stringify(V.achievementArtwork(key).paths));}A.equal(shapes.size,7);
 const a=build(3,{0:1104,10:1203,20:1301}),raw=JSON.stringify(a),s=C.analyse(a),repeat=C.analyse(merge(a,a));A.deepEqual(C.achievementDetails(s),C.achievementDetails(repeat));A.deepEqual(s.luck,repeat.luck);A.equal(JSON.stringify(a),raw);A.equal(C.VERSION,1);
});

const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js'),M=require('../js/convene-i18n.js'),V=require('../js/convene-visuals.js'),R=require('../js/convene-report.js');
const info={uid:'799999981',server:'scoped-achievements',region:'cn'};
function add(a,pool,count,stars=[]){const five=new Set(stars);return C.mergeAccount(a,info,pool,Array.from({length:count},(_,i)=>({time:new Date(Date.UTC(2026,8,30,9,0,i)).toISOString().slice(0,19).replace('T',' '),resourceId:five.has(i)?pool===2?'21010011':'1311':'21010013',name:'合成测试',resourceType:pool===2?'武器':'角色',qualityLevel:five.has(i)?5:3,cardPoolType:'generic'})).reverse()).account;}
const get=(s,scope,key)=>C.achievementDetails(s,scope).find(a=>a.baseKey===key);

test('限定为主的三组成就有独立ID与三语名称条件，常驻保持少量项目',()=>{
 const s=C.analyse(null),all=C.achievementDetails(s);A.equal(all.length,46);A.equal(new Set(all.map(a=>a.key)).size,46);A.equal(new Set(all.map(a=>a.baseKey)).size,46);
 A.deepEqual(C.ACHIEVEMENT_SCOPES.map(scope=>C.achievementDetails(s,scope).length),[28,10,8]);
 for(const a of all){A.equal(a.state,'insufficient');A.equal(a.date,null);for(const lang of ['zh-TW','zh-CN','en']){const t=M.create(lang);A.notEqual(t(a.key),a.key);A.notEqual(t('condition.'+a.key),'condition.'+a.key);}A.notEqual(V.achievementArtwork(a.key).family,'unknown');}
});

test('两限定池早金、累计抽数和五星数不互补，常驻和新手也不能补限定',()=>{
 let a=add(null,1,60,[0,10,20,30]);a=add(a,2,60,[0,10,20,30]);a=add(a,3,600,[0,10,20,30,40,50,60,70,80,90]);a=add(a,5,50,[0,1,2]);const s=C.analyse(a);
 A.equal(get(s,'limitedCharacter','fiveEarly').state,'notReached');A.equal(get(s,'limitedCharacter','fiveEarly').progress,3);A.equal(get(s,'limitedCharacter','pull1000').progress,60);A.equal(get(s,'limitedCharacter','gold30').progress,4);
 A.equal(get(s,'limitedWeapon','weaponSteadyGold').progress,3);A.equal(get(s,'limitedWeapon','weaponVariety').progress,1);
 A.equal(get(s,'standard','pull500').state,'unlocked');A.equal(get(s,'standard','gold10').progress,10);
 A.ok(R.representativeAchievements(s).every(a=>a.scope!=='standard'));
 A.ok(R.representativeAchievements(s,'limitedWeapon').every(a=>a.scope==='limitedWeapon'));
});

test('同角色七次不可用常驻补齐，缺口仍打断限定连续成就',()=>{
 let a=add(null,1,31,[0,10,20,30]);a=add(a,3,21,[0,10,20]);A.equal(get(C.analyse(a),'limitedCharacter','seven').state,'notReached');
 a=add(null,1,41,[0,10,20,30,40]);const r=a.records;a.spans=[{pool:1,first:r[0].id,last:r[20].id},{pool:1,first:r[21].id,last:r.at(-1).id}];A.equal(get(C.analyse(a),'limitedCharacter','early4').state,'notReached');
});

test('分池日期取本池首次达标记录，旧存档重算不改评分或来源且重复导入幂等',()=>{
 let a=add(null,1,1001,[0,50,100]);a=add(a,2,60,[0,30]);const raw=JSON.stringify(a),s=C.analyse(a),before=s.luck;
 A.equal(get(s,'limitedCharacter','pull1000').date,a.records.filter(r=>r.pool===1)[999].time);A.equal(get(s,'limitedWeapon','weaponSteadyGold').date,null);
 const repeat=C.analyse(C.combine({version:1,accounts:[a]},{version:1,accounts:[a]}).accounts[0]);A.deepEqual(repeat.luck,before);A.deepEqual(C.achievementDetails(repeat),C.achievementDetails(s));A.equal(JSON.stringify(a),raw);
 A.ok(s.achievements.every(key=>key.includes('.')));A.equal(C.VERSION,1);
});

test('限定武器独有锻造条件保持边界、同名累计与断档隔离',()=>{
 const build=stars=>add(null,2,stars.at(-1)+1,stars),getWeapon=a=>C.achievementDetails(C.analyse(a),'limitedWeapon');
 const a=build([0,20,40,60,80]),list=getWeapon(a);A.equal(list.find(a=>a.baseKey==='weaponFive').state,'unlocked');A.equal(list.find(a=>a.baseKey==='weaponVariety').progress,1);A.equal(list.find(a=>a.baseKey==='weaponQuickForge').date,a.records[60].time);
 A.equal(getWeapon(build([0,20,40,61])).find(a=>a.baseKey==='weaponQuickForge').state,'notReached');
 a.spans=[{pool:2,first:a.records[0].id,last:a.records[40].id},{pool:2,first:a.records[41].id,last:a.records.at(-1).id}];A.equal(getWeapon(a).find(a=>a.baseKey==='weaponQuickForge').state,'notReached');
 A.equal(getWeapon(build(Array.from({length:11},(_,i)=>i*60))).find(a=>a.baseKey==='weaponSteadyGold').state,'unlocked');
});

test('同页组合筛选只影响显示，保持排序、总进度和成就结果',()=>{
 const Cab=require('../js/convene-cabinet.js'),all=Cab.items(C.analyse(add(null,2,81,[0,20,40,60,80]))),raw=JSON.stringify(all);
 A.equal(all.length,46);A.equal(Cab.filterItems(all,{scope:'limitedWeapon'}).length,10);
 const filtered=Cab.filterItems(all,{scope:'limitedWeapon',rarity:'legendary',state:'unlocked'});A.ok(filtered.length);A.ok(filtered.every(a=>a.scope==='limitedWeapon'&&a.rarity==='legendary'&&a.state==='unlocked'));
 A.deepEqual(Cab.filterItems(all,{scope:'standard',rarity:'mythic'}),[]);A.ok(Cab.filterItems(all,{state:'locked'}).every(a=>a.state!=='unlocked'));A.deepEqual(Cab.filterItems(all,{}),all);A.equal(JSON.stringify(all),raw);
});

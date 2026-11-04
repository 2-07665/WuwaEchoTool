const {test}=require('node:test'),A=require('node:assert/strict');
const C=require('../js/convene-core.js'),V=require('../js/convene-visuals.js'),Cab=require('../js/convene-cabinet.js'),M=require('../js/convene-i18n.js'),R=require('../js/convene-report.js');
const info={uid:'799999982',server:'achievement-fixture',region:'cn'};
// 合成记录只供边界验证；结果由真实身份与保底状态机生成，不依赖角色名称。
function account(items,pool=1){
 const last=Math.max(...Object.keys(items).map(Number));
 const raw=Array.from({length:last+1},(_,i)=>({time:new Date(Date.UTC(2026,8,30,9,0,i)).toISOString().slice(0,19).replace('T',' '),resourceId:String(items[i]||21010013),name:'合成测试',resourceType:items[i]&&Number(items[i])<100000?'角色':'武器',qualityLevel:items[i]?5:3,cardPoolType:'generic'})).reverse();
 return C.mergeAccount(null,info,pool,raw).account;
}
const get=(a,key)=>C.achievementRules(C.analyse(a)).find(x=>x.key===key);
const unlocked=(a,key)=>get(a,key).state==='unlocked';
function sequence(ids,step=5){return account(Object.fromEntries(ids.map((id,i)=>[i*step,id])));}
function split(a,at){a.spans=[{pool:1,first:a.records[0].id,last:a.records[at-1].id},{pool:1,first:a.records[at].id,last:a.records.at(-1).id}];return a;}

test('三连与五连小保独立过门槛，未知的首金不当作胜利，解锁日期取首次达标',()=>{
 const a=sequence(Array(7).fill(1311)),s=C.analyse(a);
 A.equal(s.five[0].effectiveResult,'unknown');
 A.equal(get(a,'upWin3').date,s.five[3].time);A.equal(get(a,'upWin5').date,s.five[5].time);
 A.equal(get(a,'upWin3').progress,3);A.equal(get(a,'upWin5').progress,5);
 const short=sequence(Array(5).fill(1311));A.equal(get(short,'upWin5').progress,4);A.equal(unlocked(short,'upWin5'),false);
});
test('连续小保歪出允许中间大保底，但不把保证命中算作小保胜利',()=>{
 const a=sequence([1104,1311,1104,1311,1104,1311]);
 A.equal(unlocked(a,'upLoss3'),true);A.equal(get(a,'upLoss3').date,C.analyse(a).five[4].time);
 A.equal(get(a,'upWin3').progress,0);A.equal(get(a,'upWin10').progress,0);
});
test('缺口和未知身份打断连胜及连歪，不跨区间拼接',()=>{
 const a=split(sequence(Array(7).fill(1311)),16);A.equal(unlocked(a,'upWin3'),true);A.equal(unlocked(a,'upWin5'),false);
 const unknown=sequence([1311,1311,1311,999999,1311,1311]);A.equal(get(unknown,'upWin3').progress,2);A.equal(unlocked(unknown,'upWin3'),false);
 const losses=split(sequence([1104,1311,1104,1311,1104,1311]),16);A.equal(unlocked(losses,'upLoss3'),false);
});
test('歪出打断连胜，赢小保打断连歪；冲突事件无法延续连胜',()=>{
 const a=sequence([1311,1311,1311,1104,1311,1311,1311]);A.equal(unlocked(a,'upWin3'),false);A.equal(get(a,'upWin3').progress,2);
 const b=sequence([1104,1311,1311,1104,1311,1104]);A.equal(unlocked(b,'upLoss3'),false);A.equal(get(b,'upLoss3').progress,2);
 const stats=C.analyse(sequence(Array(5).fill(1311)));stats.pools[0].five[2].conflict=true;
 A.equal(C.achievementRules(stats).find(x=>x.key==='upWin3').state,'notReached');
});
test('十次小保命中可跨缺口累计，未知、大保底、武器池不计入',()=>{
 const a=split(sequence(Array(13).fill(1311)),31);A.equal(unlocked(a,'upWin10'),true);A.equal(get(a,'upWin10').progress,10);
 const b=sequence(Array.from({length:12},(_,i)=>i%2?1311:1104));A.equal(unlocked(b,'upWin10'),false);
 A.equal(unlocked(account(Object.fromEntries(Array.from({length:12},(_,i)=>[i*5,1311])),2),'upWin10'),false);
});
test('苦尽星来检查75与10抽含等号边界和顺序，不跨缺口或跨池',()=>{
 const a=account({0:1311,75:1311,85:1311});A.equal(unlocked(a,'afterPity'),true);A.equal(get(a,'afterPity').date,a.records[85].time);
 for(const items of [{0:1311,74:1311,84:1311},{0:1311,75:1311,86:1311},{0:1311,10:1311,85:1311}])A.equal(unlocked(account(items),'afterPity'),false);
 A.equal(unlocked(split(account({0:1311,75:1311,85:1311}),76),'afterPity'),false);
 let b=account({0:1311,75:1311});const other=account({0:1311,10:1311},2);b=C.combine({version:1,accounts:[b]},{version:1,accounts:[other]}).accounts[0];A.equal(unlocked(b,'afterPity'),false);
});
test('双星交辉要求两个相邻完整间隔，总和10含等号，首金下限和异常不得解锁',()=>{
 A.equal(unlocked(account({0:1311,4:1311,10:1311}),'twinStars'),true);
 A.equal(unlocked(account({0:1311,4:1311,11:1311}),'twinStars'),false);
 A.equal(unlocked(account({0:1311,1:1311}),'twinStars'),false);
 A.equal(unlocked(split(account({0:1311,4:1311,10:1311}),5),'twinStars'),false);
 const stats=C.analyse(account({0:1311,4:1311,10:1311}));stats.pools[0].five[1].anomaly=true;
 A.equal(C.achievementRules(stats).find(x=>x.key==='twinStars').state,'insufficient');
});
test('群星旅伴只计不同五星角色，重复、四星和五星武器不补足数量',()=>{
 const catalog=require('../js/character-catalog.js').records.filter(r=>r.rarity===5).slice(0,10);
 const a=sequence(catalog.map(r=>r.resourceId));A.equal(unlocked(a,'fiveCharacters10'),true);
 const b=sequence([...catalog.slice(0,9).map(r=>r.resourceId),catalog[0].resourceId,21010013]);
 A.equal(get(b,'fiveCharacters10').progress,9);
 b.records.at(-1).item=String(catalog[9].resourceId);b.records.at(-1).kind='角色';b.records.at(-1).rank=4;
 A.equal(get(b,'fiveCharacters10').progress,9);
});
test('十二个月不要求连续，重复月份不多计，空存档不伪造进度',()=>{
 const a=sequence(Array(12).fill(1311));for(const [i,r]of a.records.filter(r=>r.rank===5).entries())r.time=(2023+Math.floor(i/6))+'-'+String((i%6)*2+1).padStart(2,'0')+'-01 00:00:00';
 const details=C.achievementRules({...C.analyse(null),records:a.records});A.equal(details.find(x=>x.key==='months12').state,'unlocked');A.equal(details.find(x=>x.key==='months12').date,'2024-11-01 00:00:00');
 A.equal(get(sequence(Array(12).fill(1311)),'months12').progress,1);
 for(const x of C.achievementRules(C.analyse(null))){A.equal(x.state,'insufficient');A.equal(x.progress,null);A.equal(x.date,null);}
});
test('旧存档重算自动补齐42项，重复导入不改变成就、评分或原始记录',()=>{
 const a=sequence(Array(13).fill(1311)),raw=JSON.stringify(a),s=C.analyse(a),items=C.achievementRules(s),merged=C.combine({version:1,accounts:[a]},{version:1,accounts:[a]});
 A.equal(items.length,42);A.equal(C.VERSION,1);A.deepEqual(C.achievementRules(C.analyse(merged.accounts[0])),items);A.deepEqual(C.analyse(merged.accounts[0]).luck,s.luck);A.equal(JSON.stringify(a),raw);
});
test('图案按语义主题归属，所有成就有独立中心图案，外框只随稀有度变化',()=>{
 const expected={voyage:['pull1','pull100','pull500','pull1000','pull3000'],gold:['gold1','gold10','gold30','gold100'],endurance:['pity','hard'],companions:['characters5','characters10','fiveCharacters10'],armory:['weapons5','weapons10','weaponGold'],time:['months','months12'],upVictory:['upWin3','upWin5','upWin10'],recovery:['comeback','afterPity']};
 for(const [family,keys]of Object.entries(expected))for(const key of keys)A.equal(V.achievementArtwork(key).family,family);
 const keys=C.achievementRules(C.analyse(null)).map(a=>a.key);A.ok(keys.every(key=>V.achievementKeys.includes(key)));A.equal(Object.keys(Cab.rarity).length,54);
 const centers=keys.map(key=>{const art=V.achievementArtwork(key),frameCount=Cab.rarity[key]==='common'||Cab.rarity[key]==='rare'?2:3;A.notEqual(art.family,'unknown');A.equal(art.color,V.ACHIEVEMENT_COLORS[Cab.rarity[key]]);return JSON.stringify(art.paths.slice(frameCount));});A.equal(new Set(centers).size,42);
 for(const rarity of Cab.tiers){const same=keys.filter(k=>Cab.rarity[k]===rarity).map(k=>V.achievementArtwork(k).paths.slice(0,2));A.ok(same.every(x=>JSON.stringify(x)===JSON.stringify(same[0])));}
});
test('分享优先展示已达标的新增好运战绩，逆风与累计里程碑不会挤占好运栏',()=>{
 const result=R.representativeAchievements(C.analyse(sequence(Array(13).fill(1311),1)));
 A.deepEqual(result.map(x=>x.baseKey),['upWin7','early5','consecutive3']);A.ok(result.every(x=>!['upLoss3','months12','fiveCharacters10','fiveCharacters20'].includes(x.key)));A.ok(result.length<=3);
});
test('42项名称、条件及图示规则在三语言中均完整',()=>{
 for(const locale of ['zh-TW','zh-CN','en']){const t=M.create(locale);for(const a of C.achievementRules(C.analyse(null)))for(const key of [a.key==='pity'?'pityAch':a.key,'condition.'+a.key])A.notEqual(t(key),key);A.notEqual(t('achievementVisualGuide'),'achievementVisualGuide');}
});

test('群星连奏需要4个完整间隔，20抽含等号，首金不补足次数',()=>{
 const a=sequence(Array(5).fill(1311),20),events=C.analyse(a).five;
 A.equal(unlocked(a,'early4'),true);A.equal(get(a,'early4').date,events[4].time);A.equal(get(a,'early4').progress,4);
 A.equal(get(sequence(Array(4).fill(1311),20),'early4').progress,3);
 A.equal(unlocked(sequence(Array(5).fill(1311),21),'early4'),false);
});
test('群星俯首需要5个十抽内间隔，10抽含等号，较长间隔中断',()=>{
 const a=sequence(Array(6).fill(1311),10);A.equal(unlocked(a,'early5'),true);A.equal(get(a,'early5').date,C.analyse(a).five[5].time);
 A.equal(get(sequence(Array(5).fill(1311),10),'early5').progress,4);
 A.equal(unlocked(sequence(Array(6).fill(1311),11),'early5'),false);
 A.equal(unlocked(account({0:1311,10:1311,20:1311,31:1311,41:1311,51:1311,61:1311}),'early5'),false);
});
test('三金与四曜要求相邻1抽间隔，原累计两次1抽成就不变',()=>{
 const a=account({0:1311,1:1311,3:1311,4:1311});A.equal(unlocked(a,'consecutive'),true);A.equal(unlocked(a,'consecutive2'),false);
 const three=sequence(Array(3).fill(1311),1),four=sequence(Array(4).fill(1311),1);
 A.equal(unlocked(three,'consecutive2'),true);A.equal(unlocked(three,'consecutive3'),false);
 A.equal(unlocked(four,'consecutive3'),true);A.equal(get(four,'consecutive3').date,C.analyse(four).five[3].time);
 A.equal(get(account({0:1311,1:1311,2:1311,4:1311,5:1311}),'consecutive3').progress,2);
});
test('所有新增连续间隔成就不跨缺口、池或异常，未知机制不计',()=>{
 A.equal(unlocked(split(sequence(Array(5).fill(1311),20),41),'early4'),false);
 A.equal(unlocked(split(sequence(Array(6).fill(1311),10),21),'early5'),false);
 const one=split(sequence(Array(4).fill(1311),1),2);A.equal(unlocked(one,'consecutive2'),false);A.equal(unlocked(one,'consecutive3'),false);
 const stats=C.analyse(sequence(Array(5).fill(1311),1));stats.pools[0].five[2].anomaly=true;
 const results=C.achievementRules(stats);A.equal(results.find(x=>x.key==='early4').state,'notReached');A.equal(results.find(x=>x.key==='consecutive3').state,'notReached');
 const mixed=C.combine({version:1,accounts:[sequence(Array(3).fill(1311),1)]},{version:1,accounts:[account({0:1311,1:1311,2:1311},2)]}).accounts[0];A.equal(unlocked(mixed,'consecutive3'),false);
 const unsupported=account({0:1311,1:1311,2:1311,3:1311},10);A.equal(unlocked(unsupported,'consecutive3'),false);
});
test('破晓长歌累计三次独立转运，日期取第三次，缺口不能伪造配对',()=>{
 const a=account({0:1311,75:1311,85:1311,160:1311,170:1311,245:1311,255:1311});
 A.equal(get(a,'afterPity3').progress,3);A.equal(get(a,'afterPity3').date,a.records.at(-1).time);
 const two=account({0:1311,75:1311,85:1311,160:1311,170:1311});A.equal(get(two,'afterPity3').progress,2);A.equal(unlocked(two,'afterPity3'),false);
 A.equal(get(split(a,246),'afterPity3').progress,2);
});
test('群星殿堂按20位五星角色去重，19位或重复记录不能解锁',()=>{
 const ids=require('../js/character-catalog.js').records.filter(r=>r.rarity===5).slice(0,20).map(r=>r.resourceId);A.equal(ids.length,20);
 const a=sequence(ids);A.equal(get(a,'fiveCharacters20').progress,20);A.equal(unlocked(a,'fiveCharacters20'),true);
 A.equal(get(sequence([...ids.slice(0,19),ids[0]]),'fiveCharacters20').progress,19);
});
test('不败欧皇七连小保与五连独立，失败、未知、冲突或缺口均重置',()=>{
 const a=sequence(Array(9).fill(1311));A.equal(unlocked(a,'upWin7'),true);A.equal(get(a,'upWin7').date,C.analyse(a).five[7].time);
 const six=sequence(Array(7).fill(1311));A.equal(get(six,'upWin7').progress,6);A.equal(unlocked(six,'upWin7'),false);
 for(const item of [1104,999999])A.equal(unlocked(sequence([1311,1311,1311,1311,item,1311,1311,1311,1311]),'upWin7'),false);
 A.equal(unlocked(split(sequence(Array(10).fill(1311)),26),'upWin7'),false);
 const stats=C.analyse(a);stats.pools[0].five[4].conflict=true;A.equal(C.achievementRules(stats).find(x=>x.key==='upWin7').state,'notReached');
});
test('神话四项、传说十二项，五级排序和神话虹彩独立且保持语义进阶',()=>{
 A.deepEqual(Cab.tiers,['mythic','legendary','epic','rare','common']);
 A.equal(Object.values(Cab.rarity).filter(x=>x==='mythic').length,5);A.equal(Object.values(Cab.rarity).filter(x=>x==='legendary').length,16);
 const list=Cab.items(C.analyse(sequence(Array(9).fill(1311))));A.ok(list.slice(0,4).every(x=>x.rarity==='mythic'));
 A.equal(V.achievementArtwork('upWin7').family,V.achievementArtwork('upWin5').family);
 A.equal(V.achievementArtwork('afterPity3').family,V.achievementArtwork('afterPity').family);
 A.equal(V.achievementArtwork('afterPity7').family,V.achievementArtwork('afterPity3').family);
 for(const key of ['upWin7','early5','consecutive3']){const art=V.achievementArtwork(key);A.equal(art.rarity,'mythic');A.equal(art.gradient.length,6);A.ok(V.achievementIcon(key).includes('gradientUnits="userSpaceOnUse"'));A.notDeepEqual(art.paths.slice(0,3),V.achievementArtwork('upWin5').paths.slice(0,3));}
});

test('破晓神谕要求七次有效转运，第七次定日期，缺口与超10抽不补足次数',()=>{
 const turns=n=>{const items={0:1311};for(let i=0;i<n;i++){items[i*85+75]=1311;items[(i+1)*85]=1311;}return items;};
 const six=account(turns(6));A.equal(get(six,'afterPity7').progress,6);A.equal(unlocked(six,'afterPity7'),false);
 const seven=account(turns(7));A.equal(get(seven,'afterPity7').progress,7);A.equal(get(seven,'afterPity7').date,seven.records.at(-1).time);A.equal(unlocked(seven,'afterPity3'),true);A.ok(R.representativeAchievements(C.analyse(seven)).some(x=>x.baseKey==='afterPity7'));
 A.equal(get(split(account(turns(7)),586),'afterPity7').progress,6);
 const late=turns(7);delete late[595];late[596]=1311;A.equal(get(account(late),'afterPity7').progress,6);
 const stats=C.analyse(seven);stats.pools[0].five.at(-1).anomaly=true;A.equal(C.achievementRules(stats).find(x=>x.key==='afterPity7').progress,6);
});

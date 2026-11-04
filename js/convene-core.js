(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./convene-banners.js'),require('./character-catalog.js'),require('./weapon-catalog.js'));else root.ConveneCore=factory(root.ConveneBanners,root.CharacterCatalog,root.WeaponCatalog);})(typeof globalThis!=='undefined'?globalThis:this,function(Banners,Characters,Weapons){
'use strict';
// 识别覆盖至少 80%、小保机会至少 5 次才合成限定运，避免少数可确认失败主导评价。
const CHARACTER_TIERS=Object.freeze([{title:'fate',min:95,max:100},{title:'star',min:85,max:95},{title:'lucky',min:70,max:85},{title:'steady',min:40,max:70},{title:'headwind',min:20,max:40},{title:'abyss',min:0,max:20}]);
const RATING_RULES=Object.freeze({drawWeight:.8,limitedWeight:.2,minCoverage:.8,minOpportunities:5,minIntervals:10,minPulls:300,topIntervals:30,topOpportunities:10,tiers:Object.freeze([{title:'fate',min:95,max:100},{title:'star',min:85,max:95},{title:'radiant',min:75,max:85},{title:'lucky',min:60,max:75},{title:'steady',min:45,max:60},{title:'breeze',min:30,max:45},{title:'headwind',min:15,max:30},{title:'abyss',min:0,max:15}].map((t,i)=>Object.freeze({...t,tierId:'T'+(8-i)})))});
const characterIDs=new Set((Characters?.records||[]).map(r=>r.resourceId)),fiveCharacterIDs=new Set((Characters?.records||[]).filter(r=>r.rarity===5).map(r=>r.resourceId)),weaponIDs=new Set((Weapons?.weapons||[]).map(r=>r.resourceId));
const VERSION=1,RULE_REVISION='automatic-v4-standard-roster-2026-10-27',POOLS=Banners.rules;
const copy=x=>JSON.parse(JSON.stringify(x)),fail=code=>{throw Error(code);},safe=(s,n=180)=>typeof s==='string'&&s.length<=n&&!/[\x00-\x1f<>]/.test(s);
function stamp(s){if(typeof s!=='string')return false;const match=/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(s);if(!match)return false;const [year,month,day,hour,minute,second]=match.slice(1).map(Number);if(year<1||month<1||month>12||hour>23||minute>59||second>59)return false;const leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];return day>=1&&day<=days[month-1];}
const validServer=s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(s);
function identity(x){if(typeof x.uid!=='string'||typeof x.server!=='string'||!['global','cn'].includes(x.region)||!/^\d{5,12}$/.test(x.uid)||!validServer(x.server))fail('INVALID_ACCOUNT');return [x.region,x.server,x.uid].join(':');}
function empty(){return {version:VERSION,accounts:[]};}
function recordKey(pool,time,seq){return [pool,time,seq].join('|');}
const validSourceID=v=>typeof v==='string'&&/^\d{1,30}$/.test(v)||typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
function normalize(rows,pool){if(!Array.isArray(rows)||rows.length>200000||!Number.isInteger(pool)||pool<1||pool>20)fail('INVALID_RESPONSE');const groups=new Map();let previous='9999';for(const r of rows){if(!r||!stamp(r.time)||r.time>previous||![3,4,5].includes(Number(r.qualityLevel))||!/^\d{1,12}$/.test(String(r.resourceId))||!safe(r.name)||!safe(r.resourceType??'',40)||!safe(String(r.cardPoolType||''),100)||r.count!=null&&Number(r.count)!==1)fail('INVALID_RESPONSE');previous=r.time;if(!groups.has(r.time))groups.set(r.time,[]);groups.get(r.time).push(r);}
const out=[];for(const [time,group]of groups){group.reverse();if(group.every(r=>validSourceID(r.id))){if(new Set(group.map(r=>String(r.id))).size!==group.length)fail('INVALID_RESPONSE');group.sort((a,b)=>BigInt(a.id)<BigInt(b.id)?-1:BigInt(a.id)>BigInt(b.id)?1:0);}group.forEach((r,i)=>out.push({id:recordKey(pool,time,i+1),pool,time,seq:i+1,item:String(r.resourceId),name:r.name,kind:r.resourceType??(characterIDs.has(String(r.resourceId))?'角色':weaponIDs.has(String(r.resourceId))?'武器':''),rank:Number(r.qualityLevel),label:String(r.cardPoolType||''),result:'unknown',...(validSourceID(r.id)?{sourceId:String(r.id)}:{})}));}return out.sort(order);}
function order(a,b){return a.time.localeCompare(b.time)||a.seq-b.seq||a.pool-b.pool;}
function signature(r){return [r.item,r.rank,r.kind].join('|');}
function validate(input){let d;try{d=typeof input==='string'?JSON.parse(input):copy(input);}catch(_){fail('INVALID_BACKUP');}if(d?.version!==VERSION)fail('UNSUPPORTED_BACKUP');if(!Array.isArray(d.accounts)||d.accounts.length>100)fail('INVALID_BACKUP');const ids=new Set();for(const a of d.accounts){if(a.id!==identity(a)||ids.has(a.id)||!Array.isArray(a.records)||a.records.length>500000||!Array.isArray(a.spans)||!safe(a.updated||'',40))fail('INVALID_BACKUP');ids.add(a.id);const rs=new Set();a.records=a.records.map(r=>{if(!r||!Number.isInteger(r.pool)||r.pool<1||r.pool>20||!stamp(r.time)||!Number.isInteger(r.seq)||r.seq<1||r.seq>10000||r.id!==recordKey(r.pool,r.time,r.seq)||rs.has(r.id)||typeof r.item!=='string'||!/^\d{1,12}$/.test(r.item)||!safe(r.name)||!safe(r.kind,40)||!safe(r.label,100)||![3,4,5].includes(r.rank)||!['unknown','win','loss','guarantee'].includes(r.result)||r.result!=='unknown'&&(r.pool!==1||r.rank!==5)||r.result!=='unknown'&&r.evidence!=='user')fail('INVALID_BACKUP');rs.add(r.id);return {id:r.id,pool:r.pool,time:r.time,seq:r.seq,item:r.item,name:r.name,kind:r.kind,rank:r.rank,label:r.label,result:r.result,...(typeof r.sourceId==='string'&&/^\d{1,30}$/.test(r.sourceId)?{sourceId:r.sourceId}:{}),...(r.evidence==='user'?{evidence:'user'}:{})};});const batchSequences=new Map();for(const r of a.records){const k=r.pool+'|'+r.time;if(!batchSequences.has(k))batchSequences.set(k,[]);batchSequences.get(k).push(r.seq);}for(const values of batchSequences.values()){values.sort((a,b)=>a-b);if(values.some((v,i)=>v!==i+1))fail('INVALID_BACKUP');}a.spans=a.spans.map(s=>{if(!s||!Number.isInteger(s.pool)||!rs.has(s.first)||!rs.has(s.last)||a.records.find(r=>r.id===s.first).pool!==s.pool||a.records.find(r=>r.id===s.last).pool!==s.pool||order(a.records.find(r=>r.id===s.first),a.records.find(r=>r.id===s.last))>0)fail('INVALID_BACKUP');return {pool:s.pool,first:s.first,last:s.last};});}
return {version:VERSION,accounts:d.accounts.map(a=>({id:a.id,uid:a.uid,region:a.region,server:a.server,updated:a.updated,...(safe(a.nickname||'',80)&&a.nickname?{nickname:a.nickname}:{}),...(a.annotations?{annotations:Object.fromEntries(Object.entries(a.annotations).filter(([k,v])=>a.records.some(r=>r.id===k&&r.pool===1&&r.rank===5)&&v&&['unknown','win','loss','guarantee'].includes(v.result)).map(([k,v])=>[k,{result:v.result,evidence:'user'}]))}:{}),...(a.initialAnchors?{initialAnchors:Object.fromEntries(Object.entries(a.initialAnchors).filter(([k,v])=>k==='1'&&a.records.some(r=>r.id===v&&r.pool===1)))}:{}),...(a.initialStates?{initialStates:Object.fromEntries(Object.entries(a.initialStates).filter(([k,v])=>k==='1'&&['unknown','chance','guaranteed'].includes(v)))}:{}),...(a.manualAcquisitions!==undefined?{manualAcquisitions:validateManualAcquisitions(a.manualAcquisitions)}:{}),records:a.records.sort(order),spans:a.spans}))};}
// 手动取得独立于导入记录和连续区间；此接口只允许新增/删除该独立列表。
function validateManualAcquisitions(rows){
 if(!Array.isArray(rows)||rows.length>1000)fail('INVALID_MANUAL_ENTRY');const ids=new Set();
 return rows.map(r=>{if(!r||typeof r.id!=='string'||!/^manual-[a-zA-Z0-9_-]{1,90}$/.test(r.id)||ids.has(r.id)||typeof r.item!=='string'||!/^\d{1,12}$/.test(r.item)||(r.time!==null&&!stamp(r.time))||!['coral','manual','history'].includes(r.source))fail('INVALID_MANUAL_ENTRY');ids.add(r.id);return {id:r.id,item:r.item,time:r.time,source:r.source};});
}
function limitedCharacters(){const ids=new Set(Banners.banners.filter(b=>[1,101].includes(b.pool)).flatMap(b=>b.up));return (Characters?.records||[]).filter(r=>r.rarity===5&&ids.has(r.resourceId));}
function addManualAcquisitions(account,{item,time,source='coral',count=1}){
 if(!Number.isInteger(count)||count<1||count>99)fail('INVALID_MANUAL_ENTRY');
 const a=validate({version:VERSION,accounts:[account]}).accounts[0];
 const added=Array.from({length:count},()=>({id:'manual-'+globalThis.crypto.randomUUID(),item:String(item),time,source}));
 a.manualAcquisitions=validateManualAcquisitions([...(a.manualAcquisitions||[]),...added]);return a;
}
function removeManualAcquisition(account,id){
 const a=validate({version:VERSION,accounts:[account]}).accounts[0];if(!a.manualAcquisitions?.some(r=>r.id===id))fail('INVALID_MANUAL_ENTRY');
 a.manualAcquisitions=a.manualAcquisitions.filter(r=>r.id!==id);return a;
}
function mergeAccount(old,account,pool,rows,now=new Date().toISOString()){const id=identity(account),a=old?copy(old):{...account,id,records:[],spans:[],updated:now};if(a.id!==id)fail('INVALID_ACCOUNT');if(a.initialStates&&!a.initialAnchors)a.initialAnchors=Object.fromEntries(Object.keys(a.initialStates).map(p=>[p,a.records.find(r=>r.pool===Number(p))?.id]).filter(([,v])=>v));const incoming=normalize(rows,pool),map=new Map(a.records.map(r=>[r.id,r]));let added=0,duplicates=0;
// A changed/truncated equal-time batch is ambiguous: preserve archive, refuse this pool.
const oldBatches=new Map(),newBatches=new Map();for(const r of a.records)if(r.pool===pool)oldBatches.set(r.time,(oldBatches.get(r.time)||0)+1);for(const r of incoming)newBatches.set(r.time,(newBatches.get(r.time)||0)+1);for(const [time,count]of newBatches)if(oldBatches.has(time)&&oldBatches.get(time)!==count)fail('BATCH_CONFLICT');
for(const r of incoming){const prior=map.get(r.id);if(prior){if(signature(prior)!==signature(r))fail('BATCH_CONFLICT');if(prior.sourceId&&r.sourceId&&prior.sourceId!==r.sourceId)fail('BATCH_CONFLICT');if(r.sourceId)prior.sourceId=r.sourceId;duplicates++;}else{map.set(r.id,r);added++;}}
a.records=[...map.values()].sort(order);if(incoming.length)a.spans.push({pool,first:incoming[0].id,last:incoming.at(-1).id});a.spans=coalesce(a);a.updated=now;return {account:a,added,duplicates};}
function coalesce(a){const result=[];for(const pool of new Set(a.spans.map(s=>s.pool))){const rows=a.records.filter(r=>r.pool===pool).sort(order),positions=new Map(rows.map((r,i)=>[r.id,i])),ranges=a.spans.filter(s=>s.pool===pool).map(s=>[positions.get(s.first),positions.get(s.last)]).sort((a,b)=>a[0]-b[0]);const merged=[];for(const range of ranges){if(range[0]>range[1])fail('INVALID_BACKUP');const last=merged.at(-1);if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push(range);}for(const [start,end]of merged)result.push({pool,first:rows[start].id,last:rows[end].id});}return result;}
function combine(base,extra){const d=validate(base),e=validate(extra);for(const account of e.accounts){const a=d.accounts.find(x=>x.id===account.id);if(!a){d.accounts.push(account);continue;}const m=new Map(a.records.map(r=>[r.id,r]));for(const r of account.records){const old=m.get(r.id);if(old&&(signature(old)!==signature(r)||old.sourceId&&r.sourceId&&old.sourceId!==r.sourceId))fail('BATCH_CONFLICT');if(old&&r.sourceId)old.sourceId=r.sourceId;if(!old)m.set(r.id,r);else if(old.result==='unknown'&&old.evidence!=='user'&&r.result!=='unknown')Object.assign(old,{result:r.result,evidence:'user'});}if(account.manualAcquisitions||a.manualAcquisitions){const manual=new Map((a.manualAcquisitions||[]).map(r=>[r.id,r]));for(const r of account.manualAcquisitions||[]){const prev=manual.get(r.id);if(prev&&(prev.item!==r.item||prev.time!==r.time||prev.source!==r.source))fail('BATCH_CONFLICT');manual.set(r.id,r);}a.manualAcquisitions=[...manual.values()];}if(account.annotations||a.annotations)a.annotations={...account.annotations,...a.annotations};if(account.initialAnchors||a.initialAnchors)a.initialAnchors={...account.initialAnchors,...a.initialAnchors};if(account.initialStates||a.initialStates)a.initialStates={...account.initialStates,...a.initialStates};a.records=[...m.values()].sort(order);a.spans=coalesce({...a,spans:[...a.spans,...account.spans]});a.updated=a.updated>account.updated?a.updated:account.updated;}return validate(d);}
// 普通限定池的五星身份与具体活动映射分离；选择型及特殊池不套此排除规则。
function featuredIdentity(r,a,entries=Banners.banners){
 const candidates=Banners.candidates(r,a,entries),named=candidates.filter(b=>b.id===r.banner||b.names.includes(r.label)),scope=named.length?named:candidates;
 if(scope.length&&scope.every(b=>b.selectionRequired))return null;
 if(Banners.standardCharacters.includes(r.item))return false;
 if(fiveCharacterIDs.has(r.item))return true;
 return Banners.resolve(r,a,entries)?.up.includes(r.item)?true:null;
}
function analyse(a,options={}){const pools=[],five=[],months={};if(!a)return {total:0,five:[],pools:[],months:{},intervals:[],average:null,min:null,max:null,limited:{win:0,loss:0,guarantee:0,unknown:0},luck:luck([],0,{win:0,loss:0}),achievements:[]};for(const r of a.records){const m=r.time.slice(0,7);months[m]=(months[m]||0)+1;}
const limited={win:0,loss:0,guarantee:0,unknown:0};let comeback=false;
const classify=Banners.classifier(a);for(const pool of new Set(a.records.map(classify))){const rows=a.records.filter(r=>classify(r)===pool).sort(order),rule=[101,102].includes(pool)&&rows.every(r=>Banners.campaign(r,a))?{...POOLS[pool],repeat:true,four:10,group:Banners.campaign(rows[0],a)}:POOLS[pool]||{key:'unknown',hard:null},spans=coalesce(a).filter(s=>rows.some(r=>r.pool===s.pool)),index=new Map(rows.map((r,i)=>[r.id,i])),source=new Map(a.records.map(r=>[r.id,r])),segment=i=>spans.findIndex(s=>rows[i]&&rows[i].pool===s.pool&&order(rows[i],source.get(s.first))>=0&&order(rows[i],source.get(s.last))<=0);let lastFour=-1,sinceFour=0,lastFive=-1,lastSegment=-2,since=0,lastResult='unknown',guaranteeState='unknown',stateSource='unknown';const pf=[];
rows.forEach((r,i)=>{const seg=segment(i);if(seg!==lastSegment||seg<0){lastFive=-1;lastFour=-1;sinceFour=0;since=0;lastResult='unknown';guaranteeState='unknown';stateSource='unknown';}since++;sinceFour++;if(r.rank>=4){lastFour=i;sinceFour=0;}if(r.rank===5){const exact=lastFive>=0&&seg>=0&&!!rule.repeat,interval=exact?i-lastFive:null,valid=interval!=null&&(!rule.hard||interval<=rule.hard),f={...r,pool,interval:valid?interval:null,observed:rule.hard||rule.repeat?since:null,anomaly:!valid&&interval!=null,segment:seg};pf.push(f);five.push(f);if(pool===1){const resolved=Banners.resolve(r,a,options.banners),banner=resolved&&(Banners.standardCharacters.includes(r.item)||resolved.up.includes(r.item))?resolved:null,manual=a.annotations?.[r.id]||(r.evidence==='user'?{result:r.result}:null),manualKnown=manual&&manual.result!=='unknown',identity=manualKnown?(manual.result==='loss'?false:['win','guarantee'].includes(manual.result)?true:null):featuredIdentity(r,a,options.banners),step=manualKnown?{outcome:manual.result,next:manual.result==='loss'?'guaranteed':['win','guarantee'].includes(manual.result)?'chance':'unknown',conflict:false}:Banners.transition(guaranteeState,identity);if(lastResult==='loss'&&step.outcome==='guarantee')comeback=true;limited[step.outcome]++;f.effectiveResult=step.outcome;f.resultSource=manualKnown?'user':step.outcome==='unknown'?'unknown':banner?'history':'poolRule';f.classificationReason=manualKnown?'manual':step.conflict?'conflict':identity==null?'unknownIdentity':step.outcome==='unknown'?'unknownState':banner?'confirmed':'standardRule';f.bannerId=banner&&(identity!==true||banner.up.includes(r.item))?banner.id:null;f.featuredResult=identity===true?'up':identity===false?'offBanner':'unknown';f.up=identity===true;f.pendingAnnotation=!!manual&&!manualKnown;f.guaranteeBefore=guaranteeState;f.conflict=step.conflict;guaranteeState=step.next;stateSource=step.next!=='unknown'?'history':'unknown';lastResult=step.outcome;}lastFive=i;since=0;}lastSegment=seg;});
const latest=pf.at(-1),lastSeg=segment(rows.length-1),exact=!!rule.repeat&&!!latest&&latest.segment===lastSeg&&lastSeg>=0,pity=exact?rows.length-1-index.get(latest.id):null;
pools.push({pool,rule,fourPity:rule.four&&lastFour>=0&&lastSeg>=0?rows.length-1-lastFour:null,fourObserved:sinceFour,fourAnomaly:!!rule.four&&sinceFour>=rule.four,fourRemaining:rule.four&&lastFour>=0&&lastSeg>=0&&rows.length-1-lastFour<rule.four?rule.four-(rows.length-1-lastFour):null,guaranteeSource:stateSource,guaranteeState:pool===1?guaranteeState:pool===2?'featured':'unknown',remaining:rule.hard&&(rule.repeat||!latest)&&(pity??since)<rule.hard?rule.hard-(pity??since):null,total:rows.length,five:pf,pity,observed:since,gaps:Math.max(0,spans.length-1),anomaly:rule.hard!=null&&(pity!=null?pity:since)>=rule.hard});}
for(const p of pools){if(p.pool!==1)continue;for(let i=0;i<p.five.length;i++){const f=p.five[i],prev=p.five[i-1];f.targetSpend=null;f.targetEvidence=[];if(!f.bannerId||!f.up||f.conflict||!['win','guarantee'].includes(f.effectiveResult)||f.interval==null)continue;if(f.guaranteeBefore==='chance')f.targetSpend=f.interval;else if(f.guaranteeBefore==='guaranteed'&&prev?.effectiveResult==='loss'&&prev.interval!=null&&prev.segment===f.segment&&prev.bannerId===f.bannerId)f.targetSpend=prev.interval+f.interval;if(f.targetSpend!=null)f.targetEvidence=f.guaranteeBefore==='guaranteed'?[prev.id,f.id]:[f.id];}}five.sort(order);const intervals=five.filter(r=>r.interval!=null),eligible=intervals.filter(r=>(POOLS[r.pool]?.repeat)&&POOLS[r.pool]?.hard&&!r.anomaly),values=eligible.map(f=>f.interval),average=values.length?values.reduce((a,b)=>a+b,0)/values.length:null,achievements=[];if(eligible.some(f=>f.interval===1))achievements.push('one');if(eligible.some(f=>f.interval<=10))achievements.push('ten');if(eligible.filter(f=>f.interval>=75).length>=3)achievements.push('pity');if(pools.some(p=>p.five.some((f,i,x)=>i>=2&&x.slice(i-2,i+1).every(v=>v.interval!=null&&v.interval<=20))))achievements.push('streak');if(comeback)achievements.push('comeback');if(eligible.some(f=>f.interval===1))achievements.push('consecutive');const result={records:a.records,total:a.records.length,five,pools,months,intervals,average,min:values.length?values.reduce((a,b)=>Math.min(a,b),Infinity):null,max:values.length?values.reduce((a,b)=>Math.max(a,b),0):null,limited,luck:luck(eligible,pools.filter(p=>p.rule.repeat).reduce((s,p)=>s+p.total,0),limited,a.records.length),achievements};result.achievements=achievementDetails(result).filter(x=>x.state==='unlocked').map(x=>x.key);return result;}
function tier(score){return RATING_RULES.tiers.find(t=>score>=t.min)?.title||'abyss';}
function luck(intervals,total,limited,recordCount=total){
 const speed=intervals.length?intervals.reduce((s,r)=>s+100*(POOLS[r.pool].hard-r.interval)/(POOLS[r.pool].hard-1),0)/intervals.length:null;
 const opportunities=limited.win+limited.loss,known=opportunities+(limited.guarantee||0),results=known+(limited.unknown||0),coverage=results?known/results:null,limitedScore=opportunities?100*limited.win/opportunities:null;
 const useLimited=coverage>=RATING_RULES.minCoverage&&opportunities>=RATING_RULES.minOpportunities;
 const score=speed==null?null:Math.max(0,Math.min(100,useLimited?RATING_RULES.drawWeight*speed+RATING_RULES.limitedWeight*limitedScore:speed));
 const qualified=intervals.length>=RATING_RULES.minIntervals&&total>=RATING_RULES.minPulls,top=intervals.length>=RATING_RULES.topIntervals&&opportunities>=RATING_RULES.topOpportunities;
 const status=!recordCount?'noRecords':!qualified?'insufficient':!useLimited||score>=95&&!top?'provisional':'awarded';
 const reasons=[];if(intervals.length<RATING_RULES.minIntervals)reasons.push('intervalGate');if(total<RATING_RULES.minPulls)reasons.push('pullGate');if(!useLimited)reasons.push('coverageGate');if(score>=95&&!top)reasons.push('topGate');
 return {score,draw:speed,limited:limitedScore,samples:intervals.length,opportunities,coverage,known,results,useLimited,drawWeight:useLimited?RATING_RULES.drawWeight:1,limitedWeight:useLimited?RATING_RULES.limitedWeight:0,status,reasons,confidence:status==='awarded'?'established':status==='provisional'?'provisional':'low',computedTitle:score==null?null:tier(score),title:qualified?tier(score):'observing'};
}
// 普通限定池独立评级，不借用常驻或另一限定池的样本。
function poolLuck(stats,pool){
 if(![1,2].includes(pool))return null;
 const p=stats.pools.find(p=>p.pool===pool),eligible=(p?.five||[]).filter(f=>f.interval!=null&&!f.anomaly);
 const l=luck(eligible,p?.total||0,pool===1?stats.limited:{win:0,loss:0},p?.total||0);
 if(pool===2){
  l.reasons=l.reasons.filter(r=>r!=='coverageGate'&&r!=='topGate');
  if(l.score>=95&&l.samples<RATING_RULES.topIntervals)l.reasons.push('topGate');
  l.status=!p?.total?'noRecords':l.reasons.includes('intervalGate')||l.reasons.includes('pullGate')?'insufficient':l.reasons.includes('topGate')?'provisional':'awarded';
  l.confidence=l.status==='awarded'?'established':l.status==='provisional'?'provisional':'low';
 }
 return {...l,title:l.score==null?'observing':tier(l.score),pool,total:p?.total||0,censored:(p?.five||[]).filter(f=>f.interval==null).length};
}
function achievementRules(stats){
 const rows=(stats.records||[]).slice().sort(order),valid=stats.intervals.filter(r=>POOLS[r.pool]?.repeat&&POOLS[r.pool]?.hard&&!r.anomaly),out=[];
 const add=(key,target,events,known=rows.length>0)=>{events=events.slice().sort(order);const date=events[target-1]?.time||null;out.push({key,target,progress:known?Math.min(target,events.length):null,state:date?'unlocked':known?'notReached':'insufficient',date});};
 for(const n of [1,100,500,1000,3000])add('pull'+n,n,rows);
 for(const n of [1,10,30,100])add('gold'+n,n,stats.five);
 add('one',1,valid.filter(r=>r.interval===1),valid.length>0);add('ten',1,valid.filter(r=>r.interval<=10),valid.length>0);add('fiveEarly',5,valid.filter(r=>r.interval<=20),valid.length>0);
 add('pity',3,valid.filter(r=>r.interval>=75),valid.length>0);add('hard',1,valid.filter(r=>r.interval===POOLS[r.pool].hard),valid.length>0);
 let runs=[],pair=[],comeback=[];for(const p of stats.pools){let run=0;for(let i=0;i<p.five.length;i++){const r=p.five[i],prev=p.five[i-1];run=r.interval!=null&&r.interval<=20&&!r.anomaly?run+1:0;if(run>=3)runs.push(r);if(r.interval===1)pair.push(r);if(prev&&prev.segment===r.segment&&prev.effectiveResult==='loss'&&r.effectiveResult==='guarantee')comeback.push(r);}}
 add('streak',1,runs,valid.length>=3);add('consecutive',2,pair,valid.length>0);add('comeback',1,comeback,stats.limited.win+stats.limited.loss+stats.limited.guarantee>0);
 const unique=predicate=>{let seen=new Set();return rows.filter(r=>predicate(r)&&!seen.has(r.item)&&seen.add(r.item));};
 for(const n of [5,10])add('characters'+n,n,unique(r=>r.rank>=4&&isCharacter(r)));
 for(const n of [5,10])add('weapons'+n,n,unique(r=>r.rank>=4&&isWeapon(r)));
 const copies=new Map();let seven=[];for(const r of stats.five.filter(isCharacter)){copies.set(r.item,(copies.get(r.item)||0)+1);if(copies.get(r.item)===7)seven.push(r);}add('seven',1,seven);
 add('collab',1,stats.five.filter(r=>[101,102].includes(r.pool)));add('weaponGold',1,stats.five.filter(isWeapon));add('fourCollect',30,rows.filter(r=>r.rank===4));
 const months=new Set(),monthEvents=rows.filter(r=>!months.has(r.time.slice(0,7))&&months.add(r.time.slice(0,7)));add('months',6,monthEvents);
 // 连胜/连歪只看普通限定池已确认的小保；大保底不算小保机会，未知、冲突和断档打断连续性。
 let bestWins=0,bestLosses=0,bestEarly20=0,bestEarly10=0,bestOnes=0;
 const win3=[],win5=[],win7=[],loss3=[],afterPity=[],twinStars=[],earlyFour=[],earlyFive=[],threeGold=[],fourGold=[];
 const confirmedWins=stats.five.filter(r=>r.pool===1&&!r.conflict&&!r.anomaly&&r.effectiveResult==='win');
 const opportunities=stats.five.filter(r=>r.pool===1&&!r.conflict&&!r.anomaly&&['win','loss'].includes(r.effectiveResult));
 for(const p of stats.pools){
  if(!POOLS[p.pool]?.repeat||!POOLS[p.pool]?.hard)continue;
  let wins=0,losses=0,early20=0,early10=0,ones=0;
  for(let i=0;i<p.five.length;i++){
   const r=p.five[i],prev=p.five[i-1],continuous=prev&&r.segment>=0&&r.segment===prev.segment&&r.interval!=null;
   if(!continuous){wins=0;losses=0;early20=0;early10=0;ones=0;}
   // 连续间隔必须完整有效，并在同一保底组与连续区间；首金下限、异常均不计入。
   const exact=r.segment>=0&&r.interval!=null&&!r.anomaly;
   early20=exact&&r.interval<=20?early20+1:0;
   early10=exact&&r.interval<=10?early10+1:0;
   ones=exact&&r.interval===1?ones+1:0;
   bestEarly20=Math.max(bestEarly20,early20);bestEarly10=Math.max(bestEarly10,early10);bestOnes=Math.max(bestOnes,ones);
   if(early20===4)earlyFour.push(r);
   if(early10===5)earlyFive.push(r);
   if(ones===2)threeGold.push(r);
   if(ones===3)fourGold.push(r);
   if(continuous&&!r.anomaly&&!prev.anomaly&&prev.interval!=null){
    if(prev.interval>=75&&r.interval<=10)afterPity.push(r);
    if(prev.interval+r.interval<=10)twinStars.push(r);
   }
   if(p.pool!==1)continue;
   if(r.segment<0||r.anomaly||r.conflict||!['win','loss','guarantee'].includes(r.effectiveResult)){wins=0;losses=0;continue;}
   if(r.effectiveResult==='win'){wins++;losses=0;}
   else if(r.effectiveResult==='loss'){losses++;wins=0;}
   bestWins=Math.max(bestWins,wins);bestLosses=Math.max(bestLosses,losses);
   if(r.effectiveResult==='win'&&wins===3)win3.push(r);
   if(r.effectiveResult==='win'&&wins===5)win5.push(r);
   if(r.effectiveResult==='win'&&wins===7)win7.push(r);
   if(r.effectiveResult==='loss'&&losses===3)loss3.push(r);
  }
 }
 // 连续成就显示最长连续机会数，日期取首次达标事件；累计成就继续使用既有事件计数。
 const addRun=(key,target,best,events,known=opportunities.length>0)=>{const date=events.slice().sort(order)[0]?.time||null;out.push({key,target,progress:known?Math.min(target,best):null,state:date?'unlocked':known?'notReached':'insufficient',date});};
 addRun('upWin3',3,bestWins,win3);addRun('upWin5',5,bestWins,win5);addRun('upLoss3',3,bestLosses,loss3);
 add('afterPity',1,afterPity,valid.length>=2);add('twinStars',1,twinStars,valid.length>=2);
 add('upWin10',10,confirmedWins,opportunities.length>0);
 add('fiveCharacters10',10,unique(r=>r.rank===5&&isCharacter(r)));add('months12',12,monthEvents);
 addRun('early4',4,bestEarly20,earlyFour,valid.length>0);
 addRun('consecutive2',2,bestOnes,threeGold,valid.length>0);
 add('afterPity3',3,afterPity,valid.length>=2);
 add('fiveCharacters20',20,unique(r=>r.rank===5&&isCharacter(r)));
 addRun('upWin7',7,bestWins,win7);
 addRun('early5',5,bestEarly10,earlyFive,valid.length>0);
 addRun('consecutive3',3,bestOnes,fourGold,valid.length>0);
 add('afterPity7',7,afterPity,valid.length>=2);
 return out;
}
// 分池成就由同一规则引擎重算；保留旧规则函数供回归核对，不用于展示合并成果。
const ACHIEVEMENT_SCOPES=Object.freeze(['limitedCharacter','limitedWeapon','standard']);
const characterAchievementKeys=['pull1000','gold30','gold100','one','ten','fiveEarly','streak','consecutive','hard','twinStars','afterPity','early4','early5','consecutive2','consecutive3','afterPity3','afterPity7'];
const scopedAchievementKeys={limitedCharacter:[...characterAchievementKeys,'seven','comeback','upWin3','upWin5','upWin7','upLoss3','upWin10','fiveCharacters10','fiveCharacters20','characterRecovery','characterVisitors'],limitedWeapon:['weaponGold','weapons5','weapons10','weaponPair','weaponFive','weaponVariety','weaponQuickForge','weaponSteadyGold','weaponArsenal','weaponMiracle'],standard:['pull100','pull500','gold10','characters5','months','standardDualStar','standardReunion','standardFourVault']};
function scopedAchievements(stats,scope){
 if(scope==null)return ACHIEVEMENT_SCOPES.flatMap(scope=>scopedAchievements(stats,scope));
 if(!ACHIEVEMENT_SCOPES.includes(scope))return [];
 const ids=scope==='limitedCharacter'?[1]:scope==='limitedWeapon'?[2]:[3,4],pools=stats.pools.filter(p=>ids.includes(p.pool)),five=pools.flatMap(p=>p.five).sort(order),records=(stats.records||[]).filter(r=>ids.includes(r.pool)),intervals=five.filter(r=>r.interval!=null);
 const limited=scope==='limitedCharacter'?stats.limited:{win:0,loss:0,guarantee:0,unknown:0};
 const results=achievementRules({...stats,records,pools,five,intervals,limited}).filter(a=>scopedAchievementKeys[scope].includes(a.key));
 const addCustom=(key,target,progress,events,known=records.length>0)=>{const date=events[0]?.time||null;results.push({key,target,progress:known?Math.min(target,progress):null,state:date?'unlocked':known?'notReached':'insufficient',date});};
 if(scope==='limitedCharacter'){
  const recovery=[],visitors=[],seen=new Set();let losses=0;
  for(let i=0;i<five.length;i++){
   const r=five[i],prev=five[i-1];
   if(!prev||r.segment<0||r.segment!==prev.segment||r.interval==null||r.anomaly||r.conflict)losses=0;
   if(r.segment>=0&&!r.anomaly&&!r.conflict&&isCharacter(r)&&r.interval!=null&&r.interval<=30&&!seen.has(r.item)){seen.add(r.item);visitors.push(r);}
   if(r.segment<0||r.anomaly||r.conflict||!['win','loss','guarantee'].includes(r.effectiveResult)){losses=0;continue;}
   if(r.effectiveResult==='loss')losses++;
   if(r.effectiveResult==='win'){if(losses>=3)recovery.push(r);losses=0;}
  }
  addCustom('characterRecovery',1,recovery.length,recovery,five.some(r=>['win','loss'].includes(r.effectiveResult)));
  addCustom('characterVisitors',3,visitors.length,visitors.slice(2),intervals.some(r=>!r.anomaly));
 }
 if(scope==='standard'){
  const dual=[],poolsSeen=new Set(),reunion=[],charactersSeen=new Set(),four=[],weaponsSeen=new Set();
  for(const r of five){if((r.pool===3&&isCharacter(r)||r.pool===4&&isWeapon(r))&&!poolsSeen.has(r.pool)){poolsSeen.add(r.pool);dual.push(r);}if(r.pool===3&&Banners.standardCharacters.includes(r.item)&&!charactersSeen.has(r.item)){charactersSeen.add(r.item);reunion.push(r);}}
  for(const r of records.slice().sort(order))if(r.rank===4&&isWeapon(r)&&!weaponsSeen.has(r.item)){weaponsSeen.add(r.item);four.push(r);}
  addCustom('standardDualStar',2,dual.length,dual.slice(1));addCustom('standardReunion',3,reunion.length,reunion.slice(2));addCustom('standardFourVault',10,four.length,four.slice(9));
 }

 if(scope==='limitedWeapon'){
  const add=(key,target,progress,events,known=records.length>0)=>{const date=events[0]?.time||null;results.push({key,target,progress:known?Math.min(target,progress):null,state:date?'unlocked':known?'notReached':'insufficient',date});};
  const copies=new Map(),pair=[],full=[],unique=[],seen=new Set();let maxCopies=0;
  for(const r of five){const n=(copies.get(r.item)||0)+1;copies.set(r.item,n);maxCopies=Math.max(maxCopies,n);if(n===2)pair.push(r);if(n===5)full.push(r);if(!seen.has(r.item)){seen.add(r.item);unique.push(r);}}
  add('weaponPair',2,maxCopies,pair);add('weaponFive',5,maxCopies,full);add('weaponVariety',5,unique.length,unique.slice(4));
  const quick=[],steady=[];let window=[];
  for(const r of five){if(r.interval==null||r.anomaly||r.segment<0){window=[];continue;}if(window.length&&window.at(-1).segment!==r.segment)window=[];window.push(r);if(window.length>3)window.shift();if(window.length===3&&window.reduce((sum,v)=>sum+v.interval,0)<=60)quick.push(r);if(r.interval<=60)steady.push(r);}
  add('weaponQuickForge',1,quick.length,quick,intervals.some(r=>!r.anomaly));add('weaponSteadyGold',10,steady.length,steady.slice(9),intervals.some(r=>!r.anomaly));
  const catalog=new Map((Weapons?.weapons||[]).map(w=>[String(w.resourceId),w])),types=new Set((Weapons?.weapons||[]).map(w=>w.category)),seenTypes=new Set(),arsenal=[],miracles=[],windows=new Map();let segment=null;
  for(const r of five){
   const weapon=catalog.get(String(r.item));if(weapon?.rarity===5&&!seenTypes.has(weapon.category)){seenTypes.add(weapon.category);arsenal.push(r);}
   if(r.segment<0||r.interval==null||r.anomaly){windows.clear();segment=null;continue;}
   if(segment!==r.segment){windows.clear();segment=r.segment;}
   const chain=windows.get(r.item)||[];chain.push(r);if(chain.length>5)chain.shift();windows.set(r.item,chain);
   if(chain.length===5&&chain.reduce((sum,v)=>sum+v.interval,0)<=200)miracles.push(r);
  }
  addCustom('weaponArsenal',types.size,seenTypes.size,arsenal.slice(types.size-1));
  addCustom('weaponMiracle',1,miracles.length,miracles,intervals.some(r=>!r.anomaly));

 }
 return results.map(a=>({...a,key:scope+'.'+a.key,baseKey:a.key,scope}));
}
function achievementDetails(stats,scope){return scopedAchievements(stats,scope);}
function ratingDetails(stats){const l=stats.luck;return {...l,rules:RATING_RULES,eligiblePulls:stats.pools.filter(p=>p.rule.repeat).reduce((n,p)=>n+p.total,0),reason:l.status==='noRecords'?'noIntervals':l.status==='insufficient'?'smallSample':l.reasons.includes('topGate')?'topGate':l.status==='provisional'?'coverageGate':'qualified',censored:stats.five.filter(f=>f.interval==null).length,gaps:stats.pools.reduce((n,p)=>n+p.gaps,0),excluded:stats.five.filter(f=>f.interval==null||!POOLS[f.pool]?.repeat||!POOLS[f.pool]?.hard||f.anomaly).map(f=>({id:f.id,pool:f.pool,time:f.time,reason:f.anomaly?'intervalAnomaly':!POOLS[f.pool]?.repeat||!POOLS[f.pool]?.hard?'unsupportedPool':'unknownInterval'}))};}
function character(a,item){const all=analyse(a),five=all.five.filter(r=>r.item===String(item)&&isCharacter(r)),values=five.filter(r=>r.interval!=null).map(r=>r.interval),eligible=five.filter(r=>r.interval!=null&&POOLS[r.pool]?.repeat&&POOLS[r.pool]?.hard&&!r.anomaly);return {item:String(item),name:five[0]?.name||'',five,total:five.length,average:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,min:values.length?values.reduce((a,b)=>Math.min(a,b),Infinity):null,max:values.length?values.reduce((a,b)=>Math.max(a,b),0):null,luck:characterLuck(eligible),knownSpend:values.reduce((a,b)=>a+b,0),spendComplete:values.length===five.length,bannerSpend:null};}
function characterLuck(eligible){const l=luck(eligible,eligible.reduce((n,r)=>n+r.interval,0),{win:0,loss:0}),qualified=eligible.length>=3;l.confidence=qualified?'established':'low';l.title=qualified?CHARACTER_TIERS.find(t=>l.score>=t.min).title:'observing';return l;}
function isWeapon(r){return weaponIDs.has(String(r.item))||/武器|Weapon/i.test(r.kind);}
function isCharacter(r){return characterIDs.has(String(r.item))||/角色|Resonator|Character|共鳴者|共鸣者/i.test(r.kind);}
return {validServer,VERSION,RULE_REVISION,RATING_RULES,CHARACTER_TIERS,ACHIEVEMENT_SCOPES,scopedAchievements,limitedCharacters,addManualAcquisitions,removeManualAcquisition,poolLuck,achievementRules,achievementDetails,ratingDetails,validTimestamp:stamp,POOLS,empty,identity,normalize,validate,mergeAccount,combine,analyse,character,isCharacter,isWeapon,tier,luck,order};});

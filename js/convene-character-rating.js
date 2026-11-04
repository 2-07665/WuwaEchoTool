/* Derived, auditable target-window efficiency. Never invent event spending. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./convene-core.js'));else root.ConveneCharacterRating=factory(root.ConveneCore);})(typeof globalThis!=='undefined'?globalThis:this,function(C){
'use strict';
const RULES=Object.freeze({version:'target-window-v1',referencePerCopy:160,tiers:Object.freeze([{tier:'fate',min:95},{tier:'star',min:85},{tier:'lucky',min:70},{tier:'steady',min:40},{tier:'headwind',min:20},{tier:'abyss',min:0}])});
function score(draws,copies){if(!Number.isSafeInteger(copies)||copies<1||copies>7||!Number.isSafeInteger(draws)||draws<copies)throw Error('INVALID_TARGET');return Math.max(0,Math.min(100,100*(1-(draws-copies)/(RULES.referencePerCopy*copies-copies))));}
function evaluate(account,item,target=0,scope='investment'){
 if(!Number.isInteger(target)||target<0||target>6||!['investment','window'].includes(scope))throw Error('INVALID_TARGET');
 const a=account?C.validate({version:1,accounts:[account]}).accounts[0]:null,history=a?C.character(a,item).five:[],copies=target+1;
 const result={version:RULES.version,item:String(item),target,copies,scope,total:history.length,excess:Math.max(0,history.length-7),maxVisibleTarget:Math.min(6,history.length-1),reached:history.length>=copies,actualChain:null,bannerSpend:null,draws:null,windowDraws:null,score:null,tier:'observing',reason:'targetNotReached',anchor:null,end:null,acquisitions:history,selected:history.slice(0,copies),evidence:[],referencePerCopy:RULES.referencePerCopy};
 if(!result.reached)return result;
 const selected=history.slice(0,copies),first=selected[0],end=selected.at(-1);result.end={id:end.id,time:end.time};
 if(scope==='investment'&&selected.every(r=>r.targetSpend!=null)){result.draws=selected.reduce((n,r)=>n+r.targetSpend,0);result.bannerSpend=result.draws;result.evidence=selected.flatMap(r=>r.targetEvidence);result.score=score(result.draws,copies);result.tier=RULES.tiers.find(t=>result.score>=t.min).tier;result.reason='investmentVerified';return result;}
 if(selected.some(r=>r.pool!==1)){result.reason='crossPool';return result;}
 const rows=a.records.filter(r=>r.pool===1).sort(C.order),firstIndex=rows.findIndex(r=>r.id===first.id),endIndex=rows.findIndex(r=>r.id===end.id);
 const start=rows.findIndex(r=>r.rank===5);
 if(start<0||start>=firstIndex){result.reason='missingOrigin';return result;}
 const from=rows[start],span=a.spans.find(s=>s.pool===1&&rows.findIndex(r=>r.id===s.first)<=start&&rows.findIndex(r=>r.id===s.last)>=endIndex);
 if(!span){result.reason='historyGap';return result;}
 let prior=start;for(let i=start+1;i<=endIndex;i++)if(rows[i].rank===5){if(i-prior>C.POOLS[1].hard){result.reason='invalidInterval';return result;}prior=i;}
 result.anchor={id:from.id,time:from.time};result.windowDraws=endIndex-start;result.evidence=rows.slice(start+1,endIndex+1).map(r=>r.id);
 // A visible prior 5★ proves this window's start, not a banner's start or lifetime R.
 if(scope!=='window'){result.reason='bannerUnverified';return result;}
 if(rows.slice(start+1,endIndex+1).some(r=>r.rank===5&&r.item!==String(item)&&C.analyse(a).five.find(f=>f.id===r.id)?.effectiveResult!=='loss')){result.reason='unrelatedResults';return result;}
 result.draws=result.windowDraws;result.score=score(result.draws,copies);result.tier=RULES.tiers.find(t=>result.score>=t.min).tier;result.reason='windowVerified';return result;
}
// 战报按每份取得分配完整区间，优先使用已确认活动证据；不回溯到最早五星。
function journey(account,item,target=null){
 if(target!=null&&(!Number.isInteger(target)||target<0||target>6))throw Error('INVALID_TARGET');
 const a=account?C.validate({version:1,accounts:[account]}).accounts[0]:null,s=C.analyse(a),drawHistory=s.five.filter(r=>r.item===String(item)&&C.isCharacter(r)),manual=(a?.manualAcquisitions||[]).filter(r=>r.item===String(item)).map((r,i)=>({...r,manual:true,kind:'角色',rank:5,pool:0,seq:i+1,interval:null})),history=[...drawHistory,...manual].sort((a,b)=>(a.time||'9999').localeCompare(b.time||'9999')||Number(!!a.manual)-Number(!!b.manual)||(a.seq||0)-(b.seq||0)),pool=s.pools.find(p=>p.pool===1),poolFive=pool?.five||[];
 const entries=history.map((r,i)=>{
  const entry={...r,ordinal:i+1,stage:i<7?'R'+i:'+'+(i-6),draws:null,losses:null,basis:'missing',reason:r.pool===1?'missingOrigin':'crossPool',evidence:[],anchor:null};
  if(r.manual)return {...entry,basis:'manual',reason:'manualAcquisition',evidence:[]};
  if(r.pool!==1||r.anomaly||r.conflict||r.segment<0)return entry;
  if(r.targetSpend!=null)return {...entry,draws:r.targetSpend,basis:'verified',reason:'investmentVerified',evidence:[...r.targetEvidence],losses:r.targetEvidence.length>1?1:0};
  const at=poolFive.findIndex(f=>f.id===r.id),previous=drawHistory[drawHistory.findIndex(f=>f.id===r.id)-1];let start=-1;
  if(previous){if(previous.pool!==1||previous.segment!==r.segment){entry.reason='historyGap';return entry;}start=poolFive.findIndex(f=>f.id===previous.id);}
  else{start=at-1;while(start>=0&&poolFive[start].effectiveResult==='loss')start--;}
  const slice=poolFive.slice(start+1,at+1),anchor=poolFive[start];
  const valid=anchor&&anchor.segment===r.segment&&slice.length&&slice.every(f=>f.segment===r.segment&&f.interval!=null&&!f.anomaly&&!f.conflict),related=slice.slice(0,-1).every(f=>f.effectiveResult==='loss');
  if(r.targetSpend!=null){
   entry.draws=r.targetSpend;entry.basis='verified';entry.reason='investmentVerified';entry.evidence=[...r.targetEvidence];entry.losses=r.targetEvidence.length>1?1:0;
  }else if(valid&&related){
   entry.draws=slice.reduce((n,f)=>n+f.interval,0);entry.losses=slice.slice(0,-1).filter(f=>f.effectiveResult==='loss').length;entry.basis='interval';entry.reason='windowVerified';entry.evidence=slice.map(f=>f.id);
  }else{entry.reason=!anchor?'missingOrigin':!valid?'historyGap':'unrelatedResults';}
  if(entry.draws!=null&&anchor)entry.anchor={id:anchor.id,time:anchor.time};
  return entry;
 });
 const stages=Array.from({length:7},(_,i)=>{
  const selected=entries.slice(0,i+1),reached=entries.length>i,drawn=selected.filter(e=>!e.manual),complete=reached&&drawn.every(e=>e.draws!=null),draws=complete?drawn.reduce((n,e)=>n+e.draws,0):null;
  // 160 为既有每份参考上限，不是玩家百分位；仅对普通限定 UP 角色计算效率。
  const supported=complete&&drawn.length>0&&drawn.every(e=>e.pool===1&&e.up===true),value=supported?score(draws,drawn.length):null;
  return {target:i,stage:'R'+i,reached,drawnCopies:drawn.length,entry:reached?entries[i]:null,draws,knownDraws:selected.reduce((n,e)=>n+(e.draws||0),0),missing:reached?drawn.filter(e=>e.draws==null).length:null,losses:complete?drawn.reduce((n,e)=>n+e.losses,0):null,score:value,tier:value==null?'observing':RULES.tiers.find(t=>value>=t.min).tier};
 });
 const currentTarget=Math.max(0,Math.min(6,entries.length-1)),active=stages[target??currentTarget],excess=entries.slice(7),completion=stages[6],known=entries.filter(e=>e.draws!=null),activeKnown=entries.slice(0,active.target+1).filter(e=>e.draws!=null),main=entries.slice(0,7);
 return {version:'character-journey-v1',item:String(item),total:entries.length,currentTarget:entries.length?currentTarget:null,active,stages,entries,excess,completion,full:completion.reached,excessDraws:excess.length&&excess.every(e=>e.manual||e.draws!=null)?excess.reduce((n,e)=>n+(e.draws||0),0):null,knownDraws:known.reduce((n,e)=>n+e.draws,0),manualCount:manual.length,drawnCount:drawHistory.length,missing:drawHistory.length-known.length,fastest:activeKnown.length?Math.min(...activeKnown.map(e=>e.draws)):null,slowest:activeKnown.length?Math.max(...activeKnown.map(e=>e.draws)):null,average:active.draws!=null&&entries.slice(0,active.target+1).some(e=>!e.manual)?active.draws/entries.slice(0,active.target+1).filter(e=>!e.manual).length:null,mainKnownDraws:main.reduce((n,e)=>n+(e.draws||0),0),mainDraws:main.length&&main.every(e=>e.manual||e.draws!=null)?main.reduce((n,e)=>n+(e.draws||0),0):null,speed:history.some(e=>e.interval!=null)?history.filter(e=>e.interval!=null).reduce((n,e)=>n+e.interval,0)/history.filter(e=>e.interval!=null).length:null,limited:{win:entries.filter(e=>e.effectiveResult==='win').length,loss:entries.reduce((n,e)=>n+(e.losses||0),0)},referencePerCopy:RULES.referencePerCopy};
}
// 展示墙只按取得份数授予称号；未知日期不推算为补登当天。
const CHAIN_TITLES=Object.freeze(['first','echo','attune','companion','harmony','symphony','destiny']);
const CHAIN_ART=Object.freeze(['abyss','headwind','breeze','steady','lucky','star','fate']);
function collection(account){
 const a=account?C.validate({version:1,accounts:[account]}).accounts[0]:null,s=C.analyse(a),manual=a?.manualAcquisitions||[];
 return C.limitedCharacters().map(role=>{
  const drawn=s.five.filter(r=>r.item===role.resourceId&&C.isCharacter(r)),added=manual.filter(r=>r.item===role.resourceId).map(r=>({...r,manual:true})),entries=[...drawn,...added].sort((a,b)=>(a.time||'9999').localeCompare(b.time||'9999')||Number(!!a.manual)-Number(!!b.manual)||(a.id||'').localeCompare(b.id||'')),unknownDates=entries.filter(e=>!e.time).length;
  const stage=entries.length?Math.min(6,entries.length-1):null,milestones=CHAIN_TITLES.map((title,i)=>({stage:i,title,reached:entries.length>i,date:entries.length>i&&!unknownDates?entries[i].time:null}));
  return {item:role.resourceId,role,total:entries.length,drawnCount:drawn.length,manualCount:added.length,stage,title:stage==null?null:CHAIN_TITLES[stage],art:stage==null?'observing':CHAIN_ART[stage],full:stage===6,completedAt:milestones[6].date,firstAt:milestones[0].date,unknownDates,milestones,entries};
 });
}
return {RULES,score,evaluate,journey,collection,CHAIN_TITLES,CHAIN_ART};});

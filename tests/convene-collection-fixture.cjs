const C=require('../js/convene-core.js');
// 每阶各一个角色，另含额外取得与分页角色；仅作展示墙验收合成数据。
function fixture(){const roles=C.limitedCharacters().slice(0,10),events=new Map();let at=0;roles.forEach((r,index)=>{const count=index<7?index+1:1;for(let n=0;n<count;n++){events.set(at,r.resourceId);at+=10;}if(index===6)for(let n=0;n<2;n++){events.set(at,r.resourceId);at+=10;}});
 const rows=Array.from({length:at},(_,i)=>({time:new Date(Date.UTC(2026,7,1)+i*3600000).toISOString().slice(0,19).replace('T',' '),resourceId:events.get(i)||'21010013',name:'合成展示墙角色',resourceType:events.has(i)?'角色':'武器',qualityLevel:events.has(i)?5:3,cardPoolType:'generic'})).reverse();
 const a=C.mergeAccount(null,{uid:'799999978',server:'collection-fixture',region:'cn'},1,rows).account;return {version:1,accounts:[a]};}
module.exports={fixture};

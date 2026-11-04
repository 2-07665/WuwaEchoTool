const C=require('../js/convene-core.js');
const info={uid:'799999979',server:'journey-fixture',region:'cn'};
function build(events,pool=1){const end=Math.max(...Object.keys(events).map(Number));return C.mergeAccount(null,info,pool,Array.from({length:end+1},(_,i)=>({time:new Date(Date.UTC(2026,8,20,9,0,i)).toISOString().slice(0,19).replace('T',' '),resourceId:String(events[i]||21010013),name:'合成测试',resourceType:events[i]?'角色':'武器',qualityLevel:events[i]?5:3,cardPoolType:'generic'})).reverse()).account;}
const events={0:1505,20:1304,40:1104,60:1304,90:1304,140:1304,160:1304,220:1304,260:1304,280:1304,330:1304};
module.exports={build,events};

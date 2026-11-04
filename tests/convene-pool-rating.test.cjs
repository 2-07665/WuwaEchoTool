const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js');
const {archive}=require('./convene-fixture.cjs');

test('限定池评级不借用另一池与常驻样本，旧存档无需迁移',()=>{
 const a=archive().accounts[0],before=JSON.stringify(a),s=C.analyse(a),r=C.poolLuck(s,1),w=C.poolLuck(s,2);
 A.equal(r.samples,s.pools.find(p=>p.pool===1).five.length-1);
 A.equal(w.samples,s.pools.find(p=>p.pool===2).five.length-1);
 A.equal(w.status,'insufficient');A.equal(w.title,C.tier(w.score));
 A.deepEqual(C.poolLuck({...s,pools:s.pools.filter(p=>p.pool===1)},1),r);
 A.equal(C.poolLuck(s,3),null);A.equal(JSON.stringify(a),before);
 A.equal(C.poolLuck(C.analyse(null),2).status,'noRecords');
});

test('武器池不要求小保证据，最高阶只要求本池30个有效间隔',()=>{
 const stats=(n,interval=1,total=300)=>({pools:[{pool:2,total,five:Array.from({length:n},()=>({pool:2,interval}))}],limited:{win:0,loss:100}});
 const provisional=C.poolLuck(stats(10),2);A.equal(provisional.status,'provisional');A.deepEqual(provisional.reasons,['topGate']);
 const top=C.poolLuck(stats(30),2);A.equal(top.score,100);A.equal(top.status,'awarded');A.equal(top.title,'fate');A.equal(top.useLimited,false);
 const ordinary=C.poolLuck(stats(10,40),2);A.equal(ordinary.status,'awarded');
 A.equal(C.poolLuck(stats(30,1,299),2).status,'insufficient');
});

test('异常间隔与未知首段不进入限定池评分',()=>{
 const s={pools:[{pool:1,total:600,five:[{pool:1,interval:null},{pool:1,interval:1,anomaly:true},{pool:1,interval:80}]}],limited:{win:0,loss:0}};
 const l=C.poolLuck(s,1);A.equal(l.samples,1);A.equal(l.score,0);A.equal(l.censored,1);A.equal(l.title,'abyss');
});

test('限定池有分数即显示称号，低样本和零分不拦截，空样本仍待观测',()=>{
 for(const pool of [1,2])for(const interval of [1,40,80]){const l=C.poolLuck({pools:[{pool,total:81,five:[{pool,interval}]}],limited:{win:0,loss:0}},pool);A.equal(l.title,C.tier(l.score));}
 A.equal(C.poolLuck(C.analyse(null),1).title,'observing');
});

const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../js/convene-core.js'),R=require('../js/convene-character-rating.js'),{build,events}=require('./convene-journey-fixture.cjs');
const details={item:'1304',source:'coral',time:'2026-10-01 12:00:00',count:6};
test('六次兑换补足R6但不改变一份抽取的效率、原始记录、保底或成就',()=>{
 const a=build({0:1505,20:1304}),before=JSON.stringify(a),base=C.analyse(a),added=C.addManualAcquisitions(a,details),j=R.journey(added,'1304');
 A.equal(j.total,7);A.equal(j.manualCount,6);A.equal(j.drawnCount,1);A.equal(j.completion.draws,20);A.equal(j.completion.score,R.score(20,1));A.equal(j.missing,0);A.equal(j.entries[1].draws,null);A.equal(j.entries[1].manual,true);A.deepEqual(C.analyse(added),base);A.equal(JSON.stringify(a),before);
 const removed=C.removeManualAcquisition(added,added.manualAcquisitions[0].id);A.equal(removed.manualAcquisitions.length,5);A.deepEqual(removed.records,a.records);A.deepEqual(removed.spans,a.spans);A.equal(R.journey(removed,'1304').active.score,R.score(20,1));
});
test('删除接口严格拒绝导入ID、伪造来源、重复ID及非法时间，原数据不变',()=>{
 const a=build(events),before=JSON.stringify(a);A.throws(()=>C.removeManualAcquisition(a,a.records[0].id),/INVALID_MANUAL_ENTRY/);
 A.throws(()=>C.addManualAcquisitions(a,{...details,source:'imported'}),/INVALID_MANUAL_ENTRY/);A.throws(()=>C.addManualAcquisitions(a,{...details,count:0}),/INVALID_MANUAL_ENTRY/);A.throws(()=>C.addManualAcquisitions(a,{...details,time:'2026-02-30 12:00:00'}),/INVALID_MANUAL_ENTRY/);
 const added=C.addManualAcquisitions(a,{...details,count:1}),entry=added.manualAcquisitions[0];A.throws(()=>C.validate({version:1,accounts:[{...added,manualAcquisitions:[entry,entry]}]}),/INVALID_MANUAL_ENTRY/);A.equal(JSON.stringify(a),before);
});
test('备份往返、重复合并与后续导入保留手动列表，同ID不同内容拒绝合并',()=>{
 const a=build(events),added=C.addManualAcquisitions(a,{...details,count:2}),backup={version:1,accounts:[added]};A.deepEqual(C.validate(JSON.stringify(backup)),backup);A.deepEqual(C.combine(backup,backup),backup);
 const other=C.validate(backup);other.accounts[0].manualAcquisitions[0].source='manual';A.throws(()=>C.combine(backup,other),/BATCH_CONFLICT/);
 const info={uid:a.uid,server:a.server,region:a.region};const updated=C.mergeAccount(added,info,2,[{time:'2026-10-02 00:00:00',resourceId:'21010015',name:'合成测试',resourceType:'武器',qualityLevel:5,cardPoolType:'generic'}]).account;A.deepEqual(updated.manualAcquisitions,added.manualAcquisitions);A.equal(C.VERSION,1);
});
test('只有补入也可显示进度，无抽取效率；补入不切断原抽取区间，满链后继续独立',()=>{
 const a=build(events),added=C.addManualAcquisitions(a,{item:'1205',source:'manual',time:'2026-09-19 00:00:00',count:2}),j=R.journey(added,'1205');A.equal(j.total,2);A.equal(j.drawnCount,0);A.equal(j.active.score,null);A.equal(j.active.draws,0);
 const first=C.addManualAcquisitions(build({0:1505,20:1304,40:1304}),{...details,time:'2026-09-19 00:00:00',count:1}),mixed=R.journey(first,'1304');A.deepEqual(mixed.entries.filter(e=>!e.manual).map(e=>e.draws),[20,20]);A.equal(mixed.active.score,R.score(40,2));
 const extra=R.journey(C.addManualAcquisitions(a,{...details,count:1}),'1304');A.equal(extra.excess.length,3);A.equal(extra.completion.score,R.journey(a,'1304').completion.score);
});

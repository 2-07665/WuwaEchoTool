const {test}=require('node:test'),A=require('node:assert/strict'),V=require('../js/convene-visuals.js'),C=require('../js/convene-core.js');
const titles=['observing',...C.RATING_RULES.tiers.slice().reverse().map(t=>t.title)];

test('限定池八阶分别增加真实边框路径，两池和整体使用不同图纹',()=>{
 for(const pool of [1,2]){
  let previous=0;const shapes=new Set();
  for(const title of titles){const art=V.poolFrameArtwork(title,pool);A.ok(art.length>previous);previous=art.length;shapes.add(JSON.stringify(art));A.notDeepEqual(art,V.frameArtwork(title,600,900));
   A.notDeepEqual(art,V.poolFrameArtwork(title,pool===1?2:1));
   const svg=V.poolFrame(title,pool);A.ok(svg.includes('data-frame-tier="'+title+'"'));A.ok(svg.includes('cv-pool-engraving-mobile'));A.ok(!svg.includes('NaN'));
  }A.equal(shapes.size,9);
 }
});

test('限定池徽章同属八阶，各阶图形及两池中心意象不同',()=>{
 for(const family of ['pool-character','pool-weapon']){const signatures=new Set();for(const title of titles){const art=V.artwork(title,family);signatures.add(JSON.stringify(art));A.notDeepEqual(art,V.artwork(title,'overall'));A.ok(V.badge(title,family).includes('data-family="'+family+'"'));}A.equal(signatures.size,9);}
 for(const title of titles)A.notDeepEqual(V.artwork(title,'pool-character'),V.artwork(title,'pool-weapon'));
});

test('独立分享与页面共用所有阶级的同源边框路径',()=>{
 const original=global.Path2D;global.Path2D=class{constructor(d){this.d=d;}};
 try{for(const pool of [1,2])for(const title of titles){const painted=[],ctx={save(){},restore(){},translate(){},fill(){},stroke(path){painted.push(path.d);}};V.drawPoolFrame(ctx,title,pool,28,202,1144,365);A.deepEqual(painted,V.poolFrameArtwork(title,pool,1144,365).map(p=>p.d));}}
 finally{if(original===undefined)delete global.Path2D;else global.Path2D=original;}
});

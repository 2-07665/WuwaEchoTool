const {spawn}=require('node:child_process'),http=require('node:http'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'evidence/serve-smoke.txt');
const child=spawn(process.execPath,['handoff/serve.cjs'],{cwd:path.join(__dirname,'stage/WuwaEchoTool'),env:{...process.env,PORT:'18214'},stdio:['ignore','pipe','pipe']});
const timer=setTimeout(()=>{child.kill();fs.writeFileSync(out,'FAIL timeout\n');process.exitCode=1;},15000);
child.stdout.once('data',()=>{http.get('http://127.0.0.1:18214/index.html?view=register',r=>{let s='';r.on('data',d=>s+=d);r.on('end',()=>{try{assert.equal(r.statusCode,200);assert.ok(s.includes('<html'));fs.writeFileSync(out,'PASS HTTP 200; '+Buffer.byteLength(s)+' HTML bytes; local preview entry available.\n');}catch(e){fs.writeFileSync(out,String(e));process.exitCode=1;}finally{clearTimeout(timer);child.kill();}});}).on('error',e=>{fs.writeFileSync(out,String(e));process.exitCode=1;clearTimeout(timer);child.kill();});});
child.on('error',e=>{fs.writeFileSync(out,String(e));clearTimeout(timer);process.exitCode=1;});

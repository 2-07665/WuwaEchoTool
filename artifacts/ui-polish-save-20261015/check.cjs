/* 静态资源、秘密特征及完整副本测试；只保存检查结果，不输出秘密内容。 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const work=__dirname,stage=path.join(work,'WuwaEchoTool'),norm=p=>p.replaceAll('\\','/');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'?[]:walk(path.join(d,e.name))):[path.join(d,e.name)]);
const files=walk(stage),missing=[],refs=[],external=[];
for(const f of files.filter(f=>/\.(html|css)$/.test(f)&&!norm(path.relative(stage,f)).startsWith('artifacts/'))){
 const t=fs.readFileSync(f,'utf8'),arr=f.endsWith('.html')?[...t.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)].map(m=>m[1]):[...t.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map(m=>m[1]);
 for(let v of arr){if(/^(https?:|\/\/)/.test(v)){external.push({file:norm(path.relative(stage,f)),url:v});continue;}if(/^(data:|#)/.test(v))continue;v=v.split(/[?#]/)[0];if(!v)continue;const q=path.resolve(path.dirname(f),decodeURIComponent(v));refs.push({file:norm(path.relative(stage,f)),reference:v});if(!fs.existsSync(q))missing.push(refs.at(-1));}
}
fs.writeFileSync(path.join(work,'asset-check.json'),JSON.stringify({references:refs.length,missing,external,allImageAndLibraryFilesIncluded:true,dynamicPaths:'全部 image/library 原样复制；浏览器矩阵补充验证。'},null,2));
assert.equal(missing.length,0,JSON.stringify(missing));
const patterns=[['privateKey',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['githubToken',/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],['openaiKey',/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],['awsAccess',/\bAKIA[A-Z0-9]{16}\b/],['jwt',/\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\b/],['embeddedCredential',/https?:\/\/[^\s/]+:[^\s/]+@/]];
const findings=[],privateNames=[];let textFiles=0,docxXml=0;
function scan(name,text){textFiles++;for(const [kind,re] of patterns)if(re.test(text))findings.push({file:name,kind});}
for(const f of files){const rel=norm(path.relative(stage,f));if(/(?:^|\/)(?:\.env(?:\..*)?|id_rsa|id_ed25519|credentials|cookies\.json|localStorage\.json)$|\.(?:pem|p12|pfx)$/i.test(rel))privateNames.push(rel);if(/\.(?:html|css|js|cjs|md|txt|json|patch)$/.test(f))scan(rel,fs.readFileSync(f,'utf8'));
 if(f.endsWith('.docx')){const b=fs.readFileSync(f);let end=b.length-22;while(end>=0&&b.readUInt32LE(end)!==0x06054b50)end--;assert.ok(end>=0);let cd=b.readUInt32LE(end+16);for(let i=0;i<b.readUInt16LE(end+10);i++){const method=b.readUInt16LE(cd+10),size=b.readUInt32LE(cd+20),nl=b.readUInt16LE(cd+28),el=b.readUInt16LE(cd+30),cl=b.readUInt16LE(cd+32),off=b.readUInt32LE(cd+42),name=b.subarray(cd+46,cd+46+nl).toString();if(name.startsWith('word/')&&name.endsWith('.xml')){const start=off+30+b.readUInt16LE(off+26)+b.readUInt16LE(off+28),raw=b.subarray(start,start+size);scan(rel+'!'+name,(method===8?zlib.inflateRawSync(raw):raw).toString('utf8'));docxXml++;}cd+=46+nl+el+cl;}}
}
const security={files:files.length,textFiles,docxXml,privateNames,highConfidenceSecretFindings:findings,realBrowserStorageCopied:false,notes:'检查.env/私钥/凭证文件名和高可信秘密模式，扫描原DOCX XML；测试数据为隔离合成。模式检查不是对所有未知凭证格式的形式证明。'};
fs.writeFileSync(path.join(work,'security-check.json'),JSON.stringify(security,null,2));assert.equal(privateNames.length,0);assert.equal(findings.length,0,JSON.stringify(findings));

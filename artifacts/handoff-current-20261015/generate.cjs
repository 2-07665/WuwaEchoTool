/* 本次仅生成当前快照及交接，沿用已验证ZIP封装器，不回写产品。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'../..');let s=fs.readFileSync(path.join(root,'artifacts/list-library-fix-20261015/build.cjs'),'utf8');
s=s.replace("'list-library-fix-20261015'];","'list-library-fix-20261015','handoff-current-20261015'];");
s=s.replaceAll("walk(path.join(work,'baseline'))","walk(path.join(root,'artifacts/list-library-fix-20261015/baseline'))").replace("path.relative(path.join(work,'baseline'),f)","path.relative(path.join(root,'artifacts/list-library-fix-20261015/baseline'),f)");
s=s.replace("json=p=>JSON.parse(read(path.join(work,p)))","json=p=>JSON.parse(read(path.join(root,'artifacts/list-library-fix-20261015',p)))");
s=s.replace("write('handoff/evidence/'+f,fs.readFileSync(path.join(work,f)))","write('handoff/evidence/'+f,fs.readFileSync(path.join(['unit-results.txt','static-results.txt','asset-check.json','security-check.json'].includes(f)?work:path.join(root,'artifacts/list-library-fix-20261015'),f)))");
const marker="};for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);";assert.ok(s.includes(marker));
s=s.replace(marker,`};
 const currentList=JSON.parse(read(path.join(work,'preview/results.json'))),currentShare=JSON.parse(read(path.join(work,'qa/ui-ux-focused/results.json')));assert.equal(currentList.reports.length,12);assert.equal(currentShare.exports.length,30);assert.equal(currentList.pageErrors.length,0);assert.equal(currentShare.pageErrors.length,0);
 write('handoff/evidence/current-list-library-results.json',JSON.stringify(currentList,null,2));write('handoff/evidence/current-share-results.json',JSON.stringify(currentShare,null,2));
 notes['00_READ_FIRST.md']+='\\n本次Codex任务仅整理、检查和封装，没有改产品。最新产品任务是角色列表/声骸库精准修复；之后只重新启动本地8123服务。解压包必须自行启动node handoff/serve.cjs，重启电脑后后台服务不会自动恢复；端口被占用时可设置PORT。\\n';
 notes['01_CURRENT_PROGRESS.md']=notes['01_CURRENT_PROGRESS.md'].replace('已测试：本轮72单元、244引用/103脚本、12组精准布局/收藏、18组现有操作。历史24组保存、36张分享导出、42工作台/Classic等仅属前次记录，本轮未冒充重跑。','已测试：本次重新执行72单元、244引用/103脚本、12组精准布局/收藏和30张分享PNG；18组全站操作及24组保存/42工作台/Classic属前次历史记录，本次未重跑。').replace('本轮未重新导出分享，分享源码未变。','本次两版分享三语回归已重测，分享源码未改。');
 notes['04_LATEST_CHANGES.md']='# 本次整理与最新产品开发\\n\\n本次只新增artifacts/handoff-current-20261015内的交接工具/测试证据及封装文档，不改产品源码、公式或UI。此前最近一次操作为重新启动8123本地服务，未改产品文件；以下记录最新产品任务的精确变化。累计Git差异仍包含更早未提交工作。\\n\\n'+notes['04_LATEST_CHANGES.md'];
 notes['02_MODULE_MAP.md']=notes['02_MODULE_MAP.md'].replaceAll('角色缩图和独立编辑/删除入口在character-dock.js','角色缩图和独立删除入口在character-dock.js（重复编辑入口已删除）');
 for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);`);
fs.writeFileSync(path.join(__dirname,'build.cjs'),s);console.log('当前完整快照封装器已生成。');

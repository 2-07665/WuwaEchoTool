/* 本次只重新整理当前工作目录，严格区分重测与历史产品任务证据。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');let s=fs.readFileSync('artifacts/share-equipment-20261015/build.cjs','utf8');
s=s.replace("'share-equipment-20261015'];","'share-equipment-20261015','handoff-latest-20261015'];");
s=s.replaceAll("walk(path.join(work,'baseline'))","walk(path.join(root,'artifacts/share-equipment-20261015/baseline'))").replace("path.relative(path.join(work,'baseline'),f)","path.relative(path.join(root,'artifacts/share-equipment-20261015/baseline'),f)");
s=s.replace("json=p=>JSON.parse(read(path.join(work,p)))","json=p=>JSON.parse(read(path.join(root,'artifacts/share-equipment-20261015',p)))");
s=s.replace("write('handoff/evidence/'+f,fs.readFileSync(path.join(work,f)))","write('handoff/evidence/'+f,fs.readFileSync(path.join(['unit-results.txt','static-results.txt','asset-check.json','security-check.json'].includes(f)?work:path.join(root,'artifacts/share-equipment-20261015'),f)))");
s=s.replace("read(path.join(work,'share/results.json'))","read(path.join(root,'artifacts/share-equipment-20261015/share/results.json'))");
// 共享循环中的历史60张和本次30张来自不同目录。
s=s.replace("for(const f of ['share/results.json','qa/ui-ux-focused/results.json'])write('handoff/evidence/'+f,fs.readFileSync(path.join(work,f)))","for(const f of ['share/results.json','qa/ui-ux-focused/results.json'])write('handoff/evidence/'+f,fs.readFileSync(path.join(f.startsWith('share/')?path.join(root,'artifacts/share-equipment-20261015'):work,f)))");
const marker=" for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);";assert.ok(s.includes(marker));
s=s.replace(marker,` const current=JSON.parse(read(path.join(work,'preview/results.json')));assert.equal(current.reports.length,12);assert.equal(current.pageErrors.length,0);write('handoff/evidence/current-equipment-results.json',JSON.stringify(current,null,2));
 notes['00_READ_FIRST.md']+='\\n本次任务只检查、生成handoff文档和封装，未改产品源码/公式/UI。最新产品开发为上一次分享结算与装备详情精修，见04。重启电脑后需重新运行node handoff/serve.cjs，后台服务不会自动恢复；端口冲突可设置PORT。\\n';
 notes['01_CURRENT_PROGRESS.md']=notes['01_CURRENT_PROGRESS.md'].replace('已测试：本轮72单元、244引用/104脚本、12组装备/布局、18组操作，30常规及60多情境PNG、雷达任务前对照和Classic像素。历史保存/工作台矩阵未冒充重跑。','已测试：本次重新执行72单元、244引用/104脚本、12组装备详情与30常规PNG。上一次18组操作、60多情境PNG/任务前雷达对照/Classic像素属于历史证据，本次未重跑；保存/工作台其他矩阵也单列历史。');
 notes['04_LATEST_CHANGES.md']='# 本次整理与最新产品修改\\n\\n本次只新增artifacts/handoff-latest-20261015中的封装工具、handoff文档和检查结果，未修改产品。以下记录上一轮最新产品任务；累计Git差异包含更早未提交工作，不能全归属本次。\\n\\n'+notes['04_LATEST_CHANGES.md'];
 for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);`);
fs.writeFileSync('artifacts/handoff-latest-20261015/build.cjs',s);

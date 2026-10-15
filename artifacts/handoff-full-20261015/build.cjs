/* 完整交接快照：产品与测试原文件逐字节复制，新增工具仅放在 handoff。 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const work=__dirname,root=path.resolve(work,'../..'),stage=path.join(work,'WuwaEchoTool'),norm=p=>p.replaceAll('\\','/');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>{const f=path.join(stage,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const git=args=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
const metadata=path.join(work,'snapshot.json');
if(process.argv[2]==='prepare'){
 if(fs.existsSync(stage))throw Error('快照目录已经存在，不覆盖已有内容。');
 const selected=[],excluded=[];
 for(const entry of fs.readdirSync(root,{withFileTypes:true})){
  if(['.git','.idea','artifacts'].includes(entry.name)){excluded.push({path:entry.name,reason:entry.name==='artifacts'?'按用途选取历史测试源码、基准与结果；批量重复图片和构建副本不复制。':'Git 历史或编辑器本机缓存。'});continue;}
  const files=entry.isDirectory()?walk(path.join(root,entry.name)):[path.join(root,entry.name)];
  for(const f of files){const rel=norm(path.relative(root,f));if(/(?:^|\/)(?:node_modules|\.cache|coverage|playwright-report|test-results)(?:\/|$)|(?:^|\/)(?:\.env(?:\..*)?|Thumbs\.db|\.DS_Store)$|\.(?:zip|log|tmp)$/i.test(rel)){excluded.push({path:rel,reason:'依赖、秘密配置、缓存或可重建产物。'});continue;}selected.push(rel);}
 }
 // 历史测试源码和比较基准有实际用途；不将它们当作当前产品入口。
 for(const f of walk(path.join(root,'artifacts'))){const rel=norm(path.relative(root,f));if(rel.startsWith('artifacts/handoff-full-20261015/'))continue;if(/\.(?:cjs|js|html|css)$/.test(rel))selected.push(rel);}
 for(const rel of ['artifacts/role-workspace-redesign/share-parity.json','artifacts/role-workspace-redesign/qa/operation-optimization/browser-results.json','artifacts/role-workspace-redesign/qa/register-integration/results.json','artifacts/role-workspace-redesign/qa/ui-ux-focused/results.json','artifacts/official-import/browser-results.json','artifacts/operation-optimization/browser-results.json','artifacts/operation-optimization/unit-results.txt'])if(fs.existsSync(path.join(root,rel)))selected.push(rel);
 for(const rel of selected){const target=path.join(stage,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,rel),target);assert.equal(hash(fs.readFileSync(target)),hash(fs.readFileSync(path.join(root,rel))),rel);}
 const snapshot={date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',dateStyle:'short',timeStyle:'medium'}).format(new Date()),gitHead:git(['rev-parse','HEAD']).trim(),gitBranch:git(['branch','--show-current']).trim(),originalFiles:selected.map(rel=>({path:rel,bytes:fs.statSync(path.join(stage,rel)).size,sha256:hash(fs.readFileSync(path.join(stage,rel)))})),excluded};
 fs.writeFileSync(metadata,JSON.stringify(snapshot,null,2));
 write('handoff/GIT_STATUS.txt',git(['status','--short','--untracked-files=all']));
 write('handoff/GIT_DIFF_STAT.txt',git(['diff','--stat']));
 write('handoff/GIT_WORKTREE.patch',git(['diff','--binary','HEAD','--','css','js','docs','tests','*.html']));
 write('handoff/SNAPSHOT_ORIGINAL_FILES.json',JSON.stringify(snapshot,null,2));
 const baselineFiles=['css/role-register.css','js/role-register-renderer.js','js/role-register-page.js','js/register-share.js'];
 const baselines=baselineFiles.map(rel=>{const base=path.join(root,'artifacts/role-workspace-redesign',path.basename(rel));return {current:rel,baseline:norm(path.relative(root,base)),available:fs.existsSync(base),currentSha256:hash(fs.readFileSync(path.join(root,rel))),baselineSha256:fs.existsSync(base)?hash(fs.readFileSync(base)):null,identical:fs.existsSync(base)&&hash(fs.readFileSync(base))===hash(fs.readFileSync(path.join(root,rel)))};});
 write('handoff/LATEST_BASELINE_COMPARISON.json',JSON.stringify(baselines,null,2));
 write('handoff/browser-tools/package.json',fs.readFileSync(path.join(work,'tools/package.json')));write('handoff/browser-tools/package-lock.json',fs.readFileSync(path.join(work,'tools/package-lock.json')));
 write('handoff/run-browser.cjs',`/* 仅适配测试运行环境，不改原始测试或产品代码。 */
const path=require('node:path'),Module=require('node:module');
const entry=process.argv[2];if(!entry||!entry.startsWith('tests/')||path.extname(entry)!=='.cjs'||path.basename(entry)!==entry.slice(6))throw Error('请指定 tests/ 下的浏览器测试。');
const target=require.resolve('playwright',{paths:[path.join(__dirname,'browser-tools')]});
const original=Module._resolveFilename;Module._resolveFilename=function(request,...args){if(/(?:^|[\\\\/])playwright$/.test(request)||request==='playwright')request=target;return original.call(this,request,...args);};
const playwright=require(target),launch=playwright.chromium.launch.bind(playwright.chromium);playwright.chromium.launch=options=>{const next={...options};if(process.env.WUWA_BROWSER_CHANNEL)next.channel=process.env.WUWA_BROWSER_CHANNEL;else delete next.channel;return launch(next);};
process.chdir(path.resolve(__dirname,'..'));require(path.resolve(process.cwd(),entry));
`);
 write('handoff/serve.cjs',`/* 零依赖本机 HTTP 预览；只读取解压后的静态文件。 */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||8123);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.cjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.wasm':'application/wasm','.gz':'application/gzip','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file===root)file=path.join(root,'index.html');}catch(e){return res.writeHead(400).end();}if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:data);});}).listen(port,'127.0.0.1',()=>console.log('WuwaEchoTool http://127.0.0.1:'+port+'/index.html?view=register'));
`);
 write('handoff/verify.cjs',`/* 验证负载清单；清单自身不能包含自己的哈希。 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'FILE_MANIFEST.json'),'utf8'));for(const file of manifest.files){const data=fs.readFileSync(path.join(root,file.path));assert.equal(data.length,file.bytes,file.path);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),file.sha256,file.path);}console.log('PASS '+manifest.files.length+' SHA-256 files; metadata exclusions: '+manifest.selfExcluded.join(', '));
`);
 const originalBytes=snapshot.originalFiles.reduce((a,f)=>a+f.bytes,0);
 console.log(JSON.stringify({stage,originalFiles:selected.length,originalBytes,baselines},null,2));
}
if(process.argv[2]==='finalize'){
 const snapshot=JSON.parse(read(metadata));
 // 再次确认本次整理没有改写任何原始文件。
 for(const f of snapshot.originalFiles){assert.equal(hash(fs.readFileSync(path.join(root,f.path))),f.sha256,'工作目录在封装中改变：'+f.path);assert.equal(hash(fs.readFileSync(path.join(stage,f.path))),f.packagedSha256||f.sha256,'副本不一致：'+f.path);}
 const roleResults=JSON.parse(read(path.join(work,'qa/role/results.json'))),shareResults=JSON.parse(read(path.join(work,'qa/ui-ux-focused/results.json')));
 assert.equal(roleResults.reports.length,42);assert.equal(roleResults.pageErrors.length,0);assert.equal(shareResults.exports.length,30);assert.equal(shareResults.pageErrors.length,0);
 const portableRole=JSON.parse(read(path.join(work,'qa/portable-role/results.json'))),portableShare=JSON.parse(read(path.join(work,'qa/portable/ui-ux-focused/results.json')));assert.equal(portableRole.reports.length,42);assert.equal(portableRole.pageErrors.length,0);assert.equal(portableShare.exports.length,30);assert.equal(portableShare.pageErrors.length,0);write('handoff/evidence/portable-role-results.json',JSON.stringify(portableRole,null,2));write('handoff/evidence/portable-share-results.json',JSON.stringify(portableShare,null,2));
 for(const [from,to] of [['qa/role/results.json','handoff/evidence/role-results.json'],['qa/ui-ux-focused/results.json','handoff/evidence/share-results.json'],['checks.json','handoff/evidence/checks.json'],['asset-check.json','handoff/evidence/asset-check.json'],['security-check.json','handoff/evidence/security-check.json'],['qa/share-parity.json','handoff/evidence/share-parity.json']])write(to,fs.readFileSync(path.join(work,from)));
 for(const name of ['1440-zh-TW-manual-workspace.png','1440-zh-TW-manual-echo-cards.png','1440-zh-TW-manual-single-analysis.png','390-zh-TW-manual-workspace.png','390-zh-TW-manual-echo-cards.png','390-zh-TW-manual-single-analysis.png'])write('handoff/evidence/'+name,fs.readFileSync(path.join(work,'qa/role',name)));
 write('handoff/evidence/zh-TW-normal-detailed.png',fs.readFileSync(path.join(work,'qa/ui-ux-focused/zh-TW-normal-detailed.png')));
 const notes={
 '00_READ_FIRST.md':`# WuwaEchoTool 完整交接包

封装日期：${snapshot.date}（Asia/Taipei）。这是当前工作目录快照，包含全部未提交的产品修改，不是 HEAD 导出、补丁包或只有文档的摘要。Register 产品线 / package.json 版本为 v2.0.0；共享目录 base.js 的 toolVersion 是 3.7.48，两者表示不同版本，不擅自合并改号。

## 用途与完成情况

用于鸣潮角色与五件声骸管理、评分与分析、候选方案比较、官方资料导入、截图识别校对、分享养成及相关工具。Register 与 Classic 共存。最近产品任务已完成角色工作台装备卡片重设，保留此前两轮 UI/UX 修改；随后只重启了本机服务。本次交接仅复制、记录、检查及封装，没有产品修改。真实设备、真实账号与线上图片仍待人工验收。

## 阅读顺序

1. 01_CURRENT_PROGRESS.md、04_LATEST_CHANGES.md、05_TEST_REPORT.md。
2. 02_MODULE_MAP.md，按需求打开真实源文件；不要将 artifacts 中的历史副本当作产品代码。
3. 工作台优先读 docs/role-workspace-redesign.md、mccost.html、mccost-readonly.html、js/role-register-renderer.js、js/role-register-page.js、css/role-register.css。
4. 涉及数据时再读 js/character-core.js、js/role-view-model.js、js/base.js、js/role-register-controller.js；文案看 js/i18n-dictionaries.js。
5. 03_NEXT_IMPROVEMENTS.md、06_FILE_MANIFEST.md。FILE_INDEX.md 可逐模块定位；无需将 OCR 二进制和供应商文件放入模型上下文，但完整运行必须保留。

## 启动与测试

安装 Node.js（本次验证 v24.13.0），解压后进入 WuwaEchoTool。运行 node handoff/serve.cjs，打开 http://127.0.0.1:8123/index.html?view=register。已有服务占用时可设置 PORT=8124。普通页面与本地 OCR 的运行无需 npm install；Worker 需要 HTTP，不宜通过 file:// 判断。

运行 npm test、npm run check:static。原 package.json 原样保留，没有生产构建或 TypeScript；原仓库没有 lockfile，因为这两个任务只用 Node 内置模块。浏览器测试的独立辅助依赖与完整锁文件在 handoff/browser-tools，安装：npm ci --prefix handoff/browser-tools，然后 npm exec --prefix handoff/browser-tools -- playwright install chromium。运行 node handoff/run-browser.cjs tests/role-workspace-browser.cjs；分享回归用 tests/ui-ux-browser.cjs。Windows Edge 可设置 WUWA_BROWSER_CHANNEL=msedge。原测试有本机绝对 Playwright 路径与 Edge 默认值，辅助执行器只在运行时适配，测试原文件没有被改写。唯一安全例外：js/base.js 中未使用的遗留硬编码 JWT 在副本中置空，原工作目录不变；见 SANITIZATION.md 与哈希记录。

浏览器测试生成大量 PNG，可用 WUWA_ROLE_PREVIEW_OUT / WUWA_QA_OUT 指定外部临时目录。辅助依赖不是产品运行依赖；没有把 node_modules 或浏览器安装包压入 ZIP。

## 外部环境与边界

官方导入使用 api.kurobbs.com、用户自己的授权与网络；部分官方图片和 CryptoJS CDN 使用外部 HTTP 资源。库、OCR Worker、WASM 与三语模型均已本地包含；系统字体由设备提供，CSS 配置保留。不是所有线上导入功能都可以离线复现。浏览器存档按域名和端口隔离；包不含真实玩家 localStorage、登录 Token 或私人备份，需要数据时用现有备份/恢复功能。

禁止自动 commit、push、切换分支或清除数据。开发文档与新注释用简体中文，界面保留繁中、简中、英文。不改核心公式、数据规则、存档兼容、Classic 与分享图模板。不将多套声骸、跨角色共用或唤取记录当作已经采用的需求。
`,
 '01_CURRENT_PROGRESS.md':`# 当前进度：按证据区分状态

## 已实作

- Register 角色列表与工作台、手动声骸编辑、库存、筛选收藏、显式保存与删除确认。
- 共用评分与角色模型、单件贡献、主/固定/副词条解释、整套校正、空缺和无模型状态。
- 五固定槽、候选检查、隔离草稿、方案比较、历史/来源失效与未保存保护。这些草稿不等于单角色多套装备。
- 官方导入预览/确认与错误分类、本地截图 OCR 加人工校对、备份恢复、分享 PNG、多语及 Classic 路由。
- 前两轮 UI/UX 的字号/对比、导航与会话保持、保存/删除反馈、分享载图并发与清理。
- 最新工作台：独立装备卡片、角色/总分/完整度集中、默认展开副词条、可折叠配置管理、手机原生横向滚动。详见 04 与对应源码。

## 已测试

本次 70 项自动化、244 入口依赖/99 脚本语法、42 组工作台矩阵与 30 张实际分享 PNG 通过；独立锁文件工具重装成功，可移植 runner 在副本实际完成分享矩阵，脱敏副本又完成42组工作台矩阵；静态资源扩展检查、原文件一致性及 ZIP 验证另见 05/06。七种宽度与三语覆盖均使用隔离数据。

上一产品任务保存的 63 组跨页/操作矩阵、6 组未保存与跨页集成结果已保留；它们是 2026-10-14 历史验收，本次没有全部重跑，不能视为新的全量验证。

## 尚未测试 / 待确认

真实 Safari、实体手机/平板、软键盘、真实官方账号与线上 CORS。本次浏览器阻断外网并用本地素材模拟官方图片；导入模式是合成已导入记录，不是实际账号登录。OCR 单元解析已测，但本次没有重新运行真实截图到 OCR 的全部端到端回归。

## 已知问题与限制

没有从本次已执行检查发现已确认的产品失败。已知可移植性问题：原浏览器测试写死本机 Playwright 路径；交接辅助执行器解决运行环境问题，未修改原仓库。极长名称增加统一卡片高度，常规配置的首屏保证不适用于所有边界文本。依赖官方服务/外部 CDN 的功能需要网络；不同来源存档隔离。历史文档中的截图路径可能指向本机或被排除的批量 QA 产物，代表截图已经在 handoff/evidence 中提供。

## 规划中（候选，未正式采用）

真实设备验收、线上接口边界、性能量测和浏览器测试可移植性正式落库。多套声骸、跨角色共用、唤取记录仅为未来构想，当前不实现。

## 已放弃 / 本轮移除的旧交互

已被新卡片布局替代的共享 subgrid 轨道与叠加覆盖方案；已移除把触控滑动直接当成切换槽位的处理，改用原生滚动。没有据此移除评分、分享、保存、删除、返回或比较功能。没有证据确认其他讨论功能已正式放弃。
`,
 '02_MODULE_MAP.md':`# 功能、入口与责任

| 模块 | 主要文件 | 责任与依赖 | 修改注意 |
| --- | --- | --- | --- |
| 角色工作台 | mccost.html、mccost-readonly.html；role-register-page/renderer/controller.js；role-register.css | page 联接 controller / RoleViewModel / i18n；两个入口共用 renderer | 只选槽和展示不写 mcData；五固定槽与单一分析宿主 |
| 角色概览 | index.html；character-dock.js、register-overview.js、character-portraits.js | 目录/立绘、角色实例、筛选、总览 | 保留实例身份及原阈值 |
| 声骸管理 | register-workspace.html；register-workspace.js、register-secondary-views.js、register-search-ui.js | 库存、编辑、新增、筛选与收藏；依赖 CharacterCore | 不绕过来源冲突、唯一 ID、明确保存与未保存保护 |
| 声骸评分 | base.js、stat-keys.js、character-core.js、role-view-model.js | 目录、权重、原评分 API 与归一化 | 不改公式，不使用格式化文字回写输入 |
| 单件声骸分析 | role-view-model.js、role-register-renderer.js、role-register-page.js | 主/固定/副词条贡献、条件与完整度 | 分数来自现有模型，校正不是新分摊分数 |
| 整套分析 | base.js、role-view-model.js、register-overview.js | 总分、效率校正、观察与缺项 | 不新增毕业/完美等级或百分比解释 |
| 候选/草稿/比较 | role-candidates.js、role-candidate-surface.js、role-draft-model/storage.js、role-compare.js、role-local-configuration.js、role-history.js | 草稿、采纳记录、来源摘要、过期保护 | 草稿与当前装备分离；不要误称多套声骸 |
| 角色数据导入 | index.js、import-service.js、role-import-core.js、register-import-model.js、register-import-workbench.js | 请求/签名、模型转换、冲突与确认 | 网络成功不等于保存；不记录凭证 |
| 截图导入 | screenshot-recognition.js、screenshot-recognition-adapter.js、screenshot-name-aliases.js、register-screenshot-import.js、library/ocr | 本地 Worker/WASM/三语模型与人工校对 | HTTP 必需；未确认识别结果不能自动写存档 |
| 分享养成图片 | register-share.js；character-dock.css、register-foundation.css；image | Canvas 预览与 PNG；目录和立绘 | 保留共鸣图示；外部图片 CORS 与缺图提示需实测 |
| 多语言 | i18n.js、i18n-dictionaries.js | 851 匹配键，zh-TW/zh-CN/en；Intl 格式化 | 三语同时补齐，不改变内部统计键 |
| 数据保存 | character-core.js、register-backup.js、register-metadata.js、register-collections.js、register-unsaved.js、register-navigation.js | mcData 事务、备份、显示名与会话 | 多命名空间兼容，只有明确保存写核心 |
| 桌面/手机 | role-register.css、register-foundation.css、register-operations.css、register-workspace.css、character-dock.css | 工作台专属与共享样式，响应式/焦点/滚动 | 控制作用域，手机返回与管理入口保留 |
| Classic | ui-view.js、role-register-mode.js；index.js、mccost.js、mccost2.js、costedit.js、unusedEchoes.js、compare.js、probability.js、imitate.js；base.css | 旧入口和原算法，共享 base | 不因 Register 样式调整改变旧版 |
| 工具 | register-tools.js、echo-tool-core.js；probability/imitate/rule.html | 概率、强化、资源、规则 | 复用旧核心并保持数据隔离 |
| 测试 | tests/*.test.cjs、tests/*browser.cjs、tests/fixtures；artifacts/register-overview/classic-before.js | 无依赖单元、浏览器矩阵、冻结旧版基准 | 历史基准不是可删缓存；浏览器需独立 Playwright |
| 运行资源/配置 | library、image、_headers、package.json、calculations、docs | jQuery/Bootstrap/OCR、本地图与配置 | 全部原样复制，不能以精简理由省略必要二进制 |

表中省略 js/、css/ 前缀的源文件分别位于对应目录。完整路径与大小见 FILE_INDEX.md。

数据流：localStorage mcData → CharacterCore/导入转换 → RoleViewModel 调用 base 评分 → controller/page/renderer。语言、选槽与展示高度量测不改变计算输入。用户明确保存后才提交事务。
`,
 '03_NEXT_IMPROVEMENTS.md':`# 后续候选改善：不是本次开发内容

## 优先确认的问题

- role-register-page.js / role-register.css 的触控滚动、阅读锚点、配置 details 在真实 Safari/手机上尚未验收；先按 320/390px 实机检查软键盘与返回，不能把 Edge 模拟结论扩大成全部设备通过。
- import-service.js / index.js 与 register-share.js 仍依赖官方网络、CDN/CORS；真实凭证过期、限流、断网和线上缺图需要自己的账号隔离验证。本次离线路由没有证明官方服务正常。
- 原 tests/*browser.cjs 有绝对 Playwright 路径。交接执行器可运行；建议审阅后正式采用可移植工具/锁文件，避免跨设备失败。

## UI/UX

- 对照 role-workspace-browser 的长名、缺项、未知模型截图，检查真实笔电中极长文本导致首屏增高的取舍；当前优先完整文字，不能再用过小字号补救。
- 手机主词条在卡片摘要隐藏、下面详细分析完整保留；用新使用者任务验证是否容易发现，不随意删除详情。
- 区分单槽贡献/整套评分/整套效率校正；沿用现有模型解释，避免新增未定义结论。

## 效能与稳定性

- role-register-page.js 每次重绘、resize、字体就绪都量测卡片文本高度；先在低性能手机实测重绘次数与布局耗时，再判断是否需要合并 resize/缓存。
- register-workspace.js 大库存筛选与角色比较依赖归一化和来源摘要；先量测千件库存，不绕过来源失效保护。
- 分享并行载图/关闭清理已经实作；继续验证实际大图片内存，而不是再次重写成熟模板。

## 测试不足

- 增补 Safari/WebKit、实体软键盘、真实 HTTP/CORS/认证错误与 OCR 完整识别到确认保存的端到端验收。
- 本次仅重跑工作台与分享矩阵，63 组全站操作及 6 组集成依靠前次证据；下一次涉及这些模块时重跑对应脚本。
- 手工验收视读、焦点可见性和小尺寸触控准确性；布局量测不能替代可用性判断。

## 长期构想（未采用，须独立定义需求）

单角色多套声骸、跨角色共用声骸、唤取记录会影响 costList、实例/引用、导入冲突与备份迁移。目前禁止在此轮提前实现；已有候选草稿不是这些功能已完成的证据。
`,
 '04_LATEST_CHANGES.md':`# 最新产品任务与封装边界

## 可确认的基准

HEAD=${snapshot.gitHead}，当前分支只读取记录，没有切换。本地 Git diff 是全部累计未提交改动，涵盖前两轮与最近重设，不能全部归属到最近一次任务。Git 状态、统计、补丁分别在 GIT_STATUS.txt、GIT_DIFF_STAT.txt、GIT_WORKTREE.patch；所有当前文件本体均包含。

最近重设起始时只保存了四个可逐字节比对的产品副本：role-register.css、role-register-page.js、role-register-renderer.js、register-share.js；位于 artifacts/role-workspace-redesign。LATEST_BASELINE_COMPARISON.json 给出准确哈希。其他文件的完整任务前基准不可确认，归属以实际开发报告佐证，不伪称可完整恢复每轮差异。

## 最近一次产品开发：角色工作台重设

- 目标：深色/青绿/细线保留，独立装备卡片，桌面快速比较，手机摘要/原生横向滚动，全部分析可读。
- css/role-register.css：整合专属样式、角色/总览、五件卡片、2×2 分析、管理及候选/比较响应式；移除 subgrid 与叠加旧覆盖。
- css/register-operations.css：移走直接工作台重复样式，共享规则与其他页保留。
- js/role-register-renderer.js：角色/分享/配置管理分组；卡片标签与状态；已有单件分数/有效词条；副词条默认展开。
- js/role-register-page.js：管理展开记忆、名称/标签最大高度量测、翻译重绘阅读锚点；取消滑动直接换槽。
- js/i18n-dictionaries.js：新增三语配置管理键；mccost.html / mccost-readonly.html：专属 CSS 加载次序调整。
- package.json：test/check:static 入口；tests/browser-qa.cjs、register-operations-browser.cjs、register-integration-browser.cjs、role-workspace-browser.cjs、ui-ux-browser.cjs、ui-ux-correction-browser.cjs：适配/新增验收；docs/role-register.md、role-workspace-redesign.md：实际实现说明。

五张卡片普通 grid + 展示高度量测，桌面文字对齐，常规配置首屏五卡；手机132px 横向列表，配置管理下移。选槽更新同一分析区；保存/删除、候选比较、未保存保护及手机返回保留。只是移除自定义滑动换槽，不移除业务功能。

本轮重设没有改评分、目录、ViewModel、controller 或存档格式；分享脚本与重设起始副本完全一致。当前 share.js 相对 HEAD 有差异来自更早任务，不应误读成最近重新设计模板。30 张分享图前后相同有独立证据。

Classic 与 Register 有共享 base/入口/样式基础，理论上共享改动需回归；最近改动主要 scoped Register 且原单位测试通过，不宣称旧版所有真实操作都已人工验收。剩余问题是极长名称首屏边界、真实设备与网络未验证。

## 紧接的操作与本次任务

2026-10-15 重启了本机预览服务，新增 artifacts/wuwa-local-preview.cjs 作为临时服务辅助，没有产品逻辑改动。

本次只复制真实工作目录、生成 handoff 文件及封装/校验工具，添加浏览器工具的独立 lockfile；除 SANITIZATION.md 记录的未使用 JWT 脱敏外，产品/原测试/package.json 与源工作目录逐字节相同。不做 commit/push/分支/reset/clean，不读真实玩家存档。
`,
 '05_TEST_REPORT.md':`# 实际测试报告

## 本次重新执行（2026-10-15）

| 指令或检查 | 结果 | 范围/证据 |
| --- | --- | --- |
| npm test | 通过：70，0 失败 | 原工作目录执行；解压副本再次执行，见 evidence/checks.json |
| npm run check:static | 通过 | 244 本地入口依赖、99 脚本语法；根源与解压副本执行 |
| git diff --check | 通过 | 行尾转换提示不是检查失败；未更改 Git |
| node tests/role-workspace-browser.cjs | 通过：42 | 320/375/390/768/1024/1280/1440 × 三语 × 手动/合成导入；84 边界截图；无页面错误；role-results.json |
| node tests/ui-ux-browser.cjs | 通过：30 PNG | 三语×两模式×正常/长名/缺图/空/未知；预览=下载、底部五符号、会话及异步；share-results.json |
| 本次30 PNG 与上一任务对应 PNG 比较 | 通过 | 30 逐字节相同，0 改变；share-parity.json |
| 扩展静态资源与安全检查 | 通过 | asset-check.json / security-check.json；动态拼接路径通过完整目录复制与矩阵补充 |
| ZIP 内容/CRC/解压 SHA-256 | 通过 | 最终封装阶段强制全文件核验；verify.cjs 可再次执行 |

代表截图在 handoff/evidence：桌面1440、手机390、卡片、单件分析及分享。测试是无头 Edge、隔离合成 localStorage、本地 HTTP，外网被拦截/模拟；没有使用真实账号或真实手机。官方入口的断言不代表真实登录接口已测试。

## 历史证据（本次未重跑）

2026-10-14 最近产品任务：register-operations-browser.cjs 七尺寸/三语/大量少量空共63组；register-integration-browser.cjs 1440/320×三语共6组；30分享图与更早修正结果相同。原始结果在 artifacts/role-workspace-redesign/qa。不能将这些历史通过写成本次执行。

## 未执行

全部其他浏览器脚本、真实 OCR 端到端、Safari/实体手机/软键盘、真实官方接口与图片CORS。本项目无 TypeScript 或生产 bundler，所以没有虚构 build/typecheck 成功；现有语法/资源检查是静态发布检查。

## 可重现方法

初次尝试生成浏览器锁文件时，受限环境出现 DNS ENOTFOUND；在可访问公开套件源的环境重试成功，npm ci 已实际安装。安全检查发现未使用遗留 JWT，已仅在副本脱敏并重测，见 SANITIZATION.md。封装辅助程序初次校验发现 runner 路径正则语法与 PNG 文件统计口径问题，已修复；这些不是产品测试失败。

先 npm test / npm run check:static；浏览器辅助锁文件 npm ci --prefix handoff/browser-tools；安装 Chromium 后 node handoff/run-browser.cjs tests/role-workspace-browser.cjs 或 tests/ui-ux-browser.cjs。辅助 runner 保留原测试内容，只重定向 Playwright 模块并允许选浏览器 channel。其他历史工具可能包含本机路径，先阅读再执行，不声称全部跨平台适配。
`
 };
 for(const [name,value] of Object.entries(notes))write('handoff/'+name,value+'\n');
 write('00_先读这里.md','# 完整交接包\n\n请先读 handoff/00_READ_FIRST.md，再按模块读取实际源码。完整图片、供应商库、OCR、测试、文档均已包含；不是精简源码包。启动：node handoff/serve.cjs。\n');
 const indexFiles=walk(stage).filter(f=>!norm(path.relative(stage,f)).startsWith('image/')&&!norm(path.relative(stage,f)).startsWith('library/'));
 write('handoff/FILE_INDEX.md','# 实际文件索引\n\n当前产品位于根 HTML、js/、css/；artifacts 是历史验证。资源完整清单见 FILE_MANIFEST.json。\n\n| 路径 | 字节 |\n| --- | ---: |\n'+indexFiles.map(f=>'| '+norm(path.relative(stage,f))+' | '+fs.statSync(f).size+' |').join('\n')+'\n');
 const count=walk(stage).length+3;
 write('handoff/06_FILE_MANIFEST.md',`# 封装清单\n\n全部文件数：${count}。ZIP 大小（字节）：000000000000。\n\n根 HTML、js、css、全部 image（含旧立绘归档和OCR示例）、library（含Bootstrap/jQuery/OCR Worker/WASM/三语模型及许可证）、tests（含冻结基准）、scripts、calculations、docs、_headers、原package.json、原开发docx均保留。除 js/base.js 中未使用的遗留 JWT 仅在副本脱敏外，所有复制原文件都与当前工作目录一致；原始/副本哈希均记录。\n\n没有删除图片来缩小文件。主要缩减来自排除 .git 历史、.idea 本机设置、批量QA图片、旧构建副本/ZIP；保留历史测试源码、Classic基准、少量结果JSON及7张当前代表截图。没有 node_modules、缓存、浏览器二进制、.env 秘密或真实玩家存档。\n\n原仓库无lockfile和第三方npm依赖；不伪造原始lockfile。新增浏览器测试辅助工具拥有独立package.json/package-lock.json，通过npm ci重装Playwright1.62.1；运行本体不需安装依赖。系统字体/官方API/CDN详见00。\n\nFILE_MANIFEST.json与SHA256SUMS.txt为每个负载文件记录SHA-256，包含本文件及所有源码/资源/交接文档；清单自身与SHA256SUMS不能自引用，因此明确排除这两个元数据文件，它们也通过ZIP逐字节、CRC与解压一致性核验。ZIP整体SHA-256在最终交付报告记录。verify.cjs可在解压目录再次验证。\n\nSNAPSHOT_ORIGINAL_FILES.json记录复制来源与原始哈希；GIT状态/补丁仅辅助追踪，不是源码替代。原工作目录里的历史文档不改写，某些截图链接可能指向未打包的大量QA产物；证据代表图见handoff/evidence。\n`);
 const selfExcluded=['handoff/FILE_MANIFEST.json','handoff/SHA256SUMS.txt'];
 function manifests(){const files=walk(stage).map(f=>({path:norm(path.relative(stage,f)),bytes:fs.statSync(f).size,sha256:hash(fs.readFileSync(f))})).filter(f=>!selfExcluded.includes(f.path));write(selfExcluded[0],JSON.stringify({date:snapshot.date,totalFiles:files.length+2,selfExcluded,files},null,2)+'\n');write(selfExcluded[1],files.map(f=>f.sha256+'  '+f.path).join('\n')+'\n');return files;}
 const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 const crc=b=>{let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
 const zip=path.join(work,'final.zip'),now=new Date(),taipei=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(now).replace(/[^0-9]/g,'');
 const zipName='WuwaEchoTool_ChatGPT_Full_'+taipei.slice(0,8)+'_'+taipei.slice(8,12)+'.zip';
 function pack(){const parts=[],central=[];let offset=0;for(const f of walk(stage).sort()){const rel=norm(path.relative(stage,f)),name=Buffer.from('WuwaEchoTool/'+rel),raw=fs.readFileSync(f),method=['handoff/06_FILE_MANIFEST.md',...selfExcluded].includes(rel)?0:8,compressed=method?zlib.deflateRawSync(raw,{level:6}):raw,check=crc(raw),local=Buffer.alloc(30),cd=Buffer.alloc(46);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(method,8);local.writeUInt16LE(33,12);local.writeUInt32LE(check,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(name.length,26);parts.push(local,name,compressed);cd.writeUInt32LE(0x02014b50);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0x800,8);cd.writeUInt16LE(method,10);cd.writeUInt16LE(33,14);cd.writeUInt32LE(check,16);cd.writeUInt32LE(compressed.length,20);cd.writeUInt32LE(raw.length,24);cd.writeUInt16LE(name.length,28);cd.writeUInt32LE(offset,42);central.push(cd,name);offset+=local.length+name.length+compressed.length;}
 const cdb=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(cdb.length,12);end.writeUInt32LE(offset,16);fs.writeFileSync(zip,Buffer.concat([...parts,cdb,end]));return fs.statSync(zip).size;}
 manifests();const firstSize=pack();write('handoff/06_FILE_MANIFEST.md',read(path.join(stage,'handoff/06_FILE_MANIFEST.md')).replace('000000000000',String(firstSize).padStart(12,'0')));const payload=manifests();assert.equal(pack(),firstSize,'固定长度清单没有稳定ZIP大小');
 // 独立解析全部本地条目并验证解压、CRC、文件名、SHA；不依赖写入端的压缩缓存。
 const data=fs.readFileSync(zip),names=new Set();let pos=0,entries=0;while(data.readUInt32LE(pos)===0x04034b50){const method=data.readUInt16LE(pos+8),check=data.readUInt32LE(pos+14),size=data.readUInt32LE(pos+18),rawSize=data.readUInt32LE(pos+22),nl=data.readUInt16LE(pos+26),el=data.readUInt16LE(pos+28),name=data.subarray(pos+30,pos+30+nl).toString('utf8');assert.ok(!names.has(name),'重复路径');assert.ok(name.startsWith('WuwaEchoTool/')&&!name.includes('../'));names.add(name);const start=pos+30+nl+el,compressed=data.subarray(start,start+size),raw=method===8?zlib.inflateRawSync(compressed):compressed;assert.equal(raw.length,rawSize,name);assert.equal(crc(raw),check,name);const rel=name.slice('WuwaEchoTool/'.length);assert.equal(hash(raw),hash(fs.readFileSync(path.join(stage,rel))),name);pos=start+size;entries++;}assert.equal(entries,walk(stage).length);assert.equal(data.readUInt32LE(data.length-22),0x06054b50);assert.equal(data.readUInt16LE(data.length-12),entries);
 const result={zipName,zipPath:zip,bytes:firstSize,mib:firstSize/1024/1024,files:entries,payloadChecksums:payload.length,originalFiles:snapshot.originalFiles.length,byteIdenticalOriginals:snapshot.originalFiles.length-(snapshot.sanitizedFiles||[]).length,sanitizedFiles:snapshot.sanitizedFiles||[],crcAndShaVerified:true,sha256:hash(data),localTime:taipei};fs.writeFileSync(path.join(work,'delivery.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}

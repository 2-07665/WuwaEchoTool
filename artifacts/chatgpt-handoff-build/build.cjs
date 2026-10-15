/* 只生成交接副本；不修改产品源码、玩家数据或 Git 状态。 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),stage=path.join(__dirname,'WuwaEchoTool_v2'),light=path.join(__dirname,'ChatGPT_SOURCE');
if(fs.existsSync(stage)||fs.existsSync(light))throw Error('交接目录已存在，避免覆盖请使用新的构建目录。');
const copied=[],adapted=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);}
function copy(file,base=root,to=stage){const rel=path.relative(base,file),target=path.join(to,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);if(to===stage)copied.push(rel.replaceAll('\\','/'));}
for(const dir of ['js','css','tests','scripts','docs','library','calculations'])for(const file of walk(path.join(root,dir)))copy(file);
for(const file of walk(path.join(root,'image')))if(!file.includes(path.sep+'旧版图片'+path.sep))copy(file);
for(const name of fs.readdirSync(root))if(/\.html$/.test(name)||['_headers','.gitignore'].includes(name))copy(path.join(root,name));
// 历史 QA 源码保留，批量截图和导出图片不进入交接包。
for(const file of walk(path.join(root,'artifacts')))if(!file.startsWith(__dirname+path.sep)&&/\.(?:cjs|js|html)$/.test(file))copy(file);
const evidence=[
 'artifacts/ui-ux-correction/share-parity.json',
 'artifacts/ui-ux-correction/correction-readability/results.json',
 'artifacts/ui-ux-correction/operation-optimization/browser-results.json',
 'artifacts/ui-ux-correction/register-heading/results.json',
 'artifacts/ui-ux-correction/register-tools/results.json',
 'artifacts/ui-ux-correction/ui-ux-focused/results.json',
 'artifacts/ui-ux-v2/official-import/browser-results.json',
 'artifacts/ui-ux-correction/correction-readability/1440-en-top.png',
 'artifacts/ui-ux-correction/correction-readability/1440-en-analysis.png',
 'artifacts/ui-ux-correction/correction-readability/390-zh-TW-top.png',
 'artifacts/ui-ux-correction/correction-readability/390-zh-TW-analysis.png',
 'artifacts/ui-ux-correction/ui-ux-focused/zh-TW-normal-detailed.png'
];for(const rel of evidence)if(fs.existsSync(path.join(root,rel)))copy(path.join(root,rel));
// 可移植改动仅作用于打包副本的验收工具，应用脚本逐字节保持。
for(const file of walk(path.join(stage,'tests')).filter(p=>p.endsWith('.cjs'))){let s=fs.readFileSync(file,'utf8'),before=s;s=s.replaceAll("require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')","require('playwright')").replaceAll("channel:'msedge'","channel:process.env.WUWA_BROWSER_CHANNEL||undefined");if(s!==before){fs.writeFileSync(file,s);adapted.push(path.relative(stage,file).replaceAll('\\','/'));}}
function write(rel,text){const file=path.join(stage,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}
write('package.json',JSON.stringify({name:'wuwa-echo-tool-handoff',version:'2.0.0',private:true,description:'可运行的完整静态源码交接包',scripts:{start:'node server.cjs',test:'node --test tests/*.test.cjs','check:static':'node tests/ui-ux-static.cjs','test:browser':'node tests/ui-ux-correction-browser.cjs'},devDependencies:{playwright:'1.62.1'}},null,2));
write('server.cjs',`/* 交接包静态预览服务；无需第三方运行依赖。 */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),root=__dirname,port=Number(process.env.PORT||8123);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon','.gz':'application/gzip','.wasm':'application/wasm','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}let file;try{const url=new URL(req.url,'http://localhost');file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch(_){res.writeHead(400).end();return;}if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');if(req.method==='HEAD')res.end();else res.end(data);});}).listen(port,'127.0.0.1',()=>console.log('WuwaEchoTool: http://127.0.0.1:'+port+'/index.html?view=register'));
`);
write('00_先读这里.md',`# WuwaEchoTool v2.0 完整运行与 ChatGPT 交接包

这是 2026-10-14 工作目录的当前集成快照，包含两轮 UI／UX 修改，尚未提交。完整应用源代码、当前运行图片、三语本地 OCR 引擎／模型、测试、开发文档和评分基准均已包含。

## 给用户

1. 解压主包，进入 WuwaEchoTool_v2 目录。
2. 安装 Node.js 后运行 \`npm start\` 或 \`node server.cjs\`，打开 http://127.0.0.1:8123/index.html?view=register 。启动应用不需要 npm install。
3. 不要仅使用 file:// 判断 OCR 功能；Worker 需要本机 HTTP 服务。
4. 给 ChatGPT 上传主包内的 **ChatGPT_SOURCE_ONLY.zip**（另提供相同的小包独立下载）。它包含全部手写应用代码、测试、开发文件及资源清单，排除图片和 OCR 二进制。这个小包用于阅读修改；完整运行仍使用主包。

不同域名／端口的浏览器存档相互独立。这个包没有复制个人浏览器存档；需要已有数据时，使用工具现有的备份／恢复功能。官方导入仍需要正常网络及自己的授权信息，资源包不会代替官方服务。

## 给 ChatGPT：阅读顺序

先读 handoff/01_CURRENT_PROGRESS.md、02_MODULE_MAP.md、03_NEXT_IMPROVEMENTS.md，然后按要修改的功能打开对应真实源文件。不要把历史 QA 副本当作当前产品代码；当前产品在根 HTML、js/、css/。

完整源码不是单个巨大的拼接文本。请按模块逐个读取：角色界面先看 renderer/page/CSS；涉及数据或评分时再看 Core、ViewModel、base.js；文案看 i18n。所有文件都实际包含，可定位修改而非仅依赖摘要。

## 测试与可移植性

\`npm test\` 可直接运行现有 70 项自动化测试；\`npm run check:static\` 检查入口及语法。原项目没有打包器或 TypeScript。

浏览器测试先运行 \`npm install\`、\`npx playwright install chromium\`，然后 \`npm run test:browser\`。Linux 环境若缺少系统依赖，可由使用者按实际环境安装。Windows 已安装 Edge 时可设置 WUWA_BROWSER_CHANNEL=msedge。

打包副本把 tests/ 中作者电脑的 Playwright 绝对路径改为标准 require('playwright')，并支持选择浏览器 channel。package.json 与 server.cjs 是包内新增的启动辅助文件；**原项目应用 HTML／CSS／JS 没有被打包程序改写**。具体适配文件见 handoff/PACKAGE_MANIFEST.json。

## 为什么变小

排除 .git 历史、IDE 缓存、批量 QA 截图、无代码依赖的旧版立绘归档、早期说明 docx。现用 webp 立绘、旧版界面实际使用的 image/role、所有 OCR 引擎／模型及示例原图保留。calculation 参考表、必须的 Classic 评分测试基准与历史 QA 源码仍包含。

部分历史文档仍指向未打包的旧截图，这些是历史证据链接，不是产品运行依赖。最新代表截图与结果已保留。
`);
write('handoff/01_CURRENT_PROGRESS.md',`# 当前进度与约束

## 已完成

- 第一轮：全站共用状态、数字格式、保存／删除回馈、滚动／会话保留、比较记录并发保护、分享并行载图与关闭清理、长名称防重叠。
- 第二轮：14px 次要文字基准与更高对比；评分区关联角色／配置／完整度；精简可展开观察说明；明确分享／保存／编辑按钮；五槽共同网格与名称／Cost／有效词条读数；单颗四组读数集中；手机小立绘、分享位置及横向滑动。
- 角色／存档／评分规则、Classic 和分享模板没有在第二轮改变。30 张分享 PNG 与第一轮对应图片逐字节一致。

## 已实际通过的最近验收

70 项自动化测试；七种宽度 × 三语的 63 组主流程；18 组字号／共同基线／改名／移动滑动布局；9 组按钮状态；6 组工具流程；30 张实际 PNG。244 个本地入口依赖和 98 个脚本语法检查通过。

最新详情：docs/ui-ux-correction.md；第一轮：docs/ui-ux-v2-polish.md。结果 JSON 和少量代表截图在 artifacts/ui-ux-correction/。

## 仍未验证

真实手机／平板、Safari、真实软键盘、真实官方账号与线上图片 CORS。最近浏览器测试采用隔离合成数据和 Edge，不代表真实账号或真实设备验收。

## 后续必须遵守

禁止自动 commit／push／分支操作。不要修改核心评分公式、角色与声骸规则、玩家存档格式；不要清除数据、破坏备份、改变 Classic、增加唤取记录或提前实现单角色多套声骸。不增加无关依赖，不大规模重构，不重新设计分享模板／共鸣图示。

开发注释与文档用简体中文；界面保持繁中／简中／英文。新文案三个语言一起补齐。所有判读必须来自实际已有模型，不新增未经定义的毕业／完美／替换结论。
`);
write('handoff/02_MODULE_MAP.md',`# 模块与修改定位

| 需求 | 先读这些文件 | 边界 |
| --- | --- | --- |
| 角色工作台／列表／总览 | index.html、js/character-dock.js、js/register-overview.js、css/character-dock.css | 角色实例与展示分离，概览沿用原有阈值 |
| 手动／官方角色分析 | mccost.html、mccost-readonly.html、js/role-register-page.js、js/role-register-renderer.js、js/role-register-controller.js、css/role-register.css | 两入口共用模型、五固定槽、唯一分析宿主 |
| 新增／编辑／声骸库／备份 | register-workspace.html、js/register-workspace.js、js/register-secondary-views.js、css/register-workspace.css | 身份唯一性、显式保存与来源冲突不能绕过 |
| 共用视觉与搜索 | css/register-foundation.css、css/register-operations.css、js/register-search-ui.js | 作用域限定 Register，不能影响 Classic |
| 保存与导航状态 | js/register-navigation.js、js/register-unsaved.js、js/register-metadata.js | session UI、显示名与玩家 mcData 分开 |
| 评分及目录 | js/base.js、js/character-core.js、js/role-view-model.js、js/stat-keys.js | base.js 含原始目录／权重／评分 API，不改核心公式 |
| 候选／方案／比较 | js/role-candidates.js、js/role-candidate-surface.js、js/role-draft-model.js、js/role-draft-storage.js、js/role-compare.js、js/role-local-configuration.js、js/role-history.js | 草稿基线、来源摘要、过期／不相容保护 |
| 分享图片 | js/register-share.js、css/character-dock.css、css/register-foundation.css | 同一个 Canvas 用于预览／下载，保留共鸣图示 |
| 官方导入 | js/import-service.js、js/role-import-core.js、js/register-import-model.js、js/register-import-workbench.js、css/register-import.css | 请求／凭证／角色映射／更新冲突与界面分离 |
| 截图识别 | js/screenshot-recognition.js、js/screenshot-recognition-adapter.js、js/screenshot-name-aliases.js、js/register-screenshot-import.js、library/ocr/ | 必须人工校对确认；本地 Worker 与模型需要 HTTP |
| 工具页 | js/register-tools.js、js/echo-tool-core.js | 机率、强化、资源与规则沿用共享 API |
| 三语 | js/i18n.js、js/i18n-dictionaries.js | 输入／保存数据不使用翻译后的显示文案 |
| 版本入口／路由 | js/ui-view.js、js/role-register-mode.js | Register／Classic 隔离 |
| Classic | js/index.js、js/mccost.js、js/mccost2.js、js/costedit.js、js/unusedEchoes.js、js/probability.js、js/imitate.js、js/compare.js 等旧入口及 css/base.css | 本次保留，不能为新 UI 任意改动 |
| 回归 | tests/*.test.cjs、tests/*browser.cjs、tests/fixtures/ | 常规自动化无第三方依赖；浏览器需 Playwright |

## 数据流

浏览器 mcData → CharacterCore 读取／事务 → RoleViewModel 调用原评分生成语言中立数据 → controller／page／renderer 展示。用户明确保存才写存档；显示格式／选择／语言切换不能改变计算输入。

包内 handoff/FILE_INDEX.md 列出全部可编辑代码的实际路径与大小。PACKAGE_MANIFEST.json 记录全部资源哈希和打包时测试路径适配，便于检查遗漏。
`);
write('handoff/03_NEXT_IMPROVEMENTS.md',`# 后续可以增进的内容

以下是候选方向，不是已经实现的新功能，也不是未经验证的缺陷结论。

## 优先级高：真实使用验收

1. 在真实手机／平板与 Safari 检查五槽横向滑动、触控目标、焦点返回、软键盘与固定导航；验证 subgrid 在目标浏览器的表现，再决定是否需要兼容回退。
2. 使用自己的官方账号检查导入／更新／网络失败／来源冲突；验证外部图片 CORS 与分享缺图提示。测试不能包含个人 token 或破坏原存档。
3. 让使用者实际比较 320px 手机与小型笔电的信息密度；根据反馈微调宽度／字号／间距，不继续任意缩小文字。

## 优先级中：理解与稳定性

4. 检查第一次使用者能否区分“单槽对角色的贡献”“整套评分”“整套效率校正”；仅重用已有模型与解释，不新增评价门槛。
5. 对照 ui-ux-correction-browser 的布局量测，补充真实长配置名称、不同角色画像和部分数据组合；必要时再调整展示。
6. 观察大量库存搜索、比较记录刷新和语言重绘的实际延迟；仅修复明确瓶颈，保留原来的缓存及来源保护。
7. 保持源码／测试跨设备可运行。包内已经提供标准 Playwright 入口和零依赖本地服务器；可在原仓库正式采用前审阅这些仅打包副本的辅助改动。

## 延后、需另行明确授权

单角色多套声骸会影响 role.costList、配置身份、声骸引用／占用、草稿基线、导入更新与备份迁移。本轮只记录兼容边界，不实现。唤取记录不在当前范围。

## 推荐每次修改的验收

明确要改善的真实问题 → 定位对应模块 → 保留其他未提交修改 → 三语与桌面／手机检查 → npm test、npm run check:static、相关浏览器脚本 → 如涉及分享，验证实际 PNG 与共鸣符号 → 简体中文说明修改、测试、未验证项目与建议 commit 消息，禁止自动提交。
`);
write('handoff/04_CHATGPT_PROMPT.txt',`请先阅读这个源码包的 00_先读这里.md、handoff/01_CURRENT_PROGRESS.md、02_MODULE_MAP.md、03_NEXT_IMPROVEMENTS.md 与 docs/ui-ux-correction.md，然后检查对应真实源码。

这是 WuwaEchoTool 正式 v2.0 加两轮 UI／UX 修改后的当前完整手写源码，并非只有摘要或代码片段。请基于当前状态找出可具体改善的使用体验和稳定性问题，说明触发情境、影响、对应文件和可审阅的修改；成熟设计保留，不要重新设计所有页面。

不得修改核心评分公式、角色与声骸规则、存档格式、Classic、备份与导入兼容性；不得清除数据、添加唤取记录、提前实现多套声骸、随意引入依赖。分享模板与底部共鸣图示优先保留。禁止自动 commit／push／分支操作。

注释与开发报告用简体中文，界面保留繁中／简中／英文。请按模块读取，不需要把 vendor／OCR 二进制放进上下文。资源与供应商脚本在完整运行主包中；其路径和 SHA256 在 PACKAGE_MANIFEST.json。

如果执行环境支持，请实际运行适用测试与浏览器；不能执行时明确列出限制，不宣称全部通过。给出能定位文件的完整补丁或完整修改文件，以及测试方式、风险边界和后续建议。
`);
const editable=walk(stage).filter(f=>!f.includes(path.sep+'library'+path.sep)&&!f.includes(path.sep+'image'+path.sep)&&/\.(?:html|css|js|cjs|md|txt|json)$/.test(f));
write('handoff/FILE_INDEX.md','# 源码阅读索引\n\n供应商引擎／图片不需要进入 ChatGPT 上下文；完整运行主包仍保留。\n\n| 文件 | 字节 |\n| --- | ---: |\n'+editable.map(f=>'| '+path.relative(stage,f).replaceAll('\\','/')+' | '+fs.statSync(f).size+' |').join('\n')+'\n');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const application=copied.filter(p=>/^(?:js\/|css\/)|\.html$/.test(p)&&!p.startsWith('artifacts/'));
for(const rel of application)if(hash(path.join(root,rel))!==hash(path.join(stage,rel)))throw Error('应用文件不一致：'+rel);
const manifest={date:'2026-10-14',applicationFilesVerifiedIdentical:application.length,adaptedTests:adapted,addedHelpers:['package.json','server.cjs','00_先读这里.md','handoff/'],excluded:['.git/','.idea/','image/characters/旧版图片/','批量 QA 截图／图片','早期说明 docx'],files:walk(stage).map(f=>({path:path.relative(stage,f).replaceAll('\\','/'),bytes:fs.statSync(f).size,sha256:hash(f)}))};
write('handoff/PACKAGE_MANIFEST.json',JSON.stringify(manifest,null,2));
// 小包保留全部手写代码及测试，不含资源二进制；主包包含完整运行资源。
for(const file of walk(stage)){const rel=path.relative(stage,file);if(rel.startsWith('image'+path.sep)||rel.startsWith('library'+path.sep)||rel.startsWith('calculations'+path.sep)||/\.(?:png|webp|jpg|xlsx)$/.test(file))continue;copy(file,stage,light);}
fs.writeFileSync(path.join(__dirname,'build-result.json'),JSON.stringify({stage,light,applicationFilesVerifiedIdentical:application.length,adaptedTests:adapted.length,files:manifest.files.length,uncompressedBytes:manifest.files.reduce((a,f)=>a+f.bytes,0)},null,2));
console.log(fs.readFileSync(path.join(__dirname,'build-result.json'),'utf8'));

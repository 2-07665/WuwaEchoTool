/* 生成当前完整快照；保留浏览器测试实际依赖的历史CSS基准。 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');let s=fs.readFileSync('artifacts/list-library-fix-20261015/build.cjs','utf8');
s=s.replace("'list-library-fix-20261015'];","'list-library-fix-20261015','handoff-current-20261015','share-equipment-20261015'];");
s=s.replace(" const base=path.join(stage,'js/base.js')"," for(const rel of ['artifacts/list-library-fix-20261015/baseline/css/character-dock.css','artifacts/ui-unification-20261015/baseline/css/register-foundation.css'])copy(rel);\n const base=path.join(stage,'js/base.js')");
s=s.replace('/103 script syntax/','/104 script syntax/');
const start=s.indexOf(' const screenshots='),end=s.indexOf(' const prior=',start);assert.ok(start>0&&end>start);
s=s.slice(0,start)+` const screenshots={'01-share-compact.png':'qa/ui-ux-focused/zh-TW-normal-compact.png','02-share-detailed.png':'qa/ui-ux-focused/zh-TW-normal-detailed.png','03-desktop-equipment.png':'preview/1440-zh-TW-library.png','04-mobile-equipment.png':'preview/390-zh-TW-library.png','05-comparison.png':'preview/1440-zh-TW-comparison.png','06-favorite.png':'preview/1440-zh-TW-library-favorite.png'};for(const [to,from]of Object.entries(screenshots))write('handoff/evidence/'+to,fs.readFileSync(path.join(work,from)));
 const share=JSON.parse(read(path.join(work,'share/results.json'))),common=JSON.parse(read(path.join(work,'qa/ui-ux-focused/results.json')));assert.equal(share.exports.length,60);assert.equal(common.exports.length,30);assert.equal(share.classicPixelParity,true);for(const r of [share,common])assert.equal(r.pageErrors.length,0);for(const f of ['share/results.json','qa/ui-ux-focused/results.json'])write('handoff/evidence/'+f,fs.readFileSync(path.join(work,f)));
`+s.slice(end);
const marker="};for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);";assert.ok(s.includes(marker));
s=s.replace(marker,`};
 notes['00_READ_FIRST.md']=notes['00_READ_FIRST.md'].replace('最新开发仅角色列表立绘10px留白、移除重复编辑入口，以及库收藏卡内网格和14px双栏间距。','最新开发为分享结算三分区与装备详情精修，原真实评分/雷达/保存逻辑保留。').replace('tests/list-library-browser.cjs','tests/share-equipment-browser.cjs');
 notes['01_CURRENT_PROGRESS.md']=notes['01_CURRENT_PROGRESS.md'].replace('本轮三项精准修改见04','本轮分享结算与装备详情精修见04').replace('已测试：本轮72单元、244引用/103脚本、12组精准布局/收藏、18组现有操作。历史24组保存、36张分享导出、42工作台/Classic等仅属前次记录，本轮未冒充重跑。','已测试：本轮72单元、244引用/104脚本、12组装备/布局、18组操作，30常规及60多情境PNG、雷达任务前对照和Classic像素。历史保存/工作台矩阵未冒充重跑。').replace('本轮未重新导出分享，分享源码未变。','本轮两版分享已重测。');
 notes['02_MODULE_MAP.md']=notes['02_MODULE_MAP.md'].replaceAll('共862键','共864键')+'\\n最新：分享三分区在register-share.js；装备详情DOM在register-secondary-views.js，样式register-operations.css；收藏反馈register-workspace.js和字典，计算/数据事务不改。测试share-equipment-browser.cjs及可选WUWA_SHARE_BASELINE任务前雷达对照。\\n';
 notes['03_NEXT_IMPROVEMENTS.md']=notes['03_NEXT_IMPROVEMENTS.md'].replace('库存目标select会重绘收合details，可另行评估保留展开。','装备目标区已默认展开；后续实机检查软键盘及长下拉项。');
 notes['04_LATEST_CHANGES.md']=read(path.join(root,'docs/share-equipment-refinement.md'))+'\\n任务前五文件在artifacts/share-equipment-20261015/baseline，哈希见LATEST_BASELINE.json；累计Git状态/补丁包含更早工作。八个受限实现文件哈希不变。\\n';
 for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);`);
s=s.replace('附三文件修改前基准','附五文件修改前基准及两份必要测试CSS基准');
fs.writeFileSync('artifacts/share-equipment-20261015/build.cjs',s);

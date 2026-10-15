/* 仅打包当前源码，保留实际依赖的测试基准，不触碰产品文件。 */
const fs=require('node:fs'),assert=require('node:assert/strict');let s=fs.readFileSync('artifacts/share-equipment-20261015/build.cjs','utf8');
s=s.replace("'share-equipment-20261015'];","'share-equipment-20261015','handoff-latest-20261015','detail-image-delete-20261015'];");
s=s.replace("for(const rel of ['artifacts/list-library", "for(const rel of ['artifacts/share-equipment-20261015/baseline/js/register-share.js','artifacts/list-library");
s=s.replace('/104 script syntax/','/105 script syntax/');
s=s.replace("read(path.join(work,'share/results.json'))","read(path.join(root,'artifacts/share-equipment-20261015/share/results.json'))").replace("read(path.join(work,'qa/ui-ux-focused/results.json'))","read(path.join(root,'artifacts/share-equipment-20261015/qa/ui-ux-focused/results.json'))");
s=s.replace("for(const f of ['share/results.json','qa/ui-ux-focused/results.json'])write('handoff/evidence/'+f,fs.readFileSync(path.join(work,f)))","for(const f of ['share/results.json','qa/ui-ux-focused/results.json'])write('handoff/evidence/history/'+f,fs.readFileSync(path.join(root,'artifacts/share-equipment-20261015',f)))");
let a=s.indexOf(' const screenshots='),b=s.indexOf(' const share=',a);assert.ok(a>0&&b>a);
s=s.slice(0,a)+` const screenshots={'01-desktop-top.png':'1440-zh-TW-top.png','02-desktop-delete.png':'1440-zh-TW-delete.png','03-mobile-top.png':'390-zh-TW-top.png','04-mobile-delete.png':'390-zh-TW-delete.png','05-wide.png':'1440-zh-TW-shape-10000.png','06-tall.png':'1440-zh-TW-shape-10002.png','07-irregular.png':'1440-zh-TW-shape-10007.png'};for(const [to,from]of Object.entries(screenshots))write('handoff/evidence/'+to,fs.readFileSync(path.join(work,'preview',from)));
`+s.slice(b);
const marker=" for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);";assert.ok(s.includes(marker));
s=s.replace(marker,` notes['00_READ_FIRST.md']=notes['00_READ_FIRST.md'].replace('最新开发为分享结算三分区与装备详情精修，原真实评分/雷达/保存逻辑保留。','最新开发仅修复声骸详情图片留白、移除重复标题和底部直接全宽删除；此前分享/详情设计保留。').replace('tests/share-equipment-browser.cjs','tests/detail-image-delete-browser.cjs');
 notes['01_CURRENT_PROGRESS.md']=notes['01_CURRENT_PROGRESS.md'].replace('本轮分享结算与装备详情精修见04','本轮详情图片/重复标题/直接删除精修见04').replace('已测试：本轮72单元、244引用/104脚本、12组装备/布局、18组操作，30常规及60多情境PNG、雷达任务前对照和Classic像素。历史保存/工作台矩阵未冒充重跑。','已测试：本轮72单元、244引用/105脚本、12组图片及取消/确认删除、18组全站操作。此前分享30/60导出与Classic像素仅历史证据，本轮未重跑。').replace('本轮两版分享已重测。','本轮分享文件未改，未重跑导出。');
 notes['02_MODULE_MAP.md']+='\\n最新：详情展示组保留rw-inspector-title焦点锚点，但不再渲染重复h2；底部普通div中的data-remove保留原事件。图片规则仅限hero，原图片不改。新回归detail-image-delete-browser.cjs。\\n';
 notes['03_NEXT_IMPROVEMENTS.md']+='\\n本轮确认原头像本身贴边，CSS仅完整呈现现有位图，无法补回素材边界外主体。如未来要求全身图须单独提供完整资源；不能凭空补图。本次实体设备与真实外网尚未验证。\\n';
 notes['04_LATEST_CHANGES.md']=read(path.join(root,'docs/detail-image-delete.md'))+'\\n任务前两产品文件在artifacts/detail-image-delete-20261015/baseline，LATEST_BASELINE记录哈希；累计Git差异包含之前工作，不能全部归本次。十个受限文件哈希未变。\\n';
 for(const [n,t]of Object.entries(notes))write('handoff/'+n,t);`);
s=s.replace('附五文件修改前基准及两份必要测试CSS基准','附两文件修改前基准及必要历史测试基准').replace('六张代表图','七张代表图');
fs.writeFileSync('artifacts/detail-image-delete-20261015/build.cjs',s);

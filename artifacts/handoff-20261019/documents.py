from pathlib import Path
import json, shutil, subprocess, difflib
ROOT=Path(__file__).resolve().parents[2];WORK=ROOT/'artifacts/handoff-20261019';S=WORK/'stage/WuwaEchoTool';H=S/'handoff'
def write(n,s):
    p=H/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s.strip()+'\n',encoding='utf-8',newline='\n')

write('00_READ_FIRST.md','''# WuwaEchoTool — 先读此文件

封装日期：2026-10-19（UTC+08:00，精确时间见 SOURCE_SNAPSHOT.json 与 ZIP 文件名）。package.json 版本为 **2.0.0**；最近产品提交的发布标签描述为 **N-v2.1**，两者并不一致，未擅自修改版本。

本项目是鸣潮角色／声骸管理、评分、候选比较、官方资料导入及养成图片分享的静态网页工具。源码、资料表、三语字典、本地图片、OCR Worker/WASM/语言模型、Classic、全部现有测试与实用文档均在本包中。不是 Git diff 包。没有 TypeScript 或打包构建步骤。

本次仅制作交接包及运行检查，没有修改工作目录的产品功能、公式或 UI。封装副本 js/base.js 中唯一未使用的遗留 tokenList JWT 已置空；未复制真实浏览器存档或凭证。详见 SANITIZATION.md。

目前主流程已实作：Register 工作台、声骸库、分析、候选／比较、本地方案采纳、三语、导入／备份、截图识别入口、双版本分享。不是所有真实设备和在线服务都完成验收。最新界面改动包含五件装备卡片、配置名称保存反馈、分享战绩卡、列表与详情图片／收藏布局，以及详情底部直接删除按钮。旧文档描述可能已被后续任务取代，当前源码与 04_LATEST_CHANGES.md 优先。

建议阅读顺序：
1. handoff/01_CURRENT_PROGRESS.md、04_LATEST_CHANGES.md、05_TEST_REPORT.md。
2. register-workspace.html、mccost.html、mccost-readonly.html：入口与脚本加载顺序。
3. js/base.js → js/echo-tool-core.js → js/character-core.js → js/role-view-model.js：资料与计算／展示模型。
4. js/role-register-page.js、js/role-register-renderer.js、css/role-register.css：工作台实际 UI。
5. handoff/02_MODULE_MAP.md 定位要修改的功能；js/register-share.js 与 tests/ 用于回归。

## 执行

建议 Node.js 24（本轮 24.13.0）及 npm 11（本轮 11.6.2），现代浏览器。根目录 package.json 没有依赖，也没有根 lockfile，因此根目录无需 npm install 或 npm ci；不存在构建命令。保留 vendor library 全目录，不能视为 node_modules 删除。

```sh
node handoff/serve.cjs
# 打开 http://127.0.0.1:8123/index.html?view=register
# Classic: http://127.0.0.1:8123/index.html?view=classic
npm test
npm run check:static
node handoff/verify.cjs
```

浏览器回归的可移植运行方式（不改原测试）：
```sh
npm ci --prefix handoff/browser-tools
cd handoff/browser-tools
npx playwright install chromium
cd ../..
node handoff/run-browser.cjs tests/ui-polish-save-browser.cjs
node handoff/run-browser.cjs tests/role-workspace-browser.cjs
node handoff/run-browser.cjs tests/detail-image-delete-browser.cjs
```
原测试直接执行默认引用原作者 Windows 绝对路径 Playwright，使用 msedge 通道；辅助脚本将其映射到独立 lockfile 安装的 Playwright，默认使用 Chromium，也可设置 WUWA_BROWSER_CHANNEL=msedge。原 tests/*.cjs 全部保留。辅助工具 lockfile 版本 1.62.1 来自既有交接工具，本次没有联网更新套件。

## 环境与边界

- 用 HTTP(S) 提供同源文件，OCR Worker 不支持直接 file://；正式部署还需保留 _headers。
- 部分入口 CryptoJS 使用 cdnjs；官方资料 API 为 api.kurobbs.com，图片引用 kuro 官方 CDN。外部 API／CORS／登录凭证有效性未做真实账号验证。本地 library/crypto-js.js 虽有保留，当前 HTML 的 CDN 引用不因此自动改成本地。
- 字体主要用系统字体栈（Arial/sans-serif、系统 UI、等宽回退），没有下载或替换字型。跨平台 Canvas 字体效果可能不同。
- mcData 等 localStorage 与站点来源绑定。换端口／网域视为不同存档；用产品备份／恢复迁移，勿直接覆盖旧存档。
- 浏览器测试使用隔离合成数据与本地图像替换，不代表真实 Safari、实体手机、软键盘、在线官方导入或完整 OCR 识别准确率通过。
- 不要把备选草稿／本地采纳记录解释为多套声骸功能；多套配置、跨角色共享实例与唤取记录仅是未来构想。
''')

write('01_CURRENT_PROGRESS.md','''# 当前进度与证据边界

当前根产品源码无未提交差异，HEAD=36407726aaaffb04c8db1e10dbf249d138cf589f。最新产品提交 0d1521c（2026-10-15，N-v2.1：视觉介面优化）；HEAD 后续提交为清除历史测试资源。任务开始时唯一未跟踪目录是 artifacts/handoff-package-20261015/，属于旧封装工具／结果，不是未提交新功能。本轮新增内容也仅在 artifacts/handoff-20261019/。

| 功能／工作 | 实作状态 | 测试状态与证据 |
|---|---|---|
| Register 路由、角色列表、手动／官方角色工作台 | 已实作 | 本轮单元通过；浏览器结果见 05 |
| 五槽装备卡片、原位单件分析、整套摘要、手机横滑卡片、管理折叠区 | 已实作 | 已有浏览器测试；本轮执行状态见 05 |
| 配置名称 trim、保存反馈、语言重绘保留、冲突／损坏保护 | 已实作 | 本轮 24 组保存／布局回归及 6 张 PNG 通过 |
| 声骸库筛选、排序、搜索、收藏、编辑、装备、删除 | 已实作 | 单元通过；本轮详情浏览器结果见 05 |
| 角色模型／链／评分模态、单件贡献、整套校正 | 已实作 | 本轮评分／模型单元通过；本轮不改公式 |
| 候选资格、替换草稿、比较记录、本地采纳及来源失效保护 | 已实作 | 现有单元通过；不等于多套装备管理 |
| 官方角色导入、预览、选择、确认保存、异常分类 | 已实作 | 本轮单元通过；真实账号／在线网络本轮尚未测试 |
| 截图识别入口、本地 OCR、名称映射／人工复核 | 已实作 | 解析与适配单元通过；真实图片 OCR 全流程本轮尚未测试 |
| 简略／详细 Canvas 分享、雷达、品牌与五共鸣符号 | 已实作 | 本轮保存回归含三语双模板 6 张实际 PNG；更多边界本轮未全部重跑 |
| 繁中、简中、英文与语言／视图会话隔离 | 已实作 | 本轮 i18n 单元通过；浏览器三语范围见 05 |
| 完整备份恢复、多存储空间事务、旧资料相容性 | 已实作 | 本轮单元通过；真实个人存档未复制／未测试 |
| Classic 旧版、概率／模拟／比较／未使用声骸工具 | 已实作 | 本轮单元与静态检查通过；全量 Classic 视觉回归本轮未执行 |
| 实体手机、Safari、软键盘、真实导入凭证与 CDN/CORS | 已有代码，环境验收未完成 | 尚未测试；不可记作通过 |
| 多套声骸、跨角色共享声骸、唤取记录 | 未正式采用，未来构想 | 规划中；不属于本次开发或已完成功能 |
| 直接读取旧 JWT 作为凭证 | 无实际调用；不是产品功能 | 封装副本脱敏，源目录不变 |

最近产品任务按 docs/detail-image-delete.md 与对应 baseline 可确认：详情头像留白／居中、删除冗余标题、直接显示底部删除按钮。更早 UI-polish 文档中的“角色列表编辑快捷入口”已在 list-library-fix 删除；share-equipment 文档中的“折叠删除区”已被 detail-image-delete 后续替换。应视为已被取代的设计，不得继续当作当前行为。没有证据证明其他讨论功能已正式采用或已放弃。

本轮没有新增待完成的产品实现。已知确定问题：根版本与发布描述不一致；浏览器测试绝对路径影响移植；部分开发文档仍有旧状态（例如 ui-ux-v2-polish 曾写没有 package.json，当前已存在）；源码有无引用旧 JWT。本包已处理凭证泄漏风险，但产品源目录仍应由后续独立任务清理。其余未复现故障不猜测为 Bug。

UI/UX 待确认：真实小屏输入时键盘遮挡与横滑可发现性、长英文／混合名称的阅读舒适度、头像原素材边缘导致的视觉贴边、触屏删除反馈及辅助技术。测试可检查尺寸和流程，不能代替真实设备体验评审。
''')

modules=[
('角色工作台','mccost.html、mccost-readonly.html；js/role-register-{mode,controller,page,renderer}.js；css/role-register.css','page 事件／会话，renderer DOM，controller 模型协调','CharacterCore、RoleViewModel、RegisterNavigation；两入口共用，保持脚本顺序、未保存保护与唯一原位分析宿主'),
('声骸管理','js/register-workspace.js、register-secondary-views.js、register-actions.js、register-search-ui.js、register-collections.js；css/register-operations.css','列表／详情、筛选收藏、装备删除事务','core／metadata／navigation；手机详情切换不同于桌面双栏，不以 DOM 索引代替实例身份'),
('声骸评分','js/base.js、echo-tool-core.js、character-core.js、stat-keys.js；scripts/*model.cjs','角色／声骸目录、权重、原计算入口及模型','角色链与模态会影响模型；不可用展示格式化替代计算，也不能直接以五件之和取代整套校正'),
('单件声骸分析','js/role-view-model.js、role-register-renderer.js、role-register-page.js；mccost.html；costedit.html / js/costedit.js','贡献明细、原因、主／副属性与 Cost 展示','CharacterCore；保持缺值、零、负值及未知模型语义'),
('整套分析','js/character-core.js、role-view-model.js、role-register-renderer.js；js/compare.js / compare.html','整套分数与校正、装备完整度及比较','base 评分与角色输入；不引入虚构等级／百分比'),
('角色资料导入','js/register-import-workbench.js、register-import-model.js、import-service.js、role-import-core.js、register-screenshot-import.js、screenshot-recognition*.js、screenshot-name-aliases.js；css/register-import.css；library/ocr/*','官方请求／错误处理、预览确认、OCR Worker 与人工复核','base 中服务定义及签名、存储事务；凭证不得写入报告；保留三种语言模型及两种 WASM'),
('分享养成图片','js/register-share.js；js/role-register-page.js；image/characters、image/cost、image/attribute、image/header.png；css/register-foundation.css','简略／详细 Canvas、雷达、预览与 PNG 下载','RoleViewModel 快照、同源图／CORS 与字体；异步关闭取消、底部符号与预览下载一致性须回归'),
('多语言','js/i18n.js、i18n-dictionaries.js、stat-keys.js、screenshot-name-aliases.js','zh-TW／zh-CN／en 字典、格式化、OCR 名称映射','页面 data 属性及绘图文案；新增文本必须检查三语长文本'),
('资料保存','js/echo-tool-core.js、register-metadata.js、role-draft-{model,storage}.js、role-local-configuration.js、register-backup.js、register-unsaved.js、register-navigation.js','核心资料、名称、草稿、采纳、备份／事务与会话','mcData、wuwa.register.names.v1、wuwa.echoTool.drafts.v1、wuwa.echoTool.localConfigurations.v1 等；保持 revision 冲突与损坏保护'),
('桌面与手机版布局','css/register-foundation.css、register-workspace.css、register-operations.css、role-register.css、character-dock.css；js/character-dock.js、ui-view.js','共享视觉、工作台五卡、双栏库／手机列表详情切换','页面测量／锚点；先检查最终生效规则而非追加全局覆盖'),
('Classic 旧版','index.html、js/index.js、js/base.js、js/mccost.js、js/mccost2.js；compare.html、costedit.html、imitate.html、probability.html、unusedEchoes.html 及各同名脚本','保留旧工作流程与工具','共享 base／helperFunctions、Bootstrap/jQuery；Register CSS 必须继续限定作用域，ui-view 负责路由'),
('候选与比较','js/role-candidates.js、role-candidate-surface.js、role-compare.js、role-history.js、register-overview.js、register-tools.js','候选方案、基线比较、概览与分析工具','草稿存储与模型版本；采纳前核对来源 revision／身份'),
('测试系统','tests/*.test.cjs、tests/*browser.cjs、tests/ui-ux-static.cjs、tests/browser-qa.cjs；package.json','Node 单元、静态引用／语法、Playwright 真实页面','浏览器测试用隔离 seed；部分读取 artifacts/*/baseline，本包保留；移植入口 handoff/run-browser.cjs')]
write('02_MODULE_MAP.md','# 功能与文件地图\n\n表中 js/ 下逗号省略前缀；花括号是文件族写法，真实路径见 FILES.json。\n\n| 模块 | 主要文件 | 责任 | 依赖与修改注意 |\n|---|---|---|---|\n'+'\n'.join('| '+' | '.join(r)+' |' for r in modules)+'''

资源资料入口：角色／声骸基础目录与权重主要内嵌于 js/base.js，不应只寻找独立 JSON。角色画像映射见 js/character-portraits.js。calculations/katixiya.xlsx 与根 DOCX 为已有计算／项目参考，原样保留；本轮未验证其内容与现行全部模型一致。library/ 为随项目发布的第三方运行资源，含许可证与 OCR SHA256SUMS。

实际数据流：入口／路由 → core 或导入预览 → 用户确认保存 → CharacterCore → RoleViewModel → renderer／workspace → UI 或 RegisterShare；草稿与名称分开存储，不能因 UI 名称变化覆盖装备资料。
''')

write('03_NEXT_IMPROVEMENTS.md','''# 后续改善建议（均未在本轮实施）

## 优先修正
- js/base.js 保留未引用遗留 JWT：本包仅副本脱敏；后续应在产品源码独立清理，并由凭证所属方确认是否撤销。不要把真实 token 加回示例。
- tests/*browser.cjs 直接 require 原机器绝对路径并指定 msedge：本包提供辅助运行器，后续可统一配置以改善跨机器 CI；勿为移植改写测试断言。
- package.json 2.0.0 与 N-v2.1 提交名称、历史文档“没有 package.json”等状态不一致：统一发布与文档依据。旧 UI 方案文字容易误导修改，应标明被后续任务取代。
- index.html 与 mccost-readonly.html 等仍依赖外部 CryptoJS CDN、官方图片及 API。后续确认离线目标与合法资源来源，再评估是否切换现有本地 crypto-js；本轮不改变加载行为。

## UI/UX
- role-register 手机 132px 卡片横滑与后置管理区：在实体设备测试可发现性、选取与滚动冲突、软键盘后的保存反馈。
- register-operations 声骸详情的留白只能保留现有头像内容。若要求展示完整立绘，需另备授权完整素材，CSS 无法恢复素材外图像。
- register-share 使用动态画布高度与系统字体：真实不同系统的长英文、混合名称与字体回退需检查；继续保留五个共鸣符号和数据语义。

## 效能与稳定性
- register-share 已有并发图片加载、复用与关闭取消；下一步针对真实 CDN 超时／CORS、连续打开关闭和大图内存做实测，不应无依据重写。
- OCR 两个内嵌 WASM 与三语模型属于必要资源。低内存手机首次加载成本应测量，不能为减 ZIP 体积删模型。
- 现有跨存储空间事务与 revision 冲突保护已有测试；补充真实浏览器存储配额／隐私模式行为，保留损坏资料而非自动清空。

## 测试覆盖不足
- 本轮未验真实官方账号、验证服务与线上响应变化；现有导入测试的模拟成功不等于线上可用。
- OCR 端到端识别精度／Worker 回退及不同截图样本需要真实离线样本验收。
- Safari、真实触屏／软键盘、屏幕阅读器与跨平台 Canvas 视觉仍缺验收；浏览器 viewport 不能代替实体设备。
- 本轮分享只重跑保存专项的 6 张常规 PNG；应补跑 ui-share-redesign-browser.cjs 的多角色／负分／缺项矩阵及 Classic 像素对照。

## 长期构想，尚未正式采用
- 多套声骸需要明确配置身份，涉及 role.costList、RoleViewModel 输入、草稿基线、导航选择、导入更新与备份迁移；当前名称管理不是多套方案。
- 跨角色共享声骸需要统一实例引用、占用与冲突规则；不能仅以名称去重或让同实例静默重复装备。
- 唤取记录需要独立产品需求、资料来源与隐私方案；当前项目没有以本轮任务实现该功能。
''')

# Compute the precise latest subtask changes without treating all historical changes as one task.
changes=[]
for rel in ['js/register-secondary-views.js','css/register-operations.css']:
    a=ROOT/'artifacts/detail-image-delete-20261015/baseline'/rel;b=ROOT/rel
    if a.exists():
        diff=''.join(difflib.unified_diff(a.read_text('utf-8-sig').splitlines(True),b.read_text('utf-8-sig').splitlines(True),fromfile='baseline/'+rel,tofile='current/'+rel))
        write('evidence/latest-detail-'+Path(rel).name+'.diff',diff);changes.append(rel)
write('04_LATEST_CHANGES.md','''# 最近任务与基准说明

## 本次 2026-10-19 交接任务
只检查、运行测试、生成文档与完整 ZIP；不修改工作目录产品代码、评分、UI 或使用者资料。没有执行 commit/push、分支操作、reset/clean。包中唯一产品文件差异是 js/base.js 未使用 JWT 的副本脱敏，详见 SANITIZATION.md。新增 handoff/ 文档、清单、校验、预览与浏览器运行辅助工具，不属于新产品功能。

任务开始时 git status 仅有 ?? artifacts/handoff-package-20261015/；git diff HEAD 无产品差异。不能把旧 artifacts 误写成本轮未提交功能。本包以磁盘实存文件复制，而非 git archive；原始文件及封装 SHA-256 对照见 SOURCE_SNAPSHOT.json。

## 最近已提交产品批次
可确认基准：0d1521c（N-v2.1：视觉介面优化）与其父提交 8d32ffc。产品、测试和文档实际文件列表见 evidence/latest-product-files.txt。其包含多次 UI 子任务，不能单凭一个 commit 判定每次 Codex 对话的精确边界。HEAD 3640772 是历史测试资源清理，不是 UI 版本重做。

可确认的 UI 演进：角色工作台五件卡片、共用深色视觉与响应式；配置名保存／重绘反馈；分享双模板顶部角色／分数／雷达；角色列表头像容器与简化入口；声骸库 1.6:1 双栏／14px 间距及收藏叠放；最后是详情图像与直接删除入口。主要代码在 css/role-register.css、css/register-foundation.css、css/register-operations.css、css/character-dock.css、js/role-register-page.js、js/role-register-renderer.js、js/register-share.js、js/character-dock.js、js/register-secondary-views.js 等；完整列表不可由此简写替代。

## 最后可辨认的产品子任务：声骸详情图片与删除
依据 docs/detail-image-delete.md、artifacts/detail-image-delete-20261015/baseline/ 以及当前文件比对。该 baseline 是工作目录保存的任务前副本，不是已证实的独立 Git commit。本包保留 baseline 及逐行 diff，能重做对照。对应改动可在 js/register-secondary-views.js 和 css/register-operations.css 确认，新增 tests/detail-image-delete-browser.cjs 与 docs/detail-image-delete.md。

- 图片仍用原 PNG／contain，132px 外框、12px 内距、1px 边框，内图约106px，居中；不能恢复图片本身被素材边界截断的部分。
- 移除“声骸详情”冗余 h2，保留 rw-inspector-title 焦点锚点和真实声骸名的 aria-labelledby。
- 底部原 details/summary 删除区改为直接显示全宽、至少44px暗红按钮，与比较卡片留20px；仍调用原 data-remove、确认框和删除事务。
- 不新增评分、有效性判定或资料格式。不改变收藏、装备、比较和手机返回流程。

资料流：早期配置名称保存修复写 RegisterMetadata（与 mcData 分离），收藏成功反馈写原 notice 状态。最后详情子任务只改呈现，删除确认后仍由既有事务更新库存、列表与选取。不能将当前库内无角色上下文的数据推导为额外有效词条评判。

旧版影响：Register 专属样式和详情 renderer 为主要改动点；共享文件仍可能产生外溢风险。现有 Classic 单元／静态结果可参考，本轮未执行完整 Classic 像素对照；不作“旧版绝无影响”保证。

尚未解决：实体设备与 Safari、软键盘、真实 API/CORS、OCR 全流程验证；头像素材限制、测试绝对路径、历史文档／版本差异。多套装备、跨角色共享和唤取记录都未新增。
''')

write('SANITIZATION.md','''# 封装副本脱敏

源工作目录 js/base.js 第7378行有一个遗留 JWT，变量 tokenList 在项目应用代码中仅声明一次，没有引用。为了不打包真实凭证，仅将封装副本该 JWT 字串置空。没有改任何评分或 UI 逻辑，也没有改工作目录文件。其他复制文件逐字节保留，校验对照见 SOURCE_SNAPSHOT.json。

不复制 .env、私人浏览器资料、真实 localStorage、账号会话、私钥。所有本轮浏览器测试用隔离合成数据。安全检查包含高可信 JWT／私钥／常见服务密钥模式及 DOCX/XLSX 内 XML，不在日志输出凭证本体。模式检查不能形式证明能识别所有未知凭证格式。

EXCLUSIONS.json 记录排除项。原 SHA-256 只是不可逆校验值，不包含原始 token。若需真实在线导入，应由使用者在产品中输入自己的有效凭证；不要把 token 加入交接包。
''')

# Preserve already existing, locked handoff runtime helpers; no product files modified.
old=ROOT/'artifacts/handoff-full-20261015/WuwaEchoTool/handoff'
for n in ['serve.cjs','run-browser.cjs','browser-tools/package.json','browser-tools/package-lock.json']:
    d=H/n;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(old/n,d)
write('verify.cjs',r'''
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'FILES.json'),'utf8'));
const sum=fs.readFileSync(path.join(__dirname,'SHA256SUMS'),'utf8').trim().split(/\r?\n/);
const names=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.isDirectory()){if(['node_modules','.git'].includes(e.name))continue;walk(path.join(d,e.name));}else names.push(path.relative(root,path.join(d,e.name)).split(path.sep).join('/'));}}walk(root);
for(const f of manifest.files){assert.ok(fs.existsSync(path.join(root,f.path)),'Missing '+f.path);assert.equal(fs.statSync(path.join(root,f.path)).size,f.bytes,'Size '+f.path);}
assert.deepEqual(names.sort(),manifest.files.map(f=>f.path).sort(),'Unexpected or missing files (run before browser output generation)');
for(const line of sum){const m=line.match(/^([a-f0-9]{64})  (.+)$/);assert.ok(m);const b=fs.readFileSync(path.join(root,m[2]));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m[1],m[2]);}
console.log('PASS '+names.length+' files; '+sum.length+' SHA-256 checks; SHA256SUMS excludes itself.');
''')
print('handoff documents and runtime helpers generated')

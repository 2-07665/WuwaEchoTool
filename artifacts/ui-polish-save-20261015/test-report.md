# 本轮实际测试（2026-10-15）

本报告随最终封装程序逐项核对结果 JSON 后交付，不能以测试脚本存在替代通过。

| 指令／检查 | 结果与实际范围 |
| --- | --- |
| npm test | 72通过，0失败；评分、模型、存储、分享及雷达边界 |
| npm run check:static | 244本地入口引用、102脚本语法通过；无生产bundler或TypeScript检查任务 |
| git diff --check | 通过；未执行commit/push/切分支 |
| node tests/ui-polish-save-browser.cjs | 24组：1440/1024/390/320×三语×手动/合成导入；名称提交、trim、Enter、切角色/刷新、语言重绘、失败恢复、冲突拒绝覆盖、损坏元数据保留；同时检查布局、缩图、删除取消、编辑定位、收藏、库存编辑与确认装备；三语双版共6张真实下载PNG |
| node tests/role-workspace-browser.cjs | 42组，七宽度320—1440×三语×两入口，84张边界截图，无页面错误 |
| node tests/register-operations-browser.cjs | 36组，1440/1024/390/360四宽度×三语×大量/少量/空存档，全站真实操作回归，无页面错误 |
| node tests/register-integration-browser.cjs | 1440/320×三语共6组，跨页状态、保存失败及未保存保护，无页面错误 |
| node tests/ui-ux-browser.cjs | 30张真实PNG，三语×双版×正常/长名/缺项/未知/空；预览等于下载，五共鸣符号、边界、异步/会话保护 |
| WUWA_CLASSIC_ONLY=1 node tests/ui-share-redesign-browser.cjs | 仅执行Classic像素对照，通过；本轮该脚本0张新版PNG，不冒充历史60张重跑 |
| 核心SHA-256 | base、role-view-model、character-core、register-metadata、register-overview五文件与任务前相同 |
| 封装检查 | 全部必要image/library原样保留；335静态资源引用无缺失，秘密特征与DOCX XML扫描无发现（副本遗留JWT置空后） |

浏览器为无头Edge、独立HTTP与隔离合成localStorage；真实本地资源模拟外网图片，不读取真实玩家存档。人工查看了双版实际PNG、桌面角色列表/声骸库/总览和手机工作台/详情。桌面库详情约38%，手机维持清单与详情切换，页面无水平溢出。

测试开发时曾因未接受装备确认框误报未装备、details在目标选择重绘后收合导致无法点击；测试现在显式接受确认并重开details，产品确认流程未改。布局测试曾发现旧CSS后置规则覆盖新比例，已在实际生效规则修正；最终完整矩阵重跑。

未执行：真实Safari/实体手机/软键盘、真实官方账号/API/CORS、完整OCR端到端、未列出的其他历史测试。真实配额失败以Storage.setItem异常注入模拟；“写入成功后读取失败”未单独注入。不同雷达图面积不是统一质量百分比。

交接ZIP附CRC、逐文件SHA-256清单，并在交付前用独立.NET解压后逐字节比对全部文件，再运行副本单元/静态检查。最终验证结果见交付报告与构建目录delivery.json。

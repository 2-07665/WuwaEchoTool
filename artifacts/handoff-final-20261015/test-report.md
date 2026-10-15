# 本次封装测试与历史证据

## 本次重新执行（2026-10-15）

| 指令 | 结果与范围 |
| --- | --- |
| npm test | 72通过，0失败；原算法、模型、存储、导入兼容、分享及雷达边界 |
| npm run check:static | 244本地入口引用、102脚本语法通过；本项目无TypeScript或生产bundler，不虚构build/typecheck |
| git diff --check | 通过；仅只读Git检查，未commit/push/切分支 |
| node tests/ui-ux-browser.cjs | 30张真实PNG：三语×双版×正常/长名/缺项/未知/空；预览下载一致、五共鸣符号、文字边界与异步保护 |
| node tests/ui-polish-save-browser.cjs | 24组：1440/1024/390/320×三语×手动/合成导入；名称trim/保存、Enter、刷新及角色往返、重绘反馈、配额异常、来源冲突、损坏元数据保护；角色缩图/删除取消/编辑定位、总览圆角、收藏/库存编辑与确认装备；另外三语双版6张真实下载PNG |
| 扩展资源检查 | 335静态引用，0缺失；image/library全部逐字节复制，动态图片通过浏览器补充 |
| 安全检查 | 未复制私人存档/.env/凭证文件；副本遗留未使用JWT脱敏后，源码/文档/DOCX XML高可信秘密模式无发现 |

浏览器为本机无头Edge和独立HTTP，使用隔离合成localStorage与真实本地资源模拟外网，不访问用户真实账号或存档。对应本次结果在evidence/current-share-results.json、current-save-layout-results.json及unit-results.txt/static-results.txt。

桌面1440/1024：详情双栏约38%，收藏集成、编辑定位及保存操作通过；手机390/320：无页面水平溢出，保留横向五槽及库清单/详情切换。繁中、简中、英文均执行。两版分享导出、雷达读数和预览下载一致已通过；原始贡献尺度说明仅在网页，不写入PNG。

## 上一轮实际执行，本次未重跑

42工作台矩阵、36全站操作流程、6跨页集成、Classic像素对照。原始JSON在evidence/qa；evidence/preview/results.json属于上一轮24组及6张分享，勿与current-save-layout-results混淆。9张代表截图来自本次重新执行的浏览器与真实分享下载；产品源码本次不改，当前完整工作目录另有逐文件来源哈希。

## 未执行与限制

实体手机、Safari/WebKit、软键盘、真实官方认证/API/CORS、本次完整OCR端到端、其他未列出的历史浏览器脚本。存储配额失败通过异常注入模拟；写成功后读取失败未单独注入。未知秘密格式不能仅由模式检查形式证明，但没有复制玩家数据或环境凭证。

封装完成后还会独立.NET解压、逐文件字节/SHA-256校验、重跑副本单元与静态检查及本机HTTP启动；最终结果以交付报告为准，不将计划当作通过。FILE_MANIFEST.json与SHA256SUMS自身不能自引用，明确排除自身哈希，仍受ZIP CRC及独立解压逐字节验证。

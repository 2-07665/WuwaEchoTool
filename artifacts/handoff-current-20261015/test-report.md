# 本次封装检查与测试（2026-10-15）

## 本次实际执行

| 指令／检查 | 实际结果 |
| --- | --- |
| npm test | 72通过，0失败，含原评分/模型/存储/导入兼容/分享与雷达边界 |
| npm run check:static | 244入口引用、103脚本语法通过；无TypeScript或生产bundler，未虚构build/typecheck |
| git diff --check | 通过，只读Git检查 |
| node tests/ui-ux-browser.cjs | 30张真实PNG，三语×两版×正常/长名/缺项/未知/空；预览与下载一致、五共鸣符号、边界和异步保护 |
| node tests/list-library-browser.cjs | 12组：1440/1024/390/320×三语；不同立绘10px左内距、图片原显示尺寸/卡片高度、无编辑入口、卡片键盘进入/删除取消、收藏双向同步且不改变选择、44px触控、桌面14px双栏间隙及顶部对齐、手机返回切换、无页面水平溢出 |
| 扩展资源扫描 | 静态引用无缺失，image/library原文件完整复制，动态图片由矩阵补充 |
| 安全检查 | 不复制.env/私人存档/凭证；副本遗留未使用JWT置空，源码/文档/DOCX XML高可信秘密模式无发现 |

无头Edge、独立HTTP、隔离合成localStorage，真实本地图片模拟外网；不访问用户真实账号或存档。桌面、手机视口、繁中/简中/英文与两版分享均实际执行。本次完整JSON在evidence/current-list-library-results.json及current-share-results.json；日志为unit-results.txt/static-results.txt。六张代表截图来自本次重新执行。

## 历史证据，本次未重跑

最近产品任务18组全站操作/99截图、9文件保护哈希，以及更早24组配置保存、42组工作台、Classic像素对照等。evidence/preview/results.json和qa/operation-optimization结果为最近产品任务历史记录，不能与current-*混为本次执行。当前源文件逐项哈希另见SNAPSHOT_ORIGINAL_FILES.json。

## 尚未验证

真实实体手机/Safari/WebKit/软键盘、真实官方认证/API/CORS、完整OCR端到端、其他未列历史脚本。本次保存失败详细矩阵未重跑，不冒充通过。高可信模式检查不是对所有未知凭证格式的形式证明。

## ZIP验证

封装器强制验证每条ZIP CRC、解压长度、UTF-8路径唯一性和SHA-256；交付前另用.NET独立解压、逐文件字节比对、在副本重跑单元/静态及HTTP启动检查。最终结果见交付报告。FILE_MANIFEST.json与SHA256SUMS不能自引用，明确排除自身哈希，但仍受ZIP CRC与独立解压比对。

# 本次封装测试与历史记录（2026-10-15）

## 本次重新执行

| 指令／检查 | 结果 |
| --- | --- |
| npm test | 72通过，0失败；评分、模型、存储、导入兼容、分享和雷达边界 |
| npm run check:static | 244本地入口依赖、104脚本语法通过；无TypeScript或生产bundler，不虚构build/typecheck |
| git diff --check | 通过，只读检查，未Git写入 |
| node tests/ui-ux-browser.cjs | 30真实PNG：三语×两版×正常/长名/缺项/未知/空；预览下载一致、文字边界、品牌五符号及异步保护 |
| node tests/share-equipment-browser.cjs | 12组：1440/1024/390/320×三语，图片/名称/Cost套装置中，主副词条与原归一化读数相同，收藏双向同步/成功反馈，44px按钮、16px卡片内距、比较选择、实际14px双栏间距及顶部对齐、手机返回、无水平溢出 |
| 扩展资源检查 | 静态引用无缺失，全部image/library/OCR三语模型/WASM保留；动态图片通过浏览器补充 |
| 安全检查 | 无私人存档/.env/凭证文件；仅副本遗留未使用JWT置空后，高可信秘密模式及DOCX XML扫描无发现 |

本次结果：evidence/current-equipment-results.json、evidence/qa/ui-ux-focused/results.json、unit-results.txt/static-results.txt。六张代表图均来自本次真实浏览器与下载。无头Edge、独立HTTP、隔离合成存档和真实本地资源，不读取真实玩家账号。

## 历史证据，本次未重跑

上一次产品任务：60张多角色/链/模态/Cost/缺项/零负值PNG、逐项任务前雷达对照、Classic像素一致；18组全站操作/99截图；八个受限文件哈希未变。结果分别在evidence/share/results.json、qa/operation-optimization/browser-results.json、protected-hashes.json。evidence/preview/results.json也是上一次12组结果，本次使用current-equipment-results区分。

更早的保存/工作台矩阵不冒充本次执行。当前源文件哈希在SNAPSHOT_ORIGINAL_FILES.json；最新五文件任务前基准及两份浏览器测试必要CSS基准保留。

## 尚未执行

实体手机/Safari/WebKit/软键盘、真实官方认证/API/CORS、完整OCR端到端；本次未重跑60多情境导出、Classic像素或18全站操作。收藏写入失败未单独注入，仍沿用原错误提示。高可信秘密扫描不是对所有未知格式的形式证明。

## 封装核验

ZIP封装器强制检查CRC、UTF-8唯一路径、解压长度及SHA-256；交付前另用.NET独立解压、全文件逐字节比对，在副本重跑单元/静态和HTTP启动。最终结果见交付报告。FILE_MANIFEST.json及SHA256SUMS自身无法自引用，明确排除自身哈希，仍受ZIP CRC和独立解压比对。

运行本体无需npm第三方依赖；浏览器辅助有独立package/lockfile，安装方法见00_READ_FIRST。官方API/部分图片/CDN需联网与用户自备凭证，OCR须HTTP运行；重启电脑后需重新启动预览服务。

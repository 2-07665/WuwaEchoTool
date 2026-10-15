# 本轮实际测试（2026-10-15）

| 指令 | 实际结果 |
| --- | --- |
| npm test | 72通过，0失败；原评分/模型/存储/导入兼容/分享边界 |
| npm run check:static | 244入口依赖、105脚本语法通过；无TypeScript或生产bundler，不虚构build/typecheck |
| git diff --check | 通过，未Git写入 |
| node tests/detail-image-delete-browser.cjs | 12组1440/1024/390/320×繁中/简中/英文；宽059、尖高035、不规则039三类实际图片共36次展示，测量contain/50%居中/至少12px留白/原比例/约106px非放大；无h2、保留展示组焦点、无折叠删除；按钮底部全宽/44px/20px间距；每组真实取消与接受原生确认框，取消存储逐字节一致，确认仅移除目标项/清单更新/选择清空；原字段/收藏/比较和移动返回亦检查 |
| WUWA_QA_WIDTHS=1440,320 node tests/register-operations-browser.cjs | 18组现有操作、99截图，三语×两宽度×大量/少量/空；收藏、编辑、加入配置、比较及其他既有流程通过，0页面错误 |
| protected-hashes.json | 十个受限实现文件与任务前一致，含原删除事件/事务调用所在register-workspace.js、分享/评分/保存/统计/字典和角色列表样式 |
| 扩展资源与安全扫描 | 静态引用无缺失；image/library完整；副本遗留未使用JWT脱敏后无高可信秘密/私人凭证文件发现 |

仅使用无头Edge、独立HTTP、隔离合成存档与真实本地图片，不读取玩家账号或存档。手动查看桌面/手机顶部、全宽暗红删除、尖高头像等实际截图。测试第一次重访手机库时未先返回清单，修正测试步骤后完整重跑；产品切换逻辑未改。

图片本身是106/107px已构图方形头像，四角不透明；原素材已经贴边的部分无法通过CSS恢复。新图框保持132px，12px内距及边框，图像约106px，未增加展示区高度，也未改原资源。结果JSON为evidence/preview/results.json及qa/operation-optimization/browser-results.json。

未执行：实体手机/Safari/WebKit/软键盘、真实官方API/CORS、OCR端到端。分享及雷达实现哈希未变，本轮未重新导出或执行Classic像素，不把历史通过冒充本次。历史30/60分享及Classic证据在evidence/history，仅用于进度追溯。

交付前强制检查ZIP CRC、UTF-8唯一路径和SHA-256，再独立.NET解压后全字节比对、在副本重跑单元/静态及本机HTTP启动。两个校验清单无法自引用，明确排除自身哈希，仍受CRC/解压比对。最终完成结果以交付报告为准。

# 本轮实际测试（2026-10-15）

| 指令 | 结果与范围 |
| --- | --- |
| npm test | 72通过，0失败；原评分/模型/存储/导入/分享/雷达边界 |
| npm run check:static | 244入口依赖、104脚本语法通过；没有TypeScript或生产bundler任务 |
| git diff --check | 通过，未Git写入 |
| node tests/ui-ux-browser.cjs | 30张真实PNG：三语×双版×正常/长名/缺项/未知/空，文字不越画布、品牌五符号、预览下载一致及异步/会话保护 |
| WUWA_SHARE_BASELINE=artifacts/share-equipment-20261015/baseline/js/register-share.js node tests/ui-share-redesign-browser.cjs | 60张真实PNG，三语×双版×十情境：不同角色/链/调谐融合谐振模态、健康参考条件、43311/44111/33311、缺项、零/负值；每个雷达完整对象与修改前实现相同，原模型summary.score不改、导出不写mcData；同次预览下载一致；Classic像素对照一致 |
| WUWA_QA_WIDTHS=1440,320 node tests/register-operations-browser.cjs | 18组全站操作、99截图，三语×两宽度×大量/少量/空，收藏、编辑、装备、比较、删除确认及备份等原操作通过，0页面错误 |
| node tests/share-equipment-browser.cjs | 12组1440/1024/390/320×三语；图/名/Cost套装置中，主副词条与原归一化读数完全相同，收藏双向同步及成功提示，按钮44px、卡片16px内距、比较选择、双栏14px/顶部对齐、手机返回、无页面水平溢出 |
| protected-hashes.json | 八个受限文件未变，覆盖核心/模型/保存/工作台/统计和角色列表样式 |
| 封装扩展检查 | 静态引用无缺失，image/library全量；不含私人存档，遗留未使用JWT仅副本脱敏；高可信秘密及DOCX XML扫描无发现 |

浏览器使用无头Edge、独立本机HTTP、隔离合成存档和真实本地图片模拟外网，不访问用户账号。手动查看简略/详细实际PNG、英文详细图与桌面/手机装备详情。新CSS曾受旧padding!important覆盖，移除该优先级后12组完整重跑通过；其余操作使用原事件/事务，未增加计算。

分享宽度保持1440/2040，顶部与长文本高度自适应，不能将新设计声称与旧PNG逐字节相同；同次预览=下载。零/负值为隔离展示夹具，不是改动评分算法。雷达仍是原始贡献尺度，不是统一品质百分比。

未执行：实体手机/Safari/WebKit/软键盘、真实官方API/CORS、完整OCR端到端、其他未列脚本。收藏失败仍走原SAVE_FAILED/来源冲突提示，本轮未单独注入收藏写入失败。没有把未执行写成通过。

证据JSON在evidence/preview、qa和share。完整源码附所需旧CSS测试基准，浏览器辅助通过独立lockfile安装。交付前强制ZIP CRC/UTF-8唯一路径/SHA-256核验，再独立.NET解压全字节比对、副本单元/静态和HTTP启动检查；最终状态见交付报告。

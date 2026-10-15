# 模块、责任与依赖

表中省略前缀的脚本位于 js/，样式位于 css/。根 HTML 是实际产品入口；artifacts 是历史验证，不是产品替代。

| 功能 | 主要文件 | 责任与依赖 | 修改注意 |
| --- | --- | --- | --- |
| 角色工作台 | mccost.html、mccost-readonly.html；role-register-page.js、role-register-renderer.js、role-register-controller.js、role-register-mode.js | page联接控制器、RoleViewModel、i18n；手动/导入共用渲染 | 五固定槽、单分析宿主；显示/选槽不写核心数据 |
| 声骸管理 | register-workspace.html；register-workspace.js、register-secondary-views.js、register-search-ui.js | 库存/编辑/新增/筛选；依赖CharacterCore、收藏与导航状态 | 不绕过唯一ID、来源冲突、明确保存或未保存保护 |
| 声骸评分 | base.js、stat-keys.js、character-core.js、role-view-model.js | base提供目录/权重/原算法，Core事务与归一化依赖该API | 不改公式、权重，不把格式化文案回写数值 |
| 单件分析 | role-view-model.js、role-register-renderer.js、role-register-page.js | 主/固定/副词条贡献、完整度与解释；依赖共享评分 | 区分贡献与质量；未知数据不补造分数 |
| 整套分析 | role-view-model.js、base.js、register-overview.js | 总分、校正、最小贡献位置、属性累计 | 总分不等于五件相加；不改校正或新增评价门槛 |
| 角色概览 | index.html、character-dock.js、register-overview.js、character-portraits.js | 实例列表、跨角色统计、立绘；依赖目录/Core/ViewModel | 工作台重复展示虽移除，真实首页总览与导航保留 |
| 角色导入 | index.js、import-service.js、role-import-core.js、register-import-model.js、register-import-workbench.js | 官方请求/签名、映射、预览确认、更新冲突 | 依赖网络和使用者凭证；请求成功不等于保存，不记录Token |
| 截图识别 | screenshot-recognition.js、screenshot-recognition-adapter.js、screenshot-name-aliases.js、register-screenshot-import.js、library/ocr/ | 同源Worker/WASM/三语模型，解析后人工校对，依赖Core | HTTP运行；未确认不写存档；模型与示例图不可省略 |
| 分享图片 | register-share.js；image/；register-foundation.css | 复制ViewModel快照，字体/图片就绪后Canvas导出；两模式与五角图 | 不调用评分/存储；复用品牌、双环和五符号；轴不是质量百分比 |
| 多语言 | i18n.js、i18n-dictionaries.js | zh-TW/zh-CN/en共857键、实体名与Intl格式 | 新文案补齐三语；内部属性键不使用翻译文字 |
| 保存/备份 | character-core.js、register-backup.js、register-metadata.js、register-collections.js、register-unsaved.js、register-navigation.js | mcData事务、备份、名字、收藏、会话与保护 | 保留多命名空间、失败回滚和旧备份兼容；只显式保存核心 |
| 候选与比较 | role-candidates.js、role-candidate-surface.js、role-draft-model.js、role-draft-storage.js、role-local-configuration.js、role-compare.js、role-history.js | 独立草稿、来源摘要、比较/采纳与失效 | 草稿不等于多套装备；保留过期/不兼容/来源变化保护 |
| 工具 | register-tools.js、echo-tool-core.js；probability.html、imitate.html、rule.html | 概率、模拟、资源、规则沿用旧核心 | 不改计算口径；工具状态与角色存档分离 |
| 桌面/手机 | role-register.css、register-foundation.css、register-operations.css、register-workspace.css、character-dock.css | 共享变量、工作台专属布局、焦点/横滑/导航 | Register作用域；手机返回、管理/评分设置和触控目标保留 |
| Classic | ui-view.js；index.js、mccost.js、mccost2.js、costedit.js、unusedEchoes.js、compare.js、probability.js、imitate.js、base.css | 旧入口/旧视觉，共享base与部分资源 | 不因Register重排旧版；共享改动仍需回归 |
| 测试 | tests/*.test.cjs、tests/*browser.cjs、tests/fixtures；artifacts/register-overview/classic-before.js | 原算法基准、单元/事务、浏览器布局/导出 | 冻结基准不能删；普通测试无依赖，浏览器用Playwright辅助锁文件 |
| 运行与资源 | package.json、_headers、library/、image/、scripts/、calculations/、docs/ | 静态发布、供应商库/OCR/全部图片、参考模型与说明 | 本体无bundler/TS；不能把OCR/WASM等当作可丢缓存 |

数据流：mcData → CharacterCore/导入转换 → RoleViewModel调用原base评分 → controller/page/renderer。链/模式仍通过原事务保存并重算缓存；展示和翻译不改计算输入。分享只读取快照，独立画图，不覆盖整套评分。

源码路径索引见FILE_INDEX.md，完整文件与SHA-256见FILE_MANIFEST.json。运行/重装命令见00_READ_FIRST.md；历史QA中的本机截图链接可能未打包，代表图见evidence。

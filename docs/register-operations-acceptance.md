# Register 整體操作與介面優化：交付與驗收

日期：2026-10-13。本次為本機實作，未部署、推送或發布。官方角色導入保留上一輪流程；不改動 Classic 介面、角色定義、權重、評分公式、概率、門檻或養成總覽的統計來源。

## 操作成果

角色工作台仍使用養成總覽／角色列表單一主要面板。新增原序、名稱、分數升降及資料完整度排序，資料／草稿狀態篩選、符合數／總數與重設。沒有有效分數的項目排在數值項目之後，保留不可計分的狀態；不補零分。名稱搜尋包含配置名稱；同角色配置以預設配置名稱或使用者名稱辨識，每個角色可直接選擇多份方案。

分析保留五槽、共同基線及原位宿主。缺漏資料優先定位補資料，未知模型不給改善排名；完整且可評時使用既有 weakestPositions。主詞條與固定貢獻、副詞條贡献及整套校正分開呈現，校正不分攤至每槽。完整詞條係數表及模型條件可展開。最低貢獻只作為模型中的分析入口，不宣稱是實戰最弱或刷取收益最高。

候選支援搜尋、Cost／套裝／主詞條／完整度／收藏、原序／名稱／角色副詞條貢獻排序、數量與重設。不可選項保留原因；無可靠貢獻值不參與數值排名。依原 eligibility、RoleCompare 及目前角色條件判斷，不建立新取捨規則。選擇按鈕明確標示保存草稿並比較。比較仍為單槽副詞條；可返回候選並保留篩選、排序及捲動，關閉保留槽位。

方案管理使用現有 baseline、draft、adoption。配置及方案可明確改名；比較紀錄支援角色／方案搜尋、有效、需重新驗證及來源不存在篩選。有效且可比較才顯示差值，沒有有效值顯示需重新比較。已保存、工具內採用及失效状态分開；刪除方案清理採用與名稱引用，不改來源角色。開啟方案仍重新 assess，名稱與採用標記不繞過驗證。

聲骸庫保留 OCR、收藏、編輯、加入裝備及比較。清單僅顯示紧湊摘要，完整資料在詳情展開；收藏是列按鈕之外的原生獨立按鈕。桌面列表與詳情各有受限捲動區，手機有返回原清單。未選参考角色時只展示屬性，選定角色後才計算原模型的副詞條貢獻及排序。比較位置的可選性直接呼叫既有 eligibility。真正零庫存與無篩選結果分開顯示，已選項被篩除仍保留並提示。

返回上下文使用受限內部地址及分頁狀態，不接受外站、javascript 或任意路徑。角色列表、聲骸庫及比較紀錄保留搜尋、篩選、排序、選取與合理捲動位置；編輯返回原槽位或清單。沒有未保存變更不增加確認；有變更可保留輸入、捨棄或繼續編輯。暫存僅放在隔離的 session 狀態，來源版本不同不自動套用。數字輸入／選項的字串與數字表示不被誤判為修改。語言切換保留輸入及焦點，不發出新官方請求。

另修正原有「打開有效草稿時無條件建立相同模型 override，導致之後切換條件被誤判為保存衝突」的問題。現在只恢復確實不同的條件，真正來源變動才判為衝突；變更模型後立即使舊比較失效。

## 資料與相容性

新增名稱資料使用 `RegisterMetadata` 的獨立版本結構，角色及草稿均以原識別引用，不更改角色身分、模型或 sourceRevision。完整備份新增可選 names 區段，舊備份未帶名稱时使用相容預設。明確删除角色时清理配置名称；删除草稿时清理方案名称及采用引用。跨鍵操作先驗證預期內容，失敗只回復已成功寫入的鍵，並回報無法回復的情況，不宣稱 localStorage 多鍵天然原子。

名稱改動、收藏與清單狀態不寫 mcData。排序只對展示副本操作，原存檔陣列不重排。養成總覽仍以全存檔及原有統計優先規則準備資料，不使用畫面篩選結果。

原有共享評分對照、命座／機制、概率凍結案例、導入、OCR、分享、備份與工具測試全部回歸。Classic 沒有新功能；新增樣式僅作用於 Register。官方導入 transport、Token、伺服器與流程未改動。

## 重跑驗收

在專案根目錄執行：

```powershell
node --test tests/*.test.cjs
node tests/register-operations-browser.cjs
node tests/register-import-browser.cjs
node artifacts/screenshot-recognition/startup-regression.cjs
node artifacts/screenshot-recognition/save-session-regression.cjs
node scripts/build-register-operations-report.cjs
```

兩個 `tests/*browser.cjs` 使用全新 Edge contexts、自行啟動暫時 localhost 伺服器，官方請求採 transport fixtures，其餘外部請求攔截；不使用使用者瀏覽器 profile。OCR 兩項既有腳本使用本機 8765 伺服器與全新 headless profile，若沒有開啟，可先執行既有 `node artifacts/screenshot-recognition/server.cjs`。

- [自動化結果](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/unit-results.txt)：52 項，0 失敗，包含全部既有回歸及 8 項新增資料邊界測試。
- [整體操作瀏覽器結果](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/browser-results.json)：1440、1024、390、360 × 繁中、簡中、英文；每組大量資料、少量資料及空存檔。
- 最終整體操作驗收：36 組流程、186 張介面截圖、12 張分享 PNG 輸出、0 頁面執行例外。
- [官方導入回歸](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/import-regression.txt)：34 組既有完整導入及 Classic 同資料評分流程。
- [OCR 啟動回歸](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/ocr-regression.txt)：三語／桌面／手機、取消與只重試、逾時、重複辨識、file URL 指引及不提前保存。
- [OCR 保存回歸](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/ocr-save-regression.txt)：保存成功、失敗解鎖、不重複写入、重新開啟、忽略過期結果。
- [截圖索引](C:/Users/user/Downloads/WuwaEchoTool/artifacts/operation-optimization/screenshots.md)：包含角色清單、五槽分析、候選、比較、聲骸庫、方案、未保存提示、備份、未知模型、空槽、空庫、鍵盤視窗、模型失效、分享與工具。

大量情境使用 30 筆配置、200 筆聲骸、多角色多草稿與已採用紀錄；少量情境使用 4 筆配置、8 筆聲骸。驗證查看／篩選不改角色資料、改名不影響來源或評分、角色／方案引用清理、名冊與庫的搜尋／排序返回、編輯返回槽位、候選返回篩選、草稿返回紀錄、保留／捨棄输入、模型切換立即停止舊結論、PNG 分享下載及工具操作。每張介面截图檢查整頁橫向溢出及翻譯 key，頁面例外必須為零。

## 修改檔案

| 檔案 | 内容 |
| --- | --- |
| `js/register-metadata.js`（新增） | 名稱、預设標籤、樂觀衝突及跨鍵回復工具 |
| `js/register-collections.js`（新增） | 不可變列表篩選與排序、可靠副詞條貢獻讀取 |
| `js/register-navigation.js`（新增） | 返回白名單、session 清單狀態、鍵盤視窗 |
| `js/register-unsaved.js`（新增） | 未保存輸入保留／捨棄／繼續與語意修改比對 |
| `js/character-dock.js` | 單面板、排序／狀態、配置辨識、多方案與返回狀態 |
| `js/role-register-renderer.js` | 問題優先順序、補資料、拆解、展開資訊 |
| `js/role-register-page.js` | 配置改名、方案驗證、焦點、返回與模型衝突 |
| `js/role-candidate-surface.js` | 候選查找、排序、返回、改名、未保存與模型失效 |
| `js/register-secondary-views.js` | 聲骸庫布局／上下文／原生收藏及比較紀錄 |
| `js/register-workspace.js` | 工作台狀態、表單返回、重設、收藏保存、方案改名 |
| `js/register-actions.js` | 角色刪除名稱清理、失敗回復與語言保持 |
| `js/role-history.js` | 草稿、採用與名稱引用整合删除 |
| `js/register-backup.js` | 新名稱區段與舊格式兼容 |
| `js/i18n-dictionaries.js` | 完整三語新增文案 |
| `css/register-operations.css`（新增） | 共用清單／表單、資料密度、手機與 reduced-motion |
| `index.html`、`mccost.html`、`mccost-readonly.html`、`register-workspace.html` | 載入上述 Register 模組與樣式 |
| `tests/register-operations.test.cjs`（新增） | 資料隔離、排序、備份、衝突、删除、返回及暫存邊界 |
| `tests/register-operations-browser.cjs`（新增） | 四尺寸三語、完整流程與大量／少量／空資料驗收 |
| `tests/register-secondary-views.test.cjs`、`tests/role-candidates.test.cjs` | 同步緊湊清單與新模組 harness，保留原行為回歸 |
| `tests/register-import-browser.cjs` | 備份檔讀取後等待非同步驗證完成，再核對還原可用性 |
| `scripts/build-register-operations-report.cjs`（新增） | 從已通過結果產生截圖索引與總結 JSON |
| `artifacts/operation-optimization/*`、本報告及操作清單 | 實際測試記錄與圖片 |

## 外部限制

上一輪官方導入已由使用者實際驗收通過；本輪保留該流程並完成 fixture 回歸，沒有以真實官方帳號重新登入。手機測試是實際 Edge／Chromium 的 390、360 寬度及 460 高度鍵盤佔用視窗，不宣稱為 iOS／Android 實機鍵盤驗證。所有驗收使用隔離存檔，不修改實際資料。

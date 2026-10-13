# Register 第二階段整合驗收

本輪先讀現有實作，再修正可重現的跨功能缺口。保留原有頁面、五槽分析、單槽副詞條比較、草稿／基準／本地採用結構及三語。沒有改動 `base.js`、共用計算核心、權重、公式、門檻、Classic 操作或既有備份格式；沒有部署或推送。

## 修正與檔案

| 檔案 | 修正前的問題 | 本輪處理 |
| --- | --- | --- |
| `js/role-candidates.js` | 已保存庫存候選只驗證角色基準，沒有檢查候選实例是否被編輯、刪除、裝備或重複 | 在既有適配器加入純讀取的來源驗證；比較正規化的 Cost、主／副詞條、套裝及身分，忽略名稱與評分快取；手動試算仍為獨立快照 |
| `js/role-candidate-surface.js` | 重新開啟或採用可能繼續展示舊候選結果；切換來源直接重設輸入；保存後側邊清單不更新 | 保存、開啟、重新計算、採用前檢查候選與保存的草稿；失效立即移除結論；來源切換沿用保留／捨棄／留下；顯示方案名稱，保存／改名／採用後更新清單及目前方案標示 |
| `js/role-register-page.js` | 失敗的分析設定保存沒有離頁保護；槽位返回狀態不足；切換槽位可能開兩次未儲存確認 | 沿用既有 session 表單保護恢復未提交設定，來源不符時不套回；在既有導航中記錄並驗證槽位；修正重複確認；監聽方案／名稱／來源變更，重新驗證清單與比較 |
| `js/character-dock.js` | 瀏覽器恢復頁面可能沿用舊最近角色；候選來源失效仍列為有效草稿；不合法頁籤值可能隱藏所有面板 | 重新讀最近角色；共用候選来源驗證；無效頁籤回到養成總覽 |
| `js/register-navigation.js` | 分析頁進聲骸庫未帶角色及槽位 | 帶入明確角色、選中槽位及經 allowlist 驗證的返回位置，沿用原導航儲存與返回規則 |
| `js/register-workspace.js` | 聲骸庫／紀錄未追蹤其他分頁資料變更，刪除後仍可能顯示舊選取或上下文 | pageshow、focus、storage 重新驗證；清除已不存在的角色／聲骸及變動的替換位置；比較前再檢查來源；紀錄不顯示失效差值；失效返回連結安全回工作台；分析上下文僅作參考，聲骸庫手動／OCR 新增仍加入庫存 |
| `js/register-unsaved.js` | 第一個表單確認後可繞過其他未提交輸入；Escape 留下對話框；session 清理失敗可把已完成的核心保存報成失敗 | 在現有模組集中註冊一次離頁事件，逐一保護所有髒表單；取消後重新啟用先前表單保護；Escape 關閉並還原焦點；保留／捨棄失敗不離開；核心保存成功後的 session 清理採容錯 |
| `css/register-operations.css` | 部分不可操作按钮使用 loading 游標，其他互動狀態不一致 | Register 按鈕統一低飽和選中／Hover、180ms 過渡、focus-visible、Disabled 與 aria-busy 游標；成功／失敗訊息維持共用色彩及 reduced-motion |
| `index.html` | 工作台未載入既有候選適配器 | 載入共用 `role-candidates.js` 供有效性檢查，無第二套評分或 Classic 介面變更 |

`register-metadata.js`、草稿儲存、本地採用與歷史清理經檢查及失敗／衝突／備份／清理回歸，現有功能可沿用，沒有為了清單額外重寫。

新增 `tests/register-integration.test.cjs`、`tests/register-integration-browser.cjs`。調整 `tests/role-register.test.cjs` 的實際依賴，及 `tests/register-operations-browser.cjs` 對「被編輯候選應失效」與「槽位已恢復」的預期。

## 驗收結果

- Node：57 通過、0 失敗（原有 52 + 新增 5）。驗證庫存來源變更／移除／重複、手動快照、不修改角色、session 清理失敗、採用引用與名稱清理、其他草稿保持，以及下載／新分頁／頁內跳轉不誤觸離頁保護。原有 Classic／計算一致性、資料衝突、備份、三語及匯入等測試全部通過。
- 既有整體操作：36 組通過、0 失敗，1440／1024／390／360，繁中／簡中／英文；30 角色配置、200 聲骸、多草稿及少量／空資料，含編輯、比較、返回、分享、完整備份與工具。
- 新增整合：6 組通過、0 失敗，1440／390、三語；兩份命名方案獨立保存／重開、本地採用、跨分頁候選更新後失效、刪除聲骸與角色、候選保留／捨棄／Escape、單次槽位確認、保存失敗設定跨頁／刷新恢復、多表單保護、未提交名稱時仍可下載、角色切換與最近角色；無 pageerror。
- 頁籤：12 組通過、0 失敗，四種寬度與三語，含 Hover／Focus／鍵盤／reduced-motion／資料保持。
- 官方導入回歸：34 組通過、0 失敗；官方服務使用合成回應，無 pageerror。
- OCR：啟動及保存階段兩份瀏覽器回歸腳本通過，涵蓋取消／重試／逾時／延遲結果、保存失敗解鎖、無重複寫入、手機版與三語入口。

測試均使用新建、隔離的瀏覽器 context，不接觸使用者現有存檔。結果在 `artifacts/register-integration/unit-results.txt`、`artifacts/register-integration/results.json`；整體操作在 `artifacts/operation-optimization/browser-results.json`，官方導入在 `artifacts/official-import/browser-results.json`，頁籤在 `artifacts/register-tabs/results.json`。

截圖：`artifacts/register-integration/1440-zh-TW-plan.png`、`390-zh-TW-library-context.png`、`390-zh-TW-stale-plan.png`、`390-zh-TW-unsaved-model.png`，並有三語桌面／手機同類截圖。合成配置用來驗證操作，離線測試會攔截外部圖片請求，不代表真實官方帳號畫面。

## 重跑方式

在專案目錄執行：

```powershell
node --test tests/*.test.cjs
node tests/register-integration-browser.cjs
node tests/register-operations-browser.cjs
node tests/register-tabs-browser.cjs
node tests/register-import-browser.cjs
```

瀏覽器測試使用此環境的 Playwright runtime 與 Microsoft Edge，腳本內自動建立僅供測試的 localhost 服務，完成後關閉。不同環境需調整 Playwright 套件路徑／安裝 Edge。

OCR 既有腳本需要專案服務在 `http://127.0.0.1:8765`：

```powershell
node artifacts/screenshot-recognition/startup-regression.cjs
node artifacts/screenshot-recognition/save-session-regression.cjs
```

## 人工驗收順序及外部限制

請使用獨立測試瀏覽器設定檔／備份副本：

1. 角色列表搜尋、排序後進分析，選槽位，再返回工作台；確認頁籤／搜尋保留及最近角色正確。切換另一角色再返回。
2. 從分析頁進聲骸庫；確認參考角色與替換位置，建立兩份不同名稱方案，逐一重開；本地採用後角色原裝備不變。
3. 在另一分頁編輯候選，再返回原比較；確認結論消失、方案需重比。刪除候選／來源角色後重開舊連結，確認安全提示與返回。
4. 編輯候選數值後換來源或槽位，依次測保留、捨棄、留下與 Escape；保留後切回原來源，輸入應仍存在。
5. 同時修改配置名及方案名，離開時確認兩者均受保護；取消第二個確認後，再次離開仍須保護第一個修改。
6. 真實手機上檢查觸控、軟鍵盤、瀏覽器返回手勢、底部導覽及焦點。檢查 Safari／Firefox 下的操作與刷新提示。
7. 真實官方帳號更新、實拍截圖 OCR 與分享下載，使用測試資料確認；不要用合成回應當作官方帳號驗收。

尚未驗證的外部項目：真實官方帳號／服務、手機實機鍵盤與觸控手勢、Safari／Firefox、瀏覽器被系統強制終止時的 session 保留。自動化以 Edge 和合成配置為主；瀏覽器原生刷新／關閉警告是否顯示受使用者互動與瀏覽器政策限制。來源已改變的未提交資料不自動覆蓋新資料，sessionStorage 不可用時會提示無法保留。沒有已知未處理的本輪可重現功能問題。

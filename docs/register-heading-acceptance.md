# Register 標題列與返回入口整理

實際修改目前工作區 `C:/Users/user/Downloads/WuwaEchoTool`；環境中未找到名稱含 `WuwaEchoTool(20261013-092235)` 的其他資料夾或壓縮檔，因此無法核對該命名版本的獨立副本。

- 聲骸庫「新增聲骸」移到標題列操作區，與角色工作台建立角色入口共用 `register-page-heading`、`dock-create-actions` 樣式。桌面左右對齊，手機沿用工作台的換行安排；正常／Hover／Focus／Disabled 的字體、邊框、留白及顏色已做瀏覽器比較。
- 聲骸庫、比較紀錄、分析工具、資料管理不再生成標題上方的 `op-back` DOM；這四頁使用相同標題列。
- 桌面詳情不再生成返回按鈕；960px 以下的獨立詳情仍保留返回列表，跨尺寸切換同步加入或移除必要 DOM。共用的返回事件因手機仍需要而保留。
- 移除已無用途的新增操作列、空容器及對應 CSS；清除強制桌面顯示詳情返回的規則，以及標題和搜尋之間的重複分隔線。
- `ops.backList` 仍供編輯／新增表單及手機詳情使用，因此保留三語翻譯。官方導入的返回、編輯表單的返回／取消、OCR 返回聲骸庫、比較及分析的返回／關閉均保留。
- 主導覽、跨頁導航、資料與計算核心未修改；沒有部署或推送。

產品修改檔案：

1. `css/character-dock.css`：共用工作台與次級頁面的標題列及操作樣式。
2. `css/register-workspace.css`：清理不再存在的獨立操作列規則。
3. `css/register-operations.css`：移除桌面詳情返回強制顯示及冗餘分隔／容器規則。
4. `js/register-workspace.js`：四個主要頁面標題及新增按鈕 DOM；保留表單返回；處理詳情返回的響應式 DOM。
5. `js/register-secondary-views.js`：移除列表上方新增操作列，只保留結果與重設資訊；桌面詳情不產生返回按鈕。
6. `js/register-search-ui.js`：沿用搜尋元件，更新结果數與重設控件的來源節點。

測試修改：新增 `tests/register-heading-browser.cjs`；更新 `tests/register-search-browser.cjs`、`tests/register-operations-browser.cjs` 的桌面返回預期。長詳情驗收改用確實小於詳情高度的視窗並等待實際位置更新。搜尋測試允許指定出圖目录，避免舊截圖寫入時遇到環境檔案存取錯誤。

結果：

| 測試 | 通過 | 失敗 |
| --- | ---: | ---: |
| 原有 Node | 59 | 0 |
| 新增標題列驗收：1440、1024、390、360 × 三語 | 12 | 0 |
| 完整操作回歸 | 36 | 0 |
| 搜尋／聲骸庫矩陣 | 12 | 0 |
| 跨頁整合／未儲存保護 | 6 | 0 |
| 官方導入合成服務回歸 | 34 | 0 |
| 頁籤互動矩陣 | 12 | 0 |

OCR 啟動與保存回歸腳本亦通過。所有瀏覽器測試使用隔離 context；沒有修改使用者存檔。標題列專項確認實際手動新增並保存、兩種新增入口、返回 DOM、手機返回、resize、樣式狀態、四頁標題位置一致、主導覽存在與無橫向溢出。實際官方帳號與手機硬體操作未測；相關自動化使用合成服務與 Edge viewport。

重跑：

```powershell
node --test tests/*.test.cjs
node tests/register-heading-browser.cjs
$env:WUWA_SEARCH_QA_OUT='C:/Users/user/Downloads/WuwaEchoTool/artifacts/register-heading/search'
node tests/register-search-browser.cjs
node tests/register-operations-browser.cjs
node tests/register-integration-browser.cjs
node tests/register-import-browser.cjs
node tests/register-tabs-browser.cjs
```

結果及實際截圖：`artifacts/register-heading/`；搜尋本轮結果在其 `search/` 子目錄。人工可依序確認桌面新增按鈕、四頁主導覽切換、選取不同聲骸、手機詳情返回、手動／OCR 新增入口；手機實機鍵盤與手勢需另行驗收。

# Register 分享圖與養成總覽驗收

本次僅本機修改，尚未部署。所有截圖使用隔離瀏覽器及合成資料，未讀寫使用者的瀏覽器存檔。

## 詳細版分享圖

- 原始 PNG 寬度由 1440 增至 2040px；目前三語測試資料輸出 2040 × 2112px。高度仍隨內容調整。
- 五欄間距 392px，詞條框 365px，水平 padding 9px。
- 使用 Canvas 的 `measureText` 量測實際字型；數值保留全圖所需最大寬度（最少 64px），另加 12px 名稱／數值間隔。
- 名稱預設 18px；必要時縮至 16px。再放不下才完整換行，不截斷、不省略。每個詞條列的高度由五欄共同決定。
- 數值保持 21px 右對齊、單行。有效詞條判斷、mint 與一般中性色未改。
- 立繪、聲骸圖片 URL、主詞條、評分、總屬性、下載途徑不變。預覽沿用等比例縮放；下載直接取同一個原始 Canvas。
- 三語真實瀏覽器測試：技能／解放名稱五欄全部單行；25 個框逐列高度／y 座標相同；名称及數值無碰撞；下載 PNG 與 Canvas 完全一致。
- 簡略版仍為 1440 × 1150px；使用修改前程式重新產生同資料 PNG，與修改後 PNG 位元組完全一致。

圖片位於 `artifacts/register-overview/`：`detailed-zh-TW.png`、`detailed-zh-CN.png`、`detailed-en.png`。`compact-before.png` / `compact-after.png` 為簡略版對照。

## Classic 統計含義及安全重用

Classic 的 `pulaoPJ()` 是跨角色、讀取已儲存 `totalScore` 的統計：

1. 只要有任何 `isImport` 為 truthy 的角色，就只統計匯入角色。
2. 沒有匯入角色，才統計所有手動角色。
3. 計數是互斥區間：`>90`、`>80 且 ≤90`、`>70 且 ≤80`、`>60 且 ≤70`。剛好 90 計入大畢業，80 計入中畢業，70 計入小畢業，60 不算畢業。
4. 整體評分是所選角色總分的合計，不是百分制總評；平均值分母是統計範圍內的角色數，含未畢業角色。
5. 保留原本先 `toFixed(2)` 再判定稱號的順序與所有嚴格大於條件。

純計算由 `pulaoPJ()` 原樣抽至 `base.js` 的 `getCultivationOverview(roles)`；Classic 的 DOM、圖片、文案與 UI 不改，改呼叫共用函式後仍進行原本 DOM 回填。Register 同樣呼叫此函式，依其回傳的 `pulaoSay.level` 取得三語稱號、練度與評語；沒有另一份評分規則。

Register 的 `RegisterOverview.prepare()` 不重算／寫入 totalScore。總覽固定保留四個畢業等級與摘要欄位，並顯示可統計完整角色及未完成／分數待補數量。部分資料完整時，只使用共用 Classic 函式取得完整角色的畢業數量，明示這是部分分布；全範圍總分、平均、等級與稱號仍標示暫不可用，不使用子集產生全範圍鑑定。沒有可統計角色時，畢業數量顯示破折號，避免虛假零值。完整性仍由既有 RoleViewModel summary.status 與保存分數有效性判斷，匯入優先規則不變。

完整總覽在 Register 角色列表下方；角色工作台的評分／屬性區後有「養成總覽」入口，標明跨角色範圍。沒有新增主導覽或聲骸庫功能，亦不需要打開分享。

## 百分比來源

Classic 的「超越玩家比例」是 `sumScore * 100 / 1200`，取兩位小數後上限 100。它沒有實際玩家樣本、分布或伺服器資料，因此無法解釋成百分位。Register 完全不展示此百分比，僅展示既有總分、均分、分級與稱號。Classic 原有算法和呈現維持不變。

## 同資料對照

合成資料：8 位手動角色的已保存總分為 `90, 80, 70, 60, 90.01, 80.01, 70.01, 60.01`，各自具有完整五聲骸。

| 項目 | Classic | Register |
|---|---:|---:|
| 完美畢業 >90 | 1 | 1 |
| 大畢業 (80,90] | 2 | 2 |
| 中畢業 (70,80] | 2 | 2 |
| 小畢業 (60,70] | 2 | 2 |
| 統計角色數 | 8 | 8 |
| 合計分數 | 600.04 | 600.04 |
| 平均分數 | 75.00 | 75（同值，依現有格式器省略尾零） |
| 練度 | 入门怒涛级大佬 | 入門怒濤級大佬 |
| 稱號 | 大鸣偏将军 | 大鳴偏將軍 |

補充混合来源案例：手動 99 分 + 匯入 65 分，兩版都只計 1 位匯入角色、總分 65、均分 65、小畢業 1 位。保存分數刻意用邊界值測試，並非從示範聲骸重新計分。

## 驗證

- `node --test tests/*.test.cjs`：23 / 23 個測試檔通過。
- 新增 `register-overview.test.cjs`：與修改前 Classic 函式對照 45 組資料，涵蓋所有 16 個稱號等級、分級邊界、匯入優先、兩位小數判斷與三語／空資料。
- 瀏覽器 QA：`artifacts/register-overview/qa.cjs`，使用本機 8877 靜態伺服器與隔離 Edge。
- 三語皆驗證 Desktop 1440px、Mobile 390px；無橫向溢出；完整資料、零角色、缺聲骸、無效分數；存檔不變；瀏覽器錯誤為零。手機區塊截圖以 390 × 1100 viewport 拍攝完整內容，另在 390 × 844 驗證溢出。
- `overview-desktop-{locale}.png` / `overview-mobile-{locale}.png` 為總覽截圖；`overview-empty-*` / `overview-incomplete-*` / `overview-invalid-*` 為空狀態。
- 圖片仍讀取既有 CDN；初次沙箱驗證因網路限制缺圖，最終驗證已使用原 URL 取得完整聲骸圖片，未修改圖片來源。

## 修改檔案

| 檔案 | 內容 |
|---|---|
| `js/register-share.js` | 只調整詳細版尺寸與量測排版，保留簡略版繪製內容 |
| `js/base.js` | 新增從 Classic 抽出的共用純計算 `getCultivationOverview`，重用 `pulaoSay` |
| `js/index.js` | `pulaoPJ()` 改用共用結果，原 UI 回填保留 |
| `js/register-overview.js` | 新增輕量展示 Adapter、空狀態、總覽 HTML |
| `js/character-dock.js` | 在角色列表渲染完整總覽 |
| `index.html` | 載入總覽 Adapter |
| `js/role-register-renderer.js` | 工作台養成總覽入口 |
| `css/character-dock.css` | mint / neutral 四欄及手機 2×2 矩陣 |
| `css/role-register.css` | 工作台入口樣式 |
| `js/i18n-dictionaries.js` | 三語 UI 與全部 16 組原有稱號／評語翻譯 |
| `tests/register-overview.test.cjs` | Classic 對照與空資料測試 |
| `tests/rc2-workspace.test.cjs` | 測試環境載入新增 Adapter |
| `artifacts/register-overview/` | 合成資料入口、QA 腳本、修改前對照、PNG 與結果 |

Register 評分公式、mcData / Echo schema、聲骸庫與存檔方式均不變。沒有新增後端、資料庫、帳號或跨使用者資料收集。

## 不完整資料呈現修正

2026-10-12：修正任一角色未完成時整份總覽消失的問題。三語實際 Dock 驗證使用一位完整角色（保存分數 67.65）與一位僅有一顆聲骸的角色，確認完整／待補數量為 1／1，畢業分布 0／0／0／1，所有摘要欄位保留且顯示暫不可用。Desktop 1440px 與 Mobile 390px 無橫向溢出，存檔無寫入。截圖為 artifacts/register-overview/mixed-desktop-{locale}.png 與 mixed-mobile-{locale}.png；測試腳本 mixed-qa.cjs。較早的 overview-empty 等截圖保留為修正前記錄。

# Register 分享圖與匯出驗收

## 現行兩種輸出

簡略版保留 1440 × 1150 的原繪製內容。詳細版寬 2040px，高度依詞條及換行動態計算；1440 × 1830 為更早階段尺寸，不是目前規格。角色、鏈、模式、模型條件、五槽、主／副詞條、累計屬性及整套校正取自同一份 view model，校正不拆至每槽。

流程為分享 → 選模式 → 預覽 → 下載 PNG；可返回選擇，Escape 關閉並恢复入口焦點。預覽等比例顯示同一個 Canvas，下載不是另一次重新排版。分享／切語言不寫 mcData。

## 量測與排版契約

- 原始 PNG 寬度由 1440 增至 2040px；目前三語測試資料輸出 2040 × 2112px。高度仍隨內容調整。
- 五欄間距 392px，詞條框 365px，水平 padding 9px。
- 使用 Canvas 的 `measureText` 量測實際字型；數值保留全圖所需最大寬度（最少 64px），另加 12px 名稱／數值間隔。
- 名稱預設 18px；必要時縮至 16px。再放不下才完整換行，不截斷、不省略。每個詞條列的高度由五欄共同決定。
- 數值保持 21px 右對齊、單行。有效詞條判斷、mint 與一般中性色未改。
- 立繪、聲骸圖片 URL、主詞條、評分、總屬性、下載途徑不變。預覽沿用等比例縮放；下載直接取同一個原始 Canvas。
- 三語真實瀏覽器測試：技能／解放名稱五欄全部單行；25 個框逐列高度／y 座標相同；名称及數值無碰撞；下載 PNG 與 Canvas 完全一致。
- 簡略版仍為 1440 × 1150px；使用修改前程式重新產生同資料 PNG，與修改後 PNG 位元組完全一致。

圖片位於 `artifacts/register-overview/`：`detailed-zh-TW.png`、`detailed-zh-CN.png`、`detailed-en.png`。`compact-before.png` / `compact-after.png` 為簡略版對照。

## 有效性及未知資料

有效標記使用既有 rawContribution > 0，且要求模型可用、詞條有效。不是固定把暴擊／暴傷高亮；生命正貢獻、暴擊零貢獻亦由模型判定。缺值與未知模型保持中性，五列缺資料使用破折號。長名稱完整換行，數值右對齊；五欄行高共用量測結果。圖片沿用 catalog／CharacterPortraits；外部圖載入失敗保留身份及讀數並提示，不替換假圖。

## 保存的代表證據

- 2040px 三語輸出：[繁中](../artifacts/register-overview/detailed-zh-TW.png)、[簡中](../artifacts/register-overview/detailed-zh-CN.png)、[英文](../artifacts/register-overview/detailed-en.png)。
- 更早閱讀性階段的 [修改前](../artifacts/register-readability/detailed-before.png)、[長名稱與缺詞條](../artifacts/register-readability/detailed-long-partial.png)、[空配置](../artifacts/register-readability/detailed-empty.png)、[未知模型](../artifacts/register-readability/detailed-unknown-model.png) 保留為歷史及邊界證據，不能冒充新尺寸輸出。
- 簡略版的 before／after、compact-original PNG 及 JS/CSS 基準快照保留；曾在同一配置下得到位元組相同的輸出。

## 重跑與限制

`node tests/register-share.test.cjs` 驗證三語、模式、尺寸、有效性、取消及資料不變。完整操作瀏覽器驗收也檢查 PNG 下載。歷史 QA 可先啟動 `node artifacts/register-share/server.cjs`，再執行 `node artifacts/register-share/qa.cjs`、`node artifacts/register-readability/qa.cjs`、`node artifacts/register-readability/edge-cases.cjs`；它們會重新產生當次截圖。

歷史 2026-10-10／11／12 結果及 before 來源是比較證據，不宣稱舊 QA 的全部選擇器仍適用今日 UI。外部圖片受網路／CORS 限制；合成資料不代表真實帳號，手機 viewport 不代表實機。

# 庫街區角色匯入 API 查核

查核日期：2026-10-10。此次只調查，未修改匯入程式、未部署，也沒有使用任何帳號 Token 或個人 UID 發送請求。

## 現有請求鏈

服務定義位於 `js/base.js:7376`，Register 呼叫順序位於 `js/import-service.js`。

主機：`https://api.kurobbs.com:443`。以下皆為 POST：

| 階段 | 路徑 | 用途 |
| --- | --- | --- |
| 綁定 Token | `/user/emoji/queryUsage` | 以回應 success 判定 Token 是否可用 |
| 取得授權 | `/aki/roleBox/requestToken` | 以 Token、UID、serverId 取得 accessToken，保存為 kjq_bat |
| 刷新資料 | `/aki/roleBox/akiBox/refreshData` | 更新資料 |
| 取得角色列表 | `/aki/roleBox/akiBox/roleData` | 讀取 roleList |
| 取得單一角色 | `/aki/roleBox/akiBox/getRoleDetail` | 讀取武器、共鳴鏈、技能及聲骸 |

## 無憑證連線測試

空請求不讀取任何玩家資料，僅確認路由及錯誤回應。

| 路徑尾段 | HTTP | 業務 code | 回應 msg |
| --- | --- | --- | --- |
| queryUsage | 200 | 220 | 访问令牌不能为空 |
| requestToken | 200 | 220 | 访问令牌不能为空 |
| roleData | 200 | 10000 | 角色id不能为空 |
| getRoleDetail | 200 | 10000 | 角色id不能为空 |

對 requestToken 發送 Origin `http://127.0.0.1:8765` 的 OPTIONS 預檢，HTTP 200，allow-origin 回傳該來源，允許 POST 與程式使用的 token、source、devcode、did 等標頭。

以上只能確認端點仍可回應、測試來源的預檢允許；不能證明有效登入後的權限、回應格式或資料取得均正常，也不能代替使用者實際網站來源的測試。

## 程式已確認的限制與問題

- 固定 serverId 為 `76402e5b20be2c39f095a152090afddc`，沒有伺服器選擇。此 ID 對應國服，不能據此宣稱支援台港澳等國際服。
- AJAX 錯誤、API 非成功 code、缺少 accessToken、資料結構不符，全部只顯示 IMPORT_FAILED，沒有保留失敗階段、HTTP 狀態及官方業務 code。
- `completeHeaders` 回傳共享 headers 物件，每次建立不同 DID；曾設定 token 後，即使 needToken=false 仍可能帶著舊 token。使用假資料已重現此行為，但尚無有效授權請求證明它是本次失敗根因。
- parse 接受物件或 JSON 字串，沒有處理其他編碼格式。不能在沒有真實回應證據時判定官方已改為其他格式。
- 現有 import 測試是合成 transport fixture，並非官方線上成功登入驗證。

## 後續定位所需資訊

需確認失敗在綁定 Token、取得列表或匯入選定角色，以及角色所屬伺服器。再取得該請求的狀態與業務 code 即可縮小範圍；不需要在聊天中公開 Token、accessToken 或完整帳號回應。

參考：[社群維護者的 API 實測記錄（serverId）](https://github.com/TomyJan/Kuro-API-Collection/blob/master/API/gamer/widget/game3/getData.md)。這不是官方保證的公開開發者 API 規格。

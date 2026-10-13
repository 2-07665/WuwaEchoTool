# 測試產物管理

在專案根目錄執行：

```powershell
# 預覽清理範圍，不刪除檔案
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-test-artifacts.ps1 -WhatIf
# 清理，執行所有 Node 測試，結束後再次清理；保留測試退出碼
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-test-artifacts.ps1 -RunTests
# 瀏覽器驗收或 ZIP 備份完成前，清理本次輸出
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-test-artifacts.ps1
```

既有瀏覽器測試使用固定檔名覆蓋截圖，仍可能留下舊版本名稱。清理腳本只處理已盤點的 `artifacts` 子目錄中的截圖、文字紀錄及指定結果報告，保留測試程式、HTML seed、JS/CSS 基準快照、OCR 素材與無法確認用途的檔案。不清理 Git、正式資源或專案外的暫存檔。

新增輸入素材時，請同步更新腳本的保留清單及 `.gitignore` 例外；新增產物目錄先檢查用途，再加入清理清單。需交付的截圖先另存至專案外，完成驗收後清理。報告產生器依賴測試輸出，請在清理前執行。

`.gitignore` 只防止新產物加入 Git，不影響已追蹤檔案或一般 ZIP。備份前執行清理命令；Git 既有歷史保持不變。

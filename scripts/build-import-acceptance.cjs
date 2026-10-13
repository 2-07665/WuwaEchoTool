/* Build a local screenshot index from completed, isolated acceptance output. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'artifacts','official-import'),result=JSON.parse(fs.readFileSync(path.join(dir,'browser-results.json'),'utf8'));
if(!result.isolated||result.officialAccountVerified!==false||result.pageErrors.length||result.reports.some(r=>!r.passed))throw Error('Acceptance output is incomplete or failed');
const unit=fs.readFileSync(path.join(dir,'unit-results.txt'),'utf8'),tests=Number(/ℹ tests (\d+)/.exec(unit)?.[1]),passed=Number(/ℹ pass (\d+)/.exec(unit)?.[1]),failed=Number(/ℹ fail (\d+)/.exec(unit)?.[1]);
if(!tests||passed!==tests||failed!==0)throw Error('Unit regression output is incomplete or failed');
const absolute=file=>path.join(dir,file).replaceAll('\\','/');
const files=result.screenshots.slice().sort();for(const file of files)if(!fs.existsSync(path.join(dir,file)))throw Error('Missing screenshot: '+file);
const key=[['桌面連線','1440-zh-TW-connect.png'],['桌面選取','1440-zh-TW-select.png'],['桌面部分成功與預覽','1440-zh-TW-partial-preview.png'],['桌面結果','1440-zh-TW-result.png'],['手機英文預覽','360-en-partial-preview.png'],['手機結果','390-zh-TW-result.png'],['更新衝突','state-update-conflict-desktop.png'],['手機憑證失效','state-invalid-mobile.png'],['官方驗證','state-verification-mobile.png'],['缺漏與不可用評分','state-incomplete-mobile.png'],['手機鍵盤佔用視窗','state-keyboard-visible-viewport.png'],['不同 UID 的更新入口','state-account-mismatch-mobile.png']];
const lines=['# 庫街區導入工作台：實際瀏覽器截圖','',`2026-10-13 · ${result.reports.length} 組驗收情境 · ${files.length} 張截圖 · 0 頁面錯誤。`,'','所有畫面來自隔離 browser contexts 與合成 transport fixtures；不是真實官方帳號驗收，亦不包含個人帳號或可用憑證。','', '## 主要狀態','',...key.map(([label,file])=>`- [${label}](${absolute(file)})`),'','## 全部截圖','',...files.map(file=>`- [${file}](${absolute(file)})`),''];
fs.writeFileSync(path.join(dir,'screenshots.md'),lines.join('\n'));fs.writeFileSync(path.join(dir,'acceptance-summary.json'),JSON.stringify({date:'2026-10-13',unitTests:tests,unitFailures:failed,browserScenarios:result.reports.length,screenshots:files.length,pageErrors:result.pageErrors.length,officialAccountVerified:false},null,2));
console.log(`Indexed ${files.length} screenshots from ${result.reports.length} passed browser scenarios.`);

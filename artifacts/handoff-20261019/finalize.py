from pathlib import Path
import json, shutil, hashlib, zipfile, datetime, subprocess, re
ROOT=Path(__file__).resolve().parents[2];WORK=ROOT/'artifacts/handoff-20261019';S=WORK/'stage/WuwaEchoTool';H=S/'handoff';E=WORK/'evidence'
def sha(b):return hashlib.sha256(b).hexdigest()
def write(n,s):
    p=H/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s.strip()+'\n',encoding='utf-8',newline='\n')
def copy(a,b):
    b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)
def load(p):return json.loads(p.read_text('utf-8-sig'))

for n in ['workspace','polish','detail','staged-detail']:
    results=load(E/n/'results.json');assert results['pageErrors']==[]
    copy(E/n/'results.json',H/'evidence'/n/'results.json')
for p in E.glob('*.txt'):copy(p,H/'evidence'/p.name)
for n in ['staged-unit.txt','staged-static.txt','staged-unit-rerun.txt','staged-static-rerun.txt']:
    copy(WORK/n,H/'evidence'/n)
assert 'tests 72' in (WORK/'staged-unit-rerun.txt').read_text('utf-8-sig')
assert 'fail 0' in (WORK/'staged-unit-rerun.txt').read_text('utf-8-sig')
selected=[('workspace','1440-zh-TW-manual-workspace.png'),('workspace','320-zh-TW-manual-workspace.png'),('workspace','1440-en-long.png'),('workspace','320-en-long.png')]
selected += [('polish',f'{locale}-{mode}.png') for locale in ['zh-TW','zh-CN','en'] for mode in ['compact','detailed']]
for directory,name in selected:copy(E/directory/name,H/'evidence/screenshots'/directory/name)

write('05_TEST_REPORT.md','''# 实际测试报告 — 2026-10-19

环境：Windows、Node.js 24.13.0、npm 11.6.2、Playwright 1.62.1、无头 Microsoft Edge。测试使用隔离 context／合成存档及本地图片映射，未读取个人浏览器资料。日期使用 UTC+08:00。

| 检查／指令 | 结果 | 数量与范围 | 证据 |
|---|---|---|---|
| 原工作目录 npm test | 通过 | 72 tests，0失败、0跳过 | evidence/unit.txt |
| 原工作目录 npm run check:static | 通过 | 244个本地入口依赖、105个脚本语法 | evidence/static.txt |
| git diff --check | 通过 | exit 0；工作目录产品无 diff | evidence/diff-check.txt（无输出） |
| node tests/ui-polish-save-browser.cjs | 重跑通过 | 24组保存／布局；1440、1024、390、320 × 三语 × 手动／官方来源；6张三语双模板实际PNG | evidence/polish-rerun.txt、polish/results.json |
| node tests/role-workspace-browser.cjs | 重跑通过 | 42组工作台；320、375、390、768、1024、1280、1440 × 三语 × 两来源，另84个长名／缺项／空／未知模型画面 | evidence/workspace-rerun.txt、workspace/results.json |
| node tests/detail-image-delete-browser.cjs | 通过 | 12组；1440、1024、390、320 × 三语，图片比例／居中留白、删除取消与确认／资料事务、手机返回 | evidence/detail.txt、detail/results.json |
| 脱敏封装副本 npm test | 修正收录后通过 | 72 tests、0失败、0跳过；第一次71通过1失败，原因是遗漏测试用classic-before.js，现已纳入并完整重跑 | evidence/staged-unit.txt、staged-unit-rerun.txt |
| 脱敏封装副本 npm run check:static | 通过 | 244引用、105脚本 | evidence/staged-static-rerun.txt |
| 封装副本 node handoff/run-browser.cjs tests/detail-image-delete-browser.cjs | 通过 | 12组三语；NODE_PATH使用本机同版本Playwright，WUWA_BROWSER_CHANNEL=msedge；验证可移植运行器和保留的基准 | evidence/staged-detail.txt、staged-detail/results.json |
| node handoff/serve.cjs 启动／HTTP请求 | 重跑通过 | 本机预览index.html HTTP 200，12329 bytes | evidence/serve-smoke.txt |
| 本地资源检查 | 通过 | HTML/CSS字面引用及JS静态图片路径无缺失，完整image/library保留 | evidence/asset-check.json |
| 凭证检查 | 脱敏后通过 | 高可信JWT／私钥／常见密钥扫描，含DOCX/XLSX XML；一处无引用JWT仅副本置空 | evidence/security-check.json、SANITIZATION.md |

首次原目录浏览器尝试未进入测试阶段，Edge在沙箱内启动失败（EACCES/80070005），日志见 evidence/polish.txt、workspace.txt；获得执行环境授权后以隔离无头Edge重跑通过。首次预览HTTP连接也遭沙箱EACCES，放行本机连接后的实际结果为200。均不归类为产品断言失败。

## 桌面、手机与三语
工作台覆盖七宽度，保存／详情覆盖四宽度；包含zh-TW、zh-CN、en及手动／模拟官方角色。自动断言包含卡片分组、选择与资料一致性、滚动／键盘、管理区、保存反馈／损坏保护和无页面横向溢出。firstScreen只在桌面需要断言的场景为true，手机记录false表示未要求所有内容同一首屏，并非失败。

人工查看本轮1440繁中桌面工作台与320繁中手机截图。其他画面由自动布局断言验证，不冒称逐张人工验图。精选当前截图与6张分享PNG在 evidence/screenshots/；全量可重建截图未纳入，完整结果JSON保留。

## 分享图片
本轮实际通过6张PNG：三语 × 简略／详细；results记录downloadMatches=true、technicalTextOutsideCanvas=true及雷达实际读数。保存、重绘、关闭／故障保护与相关单元通过。不是全场景视觉回归：ui-share-redesign-browser.cjs的60张边界矩阵、ui-ux-browser.cjs的30张矩阵及完整Classic像素对照本轮未重跑。历史docs/artifacts数字仅作历史证据，不计入本轮通过数量。

## 尚未执行
本轮没有逐个运行全部独立*browser.cjs脚本。真实官方账号／在线API、线上CDN/CORS、完整OCR识别准确率、实体手机、Safari、真实软键盘与辅助技术未验证。没有打包器／TypeScript／build或独立lint命令，不能写成构建或lint通过。

ZIP随后采用CRC、唯一安全路径、逐项字节数与SHA-256及解压重验；最终结果另存外部delivery-verification.json并在最终回报列明。FILES.json列全包文件及大小，SHA256SUMS覆盖除自身之外的每个文件，避免自校验循环；ZIP整体摘要由交付验证记录提供。
''')

# Confirm that no original source changed during the handoff task.
snapshot=load(H/'SOURCE_SNAPSHOT.json')
for f in snapshot['files']:
    assert sha((ROOT/f['path']).read_bytes())==f['originalSha256'],'Working source changed: '+f['path']
    assert sha((S/f['path']).read_bytes())==f['sha256'],'Packaged source changed: '+f['path']

now=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8)))
name='WuwaEchoTool_ChatGPT_Full_'+now.strftime('%Y%m%d_%H%M')+'.zip'
delivery=WORK/'delivery';delivery.mkdir(exist_ok=True);archive=delivery/name
def manifest(size,count):
    write('06_FILE_MANIFEST.md',f'''# 封装内容清单

正式档名：{name}
封装时间：{now.isoformat()}
ZIP精确大小：{size:012d} bytes
总档案数量：{count:08d}（不计目录条目；ZIP仅有WuwaEchoTool/一个顶层目录）
原工作目录复制档案：{len(snapshot['files'])}，含完整产品源代码、资料、资源、测试、既有文档、必要基准及历史验收报告。本轮额外加入handoff文档、运行辅助与测试证据。

| 目录／文件 | 内容 |
|---|---|
| 根目录10个HTML、package.json、.gitignore、_headers | 正式入口、测试指令与托管规则 |
| js/（50个文件） | 数据／评分、Register、Classic、导入、分享、三语 |
| css/（7个文件） | 共用与响应式、工作台、导入、角色列表 |
| image/（326个文件） | 所有原图片／图标，含旧版PNG与当前WebP；未为缩小体积删减 |
| library/（34个文件） | jQuery、CryptoJS、Bootstrap及本地OCR／WASM／三语模型、许可证与校验 |
| tests/（51个文件） | 全部单元、浏览器、fixture及共用工具 |
| scripts/（5个文件） | 模型维护／验收报告工具 |
| docs/、calculations/、根DOCX | 既有开发／验收文档、布局参考、计算表与项目说明 |
| artifacts/*/baseline/及register-overview/classic-before.js | 测试／最近改动依赖的历史源文件；不可当缓存删除 |
| artifacts/其余保留报告／源码 | 有用历史验收JSON/TXT/MD及源文件，历史状态不代替本轮结果 |
| handoff/00至06 | 第一阅读文件、进度、地图、后续、最新改动、测试与本清单 |
| handoff/evidence/ | 本轮日志、结构化结果、精选截图和分享PNG |
| handoff/FILES.json、SHA256SUMS、SOURCE_SNAPSHOT.json | 全包文件大小清单、逐档摘要与原工作目录快照对照 |
| handoff/serve.cjs、run-browser.cjs、verify.cjs、browser-tools/ | 零依赖预览、测试移植、独立可锁定浏览器依赖与校验 |

## 排除及体积
不含.git历史、编辑器目录、node_modules、快取／测试输出缓存、旧ZIP与旧交接副本、历史大量可重建截图／清理清单，以及真实.env／私钥／浏览器档案。没有删除源目录内容。完整排除原因见EXCLUSIONS.json。

原image约70.8 MiB、library约16.8 MiB，是体积主因。旧图片仍可能用于参考／回退，本次全部保留；OCR资源本身必要且不可简单删除。未发现需要保留的独立dist/build目录；此项目原生静态发布。根package.json无依赖且无根lockfile，未伪造根lockfile；浏览器辅助工具有原样保留的package-lock.json。

## 重建依赖及校验规则
产品运行不需要node_modules；需要现代浏览器、HTTP同源服务器及指定在线资源。单元／静态检查仅需Node。浏览器测试另执行npm ci --prefix handoff/browser-tools及安装Playwright Chromium，或使用现有Edge。详见00_READ_FIRST.md。

FILES.json列出所有档案与字节数，包括它自身及SHA256SUMS。SHA256SUMS覆盖全包所有其他档案（含FILES.json），自身不做循环摘要。解压后先执行node handoff/verify.cjs；运行浏览器测试后新增的截图不属于原交接清单，应输出到包外目录。ZIP整体SHA-256及最终重新解压验证记录存于交付工作目录delivery-verification.json，并在交付时核对。

只有js/base.js一处无引用遗留JWT在副本置空，原始与副本摘要分别记录。未遗漏必要源码／本地资源；外部服务依赖不是本地缺档。所有路径以UTF-8记录。
''')

# Store size-dependent metadata without compression, so adding the final ZIP byte count
# cannot change compressed lengths or create a circular size calculation.
write('FILES.json','{}');write('SHA256SUMS','placeholder');manifest(0,0)
files=sorted(p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file());count=len(files)
manifest(0,count)
def indexes():
    write('SHA256SUMS','\n'.join('0'*64+'  '+n for n in files if n!='handoff/SHA256SUMS'))
    for _ in range(8):
        old=(H/'FILES.json').stat().st_size
        write('FILES.json',json.dumps({'files':[{'path':n,'bytes':(S/n).stat().st_size} for n in files],'checksumFile':'handoff/SHA256SUMS','checksumSelfExcluded':True},ensure_ascii=False,indent=2))
        if (H/'FILES.json').stat().st_size==old:break
    else:raise RuntimeError('File list did not converge')
    write('SHA256SUMS','\n'.join(sha((S/n).read_bytes())+'  '+n for n in files if n!='handoff/SHA256SUMS'))
def makezip():
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
        for n in files:
            method=zipfile.ZIP_STORED if n in {'handoff/06_FILE_MANIFEST.md','handoff/FILES.json','handoff/SHA256SUMS'} else zipfile.ZIP_DEFLATED
            z.write(S/n,'WuwaEchoTool/'+n,compress_type=method)
indexes();makezip();size=archive.stat().st_size
manifest(size,count);indexes();makezip();assert archive.stat().st_size==size

with zipfile.ZipFile(archive) as z:
    names=z.namelist();assert len(names)==len(set(names))==count
    assert all(n.startswith('WuwaEchoTool/') and '..' not in Path(n).parts and '\\' not in n for n in names)
    assert z.testzip() is None
    for n in files:assert z.read('WuwaEchoTool/'+n)==(S/n).read_bytes(),n
    extracted=WORK/'verified-extraction';extracted.mkdir(exist_ok=True);z.extractall(extracted)
verify=subprocess.run(['node','handoff/verify.cjs'],cwd=extracted/'WuwaEchoTool',capture_output=True,text=True,encoding='utf-8')
(WORK/'zip-verify.txt').write_text(verify.stdout+verify.stderr,encoding='utf-8');assert verify.returncode==0,verify.stderr

result={'zip':str(archive),'formalDestination':str(ROOT.parent/name),'zipBytes':size,'zipMiB':round(size/1048576,2),'fileCount':count,'sha256':sha(archive.read_bytes()),'crc':'PASS','duplicatePaths':0,'archiveVsStagingEveryByte':'PASS','extractedNodeVerification':verify.stdout.strip(),'missingLocalResources':0,'sanitizedFiles':snapshot['sanitizations'],'originalWorkingFilesUnchanged':True}
(WORK/'delivery-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))

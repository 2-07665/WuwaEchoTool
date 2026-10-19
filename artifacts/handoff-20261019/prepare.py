from pathlib import Path
import json, re, shutil, hashlib, subprocess, datetime, zipfile

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'artifacts/handoff-20261019'
STAGE=WORK/'stage/WuwaEchoTool'
STAGE.mkdir(parents=True,exist_ok=True)
def sha(b): return hashlib.sha256(b).hexdigest()
def write(p,s):
    f=STAGE/p; f.parent.mkdir(parents=True,exist_ok=True)
    f.write_text(s,encoding='utf-8',newline='\n')
def js(p,o): write(p,json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def git(*a): return subprocess.check_output(['git','-c','core.quotepath=false',*a],cwd=ROOT).decode('utf-8').strip()

excluded=[]; originals=[]; sanitizations=[]
skipdirs={'.git','.idea','.vscode','node_modules','.cache','.next','coverage','playwright-report','test-results'}
def walk(d):
    for p in sorted(d.iterdir()):
        rel=p.relative_to(ROOT).as_posix()
        if p.is_symlink():
            excluded.append({'path':rel,'reason':'symbolic link; not followed'});continue
        if p.is_dir():
            if p.name in skipdirs or rel.startswith('artifacts/handoff') or rel=='artifacts/chatgpt-handoff-build':
                excluded.append({'path':rel+'/','reason':'Git/editor/dependencies/cache or superseded handoff staging'});continue
            yield from walk(p)
        else: yield p

jwt=re.compile(r'eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}')
for p in walk(ROOT):
    rel=p.relative_to(ROOT).as_posix()
    if p.name.startswith('.env') or p.suffix.lower() in {'.zip','.log','.tmp','.pem','.key','.pfx','.p12'} or p.name in {'Thumbs.db','.DS_Store'}:
        excluded.append({'path':rel,'reason':'environment/credential/container or disposable file'});continue
    if rel.startswith('artifacts/') and not ('/baseline/' in rel or p.suffix.lower() in {'.json','.txt','.md','.js','.css','.html'}):
        excluded.append({'path':rel,'reason':'rebuildable historical screenshots or packaging/cleanup tool; baselines and acceptance reports retained'});continue
    if rel.startswith('artifacts/cleanup'):
        excluded.append({'path':rel,'reason':'historical generated-file cleanup inventory'});continue
    b=p.read_bytes(); original=sha(b)
    if p.suffix.lower() in {'.js','.cjs','.json','.txt','.md','.html','.css','.ps1'}:
        s=b.decode('utf-8-sig'); n=len(jwt.findall(s))
        if n:
            # Never include a real JWT. This known dead tokenList is not referenced by the application.
            if rel!='js/base.js': raise RuntimeError('Review credential candidate in '+rel)
            assert 'const tokenList = [' in s and s.count('tokenList')==1
            s=jwt.sub('',s);b=s.encode('utf-8');sanitizations.append({'path':rel,'reason':'unused legacy tokenList JWT removed in archive copy only','count':n})
    dest=STAGE/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
    originals.append({'path':rel,'bytes':len(b),'sha256':sha(b),'originalSha256':original,'identical':original==sha(b)})

js('handoff/SOURCE_SNAPSHOT.json',{'head':git('rev-parse','HEAD'),'capturedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),'files':originals,'sanitizations':sanitizations})
js('handoff/EXCLUSIONS.json',excluded)
write('handoff/evidence/git-status.txt',git('status','--short')+'\n')
write('handoff/evidence/git-diff-stat.txt',git('diff','--stat','HEAD')+'\n')
write('handoff/evidence/latest-product-files.txt',git('diff-tree','--no-commit-id','--name-only','-r','0d1521c','--','js','css','tests','docs','*.html','package.json')+'\n')
write('handoff/evidence/recent-commits.txt',git('log','-5','--format=%h %ad %s','--date=iso')+'\n')

refs=[];missing=[];external=[]
def check_ref(file,v):
    v=v.strip()
    if not v or v.startswith(('#','data:','blob:','javascript:','mailto:')):return
    if re.match(r'^(?:https?:)?//',v): external.append({'file':file.relative_to(STAGE).as_posix(),'url':v});return
    v=v.split('#')[0].split('?')[0]
    if not v:return
    target=(STAGE/v.lstrip('/')) if v.startswith('/') else file.parent/v
    item={'file':file.relative_to(STAGE).as_posix(),'reference':v};refs.append(item)
    if not target.exists(): missing.append(item)
for f in list(STAGE.glob('*.html'))+list((STAGE/'css').glob('*.css')):
    s=f.read_text('utf-8-sig')
    for v in re.findall(r'\b(?:src|href)=[\"\']([^\"\']+)',s):check_ref(f,v)
    for v in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',s):check_ref(f,v)
for f in (STAGE/'js').glob('*.js'):
    for v in re.findall(r'[\"\'](image/[^\"\'<>]+?\.(?:png|webp|jpg|ico))[\"\']',f.read_text('utf-8-sig')):
        # Application image paths are document-root relative.
        if any(c in v for c in ('`','+','${',',')):continue
        if not (STAGE/v).exists():missing.append({'file':f.relative_to(STAGE).as_posix(),'reference':v})
js('handoff/evidence/asset-check.json',{'localReferenceCount':len(refs),'missing':missing,'external':external,'allImageAndLibraryFilesRetained':True,'note':'Literal HTML/CSS and JS image paths checked; dynamic paths supplemented by browser tests.'})
if missing:raise RuntimeError('Missing local references: '+repr(missing))

findings=[];textcount=0;binaryxml=0
patterns=[re.compile(r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----'),jwt,re.compile(r'\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9_-]{32,})\b')]
for f in STAGE.rglob('*'):
    if not f.is_file():continue
    chunks=[]
    if f.suffix.lower() in {'.js','.cjs','.html','.css','.json','.md','.txt','.xml','.yml','.yaml','.ps1','.map'}:
        chunks=[f.read_text('utf-8-sig',errors='replace')];textcount+=1
    elif f.suffix.lower() in {'.docx','.xlsx'}:
        with zipfile.ZipFile(f) as z:
            chunks=[z.read(n).decode('utf-8',errors='replace') for n in z.namelist() if n.endswith('.xml')];binaryxml+=len(chunks)
    if any(p.search(s) for p in patterns for s in chunks):findings.append(f.relative_to(STAGE).as_posix())
js('handoff/evidence/security-check.json',{'textFiles':textcount,'officeXmlParts':binaryxml,'highConfidenceFindings':findings,'sanitizations':sanitizations,'privateBrowserStorageCopied':False,'limitations':'Filename and high-confidence pattern checks; no claim of detection of every possible secret format.'})
if findings:raise RuntimeError('Security review required: '+repr(findings))
print(json.dumps({'sourceFiles':len(originals),'sourceBytes':sum(x['bytes'] for x in originals),'sanitizations':sanitizations,'missing':missing,'textFilesScanned':textcount},ensure_ascii=False))

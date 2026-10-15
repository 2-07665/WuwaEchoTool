/* 在已有工作目录上精修展示；原评分、数据与保存实现保持不变。 */
const fs=require('node:fs');
function edit(file,fn){const source=fs.readFileSync(file,'utf8'),next=fn(source);if(next===source)throw Error('没有匹配修改：'+file);fs.writeFileSync(file,next);}
edit('js/role-register-renderer.js',s=>{
 const settings='<section class="rr-score-settings" aria-label="${t(\'workspace.scoringSettings\')}"><h2>${t(\'workspace.scoringSettings\')}</h2><div class="rr-model-controls">${chainControl}${modeControl}</div><p role="status" class="rr-model-note${interaction.modelChanged?\' rr-changed\':\'\'}">${t(interaction.modelPersistence?\'interaction.\'+interaction.modelPersistence:interaction.modelChanged?\'interaction.modelChanged\':\'interaction.modelPreview\')}</p></section>';
 s=s.replace('</div></div><div class="rr-role-actions">','</div></div>'+settings+'<div class="rr-role-actions">');
 s=s.replace(/<section class="rr-overview-entry">.*?<\/section>/,'');
 const identity='<p class="rr-summary-identity">${roleName}<span aria-hidden="true"> · </span><span data-summary-config>${t(\'role.currentLoadout\')}</span></p>';
 s=s.replace(identity+'<div class="rr-overall">','<div class="rr-overall">'+identity);
 const evidence='<button type="button" data-rr-evidence aria-expanded="${!!interaction.evidenceOpen}" aria-controls="rr-evidence">${t(\'interaction.evidence\')}</button>';
 s=s.replace(evidence,'');
 s=s.replace('${chainControl}${modeControl}${numericControls}','${numericControls}'+evidence);
 // 主要状态留在角色设置内，底部只保留模型解释与既有额外条件。
 const note='<p role="status" class="rr-model-note${interaction.modelChanged?\' rr-changed\':\'\'}">${t(interaction.modelPersistence?\'interaction.\'+interaction.modelPersistence:interaction.modelChanged?\'interaction.modelChanged\':\'interaction.modelPreview\')}</p>';
 const last=s.lastIndexOf(note);if(last<0)throw Error('没有找到底部模型状态');s=s.slice(0,last)+s.slice(last+note.length);
 return s;
});
edit('css/role-register.css',s=>s
 .replace('grid-template-columns:190px minmax(0,1fr);gap:10px 22px','grid-template-columns:minmax(220px,.95fr) minmax(0,1.05fr);gap:14px 24px')
 .replace('.rr-summary-identity{grid-column:1/-1;','.rr-summary-identity{margin-bottom:10px;')
 .replace('.rr-danger-actions button{color:#d4aaa4;background:transparent;border-color:transparent;padding:8px 0;justify-content:flex-start;font-size:13px}', '.rr-danger-actions button{width:100%;color:#e4bbb6;background:#35282b;border-color:#775151;padding:10px 14px;justify-content:center;font-size:14px;border-radius:8px}')
 .replace('.rr-danger-actions button:hover{color:#f0c0b6;border-color:transparent;background:transparent;text-decoration:underline}', '.rr-danger-actions button:hover{color:#f5d4cc;border-color:#ac7771;background:#493034}')
 .replace('.rr-problem h2{','.rr-problem{border-left:1px solid var(--rr-line);padding-left:24px;min-width:0}\n#role-register .rr-problem h2{')
 .replace('.rr-problem>p:not(.rr-eyebrow){font-size:12px;','.rr-problem>p:not(.rr-eyebrow){font-size:13px;')
 .replace('.rr-problem button{font-size:12px;','.rr-problem button{font-size:13px;')
 .replace('/* 总览是一个连贯面板', '#role-register .rr-score-settings{padding:14px 16px;border-top:1px solid var(--rr-line)}\n#role-register .rr-score-settings h2{font-size:15px;margin-bottom:10px}\n#role-register .rr-score-settings .rr-model-controls{display:grid;grid-template-columns:1fr;gap:10px;margin:0}\n#role-register .rr-score-settings label{display:grid;gap:4px;margin:0;font-size:13px;min-width:0}\n#role-register .rr-score-settings select{width:100%}\n#role-register .rr-score-settings .rr-model-note{font-size:12px;margin:8px 0 0;color:var(--rr-muted);line-height:1.5}\n/* 总览是一个连贯面板')
 .replace('order:1;width:100%;grid-template-columns:1fr','order:2;width:100%;grid-template-columns:1fr')
 .replace('.rr-summary-identity{display:none}', '.rr-summary-identity{display:none}')
 .replace('.rr-problem{border-top:1px solid var(--rr-line);padding-top:8px}', '.rr-problem{border-left:0;padding-left:0;border-top:1px solid var(--rr-line);padding-top:8px}')
 .replace('.rr-role-actions{order:2;', '.rr-role-actions{order:3;')
 .replace('.rr-loadout-heading{order:3;', '.rr-loadout-heading{order:4;')
 .replace('.rr-loadout{order:4;', '.rr-loadout{order:5;')
 .replace('.rr-inline-analysis{order:5;', '.rr-inline-analysis{order:6;')
 .replace('.rr-rail{order:6;', '.rr-rail{order:7;')
 .replace('#role-register .rr-overview-entry{order:7;width:100%}', '#role-register .rr-score-settings{order:1;width:100%;padding:12px 14px;border:1px solid var(--rr-line);border-radius:12px;background:var(--rr-bg)}\n#role-register .rr-score-settings .rr-model-controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n#role-register .rr-score-settings .rr-model-note{margin-top:6px}')
 );
edit('js/i18n-dictionaries.js',s=>s.replace('const rows={',`const rows={
"workspace.scoringSettings":["角色評分設定","角色评分设置","Character scoring settings"],
"share.radarTitle":["單件評分分布","单件评分分布","Echo score distribution"],
"share.radarScale":["統一座標 0–{max} 分","统一坐标 0–{max} 分","Shared scale: 0–{max} pts"],
"share.radarScope":["原始貢獻分；不同 Cost 不代表相同品質比例。","原始贡献分；不同 Cost 不代表相同质量比例。","Raw contributions; different Costs do not imply equal quality ratios."],
"share.radarPartial":["缺值或負分只標示讀數，不填入比例。","缺值或负分只标示读数，不填入比例。","Missing or negative scores: labels only, without a filled profile."],
"share.loadoutCorrection":["整套評分沿用既有校正，不等於五件相加。","整套评分沿用既有校正，不等于五件相加。","Total uses existing loadout correction; it is not the sum of the five scores."],
`));
// 在共用基础样式定义一次设计变量，由各 Register 面板复用。
edit('css/register-foundation.css',s=>s
 .replace('--register-surface:#1b2420;', '--register-surface:#1a2627;--register-panel-radius:14px;--register-card-radius:10px;--register-control-radius:8px;--register-danger-bg:#35282b;--register-danger-line:#775151;--register-danger-ink:#e4bbb6;')
 .replaceAll('border-radius:0;', 'border-radius:var(--register-control-radius);')
 + `\n/* 仅匹配 Register 的真实内容面板，保留原页面布局与 Classic。 */
.register-shell-page #register-workspace :is(.rw-inspector,.rw-backup-row,.rw-history-group,.rw-tool-content,.rt-panel,.rw-plan-card){background:var(--register-surface);border:1px solid var(--register-line);border-radius:var(--register-panel-radius);padding:20px;box-sizing:border-box;min-width:0}
.register-shell-page #register-workspace .rw-library-index{display:grid;gap:10px}
.register-shell-page #register-workspace .rw-echo-row{border:1px solid var(--register-line);border-radius:var(--register-card-radius);background:var(--register-surface);margin:0;box-sizing:border-box}
.register-shell-page #register-workspace .rw-echo-row[aria-pressed=true]{border-color:var(--register-accent);background:#203735;padding-left:12px}
.register-shell-page #register-workspace :is(.rw-echo-row,button):not(:disabled):hover{border-color:#739b93;background:#253b39}
.register-shell-page #register-workspace .rw-primary:not(:disabled):hover{background:#b5e5d7;color:#112723}
.register-shell-page #register-workspace :is(.rw-file-button,.rw-actions a){border-radius:var(--register-control-radius)}
.register-shell-page #register-workspace :is(.rw-danger button,[data-delete-draft]){background:var(--register-danger-bg);border-color:var(--register-danger-line);color:var(--register-danger-ink)}
.register-shell-page #character-dock :is(.dock-character,.dock-recent,.rr-overview-bands>div){border-radius:var(--register-panel-radius)}
.register-shell-page .rr-dialog{border-radius:var(--register-panel-radius)}
.register-shell-page .rr-dialog button{border:1px solid var(--register-line);border-radius:var(--register-control-radius);background:var(--register-surface);color:var(--register-ink);padding:10px 16px}
.register-shell-page .rr-dialog button:hover:not(:disabled){border-color:var(--register-accent);background:#253b39}
.register-shell-page .rr-share-choices button:first-child,.register-shell-page .rr-share-dialog .rr-dialog-actions button:nth-child(2){background:var(--register-accent);color:var(--register-bg)}
@media(max-width:700px){.register-shell-page #register-workspace :is(.rw-backup-row,.rw-history-group,.rw-tool-content,.rt-panel,.rw-plan-card){padding:16px}.register-shell-page #register-workspace .rw-inspector{padding:18px 14px}}
`);

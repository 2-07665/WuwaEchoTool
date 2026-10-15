/* 两个角色入口共用状态控制器；模型变更通过共享事务保存。 */
document.addEventListener('DOMContentLoaded',function(){
    'use strict';
    if(!window.RoleRegisterMode)return;
    const i18n=EchoI18n.createBrowser(window);
    const normalize=RoleViewModel.createAdapter({roleList,costList,suiteAttributeMap,newCharacterModels,getRoleScoreConfig,getScoreDetails,countScores,countMainAttr,countMainAttr2,getRoleEnergyCorrection});
    const host=document.createElement('div');host.id='role-register';document.body.append(host);
    const url=new URL(location.href),params=url.searchParams,id=params.get('roleid');
    const legacy=new URL(url);legacy.searchParams.set('view','classic');legacy.searchParams.delete('selectedPosition');legacy.searchParams.delete('selectedEcho');
    legacy.searchParams.delete('draft');
    let controller=null,error=null,lastRecord=null,candidateSurface=null;
    let modelPersistence='modelAutoSave';
    let modelGuard=null,modelRevision=null;
    const navigation=RegisterNavigation.create(sessionStorage),analysisKey='analysis:'+id;
    const operationNotice=navigation.takeNotice('role:'+id);
    function rememberAnalysis(){const selection=controller?.snapshot().selection;if(!controller)return;navigation.save(analysisKey,{position:selection?.position||null,echo:selection?.kind==='echo'?controller.snapshot().model.slots[selection.position-1].echo?.id:null,scroll:scrollY});}
    let configInput=null,metadataExpected=null,planTicket=0,configGuard=null;
    const escapeOps=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function decorate(){
        if(typeof RegisterMetadata==='undefined'||!controller)return;
        const loaded=RegisterMetadata.create(localStorage).load(),record=read(),caption=host.querySelector('.rr-identity-caption');if(!loaded.ok||!record||!caption)return;
        if(configInput===null)metadataExpected=loaded.raw;
        if(!configGuard){configGuard=RegisterUnsaved.create({scope:'config-name:'+id,get:()=>configInput,apply:value=>configInput=typeof value==='string'?value:null,revision:()=>metadataExpected,i18n});configGuard.recover();}
        const label=RegisterMetadata.roleName({role:JSON.parse(localStorage.getItem('mcData')).role},record,i18n,loaded.data);
        host.querySelector('.rr-identity h1')?.insertAdjacentHTML('afterend','<p class="op-current-config">'+escapeOps(label)+'</p>');
        host.querySelector('[data-summary-config]')?.replaceChildren(document.createTextNode(label));
        caption.insertAdjacentHTML('beforeend','<form class="op-rename" data-op-rename-role><label>'+escapeOps(i18n.t('ops.name'))+'<input maxlength="80" data-op-config-name value="'+escapeOps(configInput??label)+'"></label><button>'+escapeOps(i18n.t('ops.rename'))+'</button><small>'+escapeOps(i18n.t('ops.nameHelp'))+'</small><p role="status" data-op-name-status></p></form><section class="op-plan-management"><h2>'+escapeOps(i18n.t('ops.plans'))+'</h2><div data-op-plans></div></section>');
        const back=host.querySelector('.rr-breadcrumb a');if(back)back.href=RegisterNavigation.back(new URL(location.href).searchParams,i18n.locale);
        const ticket=++planTicket;
        crypto.subtle.digest('SHA-256',new TextEncoder().encode(RoleDraftModel.canonical(record))).then(bytes=>{
            if(ticket!==planTicket||RoleDraftModel.canonical(read())!==RoleDraftModel.canonical(record))return;
            const revision=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join(''),current=RoleDraftModel.createBaseline(controller.snapshot().model,{id:'plans-current',createdAt:Date.now(),sourceRevision:revision,modelVersion:'legacy-scoring-2026-10-08'}),drafts=RoleDraftStorage.create(localStorage).load();if(!drafts.ok)return;
            const rows=drafts.data.drafts.filter(d=>drafts.data.baselines.find(b=>b.id===d.baseline.id)?.role.identity===String(record.roleId));
            const inventory=JSON.parse(localStorage.getItem('mcData')).unusedEchoes||[],adapter=RoleCandidates.createAdapter(normalize),activeDraft=new URL(location.href).searchParams.get('draft');
            const html=rows.map(d=>{const baseline=drafts.data.baselines.find(b=>b.id===d.baseline.id),valid=RoleDraftModel.assess(baseline,d,current,Date.now()).status==='valid'&&adapter.assessSource(d,inventory,record).status==='valid',adopted=valid&&RoleLocalConfiguration.create(localStorage).find(baseline,d),u=new URL(location.href);u.searchParams.set('draft',d.id);return '<p><a'+(d.id===activeDraft?' aria-current="true"':'')+' href="'+escapeOps(u.pathname+u.search)+'">'+escapeOps(RegisterMetadata.draftName(d,i18n,loaded.data))+'</a><small> · '+escapeOps(i18n.t(valid?(adopted?'ops.adopted':'ops.saved'):'ops.recompare'))+'</small></p>';}).join('');
            host.querySelector('[data-op-plans]')?.replaceChildren();if(host.querySelector('[data-op-plans]'))host.querySelector('[data-op-plans]').innerHTML=html||'<p>'+escapeOps(i18n.t('ops.noPlans'))+'</p>';
        }).catch(()=>{});
    }
    host.addEventListener('input',event=>{if(event.target.matches('[data-op-config-name]'))configInput=event.target.value;});
    host.addEventListener('submit',event=>{if(!event.target.matches('[data-op-rename-role]'))return;event.preventDefault();const status=host.querySelector('[data-op-name-status]');if(!read()){status.textContent=i18n.t('workspace.SOURCE_CHANGED');return;}const result=RegisterMetadata.create(localStorage).rename('roles',id,configInput??event.target.querySelector('input').value,metadataExpected);if(result.ok){configInput=null;configGuard?.markSaved();metadataExpected=RegisterMetadata.create(localStorage).load().raw;const label=RegisterMetadata.roleName({role:JSON.parse(localStorage.getItem('mcData')).role},read(),i18n,RegisterMetadata.create(localStorage).load().data);host.querySelectorAll('.op-current-config,[data-summary-config]').forEach(node=>node.textContent=label);status.textContent=i18n.t('ops.renamed');}else {status.textContent=i18n.t('workspace.'+(result.code==='SOURCE_CHANGED'?'SOURCE_CHANGED':'SAVE_FAILED'));metadataExpected=RegisterMetadata.create(localStorage).load().raw;}});
    function saveModel(){
        if(!controller?.snapshot().modelChanged)return;
        if(modelPersistence==='modelSaveConflict')return;
        try{
            const core=CharacterCore.create({read:()=>JSON.parse(localStorage.getItem('mcData')),write:saveDataToCache,normalize});
            const data=core.load(),current=data.role.find(r=>String(r.roleId)===id);
            if(JSON.stringify(current)!==lastRecord)throw Error('SOURCE_CHANGED');
            let saved;
            core.transact(JSON.stringify(data),next=>{
                saved=next.role.find(r=>String(r.roleId)===id);
                Object.assign(saved,controller.modelChanges());core.score(saved);
            });
            controller.acceptSaved(saved);lastRecord=JSON.stringify(saved);modelRevision=lastRecord;modelGuard?.markSaved();modelPersistence='modelSaved';
        }catch(e){modelPersistence=e.message==='SOURCE_CHANGED'?'modelSaveConflict':'modelSaveFailed';}
        candidateSurface?.invalidate('incompatible');
    }
    const motion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    function read(){
        const data=JSON.parse(localStorage.getItem('mcData')||'null');
        const matches=Array.isArray(data?.role)?data.role.filter(r=>String(r.roleId)===id):[];
        return matches.length===1?matches[0]:null;
    }
    function focus(selector,scroll=false){
        const element=host.querySelector(selector);
        element?.focus({preventScroll:true});
        if(scroll)element?.scrollIntoView({block:'nearest',behavior:motion()});
    }
    function render(focusSelector){
        const observationOpen=host.querySelector('.rr-observation-details')?.open,expanded=host.querySelector('.rr-substats-details')?.open,active=document.activeElement,cursor=active?.selectionStart;let rememberedFocus=null;if(active?.dataset?.rcFilter)rememberedFocus='[data-rc-filter="'+active.dataset.rcFilter+'"]';if(active?.hasAttribute?.('data-rc-stat'))rememberedFocus='[data-rc-stat="'+active.dataset.rcStat+'"][data-rc-field="'+active.dataset.rcField+'"]';if(active?.hasAttribute?.('data-rc-plan-name'))rememberedFocus='[data-rc-plan-name]';if(active?.hasAttribute?.('data-op-config-name'))rememberedFocus='[data-op-config-name]';
        const state=controller?.snapshot(),model=state?.model;
        const catalogId=Number(model?.role.catalogId);
        const modes=newCharacterModels.settings[catalogId]?.modes.map(m=>m[0])||(catalogId===49?['tune','fusion']:catalogId===53?['fusion','harmony']:[]);
        const html=RoleRegisterRenderer.render(model,i18n,{error,interaction:{...state,modelPersistence},modelModes:modes,legacyUrl:legacy.pathname+legacy.search}).html;
        if(!host.querySelector('.rr-workspace')||!model||error)host.innerHTML=html;
        else {
            const template=document.createElement('template');template.innerHTML=html;
            const next=template.content;
            // 保留五槽节点和唯一分析宿主，连接线的 left 可在原节点上平滑更新。
            for(const slot of model.slots){
                const selector='.rr-slot[data-slot-position="'+slot.position+'"]';
                const current=host.querySelector(selector),fresh=next.querySelector(selector);
                current.className=fresh.className;current.innerHTML=fresh.innerHTML;current.setAttribute('aria-label',fresh.getAttribute('aria-label'));
            }
            host.querySelector('.rr-loadout').setAttribute('aria-label',next.querySelector('.rr-loadout').getAttribute('aria-label'));
            const panel=host.querySelector('.rr-inline-analysis'),freshPanel=next.querySelector('.rr-inline-analysis');
            panel.hidden=freshPanel.hidden;panel.setAttribute('aria-label',freshPanel.getAttribute('aria-label'));
            panel.querySelector('.rr-connector').setAttribute('style',freshPanel.querySelector('.rr-connector').getAttribute('style'));
            panel.querySelector('.rr-analysis-content').innerHTML=freshPanel.querySelector('.rr-analysis-content').innerHTML;
            for(const selector of ['.rr-context','.rr-identity','.rr-loadout-heading','.rr-row-labels','.rr-rail','.rr-evaluation','.rr-conditions','.rr-announcement','.rr-footer']){
                const current=host.querySelector(selector),fresh=next.querySelector(selector);
                current.innerHTML=fresh.innerHTML;
                if(fresh.hasAttribute('aria-label'))current.setAttribute('aria-label',fresh.getAttribute('aria-label'));
            }
        }
        document.title=i18n.t('register.pageTitle');
        candidateSurface?.render();
        decorate();if(observationOpen!==undefined&&host.querySelector('.rr-observation-details'))host.querySelector('.rr-observation-details').open=observationOpen;if(operationNotice&&!state?.notice){host.querySelector('.rr-announcement').textContent=i18n.t('workspace.'+operationNotice);}if(expanded!==undefined&&host.querySelector('.rr-substats-details'))host.querySelector('.rr-substats-details').open=expanded;
        if(focusSelector)focus(focusSelector);else if(rememberedFocus){const next=host.querySelector(rememberedFocus);next?.focus({preventScroll:true});if(next?.type==='text'&&cursor!=null)next.setSelectionRange(cursor,cursor);}
    }
    function refresh(force=false){
        try{
            const record=read();
            if(!record){controller=null;error='missing';candidateSurface?.invalidate();render();return;}
            const serialized=JSON.stringify(record);
            if(serialized===lastRecord&&controller&&!force)return;
            if(lastRecord!==null&&serialized!==lastRecord)candidateSurface?.invalidate();
            if(controller){if(controller.snapshot().modelChanged){controller.refresh(record);if(serialized!==lastRecord)modelPersistence='modelSaveConflict';}else {controller.acceptSaved(record);modelPersistence='modelAutoSave';}}else controller=RoleRegisterController.create(record,normalize);
            lastRecord=serialized;error=null;render();
        }catch(_){controller=null;error='unreadable';candidateSurface?.invalidate();render();}
    }
    host.addEventListener('click',event=>{if(event.target.closest('[data-rr-share]')&&controller)RegisterShare.open(controller.snapshot().model,i18n);});
    // 新增入口先选择来源；背包复用现有选择器，不进入通用声骸库。
    host.addEventListener('click',event=>{
        const link=event.target.closest('a[href]');if(!link||!controller)return;
        const destination=new URL(link.href,location.href);
        if(!destination.pathname.endsWith('/register-workspace.html')||destination.searchParams.get('mode')!=='echo'||destination.searchParams.has('costid'))return;
        event.preventDefault();
        const dialog=document.createElement('dialog');dialog.className='rr-dialog rr-add-source';dialog.setAttribute('aria-labelledby','rr-add-source-title');
        const heading=document.createElement('h2');heading.id='rr-add-source-title';heading.textContent=i18n.t('workspace.addEcho');dialog.append(heading);
        const choices=document.createElement('div');choices.className='rr-share-choices';
        for(const [label,inventory] of [['workspace.addManual',false],['workspace.addInventory',true]]){
            const button=document.createElement('button');button.type='button';button.textContent=i18n.t(label);
            button.onclick=()=>{const next=new URL(destination);if(inventory)next.searchParams.set('inventory','1');location.assign(next.href);};choices.append(button);
        }
        const close=document.createElement('button');close.type='button';close.textContent=i18n.t('common.cancel');
        const finish=()=>{dialog.close();dialog.remove();link.focus();};close.onclick=finish;dialog.oncancel=e=>{e.preventDefault();finish();};
        const actions=document.createElement('div');actions.className='rr-dialog-actions';actions.append(close);
        dialog.append(choices,actions);document.body.append(dialog);dialog.showModal();choices.querySelector('button').focus();
    });
    refresh();
    modelRevision=lastRecord;
    modelGuard=RegisterUnsaved.create({scope:'model:'+id,get:()=>controller?.modelChanges()||{},apply:changes=>{if(controller&&changes&&typeof changes==='object')for(const [field,value]of Object.entries(changes))controller.updateModel(field,value);},revision:()=>modelRevision,i18n});
    if(modelGuard.recover()&&controller?.snapshot().modelChanged){modelPersistence='modelSaveFailed';render();}
    candidateSurface=RoleCandidateSurface.mount({host,i18n,normalize,getController:()=>controller,refresh,catalog:costList});
    if(controller&&params.has('selectedEcho')){
        controller.restore(Number(params.get('selectedPosition')),params.get('selectedEcho'));render();
        params.delete('selectedEcho');params.delete('selectedPosition');history.replaceState(null,'',url.pathname+url.search);
    }else if(controller&&!params.has('draft')){
        const saved=navigation.load(analysisKey),position=Number(saved.position);if(saved.echo!=null){controller.restore(position,saved.echo);render();}else if(position>=1&&position<=5&&!controller.snapshot().model.slots[position-1].echo){controller.select(position,null);render();}
    }
    host.addEventListener('click',event=>{
        const button=event.target.closest('button');if(!button||!controller)return;
        if(button.hasAttribute('data-rr-select')){
            const position=Number(button.dataset.rrSelect),identity=button.dataset.rrIdentity||null;
            if(candidateSurface.active()){candidateSurface.close(()=>{controller.select(position,identity);render('.rr-slot[data-slot-position="'+position+'"] .rr-slot-trigger');});return;}
            controller.select(position,identity);render('.rr-slot[data-slot-position="'+position+'"] .rr-slot-trigger');
            if(button.hasAttribute('data-rr-problem')&&controller.snapshot().selection)focus('#rr-analysis-title',true);
        }else if(button.hasAttribute('data-rr-collapse')){
            const position=controller.snapshot().selection?.position,finish=()=>{controller.collapse();render('.rr-slot[data-slot-position="'+position+'"] .rr-slot-trigger');};
            if(candidateSurface.active())candidateSurface.close(finish);else finish();
        }else if(button.hasAttribute('data-rr-evidence')){
            controller.evidence();render('[data-rr-evidence]');
            if(controller.snapshot().evidenceOpen){host.querySelector('.rr-conditions').open=true;focus('#rr-evidence',true);}
        }else if(button.hasAttribute('data-rr-reset')){controller.resetModel();modelRevision=lastRecord;modelGuard.markSaved();modelPersistence='modelAutoSave';candidateSurface.invalidate('incompatible');refresh(true);focus('[data-rr-reset]');}
        else if(button.hasAttribute('data-rr-save-model')){saveModel();render('[data-rr-reset]');}
    });
    let touchOrigin=null;
    host.addEventListener('touchstart',event=>{if(event.target.closest('.rr-loadout')){const point=event.touches[0];touchOrigin={x:point.clientX,y:point.clientY};}},{passive:true});
    host.addEventListener('touchend',event=>{
        if(!touchOrigin||!controller)return;const point=event.changedTouches[0],dx=point.clientX-touchOrigin.x,dy=point.clientY-touchOrigin.y;touchOrigin=null;
        if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy))return;
        const state=controller.snapshot(),position=Math.min(5,Math.max(1,(state.selection?.position||1)+(dx<0?1:-1)));
        if(state.selection?.position===position)return;
        const finish=()=>{controller.select(position,state.identities[position]||null);render();};if(candidateSurface.active())candidateSurface.close(finish);else finish();
    },{passive:true});
    host.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&controller?.snapshot().selection){
            event.preventDefault();const position=controller.snapshot().selection.position;controller.collapse();render('.rr-slot[data-slot-position="'+position+'"] .rr-slot-trigger');
        }
    });
    host.addEventListener('change',event=>{
        if(event.target.matches('[data-rr-locale]')){i18n.setLocale(event.target.value);if(window.dispatchEvent)window.dispatchEvent(new CustomEvent('wuwa-locale',{detail:event.target.value}));}
        else if(event.target.matches('[data-rr-model]')&&controller){
            const field=event.target.dataset.rrModel;controller.updateModel(field,event.target.value);saveModel();render('[data-rr-model="'+field+'"]');
        }
    });
    window.addEventListener('wuwa-locale',event=>{if(i18n.locale!==event.detail)i18n.setLocale(event.detail);});
    i18n.subscribe(()=>render());
    // 编辑返回、其他标签页更新和页面恢复都从存档重读，不触发写入。
    if(params.has('libraryCandidate')){
        const candidate=params.get('libraryCandidate');params.delete('libraryCandidate');history.replaceState(null,'',url.pathname+url.search);
        candidateSurface.fromLibrary(candidate);
    }else candidateSurface.restore();
    window.addEventListener('pageshow',()=>refresh());
    window.addEventListener('focus',()=>refresh());
    window.addEventListener('storage',event=>{if(event.key==='mcData'||event.key===null){refresh();candidateSurface.render();}else if([RoleDraftStorage.KEY,RoleLocalConfiguration.KEY,RegisterMetadata.KEY].includes(event.key))render();});
    window.addEventListener('pagehide',rememberAnalysis);
    window.addEventListener('wuwa-core-updated',()=>refresh());
});

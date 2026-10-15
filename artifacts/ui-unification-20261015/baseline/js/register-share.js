/* 分享只读取当前 view model，不访问角色存储或计算入口。 */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RegisterShare=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
    function snapshot(model){return JSON.parse(JSON.stringify({role:model.role,model:model.model,slots:model.slots,summary:model.summary}));}
    async function open(model,i18n){
        const data=snapshot(model),t=(k,p)=>i18n.t(k,p),f=i18n.format,dialog=document.createElement('dialog');dialog.className='rr-dialog rr-share-dialog rr-share-choosing';
        const heading=document.createElement('h2');heading.textContent=t('share.title');heading.id='rr-share-title';dialog.setAttribute('aria-labelledby',heading.id);dialog.append(heading);
        const note=document.createElement('p');note.textContent=t('share.conditions')+' '+t('share.scope');dialog.append(note);
        let mode=null,closed=false;const pendingImages=new Set(),images=new Map();const choices=document.createElement('div');choices.className='rr-share-choices';dialog.append(choices);
        const modeButtons=['compact','detailed'].map(value=>{const button=document.createElement('button');button.textContent=t('share.'+value);button.onclick=async()=>{if(back.disabled||closed)return;mode=value;choices.hidden=true;canvas.hidden=false;save.hidden=false;back.hidden=false;dialog.classList.remove('rr-share-choosing');heading.textContent=t('share.'+mode);back.disabled=true;try{await render();}catch(_){status.textContent=t('share.failure');save.disabled=true;}finally{back.disabled=false;canvas.setAttribute('aria-busy','false');}if(dialog.isConnected)back.focus();};choices.append(button);return button;});
        const canvas=document.createElement('canvas');canvas.hidden=true;canvas.width=1440;canvas.height=1150;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',t('share.title'));dialog.append(canvas);
        const status=document.createElement('p');status.setAttribute('role','status');dialog.append(status);
        const actions=document.createElement('div');actions.className='rr-dialog-actions';const save=document.createElement('button'),close=document.createElement('button');save.textContent=t('share.download');close.textContent=t('common.close');save.disabled=true;const back=document.createElement('button');back.textContent=t('share.back');back.hidden=true;save.hidden=true;back.onclick=()=>{canvas.hidden=true;save.hidden=true;back.hidden=true;choices.hidden=false;status.textContent='';heading.textContent=t('share.title');dialog.classList.add('rr-share-choosing');modeButtons[mode==='detailed'?1:0].focus();};actions.append(back,save,close);dialog.append(actions);document.body.append(dialog);const opener=document.activeElement;
        const finish=()=>{closed=true;pendingImages.forEach(cancel=>cancel());pendingImages.clear();dialog.close();dialog.remove();opener?.focus();};close.onclick=finish;dialog.oncancel=event=>{event.preventDefault();finish();};dialog.showModal();modeButtons[0].focus();
        const replacements=new Map(),localSources=[...new Set([data.role.portrait,...data.slots.map(s=>s.echo?.image)].filter(src=>src&&new URL(src,document.baseURI).protocol==='file:'))];
        const filename=src=>decodeURIComponent(new URL(src,document.baseURI).pathname.split('/').pop());
        const picker=document.createElement('input');picker.type='file';picker.accept='image/*';picker.multiple=true;picker.hidden=true;dialog.append(picker);
        let restricted=false;
        async function render(){
        save.disabled=true;status.textContent=t('share.loading');restricted=false;canvas.setAttribute('aria-busy','true');
        // 重置画布的来源状态，再用用户明确选择的文件重新绘制。
        await document.fonts?.ready;
        if(closed)return;
        // 图片并行载入并在当前弹窗内复用；失败仅保留读数和明确提示。
        function loadImage(src){
            if(!src)return Promise.resolve(null);
            src=replacements.get(src)||src;
            if(images.has(src))return Promise.resolve(images.get(src));
            return new Promise(resolve=>{
                const img=new Image();let timer,done=false;
                const settle=value=>{if(done)return;done=true;clearTimeout(timer);pendingImages.delete(cancel);img.onload=img.onerror=null;if(value)images.set(src,value);resolve(value);};
                const cancel=()=>{settle(null);img.src='';};pendingImages.add(cancel);
                timer=setTimeout(()=>cancel(),4000);
                if(/^https?:$/.test(new URL(src,document.baseURI).protocol))img.crossOrigin='anonymous';
                img.onload=()=>settle(img);img.onerror=()=>settle(null);img.src=src;
            });
        }
        const sources=[...new Set([data.role.portrait,...data.slots.map(s=>s.echo?.image)].filter(Boolean))];
        const loaded=new Map(await Promise.all(sources.map(async src=>[src,await loadImage(src)])));
        if(closed)return;
        const pageWidth=mode==='detailed'?2040:1440;
        canvas.width=pageWidth;const totalKeys=[...new Set(['crit_rate','crit_damage','atk_percent','resonance_efficiency',...data.summary.substatTotals.map(s=>s.key)])];
        // 详细版按实际换行高度分配共享行，五栏始终对齐且不裁切文字。
        const measure=canvas.getContext('2d');
        function height(value,size,width){measure.font=size+'px system-ui, sans-serif';let rows=1,line='';for(const ch of String(value)){if(measure.measureText(line+ch).width>width&&line){rows++;line='';}line+=ch;}return rows*size*1.4;}
        const echoName=e=>i18n.entity('echoes',e.catalogId,e.legacy?.name||e.catalogId);
        const suiteName=e=>e.suite?.id!=null?i18n.entity('sets',e.suite.id,e.suite.legacy?.name):e.suite?.legacy?.name||'';
        const statName=s=>s?.key?t('stats.'+s.key):t('interaction.missingSubstat');
        const echoes=data.slots.map(s=>s.echo).filter(Boolean);
        const maxHeight=(get,size,width,min)=>Math.max(min,...echoes.map(e=>height(get(e),size,width)));
        const columnWidth=365, stride=392, padding=9;
        const statValue=stat=>stat?.unit==='percent'?f.percentage(stat.value):f.decimal(stat?.value);
        measure.font='600 21px system-ui, sans-serif';
        const valueWidth=Math.max(64,...echoes.flatMap(e=>(e.substats||[]).map(s=>measure.measureText(statValue(s)).width)));
        const labelWidth=columnWidth-padding*2-valueWidth-12;
        function labelSize(stat){measure.font='18px system-ui, sans-serif';return Math.max(16,Math.min(18,18*labelWidth/Math.max(1,measure.measureText(statName(stat)).width)));}
        const layout={name:maxHeight(echoName,22,columnWidth,62),suite:maxHeight(suiteName,18,columnWidth,50),main:maxHeight(e=>e.mainStat.key?t('stats.'+e.mainStat.key):t('state.missing'),20,columnWidth,56)};
        layout.rows=Array.from({length:Math.max(5,...echoes.map(e=>e.substats?.length||0))},(_,i)=>Math.max(76,...echoes.map(e=>height(statName(e.substats?.[i]),labelSize(e.substats?.[i]),labelWidth)+26)));
        layout.compactNameExtra=Math.max(0,maxHeight(echoName,20,245,62)-62);
        layout.compactMainExtra=Math.max(0,maxHeight(e=>e.mainStat.key?t('stats.'+e.mainStat.key):t('state.missing'),18,245,41)-41);
        const compactExtra=layout.compactNameExtra+layout.compactMainExtra;
        layout.subtop=748+layout.name+layout.suite+layout.main+184;
        layout.totalTop=layout.subtop+layout.rows.reduce((a,b)=>a+b+10,0)+66;
        layout.totalRows=Array.from({length:Math.ceil(totalKeys.length/4)},(_,i)=>Math.max(...totalKeys.slice(i*4,i*4+4).map(k=>height(t('stats.'+k),20,460)))+65);
        canvas.height=mode==='detailed'?Math.ceil(layout.totalTop+70+layout.totalRows.reduce((a,b)=>a+b,0)+260):Math.ceil(1150+compactExtra);
        const ctx=canvas.getContext('2d');ctx.fillStyle='#111918';ctx.fillRect(0,0,pageWidth,canvas.height);
        function text(value,x,y,size=22,color='#dce4dd',width=1300){ctx.fillStyle=color;ctx.font=size+'px system-ui, sans-serif';const lines=[];let line='';for(const ch of String(value)){if(ctx.measureText(line+ch).width>width&&line){lines.push(line);line='';}line+=ch;}lines.push(line);lines.forEach((v,i)=>ctx.fillText(v,x,y+i*size*1.4));return lines.length*size*1.4;}
        function line(x,y,x2){ctx.strokeStyle='#53645c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y);ctx.stroke();}
        let missing=false;
        function picture(src,x,y,w,h){if(!src)return;const image=loaded.get(src);if(!image){missing=true;return;}const scale=Math.min(w/image.width,h/image.height);ctx.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);}
        // 品牌整体居中；说明留在预览外，导出只保留展示所需的读数。
        ctx.font='24px system-ui, sans-serif';const brandWidth=Math.max(ctx.measureText(t('register.brand')).width,250),brandX=(pageWidth-brandWidth-58)/2;
        ctx.fillStyle='#e2e8e2';[[0,12,20],[8,0,44],[16,12,20]].forEach(([x,y,h])=>ctx.fillRect(brandX+x,48+y,2,h));text(t('register.brand'),brandX+58,64,24);text(t('register.brandLatin'),brandX+58,94,17);
        function resonance(x,y,size,color='#82968a'){
            ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.22,y-size*.18);ctx.lineTo(x+size*.7,y);ctx.lineTo(x+size*.22,y+size*.18);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.22,y+size*.18);ctx.lineTo(x-size*.7,y);ctx.lineTo(x-size*.22,y-size*.18);ctx.closePath();ctx.fill();
        }
        line(48,78,brandX-36);line(brandX+brandWidth+94,78,pageWidth-48);
        // 低对比共鸣环衬托立绘，五槽节点继续共用一条配置基线。
        ctx.strokeStyle='#2c3b34';ctx.lineWidth=1;[142,160].forEach(r=>{ctx.beginPath();ctx.arc(210,292,r,0,Math.PI*2);ctx.stroke();});
        await picture(data.role.portrait,48,130,330,310);
        const characterName=i18n.entity('characters',data.role.catalogId,data.role.legacy?.name||data.role.catalogId);
        // 长角色名缩小至可用标题区域内，链数与模式仍保留独立行。
        let titleSize=54;while(titleSize>18&&height(characterName,titleSize,520)>112)titleSize-=2;
        text(characterName,420,226-(54-titleSize),titleSize,'#eef0e9',520);
        text(t('role.chain',{chain:data.model.chain}),420,285,22,'#b5c2b9');
        text(data.model.status==='available'?t('register.mode.'+(data.model.parameters.mode||'default')):t('issues.model-unavailable'),420,326,20,'#b5c2b9',500);
        text(t('summary.score'),1000,226,22,'#b5c2b9',350);text(f.scoreValue(data.summary.score),1000,322,76);
        if(data.summary.status!=='complete')text(t('state.'+data.summary.status),1000,368,20,'#b5c2b9',350);
        if(mode==='compact'){resonance(1340,385,28);resonance(1304,385,12);resonance(1376,385,12);}
        if(mode==='compact'){
        line(48,460,1392);
        for(const slot of data.slots){const x=48+(slot.position-1)*272;const e=slot.echo;text(String(slot.position).padStart(2,'0'),x,502,22);if(!e){text(t('loadout.empty'),x,575,22,'#b5c2b9',245);continue;}await picture(e.image,x,520,120,110);text(i18n.entity('echoes',e.catalogId,e.legacy?.name||e.catalogId),x,664,20,'#e2e8e2',245);text(t('loadout.cost',{cost:e.cost}),x,727+layout.compactNameExtra,18,'#b5c2b9');text((e.mainStat.key?t('stats.'+e.mainStat.key):t('state.missing')),x,764+layout.compactNameExtra,18,'#b5c2b9',245);text(e.mainStat.unit==='percent'?f.percentage(e.mainStat.value):f.decimal(e.mainStat.value),x,805+compactExtra,24);text(f.score(e.score.value),x,851+compactExtra,30);}
        data.slots.forEach(slot=>resonance(48+(slot.position-1)*272+120,460,7));
        line(48,880+compactExtra,1392);text(t('summary.substatTotals'),48,915+compactExtra,18,'#b5c2b9');const totals=new Map(data.summary.substatTotals.map(s=>[s.key,s.value]));['crit_rate','crit_damage','atk_percent','resonance_efficiency'].forEach((key,i)=>{text(t('stats.'+key),48+i*340,955+compactExtra,18,'#b5c2b9',320);text(f.percentage(totals.get(key)??(data.summary.status==='complete'?0:null)),48+i*340,994+compactExtra,27);});
        line(48,1080+compactExtra,652);line(788,1080+compactExtra,1392);[[-44,7],[-22,12],[0,26],[22,12],[44,7]].forEach(([dx,size])=>resonance(720+dx,1080+compactExtra,size));
        }else{
            // 详细版复用当前读数与图片加载器，不调用评分或存储入口。
            const value=stat=>stat?.unit==='percent'?f.percentage(stat.value):f.decimal(stat?.value);
            const condition=data.model.parameters||{};
            const conditions=[];
            if(condition.extraEnergy!=null)conditions.push(t('register.extraEnergy',{value:f.percentage(condition.extraEnergy)}));
            if(condition.referenceHealth!=null)conditions.push(t('register.referenceHealth',{value:f.integer(condition.referenceHealth)}));
            text(conditions.join(' · '),420,370,18,'#b5c2b9',540);
            line(48,438,pageWidth-48);text(t('loadout.title'),48,477,22);text(t('share.detailed'),pageWidth-290,477,18,'#b5c2b9',240);
            for(const slot of data.slots){
                const x=48+(slot.position-1)*stride,e=slot.echo;
                resonance(x+columnWidth/2,500,7);text(String(slot.position).padStart(2,'0'),x,537,22);
                if(!e){text(t('loadout.empty'),x,620,22,'#b5c2b9',columnWidth);continue;}
                text(t('loadout.cost',{cost:e.cost}),x+120,537,18,'#b5c2b9',125);
                await picture(e.image,x+(columnWidth-190)/2,558,190,150);
                text(echoName(e),x,748,22,'#e2e8e2',columnWidth);
                let y=748+layout.name;
                text(suiteName(e),x,y,18,'#a6b9ae',columnWidth);y+=layout.suite;
                line(x,y-12,x+columnWidth);text(e.mainStat.key?t('stats.'+e.mainStat.key):t('state.missing'),x,y+18,20,'#b5c2b9',columnWidth);y+=layout.main;
                text(value(e.mainStat),x,y+24,30);text(t('loadout.contribution'),x,y+66,18,'#b5c2b9',columnWidth);text(f.score(e.score.value),x,y+112,38);
                line(x,layout.subtop-22,x+columnWidth);y=layout.subtop;
                for(let i=0;i<layout.rows.length;i++){
                    const stat=e.substats?.[i],h=layout.rows[i];
                    // 沿用有效词条计数的原始贡献来源，未知模型保持中性。
                    const effective=data.model.status==='available'&&stat?.status==='valid'&&Number.isFinite(stat.rawContribution)&&stat.rawContribution>0;
                    ctx.strokeStyle=effective?'#578c7d':'#3d5047';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,columnWidth-1,h-1);
                    if(effective){ctx.fillStyle='#172b25';ctx.fillRect(x+1,y+1,columnWidth-2,h-2);ctx.fillStyle='#a3e5cd';ctx.fillRect(x+1,y+12,2,h-24);}
                    const size=labelSize(stat);
                    text(statName(stat),x+padding,y+(h-height(statName(stat),size,labelWidth))/2+size,size,effective?'#b3efd9':'#bac6bf',labelWidth);
                    ctx.textAlign='right';ctx.fillStyle=effective?'#c7f8e5':'#dce4dd';ctx.font=(effective?'600 ':'')+'21px system-ui, sans-serif';ctx.fillText(value(stat),x+columnWidth-padding,y+h/2+7);ctx.textAlign='left';
                    y+=h+10;
                }
                if(slot.status!=='complete')text(t('state.'+slot.status),x,y+24,18,'#b5c2b9',columnWidth);
            }
            line(48,layout.totalTop,pageWidth-48);text(t('summary.substatTotals'),48,layout.totalTop+40,22);
            const totals=new Map(data.summary.substatTotals.map(s=>[s.key,s]));
            const keys=totalKeys;
            keys.forEach((key,i)=>{const row=Math.floor(i/4),x=48+(i%4)*490,y=layout.totalTop+82+layout.totalRows.slice(0,row).reduce((a,b)=>a+b,0);const stat=totals.get(key)||{unit:'percent',value:data.summary.status==='complete'?0:null};text(t('stats.'+key),x,y,20,'#b5c2b9',460);text(value(stat),x,y+layout.totalRows[row]-54,30);line(x,y+layout.totalRows[row]-32,x+460);});
            const footer=canvas.height-210;line(48,footer-25,pageWidth-48);
            text(t('summary.knownSubtotal')+'  '+f.score(data.summary.knownContribution),48,footer+10,19,'#b5c2b9',630);
            text(t('summary.energyCorrection')+'  '+f.score(data.summary.energyCorrection),960,footer+10,19,'#b5c2b9',630);
            text(t(data.summary.status==='complete'?'share.scope':'share.summaryIncomplete'),48,footer+62,17,'#92a89a',1640);
            // 详细版末尾使用居中的共鸣符号与两侧细线。
            const ornamentY=canvas.height-65;
            line(48,ornamentY,pageWidth/2-68);line(pageWidth/2+68,ornamentY,pageWidth-48);
            [[-44,7],[-22,12],[0,26],[22,12],[44,7]].forEach(([dx,size])=>resonance(pageWidth/2+dx,ornamentY,size));
        }
        const commentary=data.summary.status==='complete'?'':t('share.summaryIncomplete');
        canvas.setAttribute('aria-label',heading.textContent+' · '+i18n.entity('characters',data.role.catalogId,data.role.legacy?.name)+' · '+f.score(data.summary.score)+' · '+commentary);
        canvas.setAttribute('aria-busy','false');status.textContent=missing?t('share.imagesMissing'):'';save.disabled=false;
        try{ctx.getImageData(0,0,1,1);}catch(error){if(error.name==='SecurityError')restricted=true;}
        save.textContent=t(restricted&&localSources.length?'share.chooseImages':'share.download');
        if(restricted)status.textContent=localSources.length?t('share.chooseImagesHelp',{files:localSources.map(filename).join(', ')}):t('share.localExportRestricted');
        }
        function download(){
            save.disabled=true;status.textContent=t('share.exporting');
            try{canvas.toBlob(blob=>{if(closed)return;save.disabled=false;if(!blob){status.textContent=t('share.failure');return;}const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='resonance-register-'+data.role.id+(mode==='detailed'?'-detailed':'')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent=t('share.downloadStarted');},'image/png');}catch(_){save.disabled=false;status.textContent=t('share.failure');}
        }
        save.onclick=()=>{if(restricted){if(localSources.length)picker.click();else status.textContent=t('share.localExportRestricted');return;}download();};
        picker.onchange=async()=>{
            const files=Array.from(picker.files||[]);if(!files.length)return;
            save.disabled=true;
            try{
                for(const src of localSources){const matches=files.filter(file=>file.name===filename(src));if(matches.length!==1)continue;const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(matches[0]);});replacements.set(src,url);}
                const pending=localSources.filter(src=>!replacements.has(src));
                if(pending.length){status.textContent=t('share.chooseImagesHelp',{files:pending.map(filename).join(', ')});return;}
                await render();if(!closed&&!restricted)download();
            }catch(_){status.textContent=t('share.failure');}finally{save.disabled=false;picker.value='';}
        };
    }
    return {snapshot,open};
});

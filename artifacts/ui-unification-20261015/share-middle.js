        const pageWidth=mode==='detailed'?2040:1440;
        canvas.width=pageWidth;
        const measure=canvas.getContext('2d'),detailed=mode==='detailed';
        function height(value,size,width){measure.font=size+'px system-ui, sans-serif';let rows=1,line='';for(const ch of String(value)){if(measure.measureText(line+ch).width>width&&line){rows++;line='';}line+=ch;}return rows*size*1.35;}
        const echoName=e=>i18n.entity('echoes',e.catalogId,e.legacy?.name||e.catalogId);
        const suiteName=e=>e.suite?.id!=null?i18n.entity('sets',e.suite.id,e.suite.legacy?.name):e.suite?.legacy?.name||'';
        const statName=s=>s?.key?t('stats.'+s.key):t('interaction.missingSubstat');
        const statValue=s=>s?.unit==='percent'?f.percentage(s.value):f.decimal(s?.value);
        const characterName=i18n.entity('characters',data.role.catalogId,data.role.legacy?.name||data.role.catalogId);
        const modeName=data.model.status==='available'?t('register.mode.'+(data.model.parameters.mode||'default')):t('issues.model-unavailable');
        const echoes=data.slots.map(s=>s.echo).filter(Boolean),pad=48,gap=detailed?24:16,column=(pageWidth-pad*2-gap*4)/5;
        const nameSize=detailed?25:22,nameHeight=Math.max(60,...echoes.map(e=>height(echoName(e),nameSize,column-32)));
        const suiteHeight=detailed?Math.max(36,...echoes.map(e=>height(suiteName(e),19,column-32))):0;
        const mainHeight=detailed?Math.max(58,...echoes.map(e=>height(statName(e.mainStat),22,column-32))):0;
        const valueWidth=detailed?Math.max(90,...echoes.flatMap(e=>(e.substats||[]).map(s=>{measure.font='24px system-ui, sans-serif';return measure.measureText(statValue(s)).width;}))):0;
        const labelWidth=column-48-valueWidth;
        const rowHeights=Array.from({length:Math.max(5,...echoes.map(e=>e.substats?.length||0))},(_,i)=>Math.max(56,...echoes.map(e=>height(statName(e.substats?.[i]),21,labelWidth)+20)));
        const titleSize=detailed?54:46,identityX=detailed?590:450,identityWidth=detailed?640:420;
        const identityHeight=height(characterName,titleSize,identityWidth),modeHeight=height(modeName,22,identityWidth);
        const heroTop=146,heroHeight=Math.max(detailed?490:450,identityHeight+modeHeight+260),heroBottom=heroTop+heroHeight;
        const cardTop=heroBottom+32,imageHeight=detailed?164:140,nameTop=cardTop+imageHeight+66;
        const mainTop=nameTop+nameHeight+suiteHeight+12,scoreTop=detailed?mainTop+mainHeight+42:nameTop+nameHeight+12;
        const subTop=scoreTop+94,cardBottom=detailed?subTop+rowHeights.reduce((a,b)=>a+b+8,0)+24:scoreTop+96;
        const totalKeys=[...new Set(['crit_rate','crit_damage','atk_percent','resonance_efficiency',...data.summary.substatTotals.map(s=>s.key)])];
        const totalWidth=(pageWidth-pad*2-3*18)/4,totalRows=Array.from({length:Math.ceil(totalKeys.length/4)},(_,i)=>Math.max(100,...totalKeys.slice(i*4,i*4+4).map(key=>height(t('stats.'+key),23,totalWidth-32)+62)));
        const totalTop=cardBottom+42,totalHeight=totalRows.reduce((a,b)=>a+b+14,0);
        canvas.height=Math.ceil((detailed?totalTop+56+totalHeight:cardBottom)+118);
        const ctx=canvas.getContext('2d'),boxes=[];
        ctx.fillStyle='#101a1c';ctx.fillRect(0,0,pageWidth,canvas.height);
        function text(value,x,top,size=22,color='#e5eeeb',width=1300,align='left'){
            ctx.fillStyle=color;ctx.font=size+'px system-ui, sans-serif';ctx.textAlign=align;
            let line='',lines=[];for(const ch of String(value)){if(ctx.measureText(line+ch).width>width&&line){lines.push(line);line='';}line+=ch;}lines.push(line);
            lines.forEach((part,i)=>ctx.fillText(part,x,top+size+i*size*1.35));ctx.textAlign='left';return lines.length*size*1.35;
        }
        function line(x,y,x2){ctx.strokeStyle='#53645c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y);ctx.stroke();}
        function panel(x,y,w,h,r=16,fill='#19292b',stroke='#3a5556'){
            ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();
        }
        let missing=false;
        function picture(src,x,y,w,h){const image=src&&loaded.get(src);if(!image){if(src)missing=true;text('—',x+w/2,y+h/2-20,32,'#738c89',w,'center');return;}const scale=Math.min(w/image.width,h/image.height);ctx.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);}
        // 顶部品牌的原图标、双侧细线与对称构图保持一致。
        ctx.font='24px system-ui, sans-serif';const brandWidth=Math.max(ctx.measureText(t('register.brand')).width,250),brandX=(pageWidth-brandWidth-58)/2;
        ctx.fillStyle='#e2e8e2';[[0,12,20],[8,0,44],[16,12,20]].forEach(([x,y,h])=>ctx.fillRect(brandX+x,48+y,2,h));text(t('register.brand'),brandX+58,40,24);text(t('register.brandLatin'),brandX+58,77,17);
        function resonance(x,y,size,color='#82968a'){
            ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.22,y-size*.18);ctx.lineTo(x+size*.7,y);ctx.lineTo(x+size*.22,y+size*.18);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.22,y+size*.18);ctx.lineTo(x-size*.7,y);ctx.lineTo(x-size*.22,y-size*.18);ctx.closePath();ctx.fill();
        }
        line(48,78,brandX-36);line(brandX+brandWidth+94,78,pageWidth-48);
        // 原双共鸣环只缩放及定位，立绘始终保持原比例。
        const portraitW=detailed?480:360,portraitX=48,cx=portraitX+portraitW/2,cy=heroTop+heroHeight*.49;
        ctx.strokeStyle='#2c3b34';ctx.lineWidth=1;[142,160].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,r*(detailed?1.35:1.15),0,Math.PI*2);ctx.stroke();});
        picture(data.role.portrait,portraitX,heroTop,portraitW,heroHeight-12);boxes.push({kind:'portrait',x:portraitX,y:heroTop,w:portraitW,h:heroHeight-12});
        const titleTop=heroTop+4;
        text(characterName,identityX,titleTop,titleSize,'#f1f3ec',identityWidth);
        let infoY=titleTop+identityHeight+12;
        text(t('role.chain',{chain:data.model.chain}),identityX,infoY,23,'#c4d6cf',identityWidth);infoY+=40;
        text(modeName,identityX,infoY,22,'#c4d6cf',identityWidth);infoY+=modeHeight+24;
        text(t('summary.score'),identityX,infoY,21,'#bacdc6',identityWidth);
        text(f.scoreValue(data.summary.score),identityX,infoY+28,detailed?88:78,'#c1efdd',identityWidth);
        if(data.summary.status!=='complete')text(t('state.'+data.summary.status),identityX,infoY+128,20,'#d4bd96',identityWidth);
        const condition=data.model.parameters||{},conditions=[];
        if(condition.extraEnergy!=null)conditions.push(t('register.extraEnergy',{value:f.percentage(condition.extraEnergy)}));
        if(condition.referenceHealth!=null)conditions.push(t('register.referenceHealth',{value:f.integer(condition.referenceHealth)}));
        if(conditions.length)text(conditions.join(' · '),identityX,heroBottom-40,19,'#b0c4bd',identityWidth);
        // 雷达独立使用同一组真实单件分数；缺项或负值采用带读数的位置图。
        const radar=radarData(data),rx=detailed?1690:1178,ry=heroTop+185,radius=detailed?140:105;
        const vertex=(i,r)=>({x:rx+Math.cos(-Math.PI/2+i*Math.PI*2/5)*r,y:ry+Math.sin(-Math.PI/2+i*Math.PI*2/5)*r});
        function polygon(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
        text(t('share.radarTitle'),rx,heroTop-12,23,'#d4e7df',detailed?480:320,'center');
        for(let level=1;level<=4;level++){polygon(Array.from({length:5},(_,i)=>vertex(i,radius*level/4)));ctx.strokeStyle=level===4?'#597d76':'#2f4c49';ctx.lineWidth=1;ctx.stroke();}
        for(let i=0;i<5;i++){const p=vertex(i,radius);ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#3a5652';ctx.stroke();}
        if(radar.filled){polygon(radar.entries.map((entry,i)=>vertex(i,radius*entry.value/radar.max)));ctx.fillStyle='#78c8b833';ctx.fill();ctx.strokeStyle='#92deca';ctx.lineWidth=2;ctx.stroke();radar.entries.forEach((entry,i)=>{const p=vertex(i,radius*entry.value/radar.max);ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle='#b4eedb';ctx.fill();});}
        radar.entries.forEach((entry,i)=>{const p=vertex(i,radius+(detailed?48:42));text(String(entry.position).padStart(2,'0'),p.x,p.y-18,17,'#c8a66c',130,'center');text(f.scoreValue(entry.value),p.x,p.y+8,22,'#d5e9e1',150,'center');});
        const radarTextWidth=detailed?550:360;
        text(t('share.radarScale',{max:f.decimal(radar.max)}),rx,heroTop+365,18,'#b8cdc4',radarTextWidth,'center');
        const scope=t(radar.filled?'share.radarScope':'share.radarPartial');text(scope,rx,heroTop+397,17,'#9fb8af',radarTextWidth,'center');
        boxes.push({kind:'radar',x:rx-radius-80,y:heroTop-12,w:radius*2+160,h:heroHeight});
        canvas.setAttribute('data-share-radar',JSON.stringify(radar));
        for(const slot of data.slots){
            const x=pad+(slot.position-1)*(column+gap),e=slot.echo;
            panel(x,cardTop,column,cardBottom-cardTop,16);boxes.push({kind:'echo',position:slot.position,x,y:cardTop,w:column,h:cardBottom-cardTop});
            text(String(slot.position).padStart(2,'0'),x+16,cardTop+14,21,'#c8a66c',60);
            if(!e){text(t('loadout.empty'),x+column/2,cardTop+imageHeight+66,22,'#a5bcb3',column-32,'center');continue;}
            text(t('loadout.cost',{cost:e.cost??'—'}),x+column-16,cardTop+15,19,'#bdcfc6',column-90,'right');
            picture(e.image,x+24,cardTop+52,column-48,imageHeight);
            text(echoName(e),x+16,nameTop,nameSize,'#e6eee7',column-32);
            if(detailed){
                text(suiteName(e),x+16,nameTop+nameHeight,19,'#9dbbb0',column-32);
                text(statName(e.mainStat),x+16,mainTop,22,'#b9cec5',column-32);
                text(statValue(e.mainStat),x+16,mainTop+mainHeight,29,'#e9efea',column-32);
            }
            text(t('loadout.contribution'),x+16,scoreTop,18,'#adc5ba',column-32);
            text(f.scoreValue(e.score.value),x+16,scoreTop+26,detailed?42:36,'#b8ecd7',column-32);
            if(detailed){let y=subTop;rowHeights.forEach((h,i)=>{
                const stat=e.substats?.[i],effective=data.model.status==='available'&&stat?.status==='valid'&&Number.isFinite(stat.rawContribution)&&stat.rawContribution>0;
                panel(x+12,y,column-24,h,8,effective?'#203b35':'#172629',effective?'#578c7d':'#3d5047');
                text(statName(stat),x+24,y+(h-height(statName(stat),21,labelWidth))/2,21,effective?'#c3efdc':'#b9cbc3',labelWidth);
                text(statValue(stat),x+column-24,y+(h-24)/2-3,24,effective?'#d5f4e6':'#dae5de',valueWidth,'right');
                y+=h+8;
            });}
        }
        if(detailed){
            text(t('summary.substatTotals'),48,totalTop,26,'#d9e9e0',pageWidth-96);
            const totals=new Map(data.summary.substatTotals.map(stat=>[stat.key,stat]));
            totalKeys.forEach((key,i)=>{const row=Math.floor(i/4),x=48+(i%4)*(totalWidth+18),y=totalTop+56+totalRows.slice(0,row).reduce((a,b)=>a+b+14,0),stat=totals.get(key)||{unit:'percent',value:data.summary.status==='complete'?0:null};panel(x,y,totalWidth,totalRows[row],12);text(t('stats.'+key),x+16,y+12,23,'#abc5b8',totalWidth-32);text(statValue(stat),x+16,y+totalRows[row]-45,31,'#e3eee6',totalWidth-32);});
        }
        const ornamentY=canvas.height-65;
        // 原底部五共鸣符号、比例与两侧细线原样保留。
        line(48,ornamentY,pageWidth/2-68);line(pageWidth/2+68,ornamentY,pageWidth-48);
        [[-44,7],[-22,12],[0,26],[22,12],[44,7]].forEach(([dx,size])=>resonance(pageWidth/2+dx,ornamentY,size));
        canvas.setAttribute('data-share-layout',JSON.stringify({boxes,cardTop,cardBottom,totalTop:detailed?totalTop:null,footer:ornamentY,scope:'raw-score-distribution'}));

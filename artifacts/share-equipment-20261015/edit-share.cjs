/* 仅重排Canvas上半部；真实数据、雷达计算、品牌和下载流程保持原实现。 */
const fs=require('node:fs'),p='js/register-share.js';let s=fs.readFileSync(p,'utf8');
let a=s.indexOf('        const titleSize='),b=s.indexOf('        const cardTop=',a);
s=s.slice(0,a)+`        const heroScale=detailed?1.15:1,heroGap=20,heroInner=pageWidth-pad*2-heroGap*2;
        const identityWidth=heroInner*.38,scoreWidth=heroInner*.30,radarWidth=heroInner*.32;
        const identityX=pad,scoreX=identityX+identityWidth+heroGap,radarX=scoreX+scoreWidth+heroGap;
        const titleSize=38*heroScale,identityHeight=height(characterName,titleSize,identityWidth-40),portraitHeight=285*heroScale;
        const badgeSize=18*heroScale,chainName=t('role.chain',{chain:data.model.chain});
        measure.font=badgeSize+'px system-ui, sans-serif';
        const chainWidth=Math.min(identityWidth-40,measure.measureText(chainName).width+28),modeWidth=Math.min(identityWidth-40,measure.measureText(modeName).width+28);
        const badgeStack=chainWidth+modeWidth+8>identityWidth-40,badgeHeight=Math.max(height(chainName,badgeSize,chainWidth-24),height(modeName,badgeSize,modeWidth-24))+14;
        const heroTop=146,heroHeight=Math.max(500*heroScale,portraitHeight+36+identityHeight+badgeHeight*(badgeStack?2:1)+34),heroBottom=heroTop+heroHeight;
`+s.slice(b);
a=s.indexOf('        // 原双共鸣环');b=s.indexOf('        const vertex=',a);
s=s.slice(0,a)+`        // 三个等高区域共用同一顶部设计，长名称和徽章自然扩展高度。
        for(const [x,w] of [[identityX,identityWidth],[scoreX,scoreWidth],[radarX,radarWidth]])panel(x,heroTop,w,heroHeight,20,'#142326','#30484a');
        const portraitW=identityWidth-40,portraitX=identityX+20,cx=identityX+identityWidth/2,cy=heroTop+portraitHeight*.5+12;
        ctx.strokeStyle='#314944';ctx.lineWidth=1;[.43,.48].forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,Math.min(portraitW,portraitHeight)*r,0,Math.PI*2);ctx.stroke();});
        picture(data.role.portrait,portraitX,heroTop+12,portraitW,portraitHeight);boxes.push({kind:'portrait',x:portraitX,y:heroTop+12,w:portraitW,h:portraitHeight});
        const titleTop=heroTop+portraitHeight+22;
        text(characterName,cx,titleTop,titleSize,'#f1f3ec',identityWidth-40,'center');
        const badgeTop=titleTop+identityHeight+12,totalBadgeWidth=chainWidth+modeWidth+8;
        const badge=(label,x,y,w)=>{panel(x,y,w,badgeHeight,Math.min(16,badgeHeight/2),'#1c3233','#395552');text(label,x+w/2,y+6,badgeSize,'#c4d6cf',w-24,'center');};
        if(badgeStack){badge(chainName,cx-chainWidth/2,badgeTop,chainWidth);badge(modeName,cx-modeWidth/2,badgeTop+badgeHeight+8,modeWidth);}else{badge(chainName,cx-totalBadgeWidth/2,badgeTop,chainWidth);badge(modeName,cx-totalBadgeWidth/2+chainWidth+8,badgeTop,modeWidth);}
        // 评分沿用原读数，只增加克制的共鸣环及高字重数字。
        const scoreCenter=scoreX+scoreWidth/2,scoreY=heroTop+heroHeight*.47,ring=Math.min(scoreWidth*.36,150*heroScale);
        ctx.strokeStyle='#30514d';ctx.lineWidth=1;[ring,ring+9].forEach(r=>{ctx.beginPath();ctx.arc(scoreCenter,scoreY+10,r,0,Math.PI*2);ctx.stroke();});
        text(t('summary.score'),scoreCenter,scoreY-95*heroScale,20*heroScale,'#b6d2c8',scoreWidth-40,'center');
        const scoreText=f.scoreValue(data.summary.score);let scoreSize=112*heroScale;
        while(scoreSize>44){ctx.font='700 '+scoreSize+'px system-ui, sans-serif';if(ctx.measureText(scoreText).width<=scoreWidth-44)break;scoreSize-=2;}
        ctx.textAlign='center';ctx.fillStyle='#bff4df';ctx.shadowColor='#6cd4b844';ctx.shadowBlur=18;ctx.fillText(scoreText,scoreCenter,scoreY+scoreSize*.45);ctx.shadowBlur=0;ctx.textAlign='left';
        if(data.summary.status!=='complete')text(t('state.'+data.summary.status),scoreCenter,scoreY+95*heroScale,18*heroScale,'#d4bd96',scoreWidth-40,'center');
        const condition=data.model.parameters||{},conditions=[];
        if(condition.extraEnergy!=null)conditions.push(t('register.extraEnergy',{value:f.percentage(condition.extraEnergy)}));
        if(condition.referenceHealth!=null)conditions.push(t('register.referenceHealth',{value:f.integer(condition.referenceHealth)}));
        if(conditions.length)text(conditions.join(' · '),scoreCenter,heroBottom-72,17*heroScale,'#b0c4bd',scoreWidth-40,'center');
        const radar=radarData(data),rx=radarX+radarWidth/2,ry=heroTop+heroHeight*.50,radius=Math.min(radarWidth/2-96,160*heroScale);
        boxes.push({kind:'identity',x:identityX,y:heroTop,w:identityWidth,h:heroHeight},{kind:'score',x:scoreX,y:heroTop,w:scoreWidth,h:heroHeight});
`+s.slice(b);
s=s.replace("rx,heroTop-12,23", "rx,heroTop+20,23").replace("radius+(detailed?48:42)","radius+38").replace("x:rx-radius-80,y:heroTop-12,w:radius*2+160,h:heroHeight","x:radarX,y:heroTop,w:radarWidth,h:heroHeight");
fs.writeFileSync(p,s);

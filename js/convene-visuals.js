(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./convene-core.js'),require('./convene-cabinet.js'));else root.ConveneVisuals=factory(root.ConveneCore,root.ConveneCabinet);})(typeof globalThis!=='undefined'?globalThis:this,function(Core,Cabinet){
'use strict';
const COLORS={breeze:'#b1c5d9',radiant:'#b4df96',fate:'#f0ce86',star:'#c9b1ee',lucky:'#89ddca',steady:'#adc8cf',headwind:'#d5ad87',abyss:'#c18ba9',observing:'#8eb6ac'};
function geometry(title,family='overall'){const index=(family==='character'?Core.CHARACTER_TIERS.slice().reverse():Core.RATING_RULES.tiers.slice().reverse()).map(t=>t.title).indexOf(title),level=index+1,sides=index<0?4:4+index*2;return {level,sides,color:COLORS[title]||COLORS.observing,observing:index<0};}
function points(sides,radius,rotation=-Math.PI/2){return Array.from({length:sides},(_,i)=>{const a=rotation+i*Math.PI*2/sides;return [50+radius*Math.cos(a),50+radius*Math.sin(a)];});}
// Original primitives shared by transparent SVG and Canvas; no remote art.
function baseArtwork(title,family='overall'){
 const g=geometry(title,family),level=Math.max(0,g.level),out=[];
 const add=(d,fill=false,opacity=1,width=1.25)=>out.push({d,fill,opacity,width});
 if(g.observing)return [{d:'M50 8L85 28L85 70L50 92L15 70L15 28Z',fill:true,opacity:.3,width:1.8},{d:'M50 17L77 33L77 65L50 82L23 65L23 33Z',fill:false,opacity:.8,width:1},{d:'M50 28L57 43L72 50L57 57L50 72L43 57L28 50L43 43Z',fill:true,opacity:.7,width:1.5},{d:'M22 45Q50 15 78 45M22 55Q50 85 78 55',fill:false,opacity:.7,width:1},{d:'M50 40L56 50L50 60L44 50Z',fill:true,opacity:1,width:1}];
 if(family==='overall'){
  // Every rank retains the same astrolabe, star and orbit; higher ranks only add layers.
  add('M50 10L83 29V68L50 89L17 68V29Z',true,.14,1.8);
  add('M50 15L79 32V65L50 84L21 65V32Z',false,.55,.8);
  add('M50 27L56 44L73 50L56 56L50 73L44 56L27 50L44 44Z',true,.42,1.8);
  add('M50 39L56 50L50 61L44 50Z',true,1,1.2);
  add('M25 36C14 42 17 60 36 66C55 72 82 59 80 45C79 40 75 37 70 35',false,.65,1);
  if(level>=2){add('M50 5L88 27V71L50 95L12 71V27Z',false,.8,1);add('M50 29V36M50 64V71M29 50H36M64 50H71',false,.8,1.5);}
  if(level>=3){add('M27 30C9 44 23 71 50 72C75 73 91 49 75 32',false,.7,1.2);add('M17 43L11 50L17 57M83 43L89 50L83 57',true,.7,1.2);add('M50 78L54 83L50 88L46 83Z',true,.8,1);}
  if(level>=4){add('M16 35L5 27L8 48L17 60M84 35L95 27L92 48L83 60',true,.3,1.5);add('M15 65L24 69L21 76L31 77M85 65L76 69L79 76L69 77',false,.9,1.4);add('M41 17L50 22L59 17',false,.9,1.5);}
  if(level>=5){add('M28 23L23 9L39 16L50 5L61 16L77 9L72 23',true,.24,1.8);add('M5 41C0 58 9 74 25 80M95 41C100 58 91 74 75 80',false,.8,1);add('M22 69L20 61L29 67M78 69L80 61L71 67',true,.55,1);}
  if(level>=6){add('M50 0L57 9L50 18L43 9Z',true,.95,1.8);add('M10 53L3 59L8 64L15 61M90 53L97 59L92 64L85 61',true,.5,1.5);add('M13 73L19 84L30 85L35 91M87 73L81 84L70 85L65 91',false,.95,1.8);add('M38 88L50 98L62 88',false,.8,1.2);}
  if(level>=7){add('M8 20L18 10M82 10L92 20M8 80L18 90M82 90L92 80',false,.9,1.8);add('M35 50A15 15 0 1 0 65 50',false,.6,.8);}
  if(level>=8){add('M3 35L8 30L13 35L8 40ZM87 35L92 30L97 35L92 40Z',true,.9,1.5);add('M26 6Q50 22 74 6M26 94Q50 78 74 94',false,.8,1.2);}
 }else{
  // Paired contract stones inside a constant seal; never recolor the astrolabe silhouette.
  add('M50 11L80 25L83 54L72 73L50 91L28 73L17 54L20 25Z',true,.15,1.8);
  add('M50 17L75 29L77 53L67 69L50 83L33 69L23 53L25 29Z',false,.6,.85);
  add('M40 31L53 49L40 67L27 49Z',true,.4,1.6);add('M60 31L73 49L60 67L47 49Z',true,.4,1.6);
  add('M50 42L56 50L50 58L44 50Z',true,.95,1.2);
  if(level>=2){add('M50 5L85 22L89 56L76 77L50 97L24 77L11 56L15 22Z',false,.75,1);add('M40 39L47 49L40 59M60 39L53 49L60 59',false,.85,1.3);}
  if(level>=3){add('M25 33L15 38L20 59M75 33L85 38L80 59',false,.8,1.5);add('M33 73L50 84L67 73',false,.85,1.5);add('M50 77L54 83L50 89L46 83Z',true,.8,1);}
  if(level>=4){add('M19 30L6 23L9 43L20 57M81 30L94 23L91 43L80 57',true,.3,1.5);add('M21 63L28 65L25 75L36 78M79 63L72 65L75 75L64 78',false,.8,1.4);add('M42 19L50 25L58 19',false,.9,1.5);}
  if(level>=5){add('M30 22L30 8L42 16L50 6L58 16L70 8L70 22',true,.3,1.7);add('M8 48L4 62L16 75L23 72M92 48L96 62L84 75L77 72',false,.8,1.1);add('M31 82L25 86L39 90M69 82L75 86L61 90',true,.5,1);}
  if(level>=6){add('M50 0L57 8L50 16L43 8Z',true,1,1.7);add('M17 67Q8 81 28 86L23 92L39 87M83 67Q92 81 72 86L77 92L61 87',true,.3,1.5);add('M38 30L34 25L28 32M62 30L66 25L72 32',false,.95,1.5);add('M4 35L10 32L14 40M96 35L90 32L86 40',true,.5,1.5);}
 }

 return out;
}
function artwork(title,family='overall'){
 const ranks=(family==='character'?Core.CHARACTER_TIERS:Core.RATING_RULES.tiers).slice().reverse().map(t=>t.title),end=ranks.indexOf(title);if(end<0)return baseArtwork(title,family);const out=[];
 for(let level=1;level<=end+1;level++){
  const base=baseArtwork(ranks[level-1],family),prior=level===1?[]:baseArtwork(ranks[level-2],family);out.push(...base.slice(prior.length));
  const add=(d,opacity=.7,width=.7,fill=false)=>out.push({d,opacity,width,fill});
  if(level===2)for(let i=0;i<8;i++){const a=i*Math.PI/4,r=family==='overall'?34:38;add('M'+(50+Math.cos(a)*r)+' '+(50+Math.sin(a)*r)+'L'+(50+Math.cos(a)*(r+3))+' '+(50+Math.sin(a)*(r+3)),.8,.65);}
  if(level===3)add('M50 20L80 50L50 80L20 50Z',.35,.65);
  if(level===4){add('M50 12A38 38 0 1 1 49.99 12',.55,.7);add('M50 29L58 42L71 50L58 58L50 71L42 58L29 50L42 42Z',.75,.75);}
  if(level===5)for(let i=0;i<8;i++){const a=i*Math.PI/4,r=43,x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;add('M'+x+' '+(y-1.5)+'L'+(x+1.5)+' '+y+'L'+x+' '+(y+1.5)+'L'+(x-1.5)+' '+y+'Z',.85,.7,true);}
  if(level===6){add('M50 9A41 41 0 1 1 49.99 9',.7,.8);add('M50 16L79.4 67H20.6ZM50 84L20.6 33H79.4Z',.45,.7);add('M33 47L39 45L36 51M67 47L61 45L64 51',.9,.9);}
 }
 return out;
}

function mix(color,white){const rgb=color.slice(1).match(/../g).map(h=>parseInt(h,16));return '#'+rgb.map(v=>Math.round(v+(white?255-v:-v)*.48).toString(16).padStart(2,'0')).join('');}
function badge(title,family='overall',label=title){const g=geometry(title,family),id='cv-metal-'+family+'-'+title,light=mix(g.color,true),dark=mix(g.color,false);return '<svg xmlns="http://www.w3.org/2000/svg" class="cv-badge" data-family="'+family+'" viewBox="0 0 100 100" role="img" aria-label="'+String(label).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')+'" style="color:'+g.color+'"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+light+'"/><stop offset=".38" stop-color="'+g.color+'"/><stop offset=".55" stop-color="'+dark+'"/><stop offset=".75" stop-color="'+light+'"/><stop offset="1" stop-color="'+g.color+'"/></linearGradient></defs>'+artwork(title,family).map(p=>'<path d="'+p.d+'" fill="'+(p.fill?'url(#'+id+')':'none')+'" stroke="'+(p.width>=1.5?light:'currentColor')+'" stroke-width="'+p.width+'" opacity="'+p.opacity+'" stroke-linejoin="round"/>').join('')+'<polygon points="'+points(g.sides,3).map(p=>p.join(',')).join(' ')+'" fill="'+light+'"/></svg>';}
function drawBadge(ctx,title,cx,cy,size,family='overall'){const g=geometry(title,family);ctx.save();ctx.translate(cx-size/2,cy-size/2);ctx.scale(size/100,size/100);const gradient=ctx.createLinearGradient(0,0,100,100),light=mix(g.color,true);for(const [at,color]of [[0,light],[.38,g.color],[.55,mix(g.color,false)],[.75,light],[1,g.color]])gradient.addColorStop(at,color);ctx.fillStyle=gradient;ctx.lineJoin='round';for(const p of artwork(title,family)){ctx.strokeStyle=p.width>=1.5?light:g.color;ctx.globalAlpha=p.opacity;ctx.lineWidth=p.width;const path=new Path2D(p.d);if(p.fill)ctx.fill(path);ctx.stroke(path);}ctx.globalAlpha=1;ctx.fillStyle=light;ctx.beginPath();points(g.sides,3).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.restore();}
// 图标、卡片和分享共用稀有度色板，不按成就索引分配颜色。
const ACHIEVEMENT_COLORS=Object.freeze({common:'#adc8cf',rare:'#8dbbdb',epic:'#c6a5e3',legendary:'#e5c47b',mythic:'#e9e5ff'});
// 中心图案按成就语义显式映射；只有相关进阶共用主题，禁止以索引或稀有度循环复用图案。
const engraving=(d,fill=false,width=2.2,opacity=1)=>({d,fill,width,opacity});
const starMark=(x,y,r=7)=>'M'+x+' '+(y-r)+'L'+(x+r*.3)+' '+(y-r*.3)+'L'+(x+r)+' '+y+'L'+(x+r*.3)+' '+(y+r*.3)+'L'+x+' '+(y+r)+'L'+(x-r*.3)+' '+(y+r*.3)+'L'+(x-r)+' '+y+'L'+(x-r*.3)+' '+(y-r*.3)+'Z';
const ringMark=(x,y,r)=>'M'+(x-r)+' '+y+'a'+r+' '+r+' 0 1 0 '+(r*2)+' 0a'+r+' '+r+' 0 1 0 '+(-r*2)+' 0';
const laurel='M32 77Q13 58 25 32M68 77Q87 58 75 32M25 61L18 53M25 61L31 53M23 49L18 41M23 49L30 42M75 61L82 53M75 61L69 53M77 49L82 41M77 49L70 42';
const achievementDesigns=Object.freeze({
 // 远航里程：启程旗、罗盘、帆船、远洋船与灯塔。
 pull1:{family:'voyage',symbol:[engraving('M36 76V25M37 27H69L62 38L69 49H37',false,3),engraving('M26 77H52',false,3)]},
 pull100:{family:'voyage',symbol:[engraving(ringMark(50,50,23)),engraving('M50 23V30M50 70V77M23 50H30M70 50H77'),engraving('M61 36L54 54L39 64L46 46Z',true)]},
 pull500:{family:'voyage',symbol:[engraving('M28 61H75L65 73H38ZM49 26V59L30 57ZM54 31L72 57H54Z',true),engraving('M26 80Q34 75 42 80Q50 85 58 80Q66 75 74 80')]},
 pull1000:{family:'voyage',symbol:[engraving('M22 62H78L66 76H36ZM44 25V58M62 30V58',false,3),engraving('M39 29L26 55H39ZM49 29L59 55H49ZM66 35L76 55H66Z',true),engraving('M24 81Q37 75 50 81Q63 87 76 81')]},
 pull3000:{family:'voyage',symbol:[engraving('M39 72L43 37H57L61 72ZM39 37V28H61V37ZM35 74H65',false,3),engraving('M46 59H54V72H46Z',true),engraving('M31 32L21 26M29 40H18M69 32L79 26M71 40H82M44 23L50 17L56 23'),engraving('M23 81Q36 75 50 81Q64 87 77 81')]},
 // 五星数量：单晶、晶簇、宝箱、宝库。
 gold1:{family:'gold',symbol:[engraving('M36 29H64L75 44L50 75L25 44Z',false,3),engraving('M36 29L42 44L50 75L58 44L64 29M25 44H75')]},
 gold10:{family:'gold',symbol:[engraving('M43 24H57L65 36L50 56L35 36ZM27 49H39L46 59L33 76L20 59ZM61 49H73L80 59L67 76L54 59Z',false,2.8),engraving('M43 24L50 56L57 24M27 49L33 76L39 49M61 49L67 76L73 49',false,1.3)]},
 gold30:{family:'gold',symbol:[engraving('M26 49H74V75H26ZM26 45Q26 31 40 31H60Q74 31 74 45ZM26 58H74',false,3),engraving('M45 53H55V64H45Z',true),engraving('M36 34V46M64 34V46M36 62V74M64 62V74')]},
 gold100:{family:'gold',symbol:[engraving('M25 76V37L50 23L75 37V76ZM34 70V43H66V70ZM23 80H77',false,2.8),engraving('M41 58L50 49L59 58L50 69Z',true),engraving('M39 35H61M50 17V12M24 26L20 22M76 26L80 22')]},
 // 出金节奏：雷光、彗星、星雨、连锁与相邻雷光，图案直接表达事件。
 one:{family:'early',symbol:[engraving('M55 23L32 52H47L40 78L70 43H54Z',true),engraving('M29 29L24 24M72 67L78 73M26 59H19M71 29H79')]},
 ten:{family:'early',symbol:[engraving(starMark(63,38,14),true),engraving('M51 43L24 69M56 50L39 75M44 37L22 53',false,3)]},
 fiveEarly:{family:'early',symbol:[engraving([[35,34,8],[63,29,7],[59,56,10],[33,64,6],[76,72,5]].map(v=>starMark(...v)).join(''),true),engraving('M32 45L24 53M56 70L49 77M73 35L66 42')]},
 pity:{family:'endurance',symbol:[engraving('M33 25H67M33 75H67M38 27C38 40 45 44 50 50C55 56 62 60 62 73M62 27C62 40 55 44 50 50C45 56 38 60 38 73',false,3),engraving('M43 34H57L50 44ZM42 68L50 59L58 68Z',true),engraving('M26 41H21M26 50H21M26 59H21')]},
 hard:{family:'endurance',symbol:[engraving('M28 77V34L50 23L72 34V77M25 78H75M36 76V39H64V76',false,3),engraving('M50 40V61M43 52L50 61L57 52'),engraving(starMark(50,69,6),true)]},
 streak:{family:'early',symbol:[engraving('M22 64L37 49M42 44L57 29M42 69L57 54M62 49L77 34',false,3),engraving([[30,55,7],[50,50,7],[70,45,7]].map(v=>starMark(...v)).join(''),true)]},
 consecutive:{family:'early',symbol:[engraving('M40 27L24 51H36L31 71L52 44H41ZM65 33L49 57H61L56 77L77 50H66Z',true),engraving('M37 19L42 14M71 24L77 19')]},
 comeback:{family:'recovery',symbol:[engraving('M50 74Q34 67 24 46L43 54L36 32L50 45L64 32L57 54L76 46Q66 67 50 74Z',false,2.7),engraving('M50 69V28M42 36L50 26L58 36',false,3),engraving('M35 80Q50 85 65 80')]},
 characters5:{family:'companions',symbol:[engraving([[50,36,7],[31,44,5],[69,44,5]].map(v=>ringMark(...v)).join('')),engraving('M38 71V60Q38 49 50 49Q62 49 62 60V71ZM23 69V59Q23 53 31 53M77 69V59Q77 53 69 53',false,2.7)]},
 characters10:{family:'companions',symbol:[engraving('M33 76V25H62L58 36L62 47H34M65 38H78L73 48L78 58H65V76',false,2.8),engraving(starMark(47,36,7),true),engraving('M24 79H75M25 39V69M20 56H25')]},
 weapons5:{family:'armory',symbol:[engraving('M30 24L59 53L53 59L24 30ZM70 24L76 30L47 59L41 53Z',true),engraving('M48 54L65 71M46 63L56 53M46 54L29 71M32 56L42 66',false,3)]},
 weapons10:{family:'armory',symbol:[engraving('M25 47H75M25 66H75M29 40V78M71 40V78',false,3),engraving('M38 28L42 23L46 28V54H38ZM54 28L58 23L62 28V54H54Z',true),engraving('M36 57H48M52 57H64M42 57V72M58 57V72')]},
 seven:{family:'devotion',symbol:[engraving('M50 31A19 19 0 1 1 49.99 31',false,2.7),engraving(Array.from({length:7},(_,j)=>{const a=-Math.PI/2+j*Math.PI*2/7;return starMark(50+27*Math.cos(a),50+27*Math.sin(a),4.5);}).join(''),true),engraving('M43 42H57L48 61',false,3)]},
 collab:{family:'otherworld',symbol:[engraving('M38 24L25 36V65L38 77M62 24L75 36V65L62 77',false,3.5),engraving('M42 35L58 35L63 50L58 65L42 65L37 50Z'),engraving('M27 72L73 28M25 66L27 72L34 72',false,2),engraving(starMark(50,50,8),true)]},
 weaponGold:{family:'armory',symbol:[engraving('M50 22L57 32V57L50 64L43 57V32Z',true),engraving('M36 62H64M50 64V79M45 79H55',false,3),engraving('M32 37L25 31M68 37L75 31M31 49H22M69 49H78')]},
 fourCollect:{family:'fourStar',symbol:[engraving('M41 30L50 23L59 30V63L50 76L41 63ZM27 38L35 35L39 40V62L34 69L27 61ZM61 40L65 35L73 38V61L66 69L61 62Z',false,2.7),engraving('M50 24V74M28 40L34 65M72 40L66 65',false,1.2)]},
 months:{family:'time',symbol:[engraving('M61 26A25 25 0 1 0 74 64A25 25 0 0 1 61 26Z',true),engraving(starMark(65,43,8),true),engraving('M29 77L26 82M39 80L38 86M50 81V87M61 80L62 86M71 76L74 81M78 69L83 72')]},
 upWin3:{family:'upVictory',symbol:[engraving('M24 50L29 69H71L76 50L62 57L50 43L38 57ZM30 75H70',false,3),engraving([[30,35,5],[50,29,6],[70,35,5]].map(v=>starMark(...v)).join(''),true)]},
 upWin5:{family:'upVictory',symbol:[engraving('M27 45L33 65H67L73 45L61 53L50 36L39 53ZM33 71H67',false,3),engraving([[29,34,4],[39,27,4],[50,22,4.5],[61,27,4],[71,34,4]].map(v=>starMark(...v)).join(''),true),engraving(laurel,false,1.8)]},
 upLoss3:{family:'adversity',symbol:[engraving('M46 27A24 24 0 0 0 28 61M54 73A24 24 0 0 0 72 39M42 30L46 27L43 22M58 70L54 73L57 78',false,2.7),engraving('M57 35L52 49L43 65L47 51ZM34 37L41 44L36 51L43 58',false,2.7),engraving('M18 41L23 37M17 51H23M20 62L25 65')]},
 afterPity:{family:'recovery',symbol:[engraving('M23 75L33 55L44 60L50 51L64 55L77 75ZM50 53L44 63L52 68L47 75',false,2.7),engraving(starMark(50,33,12),true),engraving('M28 42L22 39M72 42L78 39M50 15V11')]},
 twinStars:{family:'early',symbol:[engraving(starMark(35,43,13)+starMark(65,57,13),true),engraving('M23 62Q28 83 61 75M77 38Q72 17 39 25M51 27L39 25L44 35M49 73L61 75L56 65',false,2.4)]},
 upWin10:{family:'upVictory',symbol:[engraving('M50 24L72 32V51Q72 68 50 79Q28 68 28 51V32Z',false,3),engraving(starMark(50,49,13),true),engraving('M35 40V52Q35 62 42 66M65 40V52Q65 62 58 66',false,1.4)]},
 fiveCharacters10:{family:'companions',symbol:[engraving('M44 76V49M56 76V49M38 62V54Q38 43 50 43Q62 43 62 54V62',false,3),engraving(ringMark(50,32,7)),engraving([[24,35,5],[76,35,5],[24,61,5],[76,61,5],[50,82,4]].map(v=>starMark(...v)).join(''),true),engraving('M26 45V51M74 45V51')]},
 months12:{family:'time',symbol:[engraving(ringMark(50,50,23)),engraving(Array.from({length:12},(_,j)=>{const a=j*Math.PI/6;return 'M'+(50+28*Math.cos(a))+' '+(50+28*Math.sin(a))+'L'+(50+32*Math.cos(a))+' '+(50+32*Math.sin(a));}).join(''),false,2.3),engraving('M50 33V50L62 57',false,3),engraving(starMark(50,50,4),true)]},
 early4:{family:'early',symbol:[engraving('M24 60Q39 36 52 50Q65 65 78 40M24 68Q39 44 52 58Q65 73 78 48',false,1.4,.8),engraving([[28,48,7],[43,34,7],[59,61,7],[74,31,7]].map(v=>starMark(...v)).join(''),true),engraving('M31 62L26 70M55 32L50 40')]},
 consecutive2:{family:'early',symbol:[engraving('M34 28L21 50H31L27 66L45 43H34ZM52 33L39 55H49L45 71L63 48H52ZM70 38L57 60H67L63 76L81 53H70Z',true),engraving('M26 72Q48 83 73 79',false,1.7)]},
 afterPity3:{family:'recovery',symbol:[engraving('M22 76L32 58L44 63L51 54L65 58L78 76M51 55L45 65L52 71L49 77',false,2.5),engraving('M29 56Q50 32 71 56M24 48Q50 20 76 48M20 39Q50 9 80 39',false,2.2),engraving(starMark(50,28,8),true),engraving('M25 76L20 67L25 62M75 76L80 67L75 62',false,1.5)]},
 afterPity7:{family:'recovery',symbol:[engraving('M24 76L33 59L44 64L51 55L65 60L76 76M51 56L45 65L53 70L49 76',false,2.3),engraving('M27 53Q50 29 73 53M24 44Q50 18 76 44',false,2),engraving(starMark(50,31,10),true),engraving(Array.from({length:7},(_,j)=>{const a=Math.PI+(j+1)*Math.PI/8;return starMark(50+29*Math.cos(a),48+29*Math.sin(a),2.4);}).join(''),true)]},
 fiveCharacters20:{family:'companions',symbol:[engraving('M24 77H76M27 72H73M30 43L50 30L70 43ZM32 48V68M44 48V68M56 48V68M68 48V68',false,2.8),engraving([[25,29,4],[38,22,4],[50,18,4],[62,22,4],[75,29,4]].map(v=>starMark(...v)).join(''),true)]},
 upWin7:{family:'upVictory',symbol:[engraving('M27 45L33 64H67L73 45L61 53L50 35L39 53ZM33 70H67M38 76H62',false,2.8),engraving(Array.from({length:7},(_,j)=>{const a=Math.PI+(j+1)*Math.PI/8;return starMark(50+30*Math.cos(a),49+30*Math.sin(a),3.6);}).join(''),true),engraving(laurel,false,1.5)]},
 early5:{family:'early',symbol:[engraving('M38 55V44H62V55M35 57H65L70 73H30ZM43 73V80M57 73V80',false,2.5),engraving([[24,48,6],[30,29,6],[50,20,7],[70,29,6],[76,48,6]].map(v=>starMark(...v)).join(''),true),engraving('M23 61Q20 74 29 80M77 61Q80 74 71 80',false,1.5)]},
 consecutive3:{family:'early',symbol:[engraving('M50 25Q77 25 77 50Q77 75 50 75Q23 75 23 50Q23 25 50 25Z',false,1.5,.8),engraving([[50,28,10],[72,50,10],[50,72,10],[28,50,10]].map(v=>starMark(...v)).join(''),true),engraving('M44 44L56 56M56 44L44 56',false,2.8)]}
});
const achievementKeys=Object.freeze(Object.keys(achievementDesigns));
// 外框只表示稀有度：素面、盾框、翼章、桂冠、神话放射星环；中心保留独立内容。
const achievementFrames={
 common:[engraving('M26 10H74L90 26V74L74 90H26L10 74V26Z',true,1.6),engraving('M28 16H72L84 28V72L72 84H28L16 72V28Z',false,.9,.6)],
 rare:[engraving('M50 5L88 21V60Q87 80 50 95Q13 80 12 60V21Z',true,2),engraving('M50 12L82 26V60Q81 75 50 88Q19 75 18 60V26Z',false,1,.65)],
 epic:[engraving('M50 5L86 22V76L50 95L14 76V22Z',true,2),engraving('M50 12L80 26V72L50 88L20 72V26Z',false,1,.65),engraving('M13 28L5 35L9 61L14 69M87 28L95 35L91 61L86 69M8 37L13 42M9 48L14 53M92 37L87 42M91 48L86 53',false,2,.9)],
 legendary:[engraving('M50 6L78 15L91 40L86 71L65 91H35L14 71L9 40L22 15Z',true,2.2),engraving('M50 13L74 21L84 42L79 68L62 84H38L21 68L16 42L26 21Z',false,1,.7),engraving('M18 77Q3 56 12 30M82 77Q97 56 88 30M11 55L5 49M11 55L16 48M9 42L5 36M9 42L15 37M89 55L95 49M89 55L84 48M91 42L95 36M91 42L85 37M38 9L34 2L46 6L50 1L54 6L66 2L62 9',false,1.8)],
 mythic:[engraving('M50 3L60 13L75 11L82 25L96 31L93 48L98 61L85 72L80 87L63 88L50 98L37 88L20 87L15 72L2 61L7 48L4 31L18 25L25 11L40 13Z',true,2),engraving(ringMark(50,50,36),false,1.1,.85),engraving(Array.from({length:12},(_,j)=>{const a=j*Math.PI/6;return 'M'+(50+39*Math.cos(a))+' '+(50+39*Math.sin(a))+'L'+(50+44*Math.cos(a))+' '+(50+44*Math.sin(a));}).join('')+starMark(50,7,3)+starMark(50,93,3)+starMark(7,50,3)+starMark(93,50,3),false,1.6)]
};
function achievementArtwork(key){const design=achievementDesigns[key],rarity=Cabinet.rarity[key]||'common',color=ACHIEVEMENT_COLORS[rarity],symbol=design?.symbol||[engraving('M44 36Q44 28 51 28Q61 28 61 38Q61 44 50 49V57M50 66V70',false,3)],gradient=rarity==='mythic'?[[0,'#fff8e9'],[.22,'#a9e4df'],[.45,'#eee8ff'],[.65,'#bca7e0'],[.82,'#f8d7ac'],[1,'#fff8ef']]:[[0,mix(color,true)],[.4,color],[.65,mix(color,false)],[1,mix(color,true)]];return {color,rarity,gradient,baseFill:rarity==='mythic'?'#252b3a':mix(color,false),family:design?.family||'unknown',paths:[...achievementFrames[rarity],...symbol]};}
function achievementIcon(key){const a=achievementArtwork(key),id='cv-ach-'+key;return '<svg viewBox="0 0 100 100" aria-hidden="true" data-achievement="'+key+'"><defs><linearGradient id="'+id+'" '+(a.rarity==='mythic'?'gradientUnits="userSpaceOnUse" x2="100" y2="100"':'x2="1" y2="1"')+'>'+a.gradient.map(([stop,color])=>'<stop offset="'+stop+'" stop-color="'+color+'"/>').join('')+'</linearGradient></defs>'+a.paths.map((p,i)=>'<path d="'+p.d+'" fill="'+(p.fill?(i===0?a.baseFill:'url(#'+id+')'):'none')+'" stroke="'+(i===0||a.rarity==='mythic'?'url(#'+id+')':a.color)+'" stroke-width="'+p.width+'" opacity="'+p.opacity+'" stroke-linejoin="round"/>').join('')+'</svg>';}
function drawAchievement(ctx,key,x,y,size){const a=achievementArtwork(key);ctx.save();ctx.translate(x,y);ctx.scale(size/100,size/100);const g=ctx.createLinearGradient(0,0,100,100);for(const[stop,color]of a.gradient)g.addColorStop(stop,color);ctx.lineJoin='round';a.paths.forEach((p,i)=>{ctx.globalAlpha=p.opacity;ctx.lineWidth=p.width;ctx.fillStyle=i===0?a.baseFill:g;ctx.strokeStyle=i===0||a.rarity==='mythic'?g:a.color;const path=new Path2D(p.d);if(p.fill)ctx.fill(path);ctx.stroke(path);});ctx.restore();}

/* The same engraving primitives drive page SVG and exported Canvas. */
function frameArtwork(title,w=1000,h=430){
 const level=Math.max(0,geometry(title).level),u=Math.min(w,h)/400,m=12*u,c=18*u+level*4*u,out=[];
 const add=(d,opacity=.55,width=1,fill=false)=>out.push({d,opacity,width,fill});
 add('M'+m+' '+(m+c)+'V'+m+'H'+(w-m)+'V'+(h-m)+'H'+m+'Z',.55,1.2);
 if(!level){add('M'+(w/2-12*u)+' '+m+'L'+w/2+' '+(m+9*u)+'L'+(w/2+12*u)+' '+m,.5);return out;}
 // Each higher rank retains the lower engraving and adds real geometry.
 for(const sx of [1,-1])for(const sy of [1,-1]){
  const X=x=>sx===1?x:w-x,Y=y=>sy===1?y:h-y;
  const path=pts=>pts.map(([x,y],i)=>(i?'L':'M')+X(x)+' '+Y(y)).join('');
  add(path([[m,m+c],[m,m],[m+c,m]]),.9,1.6);
  if(level>=2)add(path([[m+6*u,m+20*u],[m+6*u,m+6*u],[m+20*u,m+6*u]]),.6,.9);
  if(level>=3){add(path([[m+10*u,m+c],[m+10*u,m+25*u],[m+25*u,m+10*u],[m+c,m+10*u]]),.7);add(path([[m+17*u,m+30*u],[m+30*u,m+17*u],[m+24*u,m+24*u],[m+17*u,m+30*u]]),.5,1,true);}
  if(level>=4)add(path([[m-4*u,m+32*u],[m-4*u,m-4*u],[m+32*u,m-4*u],[m+25*u,m+3*u],[m+3*u,m+3*u],[m+3*u,m+25*u]]),.85,1.2);
  if(level>=5){add(path([[m+8*u,m+45*u],[m+8*u,m+36*u],[m+36*u,m+8*u],[m+45*u,m+8*u]]),.85);for(let j=0;j<4;j++)add(path([[m+19*u+j*5*u,m+11*u],[m+24*u+j*5*u,m+6*u]]),.55,.7);}
  if(level>=6){add(path([[m-7*u,m+50*u],[m-7*u,m-7*u],[m+50*u,m-7*u]]),.65,.8);add(path([[m+11*u,m+43*u],[m+43*u,m+11*u],[m+35*u,m+11*u],[m+11*u,m+35*u],[m+11*u,m+43*u]]),.28,1,true);}
 }
 if(level>=7){add('M'+(w*.2)+' '+(m+4*u)+'H'+(w*.8),.6,.8);add('M'+(w*.2)+' '+(h-m-4*u)+'H'+(w*.8),.6,.8);}
 if(level>=8)for(const x of [w*.2,w*.8])add('M'+(x-6*u)+' '+m+'L'+x+' '+(m+8*u)+'L'+(x+6*u)+' '+m+'L'+x+' '+(m-8*u)+'Z',.8,1,true);
 // 棱面刻板与角部共鸣纹，高阶增加翼片和晶核。
 for(const sx of [1,-1])for(const sy of [1,-1]){
  const X=v=>sx===1?v:w-v,Y=v=>sy===1?v:h-v;
  const poly=pts=>pts.map(([x,y],i)=>(i?'L':'M')+X(x*u)+' '+Y(y*u)).join('')+'Z';
  add(poly([[7,55],[7,7],[55,7],[45,14],[15,14],[15,45]]),.19,1,true);
  add(poly([[18,41],[18,18],[41,18],[35,23],[24,23],[24,35]]),.38,.7,true);
  if(level>=3)add(poly([[5,64],[5,48],[12,41],[12,57]]),.7,1,true);
  if(level>=5)add(poly([[20,54],[20,43],[43,20],[54,20],[45,26],[26,45]]),.28,.8,true);
  if(level>=7)add(poly([[31,10],[48,1],[75,1],[64,8],[49,8],[41,13]]),.75,.9,true);
 }
 // 最高两阶的星轨翼片和冠饰不改变内容区尺寸。
 const center=w/2;
 for(const edge of [m,h-m]){
  const sign=edge===m?1:-1;
  for(const side of [-1,1]){
   const x=v=>center+side*v*u,y=v=>edge+sign*v*u;
   add('M'+x(55)+' '+y(0)+'L'+x(72)+' '+y(5)+'H'+x(112)+'L'+x(126)+' '+y(0),.7,1.1);
   if(level>=2)add('M'+x(79)+' '+y(10)+'H'+x(105)+'M'+x(88)+' '+y(13)+'H'+x(99),.65,.8);
   if(level>=3)for(let i=0;i<Math.min(level,6);i++){const k=140+i*14;add('M'+x(k)+' '+y(0)+'l'+side*5*u+' '+sign*5*u+'l'+side*5*u+' '+(-sign*5*u),.7,.8);}
   if(level>=5)add('M'+x(62)+' '+y(3)+'L'+x(80)+' '+y(17)+'L'+x(115)+' '+y(17)+'L'+x(126)+' '+y(7),.48,.8);
   if(level>=7){add('M'+x(16)+' '+y(4)+'L'+x(35)+' '+y(15)+'L'+x(66)+' '+y(22)+'L'+x(54)+' '+y(10)+'L'+x(83)+' '+y(5),.75,1.4);add('M'+x(40)+' '+y(18)+'L'+x(68)+' '+y(26)+'L'+x(61)+' '+y(18),.3,1,true);}
  }
  add('M'+(center-7*u)+' '+(edge+sign*3*u)+'L'+center+' '+(edge+sign*15*u)+'L'+(center+7*u)+' '+(edge+sign*3*u)+'L'+center+' '+(edge-sign*5*u)+'Z',.7,1,true);
  if(level>=8){add('M'+(center-28*u)+' '+(edge+sign*10*u)+'Q'+center+' '+(edge+sign*34*u)+' '+(center+28*u)+' '+(edge+sign*10*u),.9,1.2);add('M'+(center-12*u)+' '+edge+'L'+center+' '+(edge+sign*26*u)+'L'+(center+12*u)+' '+edge+'L'+center+' '+(edge-sign*7*u)+'Z',.8,1.3);}
 }

 add('M'+(center-9*u)+' '+m+'L'+center+' '+(m+9*u)+'L'+(center+9*u)+' '+m,.8,1.1);
 if(level>=3)for(const sign of [-1,1])add('M'+(center+sign*22*u)+' '+m+'H'+(center+sign*(40+level*12)*u),.65);
 if(level>=5){const b=h-m;add('M'+(center-56*u)+' '+b+'L'+(center-35*u)+' '+(b-7*u)+'H'+(center-13*u)+'L'+center+' '+(b-18*u)+'L'+(center+13*u)+' '+(b-7*u)+'H'+(center+35*u)+'L'+(center+56*u)+' '+b,.8,1.3);}
 if(level>=6){const inset=m+7*u;add('M'+inset+' '+inset+'H'+(w-inset)+'V'+(h-inset)+'H'+inset+'Z',.5,.7);add('M'+(center-44*u)+' '+m+'L'+(center-26*u)+' '+(m+8*u)+'L'+center+' '+(m+21*u)+'L'+(center+26*u)+' '+(m+8*u)+'L'+(center+44*u)+' '+m,.6);for(let j=0;j<7;j++){const xx=center+(j-3)*10*u;add('M'+xx+' '+(h-m-3*u)+'v'+(-4-(3-Math.abs(j-3))*2)*u,.65,.8);}}
 return out;
}
function frame(title,variant='desktop'){
 const mobile=variant==='mobile',w=mobile?400:1000,h=mobile?620:430,g=geometry(title),id='cv-frame-metal-'+title+'-'+variant,paint='url(#'+id+')';
 const stops=[[0,mix(g.color,true)],[.25,g.color],[.5,mix(g.color,false)],[.8,mix(g.color,true)],[1,g.color]];
 return '<svg class="cv-engraving cv-engraving-'+variant+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true" style="color:'+g.color+'"><defs><linearGradient id="'+id+'" x2="1" y2="1">'+stops.map(([offset,color])=>'<stop offset="'+offset+'" stop-color="'+color+'"/>').join('')+'</linearGradient></defs>'+frameArtwork(title,w,h).map(p=>'<path d="'+p.d+'" fill="'+(p.fill?paint:'none')+'" stroke="'+paint+'" stroke-width="'+p.width+'" opacity="'+p.opacity+'" vector-effect="non-scaling-stroke" stroke-linejoin="miter"/>').join('')+'</svg>';
}
function panelFrame(title){
 const level=Math.max(0,geometry(title).level),paths=[];
 for(const sx of [1,-1])for(const sy of [1,-1]){
  const X=x=>sx===1?x:1000-x,Y=y=>sy===1?y:430-y;
  for(let i=0;i<1+Math.floor(level/3);i++){const m=7+i*6,k=level===0?18:22+level*3;paths.push('M'+X(m)+' '+Y(m+k)+'V'+Y(m)+'H'+X(m+k));}
  if(level>=2)paths.push('M'+X(14)+' '+Y(38)+'L'+X(38)+' '+Y(14)+'H'+X(45));
  if(level>=5)paths.push('M'+X(13)+' '+Y(54)+'L'+X(22)+' '+Y(45)+'M'+X(45)+' '+Y(22)+'L'+X(54)+' '+Y(13));
  if(level>=7)paths.push('M'+X(28)+' '+Y(8)+'L'+X(39)+' '+Y(16)+'L'+X(57)+' '+Y(8));
 }
 return '<svg class="cv-panel-engraving" viewBox="0 0 1000 430" preserveAspectRatio="none" aria-hidden="true">'+paths.map(d=>'<path d="'+d+'" fill="none" stroke="currentColor" stroke-width=".8" vector-effect="non-scaling-stroke"/>').join('')+'</svg>';
}
function drawFrame(ctx,title,x,y,w,h){ctx.save();ctx.translate(x,y);const color=geometry(title).color,g=ctx.createLinearGradient(0,0,w,h);for(const [at,c]of [[0,mix(color,true)],[.25,color],[.5,mix(color,false)],[.8,mix(color,true)],[1,color]])g.addColorStop(at,c);ctx.strokeStyle=g;ctx.fillStyle=g;for(const p of frameArtwork(title,w,h)){ctx.globalAlpha=p.opacity;ctx.lineWidth=p.width;const d=new Path2D(p.d);if(p.fill)ctx.fill(d);ctx.stroke(d);}ctx.restore();}

return {ACHIEVEMENT_COLORS,panelFrame,frameArtwork,frame,drawFrame,COLORS,geometry,artwork,badge,drawBadge,achievementIcon,drawAchievement,achievementArtwork,achievementKeys};});

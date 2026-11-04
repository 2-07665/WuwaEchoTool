/* Difficulty labels are editorial metadata, never population unlock rates. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./convene-core.js'));else root.ConveneCabinet=factory(root.ConveneCore);})(globalThis,function(Core){
'use strict';
const tiers=['mythic','legendary','epic','rare','common'];
const groups={mythic:['weaponMiracle','upWin7','early5','consecutive3','afterPity7'],legendary:['characterRecovery','weaponArsenal','weaponFive','weaponQuickForge','pull3000','gold100','seven','fiveEarly','streak','consecutive','upWin5','twinStars','early4','consecutive2','afterPity3','fiveCharacters20'],epic:['characterVisitors','standardReunion','standardFourVault','weaponVariety','weaponSteadyGold','pull1000','gold30','comeback','characters10','weapons10','months','upWin3','upLoss3','upWin10','fiveCharacters10','months12'],rare:['standardDualStar','weaponPair','pull500','gold10','one','ten','pity','hard','characters5','weapons5','collab','fourCollect','afterPity'],common:['pull1','pull100','gold1','weaponGold']};
const rarity=Object.freeze(Object.fromEntries(tiers.flatMap(t=>groups[t].map(k=>[k,t]))));
function items(stats,scope='all'){const list=scope==='all'?Core.scopedAchievements(stats):scope==='featured'?Core.scopedAchievements(stats).filter(a=>a.scope!=='standard'):Core.scopedAchievements(stats,scope);return list.map((a,index)=>({...a,rarity:rarity[a.baseKey]||'common',index})).sort((a,b)=>tiers.indexOf(a.rarity)-tiers.indexOf(b.rarity)||(a.state==='unlocked'?0:1)-(b.state==='unlocked'?0:1)||a.index-b.index);}
function filterItems(list,{scope='',rarity:grade='',state=''}={}){return list.filter(a=>(!scope||a.scope===scope)&&(!grade||a.rarity===grade)&&(!state||(state==='unlocked'?a.state==='unlocked':a.state!=='unlocked')));}
return {tiers,rarity,items,filterItems};
});

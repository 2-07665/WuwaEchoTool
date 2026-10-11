/* 沿用原服务地址、请求签名和转换器；网络成功不等于用户已确认保存。 */
(function(root){
    'use strict';
    function create(api){
        const stages={0:'list',1:'detail',2:'bind',3:'refresh',6:'auth'};
        // 只保留阶段、分类及数字状态码，不把服务器原文或凭证带入错误对象。
        function failure(stage,reason,response,status){
            const error=Error('IMPORT_FAILED');
            error.importFailure={stage,reason,code:/^\d{1,8}$/.test(String(response?.code))?String(response.code):'',status:Number.isInteger(status)&&status>0?status:null};
            return error;
        }
        function check(response,stage,status){
            let data=response?.data;
            if(typeof data==='string'){try{data=JSON.parse(data);}catch(_){data=null;}}
            const msg=typeof response?.msg==='string'?response.msg:'';
            let reason;
            if(data?.geeTest===true||/验证码|驗證碼|captcha|geetest/i.test(msg))reason='verification';
            else if(/维护|維護|停机|停機|升级中|系統升級|系统升级/.test(msg))reason='maintenance';
            else if(/数据令牌.*失效|資料憑證.*失效/.test(msg))reason='dataToken';
            else if(/令牌.*(失效|过期|過期|为空)|token.*(expired|invalid)|登录.*(失效|过期)|未登录/i.test(msg))reason='credential';
            if(reason)throw failure(stage,reason,response,status);
            if(response?.success===false||(response?.code!=null&&![200,10902].includes(Number(response.code))))throw failure(stage,'rejected',response,status);
        }
        const request=(index,data,headers)=>new Promise((resolve,reject)=>{
            const stage=stages[index];
            api.ajax({url:api.host+api.methods[index],type:'POST',headers,data,dataType:'json',timeout:30000,
                success:response=>{try{check(response,stage);resolve(response);}catch(error){reject(error);}},
                error:(xhr,state)=>{
                    try{if(xhr?.responseJSON)check(xhr.responseJSON,stage,xhr.status);}catch(error){reject(error);return;}
                    reject(failure(stage,state==='timeout'?'timeout':state==='parsererror'?'format':xhr?.status?'http':'network',null,xhr?.status));
                }
            });
        });
        const parse=(r,stage)=>{
            try{
                const data=typeof r?.data==='string'?JSON.parse(r.data):r?.data;
                if(!data||typeof data!=='object')throw Error();
                return data;
            }catch(_){throw failure(stage,'format',r);}
        };
        async function bind(token){const result=await request(2,'',api.tokenHeaders(token));if(!result?.success)throw failure('bind','format',result);api.storage.setItem('kjq_token',token);}
        async function list(uid){
            if(!/^\d{9}$/.test(uid))throw Error('INVALID_UID');
            if(!api.storage.getItem('kjq_token'))throw Error('TOKEN_REQUIRED');
            const params={gameId:3,roleId:uid,serverId:'76402e5b20be2c39f095a152090afddc'};
            const auth=await request(6,{roleId:uid,serverId:params.serverId,forceRefresh:true},api.headers());
            const data=parse(auth,'auth');if(!data?.accessToken)throw failure('auth','format',auth);
            api.storage.setItem('kjq_bat',data.accessToken);
            const headers=api.headers(data.accessToken,false),refreshHeaders={...headers};delete refreshHeaders.token;
            await request(3,params,refreshHeaders);
            const result=parse(await request(0,params,headers),'list');if(!Array.isArray(result?.roleList))throw failure('list','format');return result.roleList;
        }
        async function detail(uid,record){
            if(!/^\d{9}$/.test(uid))throw Error('INVALID_UID');
            const params={gameId:3,roleId:uid,serverId:'76402e5b20be2c39f095a152090afddc',channelId:19,countryCode:1,id:record.gameRoleId};
            const headers=api.headers(api.storage.getItem('kjq_bat'),false);await request(3,params,headers);
            const data=parse(await request(1,params,headers),'detail');if(!Array.isArray(data?.chainList)||!Array.isArray(data?.phantomData?.equipPhantomList))throw failure('detail','format');
            const role=JSON.parse(JSON.stringify(record));role.level=data.level;role.ming=data.chainList.filter(c=>c.unlocked).length;
            if(data.weaponData?.weapon){role.weaponImg=data.weaponData.weapon.weaponIcon;role.weaponStar=data.weaponData.weapon.weaponStarLevel;role.weaponlevel=data.weaponData.level;role.weaponReson=data.weaponData.resonLevel;}
            role.skillList=(data.skillList||[]).slice(0,5).map(s=>({img:s.skill.iconUrl,level:s.level}));
            role.costList=(data.phantomData?.equipPhantomList||[]).filter(Boolean).map(e=>api.convert(e,role));return role;
        }
        return {bind,list,detail};
    }
    function formatError(error,t){
        const info=error.importFailure;
        if(!info)return t('workspace.'+(['INVALID_UID','TOKEN_REQUIRED','SOURCE_CHANGED','INVALID_DATA','INVALID_ECHO','READ_ONLY','IDENTITY','COST_LIMIT','SAVE_FAILED'].includes(error.message)?error.message:'IMPORT_FAILED'));
        return t('workspace.importFailure',{stage:t('workspace.importStage.'+info.stage),reason:t('workspace.importReason.'+info.reason)})
            +(info.code?' '+t('workspace.importCode',{code:info.code}):'')
            +(info.status?' HTTP '+info.status:'');
    }
    root.ImportService={create,formatError};
})(typeof globalThis!=='undefined'?globalThis:this);

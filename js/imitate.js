//当前正在被编辑的声骸
var currentCost = {
    "sumScore": 0,
    "propertyList": []
}
var tempurl = null;
//模拟词条库
var monick = [
    {"property": "暴击", "value": 0},
    {"property": "暴伤", "value": 1},
    {"property": "大攻击", "value": 2},
    {"property": "小攻击", "value": 6},
    {"property": "小生命", "value": 5},
    {"property": "小防御", "value": 7},
    {"property": "共鸣效率", "value": 4},
    {"property": "大防御", "value": 3},
    {"property": "大生命", "value": 2},
    {"property": "普攻伤害", "value": 2},
    {"property": "重击伤害", "value": 2},
    {"property": "技能伤害", "value": 2},
    {"property": "解放伤害", "value": 2}
]
$(function () {
    //初始化声骸选单默认加载Cost4
    loadCost("Cost4");
    //重新过滤Cost
    $("#mc-filter-value").change(() => {
        loadCost($(this).find("option:selected").val());
    });
    $("#mc-addcost").on("click", ".mcccost-reset", function () {
        $(".mcccost-reset").removeClass("mc-active");
        $(this).addClass("mc-active");
        tempurl = $(this).attr("imgcode");
    });
    $("#qd-btn2").click(() => {
        if (tempurl == null) {
            alert("请选择一个声骸。");
        } else {
            $("#shimg01").attr("src",  tempurl );
            $("#mc-addcost").modal("hide");
        }
    });

    //点击随机开启副词条
    $("#mc-kqct").click(() => {
        if (currentCost.propertyList.length > 4) {
            alert("词条已满5个，请重置再试");
            return;
        }
        //生成一个词条。
        let sjs = getRandomInt(0, 12);
        for (let i = 0; i < 5; i++) {
            if (sjs > 13) {
                sjs = 0;
            }
            if (currentCost.propertyList.length > 0) {
                let flag = false;//默认没重复
                currentCost.propertyList.forEach(item => {
                    if (item.property === monick[sjs].property) {
                        flag = true;//重复了
                        sjs++;
                    }
                });
                if (!flag) {
                    let yct = {"property": "", "value": ""};
                    yct.property = monick[sjs].property;
                    yct.value = fctValue[monick[sjs].value].values[getRandomInt(0, fctValue[monick[sjs].value].values.length - 1)];
                    currentCost.propertyList.push(yct);
                    renderList(null, null);
                    return;
                }
            } else {
                let yct = {"property": "", "value": ""};
                yct.property = monick[sjs].property;
                yct.value = fctValue[monick[sjs].value].values[getRandomInt(0, fctValue[monick[sjs].value].values.length - 1)];
                currentCost.propertyList.push(yct);
                renderList(null, null);
                return;
            }
        }
    });
    $("#mc-czct").click(() => {
        if (confirm("确定要重置吗？")) {
            currentCost.propertyList = [];
            renderList(null, null);
        }
    });
    //返回首页
    $(".mc-btn-backhome").click(() => {
        window.open("./index.html", "_self");
    });
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//加载渲染副词条列表,ct为新词条对象，yct为原词条
function renderList(ct, yct) {
    if (ct !== "" && ct != null && typeof (ct) != "undefined") {
        if (yct !== "" && yct != null && typeof (yct) != "undefined") {
            //原词条不为空，修改原词条
            currentCost.propertyList.forEach((item, index) => {
                if (item.property === yct.property && item.value === yct.value) {
                    //找到了该元素,覆盖原来的值
                    currentCost.propertyList[index].value = ct.value;
                    currentCost.propertyList[index].property = ct.property;
                }
            });
        } else {
            //原词条为null，默认为新增词条
            currentCost.propertyList.push(ct);
        }
    } else {
        //alert("传入的词条信息为空。");
        //直接重新加载
    }
    //重新加载该列表
    let res = "";
    if (currentCost.propertyList.length > 0) {
        currentCost.propertyList.forEach((item, index) => {
            res += `<tr>
                <th scope="row">` + (index + 1) + `</th>
                <td>` + item.property + `</td>
                <td>` + item.value + `</td>
            </tr>`;
        });
    } else {
        res = ` <tr>
                <td colspan="4">无副词条属性</td>
            </tr>`;
    }
    $("#chitiao-list").html(res);
    //词条概率计算
    countProbability();
}

//校验词条是否重复,name-词条名 true-重复
function checkRepeat(name) {
    let fl = false;
    currentCost.propertyList.forEach(item => {
        if (item.property === name) {
            fl = true;
        }
    });
    return fl;
}

//词条概率计算：
function countProbability() {
    let syqct = ["暴击", "暴伤", "大攻击", "小攻击", "大生命", "小生命", "大防御", "小防御", "共鸣效率", "普攻伤害", "重击伤害", "技能伤害", "解放伤害"];//剩余全词条
    let lastNum = 96;
    let sfcts = 28;//剩余可出生防数
    //0.总词条数104个，排除已出词条类的个数
    if (currentCost.propertyList.length > 0) {
        currentCost.propertyList.forEach(item => {
            syqct = syqct.filter(value => {
                return value !== item.property;
            });
            if (item.property === "暴击") {
                lastNum = lastNum - 8;
            } else if (item.property === "暴伤") {
                lastNum = lastNum - 8;
            } else if (item.property === "大攻击") {
                lastNum = lastNum - 8;
            } else if (item.property === "小防御") {
                sfcts = sfcts - 4;
                lastNum = lastNum - 4;
            } else if (item.property === "大防御") {
                sfcts = sfcts - 8;
                lastNum = lastNum - 8;
            } else if (item.property === "小生命") {
                sfcts = sfcts - 8;
                lastNum = lastNum - 8;
            } else if (item.property === "大生命") {
                sfcts = sfcts - 8;
                lastNum = lastNum - 8;
            } else if (item.property === "共鸣效率") {
                lastNum = lastNum - 8;
            } else if (item.property === "小攻击") {
                lastNum = lastNum - 4;
            } else {
                lastNum = lastNum - 8;
            }
        });
    }
    let bjzlv = 0;//出暴击总概率
    let bszlv = 0;//出暴伤总概率
    //1.计算剩余出暴击概率
    let wln = [];
    let res = "";
    let syfbjjd = 0;
    let gl = 0;
    if (!syqct.includes("暴击")) {
        $("#gl-bj").html("已出");
    } else {
        for (let i = 0; i < (5 - currentCost.propertyList.length); i++) {
            syfbjjd = lastNum * (syqct.length - i) / syqct.length;
            if (i === 0) {
                gl = backMaxNum("暴击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                bjzlv = parseFloat(bjzlv) + parseFloat(gl);
            } else if (i > 0) {
                //第二轮概率-剩余非暴击可能个数
                gl = backMaxNum("暴击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                if (i === 1) {
                    bjzlv = parseFloat(bjzlv) + (100 - wln[0]) * gl / 100;
                }
                if (i === 2) {
                    bjzlv = parseFloat(bjzlv) + (100 - wln[0]) * (100 - wln[1]) * gl / 10000;
                }
                if (i === 3) {
                    bjzlv = parseFloat(bjzlv) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * gl / 1000000;
                }
                if (i === 4) {
                    bjzlv = parseFloat(bjzlv) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * (100 - wln[3]) * gl / 100000000;
                }
            }
            res += "(" + (i + 1) + ")" + gl + "% | ";
            wln.push(gl);
        }
        res += "(总)" + bjzlv.toFixed(2) + "%";
        $("#gl-bj").html(res);
    }
    //2.计算剩余出爆伤概率
    if (!syqct.includes("暴伤")) {
        $("#gl-bs").html("已出");
    } else {
        wln = [];
        res = "";
        syfbjjd = 0;
        gl = 0;
        for (let i = 0; i < (5 - currentCost.propertyList.length); i++) {
            syfbjjd = lastNum * (syqct.length - i) / syqct.length;
            if (i === 0) {
                gl = backMaxNum("暴击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                bszlv = parseFloat(bszlv) + parseFloat(gl);
            } else if (i > 0) {
                //第二轮概率-剩余非暴击可能个数
                gl = backMaxNum("暴击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                if (i === 1) {
                    bszlv = parseFloat(bszlv) + (100 - wln[0]) * gl / 100;
                }
                if (i === 2) {
                    bszlv = parseFloat(bszlv) + (100 - wln[0]) * (100 - wln[1]) * gl / 10000;
                }
                if (i === 3) {
                    bszlv = parseFloat(bszlv) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * gl / 1000000;
                }
                if (i === 4) {
                    bszlv = parseFloat(bszlv) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * (100 - wln[3]) * gl / 100000000;
                }
            }
            res += "(" + (i + 1) + ")" + gl + "% | ";
            wln.push(gl);
        }
        res += "(总)" + bszlv.toFixed(2) + "%";
        $("#gl-bs").html(res);
    }
    //3.计算剩余出大攻击概率
    if (!syqct.includes("大攻击")) {
        $("#gl-gj").html("已出");
    } else {
        wln = [];
        res = "";
        syfbjjd = 0;
        gl = 0;
        let dgjzgl = 0;
        for (let i = 0; i < (5 - currentCost.propertyList.length); i++) {
            syfbjjd = lastNum * (syqct.length - i) / syqct.length;
            if (i === 0) {
                gl = backMaxNum("大攻击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                dgjzgl = parseFloat(dgjzgl) + parseFloat(gl);
            } else if (i > 0) {
                //第二轮概率-剩余非暴击可能个数
                gl = backMaxNum("大攻击") * 100 / syfbjjd;
                gl = gl.toFixed(2);
                if (i === 1) {
                    dgjzgl = parseFloat(dgjzgl) + (100 - wln[0]) * gl / 100;
                }
                if (i === 2) {
                    dgjzgl = parseFloat(dgjzgl) + (100 - wln[0]) * (100 - wln[1]) * gl / 10000;
                }
                if (i === 3) {
                    dgjzgl = parseFloat(dgjzgl) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * gl / 1000000;
                }
                if (i === 4) {
                    dgjzgl = parseFloat(dgjzgl) + (100 - wln[0]) * (100 - wln[1]) * (100 - wln[2]) * (100 - wln[3]) * gl / 100000000;
                }
            }
            res += "(" + (i + 1) + ")" + gl + "% | ";
            wln.push(gl);
        }
        res += "(总)" + dgjzgl.toFixed(2) + "%";
        $("#gl-gj").html(res);
    }
    //4双爆达成概率
    if (!syqct.includes("暴击") && !syqct.includes("暴伤")) {
        $("#gl-sb").html("已达成");
    } else {
        if (!syqct.includes("暴击")) {
            //暴击未达成
            $("#gl-sb").html(bszlv.toFixed(2) + "%");
        }
        if (!syqct.includes("暴伤")) {
            //暴伤未达成
            $("#gl-sb").html(bjzlv.toFixed(2) + "%");
        }
        //均未达成且空位>1
        if (syqct.includes("暴伤") && syqct.includes("暴击")) {
            if (currentCost.propertyList.length < 4) {
                let zgls = bszlv * bjzlv / 100;
                $("#gl-sb").html(zgls.toFixed(2) + "%");
            } else {
                $("#gl-sb").html("0.00%");
            }
        }

    }
    //5下次生防概率
    if (sfcts > 0) {
        let sfgl = sfcts * 100 / lastNum;
        $("#gl-sf").html(sfgl.toFixed(2) + "%");
    } else {
        $("#gl-sf").html("0.00%");
    }
}

//加载声骸选单-cst-Cost名例如Cost4
function loadCost(cst) {
    let rest = "";
    costList.forEach(item => {
        if (item.type === cst) {
            if(item.imgCode.length>6){
                rest += `<div imgcode="` + item.imgCode + `"  class="mc-cost-val mcccost-reset">
                            <img class="mc-cost-img" src="` + item.imgCode + `" alt="cost">
                        </div>`;
            }else{
                let gsxb = parseInt(item.imgCode)-1;
                rest += `<div imgcode="` + item.imgCode + `"  class="mc-cost-val mcccost-reset">
                            <img class="mc-cost-img" src="` + costList[gsxb].imgCode + `" alt="cost">
                        </div>`;
            }

        }
    });
    $('.mc-fillcost-list').html(rest);
}

//传入词条名称，返回该词条总数值个数,mc-词条名称
function backMaxNum(mc) {
    if (mc === "小攻击" || mc === "小防御") {
        return 4;
    } else if (mc === "暴击" || mc === "暴伤" || mc === "大防御" || mc === "共鸣效率" || mc === "小生命") {
        return 8;
    } else {
        return 8;
    }
}
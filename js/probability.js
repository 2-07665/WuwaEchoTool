//当前正在被编辑的声骸
var currentCost = {
    "sumScore": 0,
    "propertyList": []
}
var currentRole = 0;
var tempRole = null;
let yct = {"property": "", "value": ""};
$(function () {
    //初始化角色选单
    let roleRes = `<div class="mc-filter">角色过滤：
                        <select id="mc-filter-select" class="form-control mc-select">
                            <option value="s5" selected>五星角色</option>
                            <option value="s4">四星角色</option>
                        </select>
                    </div><div class="mc-filter-role5">`;
    let ress4 = `<div class="mc-filter-role4 mc-hide">`
    roleList.forEach(item => {
        if (item.star === 5) {
            roleRes += `<div data-role-val="` + item.id + `" class="mc-role ` + item.cls + `"></div>`;
        } else {
            ress4 += `<div data-role-val="` + item.id + `" class="mc-role ` + item.cls + `"></div>`;
        }
    });
    roleRes += "</div>";
    ress4 += "</div>";
    roleRes += ress4;
    //切换选择角色星级
    $(".modal-body-a").on("change", "#mc-filter-select", function () {
        if ($("#mc-filter-select option:selected").val() === "s5") {
            $(".mc-filter-role5").removeClass("mc-hide");
            $(".mc-filter-role4").addClass("mc-hide");
        } else {
            $(".mc-filter-role4").removeClass("mc-hide");
            $(".mc-filter-role5").addClass("mc-hide");
        }
    });
    $("#mc-addrole .modal-body-a").html(roleRes);
    $("#shimg").on("click", "#shimg01", function () {
        $("#mc-addrole").modal("show");
    });
    //点击添加角色
    $("#mc-addrole .mc-role").click(function () {
        $(".mc-role").removeClass("mc-active");
        $(this).addClass("mc-active");
        currentRole = $(this).attr("data-role-val");
    });
    //保存角色
    $('#qd-btn').click(() => {
        if (currentRole < 1) {
            alert("请先选择一个角色。");
            return;
        }
        // 执行确定按钮的操作,从角色JSON查出对应编号插入列表
        roleList.forEach(item => {
            if (item.id == currentRole) {
                //生成一个角色对象
                tempRole = {
                    "roleId": Date.now(),
                    "isImport": false,
                    "level": 0,
                    "roleListId": item.id,
                    "totalScore": 0.00,
                    "name": item.name,
                    "cls": item.cls.replace("mcr-", ""),
                    "dbCritNum": 0,
                    "attackNum": 0,
                    "costList": []
                }
                //将角色头像回显到左上角
                $("#shimg").html(`<img id="shimg01" class="mc-character-imgCost" src="image/role/` + tempRole.cls + `.png" alt="选择的角色">`);
                renderList(null, null);
                $(".mc-role-cel").addClass("mc-hide");
            }
        });
        $('#mc-addrole').modal('hide');
    });
    //下拉选择联动
    $("#mc-words-name").change(() => {
        let dqz = $(this).find("option:selected").val();
        let gzid = [];
        if (dqz == "暴击") {
            gzid = fctValue[0].values;
        }
        if (dqz == "暴伤") {
            gzid = fctValue[1].values;
        }
        if (dqz == "大攻击" || dqz == "大生命" || dqz == "普攻伤害" || dqz == "重击伤害" || dqz == "技能伤害" || dqz == "解放伤害") {
            gzid = fctValue[2].values;
        }
        if (dqz == "大防御") {
            gzid = fctValue[3].values;
        }
        if (dqz == "共鸣效率") {
            gzid = fctValue[4].values;
        }
        if (dqz == "小生命") {
            gzid = fctValue[5].values;
        }
        if (dqz == "小攻击") {
            gzid = fctValue[6].values;
        }
        if (dqz == "小防御") {
            gzid = fctValue[7].values;
        }
        //初始化联动select
        let ress = ``;
        gzid.forEach((item, index) => {
            if (index === 0) {
                ress += `<option selected value="` + item + `">` + item + `</option>`;
            } else {
                ress += `<option value="` + item + `">` + item + `</option>`;
            }
        });
        $("#mc-words-value").html(ress);
    }).trigger("change");
    //点击添加副词条
    $(".mc-cost-addbtn").click(() => {
        if (tempRole == null || typeof (tempRole) === "undefined") {
            alert("因为计分与角色伤害分布关联，请先选择角色。");
            $("#mc-addrole").modal("show");
        } else {
            $("#mc-addwords").modal("show");
        }
        $("#qd-btn5").addClass("mc-hide");
        $("#qd-btn3").removeClass("mc-hide");
    });
    //添加词条保存
    $('#qd-btn3').click(() => {
        if (currentCost.propertyList.length === 5) {
            $("#mc-addwords").modal("hide");
            alert("副词条已满5条，请尝试修改或删除。");
            return;
        }
        //获取词条属性与值
        let sx = $("#mc-words-name").val();
        let sxv = $("#mc-words-value").val();
        if (checkRepeat(sx)) {
            alert("已选择了相同属性，不允许重复");
        } else {
            renderList({"property": sx, "value": sxv}, null);
        }
        $('#mc-addwords').modal('hide');
    });
    //修改词条
    $("#fct-list").on("click", ".mc-edit-fct", function () {
        //拿到原属性和值
        let sx = $(this).parent().attr("data-sx");
        let sxv = $(this).parent().attr("data-sxv");
        $("#qd-btn3").addClass("mc-hide");
        $("#qd-btn5").removeClass("mc-hide");
        $("#mc-words-name").val(sx).trigger("change");
        $("#mc-words-value").val(sxv);
        yct.property = sx;
        yct.value = sxv;
        $('#mc-addwords').modal('show');
    });
    //修改保存词条
    $('#qd-btn5').click(() => {
        //获取新词条属性与值
        let sx = $("#mc-words-name").val();
        let sxv = $("#mc-words-value").val();
        //原词条没变或不重复
        if (sx === yct.property || !checkRepeat(sx)) {
            renderList({"property": sx, "value": sxv}, yct);
        } else {
            alert("属性重复。");
            return;
        }
        $('#mc-addwords').modal('hide');
    });

    //删除词条
    $("#fct-list").on("click", ".mc-del-fct", function () {
        //拿到属性和值
        let sx = $(this).parent().attr("data-sx");
        let sxv = $(this).parent().attr("data-sxv");
        if (confirm("确认要删除副词条【" + sx + "-" + sxv + "】吗？")) {
            currentCost.propertyList = currentCost.propertyList.filter(function (value) {
                return !(value.property === sx && value.value === sxv);
            });
            renderList(null, null);
        }
    });

    //返回首页
    $(".mc-btn-backhome").click(() => {
        window.open("./index.html", "_self");
    });
});

//计算声骸总分数
function countTotalScores() {
    let s1 = $("#zhupf").html();
    let s2 = $("#listScore").html();
    if (typeof (s1) === "undefined") {
        s1 = 0;
    }
    if (typeof (s2) === "undefined") {
        s2 = 0;
    }
    let hjscore = parseFloat(s1) + parseFloat(s2);
    hjscore = hjscore.toFixed(2);
    currentCost.sumScores = hjscore;
    $("#zonpf").html(hjscore);
    //获取剩余期望得分
    let qwScore = $("#gl-ysqw").html();
    //加总得到期望总分
    hjscore = parseFloat(hjscore) + parseFloat(qwScore);
    $("#z-qw").html(hjscore.toFixed(2));
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
    let sumScore = 0;
    if (currentCost.propertyList.length > 0) {
        currentCost.propertyList.forEach((item, index) => {
            let sc = countScores(item, tempRole);
            sumScore += parseFloat(sc);
            let xh = index + 1;
            res += `<tr>
                <th scope="row">` + xh + `</th>
                <td>` + item.property + `</td>
                <td>` + item.value + `</td>
                <td>` + sc + `</td>
                <td data-sx="` + item.property + `" data-sxv="` + item.value + `"><a class="mc-edit-fct" href="javascript:void(0)">修改</a>|<a
                    class="mc-del-fct" href="javascript:void(0)">删除</a></td>
            </tr>`;
        });
        //合计计分
        res += `<tr>
            <th scope="row">+</th>
            <th></th>
            <th>计分合计：</th>
            <th id="listScore">` + sumScore.toFixed(2) + `</th>
            <th></th>
        </tr>`;
    } else {
        res = ` <tr>
                <th scope="row">1</th>
                <td colspan="4">无副词条属性</td>
            </tr>
            <tr>
                <th scope="row">+</th>
                <th></th>
                <th>计分合计：</th>
                <th id="listScore">0.00</th>
                <th></th>
            </tr>`;
    }
    $("#chitiao-list").html(res);
    //初始化合计总得分
    countTotalScores();
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

    //6.得分期望，先计算剩余未开词条总得分
    let sumScoreR = 0;
    fctValueHJ.forEach(item => {
        if (syqct.includes(item.property)) {
            sumScoreR = parseFloat(sumScoreR) + parseFloat(countScores(item, tempRole));
        }
    });

    let sumP = sumScoreR * (5 - currentCost.propertyList.length) / lastNum;
    $("#gl-ysqw").html(sumP.toFixed(2));
    //获取已获得的总得分
    let alreadyScore = $("#zonpf").html();
    //加总得到期望总分
    sumP = sumP + parseFloat(alreadyScore);
    $("#zonpf").html(sumP.toFixed(2));
    countGouliang();
}

//根据当前强化级数计算狗粮消耗
function countGouliang() {
    let ls = 0
    if (!currentCost.propertyList.length > 0) {
        return;
    }
    let cx = costExperance[currentCost.propertyList.length - 1];
    $("#ytr01").html(cx.gouliang + "个")
    $("#ytr02").html(cx.dakong + "个")

    $("#hs01").html(cx.gouliang * 0.7 + "个")
    $("#hs02").html(cx.dakong * 0.3 + "个");
    $("#ss01").html(cx.gouliang * 0.3 + "个")
    $("#ss02").html(cx.dakong * 0.7 + "个");
    ls = costExperance[4].gouliang - cx.gouliang;
    ls = ls.toFixed(2);
    $("#lm01").html(ls + "个");
    ls = costExperance[4].dakong - cx.dakong;
    $("#lm02").html(ls + "个");
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
function pulaoPJ() {
    let bys = {"b01": 0, "b02": 0, "b03": 0, "b04": 0};
    let sumScore = 0;
    let avgScore = 0;
    let fbrs = 0;
    curData.role.forEach(item => {
        if (typeof (item.isImport) !== "undefined" && item.isImport) {
            fbrs++;
            if (item.totalScore > 90) {
                bys.b01 = bys.b01 + 1;
            } else if (item.totalScore > 80) {
                bys.b02 = bys.b02 + 1;
            } else if (item.totalScore > 70) {
                bys.b03 = bys.b03 + 1;
            } else if (item.totalScore > 60) {
                bys.b04 = bys.b04 + 1;
            }
            sumScore = parseFloat(sumScore) + parseFloat(item.totalScore);
        }
    });
    if (fbrs !== 0) {
        avgScore = parseFloat(sumScore) / fbrs;
    } else {
        curData.role.forEach(item => {
            if (typeof (item.isImport) === "undefined" || !item.isImport) {
                fbrs++;
                if (item.totalScore > 90) {
                    bys.b01 = bys.b01 + 1;
                } else if (item.totalScore > 80) {
                    bys.b02 = bys.b02 + 1;
                } else if (item.totalScore > 70) {
                    bys.b03 = bys.b03 + 1;
                } else if (item.totalScore > 60) {
                    bys.b04 = bys.b04 + 1;
                }
                sumScore = parseFloat(sumScore) + parseFloat(item.totalScore);
            }
        });
        if (fbrs !== 0) {
            avgScore = parseFloat(sumScore) / fbrs;
        }
    }
    sumScore = sumScore.toFixed(2);
    avgScore = avgScore.toFixed(2);
    let ts = getDaysDiff(new Date("2024/5/23"), new Date());
    //开始根据练度筛选评价，总分500+均分75+，总分460+均分70+，总分430均分65，总分400均分60，总分360，总分320，总分280，总分240，总分180，总分120
    let pj;
    if (sumScore > 1200 && avgScore > 75) {
        pj = pulaoSay[0];
    } else if (sumScore > 1100 && avgScore > 70) {
        pj = pulaoSay[1];
    } else if (sumScore > 1000 && avgScore > 65) {
        pj = pulaoSay[2];
    } else if (sumScore > 900 && avgScore > 62) {
        pj = pulaoSay[3];
    } else if (sumScore > 800 && avgScore > 60) {
        pj = pulaoSay[4];
    } else if (sumScore > 700 && avgScore > 55) {
        pj = pulaoSay[5];
    } else if (sumScore > 600) {
        pj = pulaoSay[6];
    } else if (sumScore > 500) {
        pj = pulaoSay[7];
    } else if (sumScore > 400) {
        pj = pulaoSay[8];
    } else if (sumScore > 350) {
        pj = pulaoSay[9];
    } else if (sumScore > 300) {
        pj = pulaoSay[10];
    } else if (sumScore > 250) {
        pj = pulaoSay[11];
    } else if (sumScore > 200) {
        pj = pulaoSay[12];
    } else if (sumScore > 150) {
        pj = pulaoSay[13];
    } else if (sumScore > 100) {
        pj = pulaoSay[14];
    } else {
        pj = pulaoSay[15];
    }
    let percent = sumScore * 100 / 1200;
    percent = percent.toFixed(2);
    if (percent > 100) {
        percent = 100;
    }
    //开始回填数据
    $(".mc-box-evaluate-left").attr("title", pj.title).attr("data-original-title", pj.title);
    $('[data-toggle="tooltip"]').tooltip('show');
    $(".mc-box-evaluate-img").attr("src", "image/bqb/" + pj.img + ".png");
    $("#userPJ").html(pj.dj);
    $("#by01").html(bys.b01 + "个");
    $("#by02").html(bys.b02 + "个");
    $("#by03").html(bys.b03 + "个");
    $("#by04").html(bys.b04 + "个");
    $("#pj-words").html(pj.say + `开服至今 <span class="font-color font-color-01">` + ts + `</span>天，你一共毕业了<span class="font-color font-color-02"> ` + (bys.b01 + bys.b02 + bys.b03 + bys.b04) + ` </span>套声骸，合计评分<span class="font-color font-color-03">` + sumScore + `</span>
                分，平均每个角色练度为<span class="font-color font-color-04">` + avgScore + `</span>分，已经超越了<span class="font-color font-color-05"> ` + percent + `% </span>的玩家，评估你的练度为<span class="font-color font-color-07">【` + pj.dj + `】</span>，现在蒲牢我任命你为<span class="font-color font-color-06"> 【` + pj.ps + `】 </span>`);

}


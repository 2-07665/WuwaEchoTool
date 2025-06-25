var curData;
$(function () {
    curData = getDataFromCache("mcData");
    //初始化声骸选单默认加载Cost4
    loadCost("Cost4");
    //重新过滤Cost
    $("#mc-filter-value").change(function () {
        loadCost($(this).find("option:selected").val());
    });
    //初始化声骸列表
    renderCostList(curData.unusedEchoes);
    //选择声骸
    $("#mc-addcost").on("click", ".mcccost-reset", function () {
        $(".mcccost-reset").removeClass("mc-active");
        $(this).addClass("mc-active");
        currentCostId = $(this).attr("data-id");
    });
    //添加保存声骸
    $('#qd-btn2').click(() => {
        // 判断是否选中了一个声骸
        if (currentCostId === "000") {
            alert("请先选择一个声骸。");
            return;
        }
        // 执行确定按钮的操作
        let currentCost = {
            "costId": Date.now(),
            "costListId": currentCostId,
            "name": costList[currentCostId - 1].name,
            "type": costList[currentCostId - 1].type,
            "imgCode": costList[currentCostId - 1].imgCode,
            "suite": null,
            "mainAtrri": null,
            "sumScores": 0.00,
            "propertyList": []
        }

        if(curData.unusedEchoes == null || typeof(curData.unusedEchoes) == "undefined"){
            curData.unusedEchoes = [];
        }
        curData.unusedEchoes.push(currentCost);
        saveDataToCache(curData);
        renderCostList(curData.unusedEchoes);
        $('.mc-cost-list-null').addClass('mc-hide');
        $('#mc-addcost').modal('hide');
    });
    //点击跳转到声骸编辑页 - 使用事件委托
    $(document).on("click", ".mc-unused-cost-img", function () {
        window.open("./costedit.html?roleid=0&costid=" + $(this).parent().parent().attr("data-id"), "_self");
    });
    //点击删除声骸 - 使用事件委托
    $(document).on("click", ".mc-cost-delete", function () {
        if (!confirm("确定要删除吗？")) {
            return false;
        }
        curData.unusedEchoes = curData.unusedEchoes.filter(item => {
            return item.costId != $(this).attr("data-id");
        });
        saveDataToCache(curData);
        $(this).parent().remove();
        //重新渲染声骸列表
        renderCostList(curData.unusedEchoes);
    });
    //返回首页
    $(".mc-btn-backhome").click(() => {
        window.open("./index.html", "_self");
    });
    
});


groupedBarChart = function (data, bigGroup, subGroup, yAxis, svgID, h, w) {
    var margin = {
        top: 50,
        right: 70,
        bottom: 100,
        left: 100
    };
    $(svgID).width(w);
    $(svgID).height(h);

    var svg = dimple.newSvg(svgID, '100%', '100%');
    var myChart = new dimple.chart(svg, data);

    myChart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = myChart.addCategoryAxis("x", [bigGroup, subGroup]);
    if (yAxis == "count") {
        myChart.addMeasureAxis("y", 'Count');
    }
    else {
        myChart.addMeasureAxis("y", yAxis);
    }

    myChart.addSeries(subGroup, dimple.plot.bar);
    myChart.addLegend('25%', '3%', '70%', 20, "right");
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longetsLabel(xAxisLabels[0]);
    if (longestLabel > 10) {
        var labelSizeApprx = longestLabel * 5;
        var svgHeight = $(svgID).height();
        $(svgID).height(svgHeight + labelSizeApprx);
    }

    var chartSvg = myChart.svg[0][0];
    document.getElementById('chartEmbedTxt').value = chartSvg.outerHTML;

};

var longetsLabel = function (nodeList) {
    var longest = 0;
    nodeList.forEach(function (n) {
        if (n.innerHTML.length > longest) {
            longest = n.innerHTML.length;
        }
    });

    return longest;
};
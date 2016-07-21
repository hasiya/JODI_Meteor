barChartHeaders = function (data, property, xLabel, svgID, h, w) {

    var margin = {
        top: 10,
        right: 70,
        bottom: 100,
        left: 50
    };

    $(svgID).width(w);
    $(svgID).height(h);

    var svg = dimple.newSvg(svgID, w, h);
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(margin.left, margin.top, w - margin.right, h - margin.bottom);
    var x = myChart.addCategoryAxis("x", xLabel);
    myChart.addMeasureAxis("y", property);
    myChart.addSeries(null, dimple.plot.bar);
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longetsLabel(xAxisLabels[0]);
    if (longestLabel >= 10) {
        var labelSizeApprx = longestLabel * 5;
        var svgHeight = $(svgID).height();
        $(svgID).height(svgHeight + labelSizeApprx);
    }
};

barChartCounts = function (data, property, svgID, h, w) {

    var margin = {
        top: 10,
        right: 70,
        bottom: 100,
        left: 50
    };
    $(svgID).width(w);
    $(svgID).height(h);

    var svg = dimple.newSvg(svgID, '100%', '100%');
    var myChart = new dimple.chart(svg, data);
    // myChart.setBounds(60, 30, 510, 305)
    // myChart.setBounds(margin.left, margin.top, w - margin.right, h - margin.bottom);
    myChart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    var x = myChart.addCategoryAxis("x", property);
    x.title = property;
    myChart.addMeasureAxis("y", "Count");
    myChart.addSeries(null, dimple.plot.bar);
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longetsLabel(xAxisLabels[0]);
    if (longestLabel > 10) {
        var labelSizeApprx = longestLabel * 5;
        var svgHeight = $(svgID).height();
        $(svgID).height(svgHeight + labelSizeApprx);
    }

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
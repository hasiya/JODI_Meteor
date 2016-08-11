/**
 * Created by Rajitha Hasith on 11/07/2016.
 * This file contains the bar chart visualisation functions.
 */


/**
 * This function draws bar charts with numerical column in the y axis.
 * the function uses dimple.js to draw the charts.
 *
 * Doc: https://github.com/PMSI-AlignAlytics/dimple/wiki
 *
 * @param data
 * the data object, which contains all the data.
 *
 * @param property
 * The property variable, which is the the y axis values.
 *
 * @param xLabel
 * The x axis values.
 *
 * @param svgID
 * the element that draw the chart in.
 *
 * @param h
 * Height of the chart.
 *
 * @param w
 * Width of the chart.
 *
 * @param Data_Source
 * Data source, which will display in the chart.
 */
barChartHeaders = function (data, property, xLabel, svgID, h, w, Data_Source) {

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
    var x = myChart.addCategoryAxis("x", xLabel);
    myChart.addMeasureAxis("y", property);
    myChart.addSeries(null, dimple.plot.bar);
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longest_label(xAxisLabels[0]);
    if (longestLabel >= 10) {
        var labelSizeApprx = longestLabel * 5;
        var svgHeight = $(svgID).height();
        $(svgID).height(svgHeight + labelSizeApprx);
    }

    svg.append("text")
        .attr("x", w / 2 + w / 5)
        .attr("y", h)
        .text("Data Source: " + Data_Source);

    var chartSvg = myChart.svg[0][0];
    document.getElementById('chartEmbedTxt').value = chartSvg.outerHTML;


};

/**
 * This function draws chart with value frequency of specific property in the data object.
 *
 * Doc: https://github.com/PMSI-AlignAlytics/dimple/wiki
 *
 * @param data
 * @param property
 * @param svgID
 * @param h
 * @param w
 * @param Data_Source
 */
barChartCounts = function (data, property, svgID, h, w, Data_Source) {

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
    var x = myChart.addCategoryAxis("x", property);
    x.title = property;
    myChart.addMeasureAxis("y", "Count");
    myChart.addSeries(null, dimple.plot.bar);
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longest_label(xAxisLabels[0]);
    if (longestLabel > 10) {
        var labelSizeApprx = longestLabel * 5;
        var svgHeight = $(svgID).height();
        $(svgID).height(svgHeight + labelSizeApprx);
    }
    svg.append("text")
        .attr("x", w / 2 + w / 5)
        .attr("y", h - 10)
        .text("Data Source: " + Data_Source);

    var chartSvg = myChart.svg[0][0];

    document.getElementById('chartEmbedTxt').value = chartSvg.outerHTML;


};

/**
 * Tis function is used to check the longest x axis label to display the data source in the chart.
 * @return {number}
 */
var longest_label = function (nodeList) {
    var longest = 0;
    nodeList.forEach(function (n) {
        if (n.innerHTML.length > longest) {
            longest = n.innerHTML.length;
        }
    });

    return longest;
};
/**
 * Created by Rajitha Hasith on 13/07/2016.
 * This file contains the line chart chart visualisation function.
 *
 */
/**
 * The function draws the line chart
 *
 * Doc: https://github.com/PMSI-AlignAlytics/dimple/wiki
 *
 * @param data
 * the data object, which contains all the data.
 *
 * @param property
 * The property variable, which is the the y axis values.
 *
 * @param xAxis
 * property name for x axis values.
 *
 * @param svgID
 * the element that draw the chart in.
 *
 * @param h
 * height of the chart.
 *
 * @param w
 * width of the chart.
 *
 * @param Data_Source
 * Data source, which will display in the chart.
 */
lineChart = function (data, property, xAxis, svgID, h, w, Data_Source) {

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

    var x = myChart.addCategoryAxis("x", xAxis);
    myChart.addMeasureAxis("y", property);
    myChart.addSeries(null, dimple.plot.line);
    myChart.draw();

    var xAxisLabels = x.shapes.selectAll('text');
    var longestLabel = longest_label(xAxisLabels[0]);
    if (longestLabel >= 10) {
        var labelSizeApprx = longest_label * 5;
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
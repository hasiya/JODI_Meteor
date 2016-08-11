/**
 * Created by Rajitha Hasith on 15/07/2016.
 * This file contains the pie chart visualisation function.
 */

/**
 * The chart draws the pie chart.
 *
 * Doc: https://github.com/PMSI-AlignAlytics/dimple/wiki
 *
 * @param data
 * the data object, which contains all the data.
 *
 * @param header
 * The property variable, which will be the sectors of the pie chart.
 *
 * @param measure
 * this is the column name for values of size of the sectors.
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
 *
 */
pieChart = function (data, header, measure, svgID, h, w, Data_Source) {

    var margin = {
        top: 10,
        right: 50,
        bottom: 10,
        left: 20
    };

    $(svgID).width(w);
    $(svgID).height(h);

    var svg = dimple.newSvg(svgID, w, h);
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(margin.left, margin.top, '70%', h - margin.bottom);
    myChart.addMeasureAxis("p", measure);
    myChart.addSeries(header, dimple.plot.pie);
    myChart.addLegend('70%', '1%', '30%', '100%', "left");
    myChart.draw();

    svg.append("text")
        .attr("x", w / 2 + w / 5)
        .attr("y", h - 10)
        .text("Data Source: " + Data_Source);

    var chartSvg = myChart.svg[0][0];
    document.getElementById('chartEmbedTxt').value = chartSvg.outerHTML;


};
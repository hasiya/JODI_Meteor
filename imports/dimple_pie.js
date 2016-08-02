pieChart = function (data, header, measure, count, svgID, h, w, Data_Source) {

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
        .attr("y", h - 20)
        .text(Data_Source);

    var chartSvg = myChart.svg[0][0];
    document.getElementById('chartEmbedTxt').value = chartSvg.outerHTML;


};
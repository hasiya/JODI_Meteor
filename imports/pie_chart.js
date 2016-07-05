/**
 * Created by digital on 05/07/16.
 */
var tooltip = document.getElementById("tooltip");

if (tooltip) {
    tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "14px sans-serif");
}
else {
    tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "14px sans-serif");
}

pieChart = function (data, header, svgElem, h, w) {

    var margin = {
        top: 10,
        right: 10,
        bottom: 60,
        left: 50
    };
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var pieData = d3.nest()
        .key(function (d) {
            return d[header]
        })
        .entries(data);
    var pieMap = pieData.map(function (d) {
        return d.values.length
    });


    var dataset = [5, 10, 20, 45, 6, 25];

    var outerRadius = (w / 2) - (h / 3);
    var innerRadius = 0;
    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.layout.pie()
        .value(function (d) {
            return d.values.length;
        });

    //Easy colors accessible via a 10-step ordinal scale
    var color = d3.scale.category10();

    //Create SVG element
    var svg = d3.select(svgElem)
        .attr("width", w)
        .attr("height", h);

    //Set up groups
    var arcs = svg.selectAll("g.arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function (d) {
            var a = color(d.data.key);
            return a;
        })
        .attr("d", arc);

    //Labels
    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.value;
        });

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", w - 7)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", w - 13)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });

};

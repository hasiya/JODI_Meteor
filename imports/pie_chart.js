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

pieChart = function (data, header, count, svgElem, h, w) {

    var margin = {
        top: 10,
        right: 10,
        bottom: 60,
        left: 50
    };
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;
    var pieData;
    var pie;

    if (count) {
        pieData = d3.nest()
            .key(function (d) {
                return d[header]
            })
            .entries(data);

        pie = d3.layout.pie()
            .value(function (d) {
                return d.values.length;
            });
    }
    else {
        pieData = data;

        pie = d3.layout.pie()
            .value(function (d) {
                return d[header];
            });
    }


    if (h < w) {
        outerRadius = (h / 2) - 2
    }
    else {

        var outerRadius = (w / 2) - 2;
    }

    // h = outerRadius *2 +10
    var innerRadius = 0;
    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var labelArc = d3.svg.arc()
        .innerRadius(outerRadius - 50)
        .outerRadius(outerRadius);


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
            if (count) {
                return color(d.data.key);
            }
            else {
                return color(d.data[header])
            }
        })
        .attr("d", arc);

    //Labels
    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + labelArc.centroid(d) + ")";
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
        .attr("x", w - 8)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", w - 14)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });

};

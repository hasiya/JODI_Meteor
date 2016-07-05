function unique(x) {
    return x.reverse().filter(function (e, i, x) {
        return x.indexOf(e, i + 1) === -1;
    }).reverse();
}

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

groupedBarChart = function (data, bigGroup, subGroup, svgElem, h, w) {
    var margin = {
        top: 10,
        right: 10,
        bottom: 60,
        left: 50
    };
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var groupArray = unique(data.map(function (d) {
        return d[bigGroup]
    }));
    var subArray = unique(data.map(function (d) {
        return d[subGroup]
    }));

    var nestedObject = d3.nest()
        .key(function (d) {
            return d[bigGroup]
        })
        .key(function (d) {
            return d[subGroup]
        })
        .entries(data);
    console.log(nestedObject);

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, w], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([h, 0]);

    var colours = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var svg = d3.select(svgElem)
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x0.domain(nestedObject.map(function (d) {
        return d.key;
    }));
    x1.domain(subArray).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(nestedObject, function (d) {
        return d3.max(d.values, function (d) {
            return d.values.length;
        });
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, x0.rangeBand());

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var key = svg.selectAll(".key")
        .data(nestedObject)
        .enter().append("g")
        .attr("class", "key")
        .attr("transform", function (d) {
            return "translate(" + x0(d.key) + ",0)";
        });

    key.selectAll("rect")
        .data(function (d) {
            return d.values;
        })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function (d) {
            return x1(d.key);
        })
        .attr("y", function (d) {
            return y(d.values.length);
        })
        .attr("height", function (d) {
            return h - y(d.values.length);
        })
        .style("fill", function (d) {
            return colours(d.key);
        })
        .on("mouseover", function (d) {
            tooltip.html("<span style='color:red'>" + d.values.length + "</span>");
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        });

    var legend = svg.selectAll(".legend")
        .data(subArray.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", w - 7)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colours);

    legend.append("text")
        .attr("x", w - 13)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });


};

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}
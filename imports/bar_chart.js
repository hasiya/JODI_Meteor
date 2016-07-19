var colours = d3.scale.category10();
var svg_g;
barChartHeaders = function (data, property, xLabel, svgID, h, w) {

    var margin = {
        top: 10,
        right: 10,
        bottom: 60,
        left: 50
    };
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var updatedData = d3.nest()
        .key(function (d) {
            return d[xLabel];
        })
        .rollup(function (u_data) {
            return {
                total: d3.sum(u_data, function (d) {
                    return parseFloat(d[property]);
                })
            }
        })
        .entries(data);

    var barPadding = 1;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, w], .1);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var y = d3.scale.linear()
        .range([h, 0]);

    var yAxis;

    if (updatedData[0].values.total < 1) {
        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
            .ticks(10)
    }
    else {
        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickFormat(d3.format(".2s"));

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

    //Create SVG element
    var svg = d3.select(svgID)
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    y.domain([0, d3.max(updatedData, function (d) {
        return d.values.total;
    })]);

    x.domain(updatedData.map(function (d) {
        return d.key;
    }));


    var barWidthPadding = w / data.length - barPadding;
    if (barWidthPadding < 0) {
        barPadding = 0;
    }

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll(".tick text")
        .call(wrap, x.rangeBand());

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("rect")
        .data(updatedData)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return i * (w / updatedData.length);
        })
        .attr("y", function (d) {
            return y(d.values.total);
        })
        .attr("width", w / updatedData.length - barPadding)
        .attr("height", function (d) {
            return (h - y(d.values.total));
        })
        .attr("fill", function (d, i) {
            return colours(i);
        })
        .on("mouseover", function (d) {
            tooltip.html("<span style='color:red'>" + d.values.total + "</span>");
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        });
    d3.select(svgID)
        .attr("width", w + 100)
        .attr("height", h + 100);

    // svg.selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .text(function (d) {
    //         return d[property];
    //     })
    //     .attr("text-anchor", "middle")
    //     .attr("x", function (d, i) {
    //         return i * (w / data.length) + (w / data.length - barPadding) / 2;
    //     })
    //     .attr("y", function (d) {
    //         return y(d[property]) + 10;
    //     })
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "11px")
    //     .attr("fill", "white");
};

barChartCounts = function (data, svgID, h, w) {

    var margin = {
        top: 10,
        right: 10,
        bottom: 50,
        left: 50
    };
    w = w - margin.left - margin.right;
    h = h - margin.top - margin.bottom;

    var barPadding = 1;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, w], .1);

    var y = d3.scale.linear()
        .range([h, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

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

    // tooltip.parentNode.removeChild(tooltip);


    //Create SVG element
    var svg = d3.select(svgID)
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg_g = svg;
    // svg.call(tip)

    y.domain([0, d3.max(data, function (d) {
        return d.Value + 100;
    })]);

    x.domain(data.map(function (d) {
        return d.Key;
    }));

    var xDomain = x.domain();
    var longestXval = d3.max(xDomain, function (d) {
        return d.length;
    });


    var barWidthPadding = w / data.length - barPadding;
    if (barWidthPadding < 0) {
        barPadding = 0;
    }


    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll(".tick text")
        // .attr("y", 0)
        // .attr("x", 9)
        // .attr("dy", ".35em")
        // .attr("transform", "rotate(90)")
        // .style("text-anchor", "start");
        .call(wrap, x.rangeBand());

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("y", 6)
    // .attr("dy", ".71em")
    // .style("text-anchor", "end")
    // .text("Frequency");

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return i * (w / data.length);
        })
        .attr("y", function (d) {
            return y(d.Value);
        })
        .attr("width", w / data.length - barPadding)
        .attr("height", function (d) {
            return (h - y(d.Value));
        })
        .attr("fill", function (d, i) {
            return colours(i);
        })
        .on("mouseover", function (d) {
            tooltip.html("<span style='color:red'>" + d.Value + "</span>");
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        });

    d3.select(svgID)
        .attr("width", w + 100)
        .attr("height", h + 100 + (longestXval * 5));


    // svg.selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .text(function (d) {
    //         return d.Value;
    //     })
    //     .attr("text-anchor", "middle")
    //     .attr("x", function (d, i) {
    //         return i * (w / data.length) + (w / data.length - barPadding) / 2;
    //     })
    //     .attr("y", function (d) {
    //         return y(d.Value) + 10;
    //     })
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "11px")
    //     .attr("fill", "black");
};

rotate_X_labels = function (checked, svgID) {
    var svg = d3.select(svgID);
    if (checked) {
        svg.selectAll("g .xaxis .tick text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");
    } else {
        svg.selectAll("g .xaxis .tick text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");
    }
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

barChartHeaders = function (data, property, svg, h, w) {

    var barPadding = 1;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, w], .1);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    
    var y = d3.scale.linear()
        .range([h, 0]);

    //Create SVG element
    //noinspection JSDuplicatedDeclaration
    var svg = d3.select(svg)
        .attr("width", w)
        .attr("height", h);

    y.domain([0, d3.max(data, function (d) {
        return d[property] + 1;
    })]);


    var barWidthPadding = w / data.length - barPadding;
    if (barWidthPadding < 0) {
        barPadding = 0;
    }

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return i * (w / data.length);
        })
        .attr("y", function (d) {
            return y(d[property]);
        })
        .attr("width", w / data.length - barPadding)
        .attr("height", function (d) {
            return (h - y(d[property]));
        })
        .attr("fill", function (d) {
            return "rgb(0, 150, " + (d[property] * 10) + ")";
        });

    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function (d) {
            return d[property];
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) {
            return i * (w / data.length) + (w / data.length - barPadding) / 2;
        })
        .attr("y", function (d) {
            return y(d[property]) + 10;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");
};

barChartCounts = function (data, svg, h, w) {

    var margin = {
        top: 10,
        right: 10,
        bottom: 60,
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
    //noinspection JSDuplicatedDeclaration
    var svg = d3.select(svg)
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svg.call(tip)

    y.domain([0, d3.max(data, function (d) {
        return d.Value + 100;
    })]);

    x.domain(data.map(function (d) {
        return d.Key;
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
        .attr("fill", function (d) {
            return "rgb(0, 150, " + (d.Value * 10) + ")";
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
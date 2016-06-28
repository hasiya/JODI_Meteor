barChartHeaders = function (data, property, svg, h, w) {

    var barPadding = 1;

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

    var barPadding = 1;
    var y = d3.scale.linear()
        .range([h, 0]);

    //Create SVG element
    //noinspection JSDuplicatedDeclaration
    var svg = d3.select(svg)
        .attr("width", w)
        .attr("height", h);

    y.domain([0, d3.max(data, function (d) {
        return d + 1;
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
            return y(d);
        })
        .attr("width", w / data.length - barPadding)
        .attr("height", function (d) {
            return (h - y(d));
        })
        .attr("fill", function (d) {
            return "rgb(0, 150, " + (d * 10) + ")";
        });

    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function (d) {
            return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) {
            return i * (w / data.length) + (w / data.length - barPadding) / 2;
        })
        .attr("y", function (d) {
            return y(d) + 10;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");
};
/**
 * Created by digital on 28/06/16.
 */

function type(d) {
    d.frequency = +d.frequency;
    return d;
}

// bar = function (data, width, height, label) {
//     var formatCount = d3.format(",.0f");
//     var margin = {
//         top: 20,
//         right: 20,
//         bottom: 30,
//         left: 40
//     };
//     width = width - margin.left - margin.right;
//     height = height - margin.top - margin.bottom;
//
//     var x = d3.scaleL
//         .rangeRoundBands([0,width],.1);
//
//     var y = d3.scale.linear()
//         .range([height, 0]);
//
//     var xAxis = d3.svg.axis()
//         .scale(x)
//         .orient("bottom");
//
//     var histogram = d3.histogram()
//         .value(function(d) { return d[label]; })
//         .domain(x.domain())
//         .thresholds(x.ticks(d[label]));
//
//     var svg = d3.select("#svgChar")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//     data.forEach(function (d) {
//         type(d)
//     });
//
//     svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(xAxis);
//
//     var bins = histogram(data);
//
//     y.domain([0, d3.max(bins, function(d) { return d.length; })]);
//
//     var bar = svg.selectAll(".bar")
//         .data(bins)
//         .enter().append("g")
//         .attr("class", "bar")
//         .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
//
//     bar.append("rect")
//         .attr("x", 1)
//         .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
//         .attr("height", function(d) { return height - y(d.length); });
//
//     bar.append("text")
//         .attr("dy", ".75em")
//         .attr("y", 6)
//         .attr("x", function(d) { return (x(d.x1) - x(d.x0)) / 2; })
//         .attr("text-anchor", "middle")
//         .text(function(d) { return formatCount(d.length); });
// };


bar_chart = function (data, width, height, label, dataProp) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var svg = d3.select("#svgChar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // data.forEach(function (d) {
    //     type(d)
    // });

    x.domain(data.map(function (d) {
        return d[label];
    }));

    y.domain([0, d3.max(data, function (d) {
        return d[dataProp];
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        // .attr("class", "bar")
        .attr("x", function (d) {
            return x(d[label]);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d[dataProp]);
        })
        .attr("height", function (d) {
            return height - y(d[dataProp]);
        })
        .attr("fill", function (d) {
            return "rgb(0, 0, 150 )";
        });
}
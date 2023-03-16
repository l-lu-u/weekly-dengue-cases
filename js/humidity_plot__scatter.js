var humidityMargin = {top: 80, right: 30, bottom: 30, left: 30},
    humidityWidth = 800 - humidityMargin.left - humidityMargin.right,
    humidityHeight = 400 - humidityMargin.top - humidityMargin.bottom;

var linePlot = d3.select("#humidity_plot")
    .append("svg")
      .attr("width", humidityWidth + humidityMargin.left + humidityMargin.right)
      .attr("height", humidityHeight + humidityMargin.top + humidityMargin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + humidityMargin.left + "," + (humidityHeight) + ")");

d3.json("./relative-humidity-annual-mean.json").then(function(data){

    //list of groups
    var groups = ["Daily Mean", "Daily Minimum", "Daily Maximum"]

    // d3.select("#selectButton")
    //     .selectAll("myOptions")
    //         .data(groups)
    //     .enter()
    //         .append("option")
    //     .text(function (d) { return d; }) // text showed in the menu
    //     .attr("value", function (d) { return d; }) // corresponding value returned by the button

    //add x axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([0,humidityWidth]);
    linePlot.append("g")
        .attr("transform","translate(0,"+humidityHeight+")")
        .call(d3.axisBottom(x)
            .ticks(humidityWidth/50)
            // .tickFormat(d3.timeFormat("%Y"))
            // .tickFormat(function(d) { return d3.timeFormat("%Y")(d) })
        )
        .append("text")
            .attr("dy", "1.6rem")
            .attr("x", "-2.4rem")
            .style("text-anchor", "end")
            .text("Year")
            .style("fill","white");

    // Add y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.rh_means_daily_maximum+10; })])
        .range([ humidityHeight, 0 ]);
    linePlot.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain")
            .remove())
        .append("text")
            .attr("dy", ".75em")
            .style("text-anchor", "end")
            .text("Relative humidity (%)")
            .style("fill","white");

    // Add the lines
    var pathMean = linePlot.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(d.rh_mean_daily) })
        );
    linePlot.append("text")
        .style("text-anchor", "end")
        .attr("transform",
        "translate(" + humidityWidth + "," +(humidityMargin.top+humidityMargin.bottom) +")")
        .text("daily mean of relative humidity")
        .style("fill","white");

    //create a tooltip
    var tooltip = d3.select("#humidity_plot")
        .append("div")
        .style("opacity", 0)
        .attr("id","tooltip_humidity")
        .attr("class", "tooltip")
        .style("width", "8rem")

    //functions that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        tooltip
            .style("opacity", 1)
      }
      var mousemove = function(event, d) {
        tooltip
            .html("<b>" + d.year + "</b>: " + d.rh_mean_daily + "%")
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY-60) + "px")
        linePlot.append('line')
            .attr("id", "limit")
            .attr('x1', x(d.year))
            .attr('y1', humidityHeight)
            .attr('x2', x(d.year))
            .attr('y2', y(d.rh_mean_daily));
      }
      var mouseleave = function(d) {
        tooltip
            .style("opacity", 0)
        linePlot.selectAll("#limit").remove();
      }

    // Add the points
    linePlot
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", "spot-humidity")
        .attr("cx", function(d) { return x(d.year) } )
        .attr("cy", function(d) { return y(d.rh_mean_daily) } )
        .attr("r", 3)
        .attr("fill", "steelblue")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
})
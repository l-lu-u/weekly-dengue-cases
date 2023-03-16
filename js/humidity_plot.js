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
    // var pathMin = linePlot.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", d3.line()
    //         .x(function(d) { return x(d.year) })
    //         .y(function(d) { return y(d.rh_mean_daily_minimum) })
    //     )
    // var pathMax = linePlot.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", d3.line()
    //         .x(function(d) { return x(d.year) })
    //         .y(function(d) { return y(d.rh_means_daily_maximum) })
    //     );


    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.x; }).left;

    // Create the circle that travels along the curve of chart
    var focus = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusText = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    linePlot.append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', humidityWidth)
        .attr('height', humidityHeight)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

        function mouseover(event, d) {
            focus.style("opacity", 1)
            focusText.style("opacity",1)
        }
        
        function mousemove(event, d) {
            // recover coordinate we need
            var x0 = x.invert(event.pageX);
            var i = bisect(data, x0, 1);
            selectedData = data[i]
            focus
                .attr("cx", x(selectedData.x))
                .attr("cy", y(selectedData.y))
            focusText
                .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
                .attr("x", x0+15)
                .attr("y", y(selectedData.y))
        }
        function mouseout(event, d) {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
        }

    // A function that update the chart
    function update(selectedGroup) {

        // Create new data with the selection?
        var dataFilter = data.map(function(d){return {year: d.year, value:d[selectedGroup]} })
  
        // Give these new data to update line
        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.year) })
              .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })
    }

    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })
})
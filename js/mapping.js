const biunivocal = "<->"
    let  map = d3.select("#data-mapping")
    map = map.call(d3.zoom().on("zoom", zoomed)).select("g")
    function zoomed(e) {
        const {x,y,k} = e.transform
        map.attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")");
    }
    const defs = map.append("defs")
        defs.append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
        defs.append("marker")
        .attr("id", "arrow-back")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", -20)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M10,-5L0,0L10,5z");
    const mapWidth = 800, mapHeight = 800;
    const link = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRLN35gFWVTUyPzf6IFf7GNZpdrw7Kbwi5L0cxbIejgjD8onKGfSB6uPd2mkFx1T83hUL5OxnXcJVtd/pub?output=csv"
    d3.csv(link).then(data=>{
        const nodeLabels = [...data.map(d=>d.source),...data.map(d=>d.target)]
            .filter((e,n,I)=>I.indexOf(e)===n)
        const nodes = nodeLabels.map(e=>({'name':e}))
        
        const links = data.map(d=>({source:nodeLabels.indexOf(d.source),target:nodeLabels.indexOf(d.target), interaction:d.interaction}))
        
        const simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(-10000))
            .force('center', d3.forceCenter(mapWidth / 2, mapHeight / 2))
            .force('link', d3.forceLink().links(links))
            .on('tick', ticked);

        function updateLinks() {
            const u = d3.select('.links')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr("data-double",d=>d.interaction?.includes(biunivocal)?true:false)
                .attr('x1', function(d) {
                    return d.source.x
                })
                .attr('y1', function(d) {
                    return d.source.y
                })
                .attr('x2', function(d) {
                    return d.target.x 
                })
                .attr('y2', function(d) {
                    return d.target.y 
                });
        }

        function updateNodes() {
            u = d3.select('.nodes')
                .selectAll('text')
                .data(nodes)
                .join('text')
                .text(function(d) {
                    return d.name
                })
                .attr('x', function(d) {
                    return d.x
                })
                .attr('y', function(d) {
                    return d.y
                })
                .attr('dy', function(d) {
                    return 5
                })
                .style("fill","white");;
        }
        const edgepaths = map.selectAll(".edgepath")
            .data(links)
            .join('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) {return 'edgepath' + i})
            .style("pointer-events", "none");
        const edgelabels = map.selectAll(".edgelabel")
            .data(links)
            .join('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 10)
            .attr('fill', 'white');
        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.interaction.replace(biunivocal,"––––")});

        function ticked() {
            updateLinks()
            updateNodes()
            edgepaths.attr('d', function (d) {
                return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
            });
            edgelabels.attr('transform', function (d) {
                if (d.target.x < d.source.x) {
                    var bbox = this.getBBox();

                    rx = bbox.x + bbox.width / 2;
                    ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
            });

        }
})

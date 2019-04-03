function draw_flowchart(json_file) {

    d3.select("svg").selectAll("*").remove();    

    var svgContainer = d3.select("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + ", 0)");

    svgContainer.append('defs').append("marker")
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('xoverflow', 'visible')
        .append('path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', 'black')
        .style('stroke', 'none')
        .attr("class", "arrowHead");        

    var behaviors = {};
    behaviors.drag = d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);

    var nodesArr = [],
        linksArr = [],
        top = 100,
        h_margin = 50,
        v_margin = 50,
        r_w = 150,
        r_h = 60;

    //load json data    
    jQuery.ajax({
        dataType: "json",
        url: "json/" + json_file,
        async: false,
        success: function (data) {
            nodesArr = data.nodes;
            nodesArr.forEach((n, i) => {
                nodesArr[i] = {
                    id: n.id,
                    category: n.category,
                    pos_index: n.pos_index,
                    level: n.level,
                    cx: getCenterPosition(n.level, n.pos_index, n.category).cx,
                    cy: getCenterPosition(n.level, n.pos_index, n.category).cy,
                    text: n.text
                };
            });
            linksArr = data.links;
            linksArr.forEach((e, i) => {
                linksArr[i] = {
                    fromPort: e.fromPort,
                    toPort: e.toPort,
                    source: nodesArr.filter(n => n.id == e.from)[0],
                    target: nodesArr.filter(n => n.id == e.to)[0]
                };
            });
        }
    });

    drawChart();

    function drawChart() {

        var links = svgContainer
            .selectAll(".link")
            .data(linksArr);
        var enteredLinks = links.enter().append('g').attr('class', 'link');
        enteredLinks.append('path')
            .attr("d", d => getPath(d))            
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr('marker-end', 'url(#arrowhead)');

        var nodes = svgContainer
            .selectAll(".node")
            .data(nodesArr);
        var enteredNodes = nodes.enter().append('g').attr('class', 'node');
        enteredNodes
            .append("rect")
            .attr("x", d => d.category != "" ? d.cx - r_h / 2 : d.cx - r_w / 2)
            .attr("y", d => d.cy - r_h / 2)
            .attr("rx", d => d.category != "" ? r_h : 0)
            .attr("ry", d => d.category != "" ? r_h : 0)
            .attr("width", d => d.category != "" ? r_h : r_w)
            .attr("height", r_h)
            .attr("fill", "#00a9c9")
            .attr("opacity", 1);
        enteredNodes
            .attr('class', 'node-text')
            .append("text")
            .attr("x", d => d.cx)
            .attr("y", d => d.cy)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(d => d.text);

    }

    //handler drag start event
    function dragstarted(d) {

    }
    // handle dragging event
    function dragged(d) {

    }
    //-------------------- handle drag end event ---------------
    function dragended(d) {

    }

    //-------------------------- node mouse hover handler ---------------
    function nodeMouseover(d) {

    }

    function nodeMouseout(d) {

    }

    function nodeClick(d) {

    }

    function getPath(d) {
        var source = d.source,
            target = d.target,
            pathStr = '';
        console.log(source.level + ":" + target.level)
        if (source.level == target.level) {
            if (source.pos_index > target.pos_index) {
                console.log("here")
                pathStr = 'M' + (source.cx - r_w / 2) + ',' + source.cy + 'l-' + v_margin + ',0';
            } else {
                console.log("here1")
                pathStr = 'M' + (source.cx + r_w / 2) + ',' + source.cy + 'l' + (v_margin) + ',0';
            }
        } else if (source.level < target.level) {
            if (source.pos_index == target.pos_index) {
                pathStr = 'M' + source.cx + ',' + (source.cy + r_h / 2) + 'l0' + ',' + h_margin + '';
            } else {
                pathStr = 'M' + source.cx + ',' + (source.cy + r_h / 2) + 'l0,' + h_margin / 2 + 'l' + target.pos_index * (v_margin + r_w) + ',0' + 'l0,' + h_margin / 2 + '';
            }
        } else {
            pathStr = 'aaa';
        }
        return pathStr;
    }

    function getCenterPosition(level, pos_index, category) { //type : start or ""
        var cx, cy;
        if (category != "") { // start
            cx = 0;
        } else {
            if (pos_index < 0) {
                cx = -(Math.abs(pos_index) * (r_w + v_margin));
            } else if (pos_index > 0) {
                cx = pos_index * (r_w + v_margin);
            } else {
                cx = 0;
            }
        }
        cy = top + level * (r_h + h_margin);
        return {
            cx: cx,
            cy: cy
        };
    }

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
};
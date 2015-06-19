var fill = d3.scale.category20();


Meteor.d3Pack = {};

Meteor.d3Pack.create = function(el, root) {
  var w = 1200,
    h = 900,
    r = 800,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node;

  Meteor.visUtils.pre_process_nodes(root);
  var links = Meteor.visUtils.convert_to_links(root);
  var max_tree_depth = Meteor.visUtils.get_max_depth(root);
  var packing_generation_factor = max_tree_depth - 0.5;
  console.log("packing factor", packing_generation_factor);

  var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) {
      return packing_generation_factor - d.generation;
    });

  var vis = d3.select(el).append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  node = root;

  var nodes = pack.nodes(root);

  vis.selectAll("circle")
    .data(nodes)
    .enter().append("svg:circle")
    .attr("class", function(d) {
      return d.children ? "parent" : "child";
    })
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .attr("r", function(d) {
      return d.r;
    })
    .on("click", function(d) {
      return zoom(node == d ? root : d);
    });

  vis.selectAll("text")
    .data(nodes)
    .enter().append("svg:text")
    .attr("class", function(d) {
      return d.children ? "parent" : "child";
    })
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("opacity", function(d) {
      return d.r > 20 ? 1 : 0;
    })
    .text(function(d) {
      return d.name;
    });

  vis.selectAll('line').data(links)
    .enter().append('svg:path')
    .attr('class', function() {
      return 'child-branch';
    })
    .style('stroke', function(d) {
      return d3.rgb(fill(d.target.by_alliance_with + 1)).darker();
    })
    .attr('d', Meteor.visUtils.linkArc);

  d3.select(window).on("click", function() {
    zoom(root);
  });

  function zoom(d, i) {
    var k = r / d.r / 2;

    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
      .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
      .attr("cx", function(d) {
        return x(d.x);
      })
      .attr("cy", function(d) {
        return y(d.y);
      })
      .attr("r", function(d) {
        return k * d.r;
      });

    t.selectAll("text")
      .attr("x", function(d) {
        return x(d.x);
      })
      .attr("y", function(d) {
        return y(d.y);
      })
      .style("opacity", function(d) {
        return k * d.r > 20 ? 1 : 0;
      });

    t.selectAll("path")
      .attr("d", function(d) {
        var coordPath = {
          source: {
            x: x(d.source.x),
            y: y(d.source.y)
          },
          target: {
            x: x(d.target.x),
            y: y(d.target.y)
          }
        };
        return linkArc(coordPath);
      });

    node = d;
    d3.event.stopPropagation();
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    var returnString = ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' +
      dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y);
    //console.log("TRANSFORM", returnString);
    return returnString;
  }
}

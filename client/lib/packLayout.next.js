var fill = d3.scale.category10();
var idCounter = 0;

Meteor.d3Pack = {};

Meteor.d3Pack.create = function(el, clickHandler, root, w, h, r) {
  var vis = d3.select(el).append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

  // Meteor.d3Pack.update(el, clickHandler, root, w, h, r);

};

Meteor.d3Pack.update = function(el, clickhandler, root, w, h, r) {
  var x = d3.scale.linear().range([0, r]);
  var y = d3.scale.linear().range([0, r]);
  var node;

  pre_process_nodes(root);
  post_process_nodes(root);
  var links = convert_to_links(root);
  var max_tree_depth = get_max_depth(root);
  var packing_generation_factor = max_tree_depth - 0.5;
  console.log("packing factor", packing_generation_factor);

  var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) {
      return packing_generation_factor - d.generation;
    });

  var vis = d3.select(el).select('svg');
  // vis.selectAll("*").remove();

  node = root;

  var nodes = pack.nodes(root);

  var circles = vis.selectAll("circle")
    .data(nodes, function(d) { return d.id; });

  circles.enter().append("circle")
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
      console.log("click bubble", d);
      if (node === d) {
        clickhandler(root);
        return zoom(root);
      } else {
        clickhandler(d);
        return zoom(d);
      }
    });

  var labels = vis.selectAll("text")
    .data(nodes, function(d) { return d.id; });

  labels.enter().append("svg:text")
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
      return !d.children ? d.name : "";
    });


  var paths = vis.selectAll('path')
    .data(links, function(d) { return d.source.id + "-" + d.target.id; });

  paths.enter().append('svg:path')
    .attr('class', function() {
      return 'child-branch';
    })
    .style('stroke', function(d) {
      console.log("Alliance", d, d.target.by_alliance_with);
      if (d.target.by_alliance_with)
        return "#ff7f0e";
      else
        return "rgb(21, 83, 125)";
    })
    .attr('d', linkArc);


  d3.select(window).on("click", function() {
    zoom(root);
  });

  circles.exit().remove();
  labels.exit().remove();
  paths.exit().remove();

  function zoom(d, i) {
    var k = r / d.r / 2;

    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
      .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
      .attr("cx", function(e) {
        return x(e.x);
      })
      .attr("cy", function(e) {
        return y(e.y);
      })
      .attr("r", function(e) {
        return k * e.r;
      });

    t.selectAll("text")
      .attr("x", function(e) {
        return x(e.x);
      })
      .attr("y", function(e) {
        return y(e.y);
      })
      .style("opacity", function(e) {
        return k * e.r > 20 ? 1 : 0;
      });

    t.selectAll("path")
      .attr("d", function(e) {
        var coordPath = {
          source: {
            x: x(e.source.x),
            y: y(e.source.y)
          },
          target: {
            x: x(e.target.x),
            y: y(e.target.y)
          }
        };
        return linkArc(coordPath);
      });

    node = d;
    d3.event.stopPropagation();
  }
};

function extend() { // jQuery.extend equivalent
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }
  return arguments[0];
}


function pre_process_nodes(node, generation) {
  node.generation = (typeof node.generation !== 'undefined' ? node.generation : generation || 0);
  if (node.partner) { // Adding as a child node
    node.partner.by_alliance_with = node.name;
    node.partner.generation = node.generation;
    if (node.children) {
      node.children.push(node.partner);
    } else {
      node.children = [node.partner];
    }
  }

  if (node.children) { // Making a shallow child copy
    var itself = {};
    for (var k in node) {
      itself[k] = node[k];
    }
    delete itself.children; // To avoid processing them twice & recursion
    delete itself.partner; // To avoid processing it twice
    node.itself = itself;
    node.children.push(itself);
  }
  for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
    pre_process_nodes(node.children[i], node.generation + 1);
  }
}

function get_max_depth(node) {
  var child_max_depth = 0;
  for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
    var child_depth = get_max_depth(node.children[i]);
    if (child_depth > child_max_depth) {
      child_max_depth = child_depth;
    }
  }
  return child_max_depth + 1;
}

function convert_to_links(node) {
  var out_links = [];
  var node_itself = node.itself || node;
  for (var j = 0; j < (node.children ? node.children.length : 0); j++) {
    var child_node = node.children[j];
    if (child_node === node_itself) {
      continue;
    }
    out_links.push({
      id: idCounter++,
      source: node_itself,
      target: child_node.itself || child_node
    });
    [].push.apply(out_links, convert_to_links(child_node));
  }
  //console.log("out_links", out_links);
  return out_links;
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = Math.sqrt(dx * dx + dy * dy);
  return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr +
    ' 0 0,1 ' + d.target.x + ',' + d.target.y);
}

// Inspired by http://bl.ocks.org/mbostock/7555321
function wrap_text(selection, content_key, line_height,
  strip_nonalpha) {
  selection.each(function(d) {

    if (d.children) return;

    var text_node = d3.select(this);
    var content = d[content_key];
    if (strip_nonalpha) {
      content = content.replace(/[0-9]/g, '');
    }
    var words = content.split(/\s+/);
    if (words.length === 1) {
      text_node.text(content);
      return;
    }
    var width = d.r * 2,
      line = [],
      line_number = 0,
      tspan = text_node.append('tspan').attr('x', 0).attr('y', 0),
      tspans = [tspan];
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      line.push(word);
      tspan.text(line.join(' '));
      if (line.length > 1 && tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text_node.append('tspan').attr('x', 0).attr('y', 0).text(word);
        tspans.push(tspan);
      }
    }
    var dy = parseFloat(text_node.attr('dy')) - line_height * (tspans.length - 1) / 2;
    for (line_number = 0; line_number < tspans.length; line_number++) {
      tspan = tspans[line_number];
      tspan.attr('dy', dy + 'em');
      dy += line_height;
    }
  });
}

function post_process_nodes(root) {
  root.id = idCounter++;
  if (root.children)
    root.children.forEach(function(d) {
      d.id = idCounter++;
      if (d.partner)
        d.partner.id = idCounter++;
      post_process_nodes(d);
    });
}

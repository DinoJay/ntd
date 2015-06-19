var fill = d3.scale.category20();

Template.zoom.rendered = function() {
  var root = {
    "name": "Shmi Skywalker",
    "partner": {
      "name": "Cliegg Lars"
    },
    "miniature_img_url": "http://img1.wikia.nocookie.net/__cb20100129155042/starwars/images/0/" +
      "01/Hansoloprofile.jpg",
    "children": [{
      "name": "Anakin Skywalker",
      "caption": "Darth Vader",
      "partner": {
        "name": "Padmé Amidala",
        "caption": "Queen of Naboo"
      },
      "children": [{
        "name": "Luke Skywalker",
        "partner": {
          "name": "Mara Jade",
          "caption": "Emperor's Hand"
        },
        "children": [{
          "name": "Ben Skywalker"
        }]
      }, {
        "name": "Leïa Organa",
        "caption": "Senator of Alderaan",
        "partner": {
          "name": "Han Solo"
        },
        "children": [{
          "name": "Jaina Fel"
        }, {
          "name": "Jacen Solo",
          "caption": "Darth Caedus"
        }, {
          "name": "Anakin Solo"
        }]
      }]
    }]
  };

  Meteor.visUtils.pre_process_nodes(root);
  var links = Meteor.visUtils.convert_to_links(root);
  var max_tree_depth = Meteor.visUtils.get_max_depth(root);
  var packing_generation_factor = max_tree_depth - 0.5;

  var zoom1 = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  function zoomed() {
    svg
      .attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  var margin = 20,
    diameter = 960;

  var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

  var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    .value(function(d) {
      return packing_generation_factor - d.generation;
    });

  var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")")
    .call(zoom1);

  //var container = svg.append("g");

  var focus = root,
    nodes = pack.nodes(root),
    view;

  var circle = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function(d) {
      return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
    })
    .style("fill", function(d) {
      return d.children ? color(d.depth) : null;
    });
    //.on("click", function(d) {
      //if (focus !== d) zoom(d);
      //d3.event.stopPropagation();
    //});

  var text = svg.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .style("fill-opacity", function(d) {
      return d.parent === root ? 1 : 0;
    })
    .style("display", function(d) {
      return d.parent === root ? null : "none";
    })
    .text(function(d) {
      return d.name;
    });

  svg.selectAll('line').data(links)
    .enter().append('svg:path')
    .attr('class', function() {
      return 'child-branch';
    })
    .style('stroke', function(d) {
      return d3.rgb(fill(d.target.by_alliance_with + 1)).darker();
    })
    .attr('d', function(d) {
      //if (d.source.name === "Shmi Skywalker")
      //console.log("Before Translate", d.source.x, d.source.y);
      //var coordPath = {
      //source: {
      //x: (d.source.x - v[0] - v[2]/2 + margin) * k * (-1), // 574
      //y: (d.source.y - v[1] - v[2]/2 + margin) * k * (-1)// 820
      ////x: 350.89444167148,
      ////y: 104.78298731540552
      //},
      //target: {
      //x: (d.target.x - v[0] - v[2]/2 - margin/2) * k *(1), // 574
      //y: (d.target.y - v[1] - v[2]/2 - margin/2) * k *(1)// 820
      ////x: 168.99248542061312,
      ////y: 308.5695947800648
      //}
      //};
      //if (d.source.name === "Shmi Skywalker")
      //console.log("CoordPath Source",
      //coordPath.source.x, coordPath.source.y);
      //console.log("CoordPath Target",
      //coordPath.target.x, coordPath.target.y);
      return linkArc(d);

    });
  var node = svg.selectAll("circle,text");
  var path = svg.selectAll("path");

  console.log("links", links);

  //d3.select("body")
    //.style("background", color(-1))
    //.on("click", function() {
      //zoom(root);
    //});

  zoomTo([root.x, root.y, root.r * 2 + margin]);
  console.log("ROOT", root);

  function zoom(d) {
    var focus0 = focus;
    focus = d;

    var transition = d3.transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween("zoom", function(d) {
        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
        return function(t) {
          zoomTo(i(t));
        };
      });

    transition.selectAll("text")
      .filter(function(d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .style("fill-opacity", function(d) {
        return d.parent === focus ? 1 : 0;
      })
      .each("start", function(d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .each("end", function(d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function(d) {
      console.log("node pos", d.x, d.y);
      var tmpY = (d.x - v[0]) * k;
      var tmpX = (d.y - v[1]) * k;
      return "translate(" + tmpX + "," + tmpY + ")";
    });
    circle.attr("r", function(d) {
      return d.r * k;
    });
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

};

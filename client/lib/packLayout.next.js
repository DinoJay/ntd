// var fill = d3.scale.category20();

// Meteor.d3Pack = {};

// Meteor.d3Pack.create = function(el, root) {
//   var zoom = d3.behavior.zoom()
//     .translate([0, 0])
//     .scale(1)
//     .scaleExtent([0.5, 20])
//     .on("zoom",
//       function() {
//         container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//       });

//   var margin = 0,
//     diameter = 800;

//   var color = d3.scale.linear()
//     .domain([-1, 5])
//     .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
//     .interpolate(d3.interpolateHcl);

//   // TODO: add real return value
//   Meteor.visUtils.pre_process_nodes(root);

//   var links = Meteor.visUtils.convert_to_links(root);
//   var max_tree_depth = Meteor.visUtils.get_max_depth(root);
//   var packing_generation_factor = max_tree_depth - 0.5;
//   console.log("Preprocessed nodes", root);
//   console.log("max_tree_depth", max_tree_depth);
//   console.log("packing_generation_factor", packing_generation_factor);

//   var pack = d3.layout.pack()
//     .padding(2)
//     .size([diameter - margin, diameter - margin])
//     .value(function(d) {
//       return packing_generation_factor - d.generation;
//     });

//   var focus = root,
//     nodes = pack.nodes(root),
//     view;

//   var svg = d3.select(el).append("svg")
//     .attr("width", diameter)
//     .attr("height", diameter)
//     .append("g");
//   // comment for edges
//   //.attr("transform",
//   //"translate(" + diameter / 2 + "," + diameter / 2 + ")");
//   var container = svg.append("g");


//   var node = container.selectAll('.node')
//     .data(nodes).enter()
//     .append('svg:g')
//     // TODO include for edges
//     .attr('transform', function(d) {
//       return 'translate(' + d.x + ',' + d.y + ')';
//     });

//   var circle = node.append("svg:circle")
//     .attr("class", 'leaf')
//     .style("fill", function(d) {
//       var colorScal = d.generation + (d.by_alliance_with ? 0.5 : 0);
//       return fill(colorScal);
//     })
//     .style('stroke', function(d) {
//       var colorScal = d.generation + (d.by_alliance_with ? 0.5 : 0);
//       return d3.rgb(fill(colorScal)).darker();
//     })
//     .attr('r', function(d) {
//       return d.r;
//     })
//     .on("click", function(d) {
//       d3.select(this).transition()
//         .call(zoom
//           .translate([(-d.x), (-d.y)])
//           .scale(2).event
//         );
//     });

//   node.append('svg:text')
//     .attr('class', 'leaf name')
//     .attr('dy', "0.90em")
//     .call(function(sel, key, line_height, strip_nonalpha) {
//       Meteor.visUtils.wrap_text(sel, key, line_height,
//         strip_nonalpha);
//     }, 'name', 1.5, true);

//   node.filter(function(d) {
//       return d.caption;
//     }).append('svg:text')
//     .attr('class', 'leaf caption')
//     .attr('dy', '3em')
//     .call(function(sel, key, line_height, strip_nonalpha) {
//       Meteor.visUtils.wrap_text(sel, key, line_height, strip_nonalpha);
//     }, 'caption', 1.5);

//   container.selectAll('line').data(links)
//     .enter().append('svg:path')
//     .attr('class', function() {
//       return 'child-branch';
//     })
//     .style('stroke', function(d) {
//       return d3.rgb(fill(d.target.by_alliance_with + 1)).darker();
//     })
//     .attr('d', Meteor.visUtils.linkArc);
// };

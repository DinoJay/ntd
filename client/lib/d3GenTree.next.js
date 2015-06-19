Meteor.visUtils = {};
var conf = {
    path_to_miniature_imgs: '/img/', // if evaluates to false, only use optional .miniature_img_url
    miniature_img_ext: '.jpg',
    use_fixed_miniature: true,
    miniature_photo_size: 300,
    packing_generation_factor: null, // default value is set later on as $genealogy_max_depth - 0.5
    d3_color_scale: 'category20',
    leaf_name_dy: '0.90em',
    leaf_caption_dy: '3em',
    wrapped_text_line_height_ems: 1.5,
};


var fill = d3.scale[conf.d3_color_scale]();
Meteor.d3GenTree = {};

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

Meteor.visUtils.pre_process_nodes = function(node, generation) {
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

    //if (node.apprentices) {
        //console.log("node", nodes);
        //node.apprentices.forEach(function(v) {
            //var appr = {
              //name: v,
              //generation: 1
            //};
            //if (node.children) {
                //console.log("v", v);
                //node.children.push(appr);
            //} else {
                //node.children = [v];
            //}
        //});
    //}

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
        Meteor.visUtils.pre_process_nodes(node.children[i], node.generation + 1);
    }
};

Meteor.visUtils.get_max_depth = function(node) {
    var child_max_depth = 0;
    for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
        var child_depth = Meteor.visUtils.get_max_depth(node.children[i]);
        if (child_depth > child_max_depth) {
            child_max_depth = child_depth;
        }
    }
    return child_max_depth + 1;
};

Meteor.visUtils.convert_to_links = function(node) {
    var out_links = [];
    var node_itself = node.itself || node;
    for (var j = 0; j < (node.children ? node.children.length : 0); j++) {
        var child_node = node.children[j];
        if (child_node === node_itself) {
            continue;
        }
        out_links.push({
            source: node_itself,
            target: child_node.itself || child_node
        });
        [].push.apply(out_links, Meteor.visUtils.convert_to_links(child_node));
    }
    //console.log("out_links", out_links);
    return out_links;
};

Meteor.visUtils.linkArc = function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return ('M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr +
        ' 0 0,1 ' + d.target.x + ',' + d.target.y);
};

// Inspired by http://bl.ocks.org/mbostock/7555321
Meteor.visUtils.wrap_text = function(selection, content_key, line_height,
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
};

Meteor.d3GenTree.update = function(svg, jsonData) {
    Meteor.visUtils.pre_process_nodes(jsonData);

    var max_tree_depth = Meteor.visUtils.get_max_depth(jsonData);
    var packing_generation_factor = max_tree_depth - 0.5;

    var links = Meteor.visUtils.convert_to_links(jsonData);

    var pack = d3.layout.pack()
        .size([svg.attr('width'), svg.attr('height')])
        .value(function(d) {
            return packing_generation_factor - d.generation;
        });

    if (jsonData === []) console.log("No data");

    var node = svg.datum(jsonData).selectAll('.node')
        .data(pack.nodes).enter()
        .append('svg:g')
        .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });

    // TODO: check deeper
    //var leaf = node.filter(function(d) { return !d.children; });
    var leaf = node;
    console.log("leaf node", leaf);

    leaf.append('svg:text')
        .attr('class', 'leaf name')
        .attr('dy', "0.90em")
        .call(Meteor.visUtils.wrap_text, 'name', 1.5, true);

    leaf.filter(function(d) {
            return d.caption;
        }).append('svg:text')
        .attr('class', 'leaf caption')
        .attr('dy', '3em')
        .call(Meteor.visUtils.wrap_text, 'caption', 1.5);

    leaf.append('svg:circle')
        .attr('class', 'leaf')
        .attr('r', function(d) {
            return d.r;
        })
        .style('fill', function(d) {
            return fill(d.generation + (d.by_alliance_with ? 0.5 : 0));
        })
        .style('stroke', function(d) {
            return d3.rgb(fill(d.generation + (d.by_alliance_with ? 0.5 : 0))).darker();
        })
        .on('mouseover', function(d) {
            //miniature_mouseover(d, d3.select(this));
        })
        .on('mouseout', function(d) {
            //miniature_mouseout(d, (d3.select(this)));
        });

    svg.selectAll('line').data(links)
        .enter().append('svg:path')
        .attr('class', function() {
            // TODO: diversify
            return 'child-branch';
        })
        .style('stroke', function(d) {
            return d3.rgb(fill(d.target.by_alliance_with + 1)).darker();
        })
        .attr('d', Meteor.visUtils.linkArc);

    //if (conf.post_rendering_callback) {
    //conf.post_rendering_callback();
    //}
};


Meteor.d3GenTree.create = function(el, data) {
    //var conf = extend({}, CONFIG_DEFAULTS, args),
    //svg = d3.select(conf.svg_tree_selector);
    //check_exists(conf.svg_tree_selector);

    var svg = d3.select(el).append("svg")
        .attr("width", '800')
        .attr("height", '800');

    Meteor.d3GenTree.update(svg, data);
};

Meteor.d3GenTree.remove = function(args) {
    var conf = extend({}, CONFIG_DEFAULTS, args);
    check_exists(conf.svg_tree_selector);
    d3.select(conf.svg_tree_selector).selectAll('g').remove();
    d3.select(conf.svg_tree_selector).selectAll('path').remove();
    check_exists('svg#genealogic-miniature');
    d3.select('svg#genealogic-miniature').selectAll('*').remove();
};

Template.otherPack.rendered = function() {
  var el = this.find("#otherPack");
  Meteor.myUtils.ajaxWrapper("Shmi Skywalker", function(data) {
    console.log("VIS render", data);
    Meteor.d3Pack.create(el, data);
  });
};

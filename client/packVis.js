Template.pack.rendered = function() {
  // console.log("hello created", this);
  // var el = this.find("#vis");
  // Meteor.myUtils.ajaxWrapper("Luke Skywalker", function(data) {
  //     console.log("Callback", data);
  //     Meteor.d3GenTree.create(el, data);
  // });
  var el = this.find("#pack");
  Meteor.myUtils.ajaxWrapper("Shmi Skywalker", function(data) {
    Meteor.d3Pack.create(el, data);
  });
};

Template.pack.helpers({
  counter: function() {
    return Session.get('counter');
  }
});

Template.pack.events({
  'click button': function() {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});

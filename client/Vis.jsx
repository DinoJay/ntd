ReactMeteor.createClass({
  templateName: "DataDispatcher",

  getInitialState: function() {
    console.log("Meteor intervention");
    return {
      visData: [],
      gridData: []
    };
  },

  componentDidMount: function() {
    Meteor.myUtils.ajaxWrapper("Shmi Skywalker", function(visData) {
      console.log("VIS render", visData);

      var flat_data = flatten(visData);

      this.setState({
        visData: visData,
        gridData: flat_data
      });

      console.log("vis data", visData);

    }.bind(this));
  },

  clickHandler: function(e) {
    e.preventDefault();

    var fce = React.findDOMNode(this.refs.fce).value.trim();
    Meteor.myUtils.ajaxWrapper(fce, function(visData) {
      console.log("VIS render", visData);

      var flat_data = flatten(visData);

      this.setState({
        visData: visData,
        gridData: flat_data
      });

    }.bind(this));
  },

  bubbleClickHandler: function(gridData) {
      this.setState({
        gridData: flatten(gridData)
      });
  },

  render: function() {
    return (
      <div className="container">
        <div className="row">
          <form className="form-inline">
            <div className="form-group form-group-lg">
              <div className="col-md-12">
                <input className="form-control" type="text"
                  id="formGroupInputLarge"
                  placeholder="Search for FCE" ref="fce"
                  defaultValue="Shmi Skywalker">
                </input>
                </div>
              </div>
              <button onClick={this.clickHandler} type="submit"
                className="btn-lg btn-default">
                Submit
              </button>
            </form>
          </div>
            <div className="row">
              <Pack clickHandler={this.bubbleClickHandler}
                data={this.state.visData}/>
              <Grid data={this.state.gridData}/>
            </div>
        </div>
    );
  }
});

var Pack = ReactMeteor.createClass({

  getDefaultProps: function() {
    return {
      data: [],
      clickHandler: null
    };
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
      Meteor.d3Pack.create(el, this.props.clickHandler, this.props.data,
                          600, 600, 600);
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
      Meteor.d3Pack.update(el, this.props.clickHandler, this.props.data,
                          600, 600, 600);
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return !(this.props.data.name === nextProps.data.name);
  },

  render: function() {
    return (
      <div id="vis"></div>
    );
  }
});


function flatten(root) {
  var tmp = [];
  tmp.push(root);
  if (root.partner)
    tmp.push(root.partner);

  traverse_data(root, tmp);
  return tmp;
}

function traverse_data(root, tmp) {
  if (root.children)
    root.children.forEach(function(d) {
      var i = tmp.map(function(e) { return e.name; }).indexOf(d.name);
      if (i === -1) tmp.push(d);

      traverse_data(d, tmp);
    });
}

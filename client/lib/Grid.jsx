Grid = ReactMeteor.createClass({

  getDefaultProps: function() {
    return {
      data: null
    };
  },

  getInitialState: function() {
    return {
      data: []
    };
  },

  componentWillReceiveProps: function(nextProps) {
    console.log("new Props", nextProps);
    this.setState({
      data: nextProps.data
    });
  },

  renderFce: function(fce) {
    return <FcePreview fce={fce}/>;
  },

  render: function() {

    var cells = this.state.data.map(this.renderFce);

    console.log("render Grid cells", cells);
    return (
      <div id="cells">
          {cells}
      </div>
    );
  }
});

var FcePreview = ReactMeteor.createClass({

  getDefaultProps: function() {
    return {
      fce: null
    };
  },

  render: function() {
    var height;
    var hairColor;
    var skinColor;
    var planet;

    if (this.props.fce.appearance) {
      height = this.props.fce.appearance.height;
      hairColor = this.props.fce.appearance.hairColor;
      skinColor = this.props.fce.appearance.skinColor;
      planet = this.props.fce.planet;
    }
    else {
      height = "<not specified>";
      hairColor = "<not specified>";
      skinColor = "<not specified>";
      planet = "<not specified>";
    }

    return (
      <div className="custom-row-card">
        <div className="name">
          <strong className="text-primary">{this.props.fce.name}</strong>
        </div>
        <div style={{float: "left", marginLeft: "20px", width: "50%"}}>
          <div>
            <span className="text-muted">Gender: </span>
            {this.props.fce.gender}
          </div>
          <div>
            <span className="text-muted">Height: </span>
            {height}
          </div>
          <div>
            <span className="text-muted">Hair color: </span>
             {hairColor}
          </div>
        </div>
        <div>
          <div>
            <span className="text-muted">Skin color: </span>
            {skinColor}
          </div>
          <div>
            <span className="text-muted">Planet: </span>
            {planet}
          </div>
        </div>
      </div>
    );
  }
});

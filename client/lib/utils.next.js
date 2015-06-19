String.prototype.quote = function() {
  return "'" + this + "'";
};

function quote(str) {
  return "'" + str + "'";
}

function makeAjaxCall(parent, callback) {

  var API_URL = "http://localhost:3030/StarWars/query";
  var query = (
    "PREFIX fictu:<http://webprotege.stanford.edu/project/" +
    "pFQcTHFYhJGfU4INaGHqk#> " +
    "SELECT * " +
    "WHERE { " +
    "?fce fictu:hasName " + quote(parent.name) + " ." +
    "?fce fictu:hasName ?fceName." +
    "?fce fictu:isParentOf ?child." +
    "?child fictu:hasName ?childName." +
    "OPTIONAL {" +
    "?fce fictu:hasPartner ?partner." +
    "?partner fictu:hasName ?partnerName." +
    "}" +
    "}"
  );
  var encodedQuery = encodeURIComponent(query);

  $.ajax({
    url: API_URL + "?query=" + encodedQuery,
    dataType: 'jsonp',
    Accept: 'application/sparql-results+json',
    async: false,
    success: function(data) {
      var relatedFces = data.results.bindings;
      //console.log("relatedFces", relatedFces);

      relatedFces.forEach(function(d) {
        console.log("related FCE partner", d);
        parent.partner = {
          name: d.partnerName ? d.partnerName.value : "Unknown"
        };

        if (d.apprenticeName) {
          if (typeof parent.apprentices === "undefined") {
            parent.apprentices = [d.apprenticeName.value];
          } else {
            parent.apprentices.push(d.apprenticeName.value);
          }
        }
      });

      if (relatedFces.length === 0) {
        callback(parent);
        return;
      }

      relatedFces.forEach(function(d) {
        console.log("relatedFce", d);
        var childObj = {
          name: d.childName.value,
          type: "child",
          children: []
        };
        // TODO
        //if (d.apprentice) {
        //var apprObj = {
        //name: d.apprenticeName.value,
        //type: "apprentice",
        //};
        //parent.children.push(apprObj);
        //}
        parent.children.push(childObj);
        makeAjaxCall(childObj, callback);
      });
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(xhr.status);
      alert(thrownError);
    }
  });
}

function ajaxWrapper(fceName, callback) {
  var familyTree = [];
  var parent = {
    name: fceName,
    children: []
  };
  makeAjaxCall(parent, function(data) {
    console.log("leave reached", data);
  });

  setTimeout(function() {
    callback(parent);
  }, 3000);
}

Meteor.myUtils = {
  ajaxWrapper: ajaxWrapper
};

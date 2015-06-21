function quote(str) {
  return "'" + str + "'";
}

function makeAjaxCall(parent, callback) {

  var API_URL = "http://localhost:3030/StarWars/query";
  var query = (
    "PREFIX fictu:<http://webprotege.stanford.edu/project/" +
    "pFQcTHFYhJGfU4INaGHqk#> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +
    "SELECT * " +
    "WHERE { " +
    "?fce fictu:hasName " + quote(parent.name) + " ." +
    "?fce fictu:hasName ?fceName." +
    "?fce fictu:isParentOf ?child." +
    "?fce fictu:hasName ?fceName." +
    "?child fictu:hasName ?childName." +
    "?child fictu:hasSkinColor ?childSkinColor." +
    "?child fictu:hasHairColor ?childHairColor." +
    "?child fictu:hasHeight ?childHeight." +
    "?child fictu:hasGender ?childGender." +
    "?child fictu:originatesFrom ?childPlanet." +
    "?childPlanet rdfs:label ?childPlName." +
    "OPTIONAL {" +
    "?fce fictu:hasPartner ?partner." +
    "?partner fictu:hasName ?partnerName." +
    "?partner fictu:hasSkinColor ?partnerSkinColor." +
    "?partner fictu:hasHairColor ?partnerHairColor." +
    "?partner fictu:hasHeight ?partnerHeight." +
    "?partner fictu:hasGender ?partnerGender." +
    "?partner fictu:originatesFrom ?partnerPlanet." +
    "?partnerPlanet rdfs:label ?partnerPlName." +
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
      console.log("relatedFces", relatedFces);

      relatedFces.forEach(function(d) {
        // console.log("related FCE partner", d);

        if (d.partnerName) {
          parent.partner = {
            name: d.partnerName.value,
            appearance: {
              hairColor: d.partnerHairColor.value,
              height: d.partnerHeight.value,
              skinColor: d.partnerSkinColor.value
            },
            gender: d.partnerGender.value,
            planet: d.partnerPlName.value
          };
        } else {
          parent.partner = {
            name: "Unknown",
            appearance: {
              hairColor: "Unknown",
              height: "Unknown",
              skinColor: "Unknown"
            },
            gender: "Unknown",
            planet: "Unknown"
          };
        }

      });

      if (relatedFces.length === 0) {
        callback(parent);
        return;
      }

      relatedFces.forEach(function(d) {
        // console.log("relatedFce", d);
        var childObj = {
          name: d.childName.value,
          type: "child",
          children: [],
          appearance: {
            hairColor: d.childHairColor.value,
            height: d.childHeight.value,
            skinColor: d.childSkinColor.value
          },
            gender: d.childGender.value,
            planet: d.childPlName.value
        };

        parent.children.push(childObj);
        makeAjaxCall(childObj, callback);
      });
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(xhr.status);
      console.log(thrownError);
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
    // console.log("leave reached", data);
  });

  setTimeout(function() {
    callback(parent);
  }, 3000);
}

Meteor.myUtils = {
  ajaxWrapper: ajaxWrapper
};

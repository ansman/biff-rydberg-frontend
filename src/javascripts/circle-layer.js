define("circle-layer", ["d3", "underscore", "animator", "fetcher", "info-panel"], function(d3, _, Animator, fetcher, InfoPanel) {

  var ANIMATION_DURATION = 800;

  var logoMapping = {
    senior_citizen: "retired",
    upper_class: "upper_class",
    ordinary: "middle_class",
    cougar: "35_plus",
    hip_and_young: "young",
    workers: "workers"
  };


  return L.Class.extend({
    initialize: function() {
      this.markers = [];
      this.year = 2010;
      _.bindAll(this, "createMarker");

      this.loadMarkers();

      this.yearText = document.createElement("div");
      this.yearText.id = "year-text";
      this.yearText.innerText = this.year;
      document.body.appendChild(this.yearText);

      this.infoPanel = new InfoPanel();
      this.infoPanel.addTo(document.body);
    },

    loadMarkers: function() {
      var that = this;
      var url = "http://192.168.250.24:8080/regions?year=" + this.year;
      if (this.request) {
        this.request.cancel();
      }
      this.request = fetcher(url, function(error, municipalities) {
        if (error) {
          console.error("municipality", error, municipalities);
        } else {
          that.markersLoaded(municipalities);
        }
      });
    },

    markersLoaded: function(municipalities) {
      this.layoutMarkers(municipalities);
    },

    createMarker: function(municipality) {
      var that = this;
      var location = municipality.coordinates;
      if (!location) {
        return;
      }

      var marker = L.marker(location, {
        icon: L.divIcon({
          clickable: true,
          className: 'round-marker'
        })
      });

      marker.on("click", function() {
        that.infoPanel.setMunicipality(marker.municipality);
      });

      _.extend(marker, {
        animator: new Animator()
          .duration(ANIMATION_DURATION)
          .ease(d3.ease("elastic"))
          .callback(function(p) {
            marker.setLatLng(L.latLng(p[0], p[1]));
            var scale = Math.max(p[2], 0);
            that.setScale(marker.border, scale);
          })
      });

      this.markers.push(marker);
      marker.addTo(this.map);

      var logo = document.createElement("img");
      logo.classList.add("logo");

      var border = document.createElement("div");
      border.classList.add("border");
      this.setScale(border, 0);
      border.appendChild(logo);

      marker._icon.appendChild(border);
      marker.border = border;

      return marker;
    },

    setScale: function(el, scale) {
      el.style.webkitTransform = "scale(" + scale + ")";
    },

    layoutMarkers: function(newMunicipalities) {
      var oldMunicipalities = _.pluck(this.markers, "municipality");
      var idLookup = {};
      this.indexMunicipalities(idLookup, "old", oldMunicipalities);
      this.indexMunicipalities(idLookup, "new", newMunicipalities);

      this.markers = [];

      this.processNonChanged(idLookup);
      this.processMoved(idLookup);
      this.processAdded(idLookup);
      this.processRemoved(idLookup);
    },

    indexMunicipalities: function(lookup, key, municipalities) {
      if (!municipalities) {
        return;
      }
      _.each(municipalities, function(municipality) {
        if (municipality.coordinates) {
          var o = lookup[municipality.id] || {};
          lookup[municipality.id] = o;
          o[key] = municipality;
        }
      });
    },

    processRemoved: function(lookup) {
      var that = this;
      var count = 0;
      _.each(lookup, function(ms, key) {
        var muni = ms.old;
        if (!muni) {
          return;
        }
        ++count;
        console.debug("Removing muni with id " + muni.id);

        that.updateMarker(muni.marker, null);
        muni.marker._icon.style.zIndex = 100;
        setTimeout(function() {
          that.map.removeLayer(muni.marker);
        }, muni.marker.animator.duration());
      });

      return count > 0;
    },

    processAdded: function(lookup) {
      var that = this;
      _.each(lookup, function(ms) {
        var muni = ms['new'];
        if (!muni) {
          return;
        }
        console.debug("Adding muni with id " + muni.id);
        var marker = that.createMarker(muni);
        that.updateMarker(marker, muni);
      });
    },

    processNonChanged: function(lookup) {
      for (var key in lookup) {
        var o = lookup[key].old
          , n = lookup[key]['new'];

        if (this.municipalitiesMatch(o, n)) {
          console.debug("Not moving muni with id " + key);
          this.updateMarker(o.marker, n);
          delete lookup[key];
        }
      }
    },

    municipalitiesMatch: function(m1, m2) {
      return m1 && m2 && m1.average_person.stereotype == m2.average_person.stereotype;
    },

    processMoved: function(lookup) {
      var n, o;
      var bestMatchKey;
      for (var k1 in lookup) {
        bestMatchKey = null;
        o = lookup[k1].old;

        for (var k2 in lookup) {
          if (k1 == k2) {
            continue;
          }

          n = lookup[k2]['new'];
          if (this.municipalitiesMatch(o, n)) {
            var bestMatch = (lookup[bestMatchKey] || {})['new'];
            if (!bestMatch || this.isCloser(o, bestMatch, n)) {
              bestMatchKey = k2;
            }
          }
        }

        if (bestMatchKey) {
          o = this.prune(lookup, k1, "old");
          n = this.prune(lookup, bestMatchKey, "new");
          console.debug("Moving muni with id " + k1 + " to " + bestMatchKey);
          this.updateMarker(o.marker, n);
        } else {
          console.debug("Could not find a place for " + k1);
        }
      }
    },

    prune: function(lookup, id, key) {
      var ret = lookup[id][key];
      delete lookup[id][key];
      if (_.isEmpty(lookup[id])) {
        delete lookup[id];
      }
      return ret;
    },

    isCloser: function(old, bestMatch, contender) {
      var oc = old.coordinates
        , bc = bestMatch ? bestMatch.coordinates : null
        , cc = contender ? contender.coordinates : null;
      return this.distance(oc, cc) < this.distance(oc, bc);
    },

    distance: function(l1, l2) {
      if (!l1 || !l2) {
        return Infinity;
      }

      a = l2[0] - l1[0];
      b = l2[1] - l1[1];
      return Math.sqrt(a * a + b * b);
    },

    updateMarker: function(marker, municipality) {
      var that = this;
      var loc = marker.getLatLng();

      var scale = 1.0;
      if (!municipality) {
        scale = 0;
      } else if (municipality.population) {
        scale = Math.log(municipality.population.current) / Math.LN2;
        scale = scale / 15;
      }

      var border = marker.border;

      var from = [
        loc.lat,
        loc.lng,
        this.getScale(border)
      ];

      var to = (municipality ? municipality.coordinates : [loc.lat, loc.lng]).concat([scale]);

      marker.animator
        .interpolator(d3.interpolateArray(from, to))
        .start();

      border.className = "border";
      if (municipality) {
        var person = municipality.average_person;
        border.classList.add(person.stereotype);
        border.title = this.prettify(person.stereotype);
        var src = this.getPersonLogo(person);
        person.logo = src;
        border.querySelector("img").src = src;
        border.style.webkitTransform = "scale(" + scale + ")";
        municipality.marker = marker;
        if (marker.municipality) {
          marker.municipality.marker = null;
        }
        marker.municipality = municipality;
        this.markers.push(marker);
      }
    },

    getScale: function(el) {
      var val = el.style.webkitTransform;
      if (!val) {
        return 1;
      }

      var m = /scale\(([\d.]+)\)/g.exec(val);
      if (m) {
        return +m[1];
      }
      return 1;
    },

    getPersonLogo: function(person) {
      var name = logoMapping[person.stereotype];
      if (person.stereotype == 'ordinary') {
        name += '_married';
      } else {
        name += '_' + person.gender;
      }

      if (this.isRetina()) {
        name += "@2x";
      }

      return "images/stereotypes/" + name + ".png";
    },

    isRetina: function() {
      return window.devicePixelRatio >= 1.5;
    },

    prettify: function(str) {
      str = str.replace(/_/g, " ");
      return str[0].toUpperCase() + str.slice(1);
    },

    onAdd: function(map) {
      this.map = map;
    },

    onRemove: function() {
      this.map = null;
    },

    decreaseYear: function() {
      this.changeYear(this.year-1);
    },

    increaseYear: function() {
      this.changeYear(this.year+1);
    },

    changeYear: function(newYear) {
      newYear = Math.max(1968, Math.min(2013, newYear));
      if (this.year == newYear) {
        return;
      }
      var that = this;
      this.year = newYear;
      this.yearText.classList.remove("animate");
      this.yearText.innerText = newYear;
      _.defer(function() {
        that.yearText.classList.add("animate");
      });
      this.loadMarkers();
    }
  });
});

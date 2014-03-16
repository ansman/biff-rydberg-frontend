define("info-panel", ["d3"], function(d3) {
  var InfoPanel = function() {
    this.createEl();
  };

  _.extend(InfoPanel.prototype, {
    createEl: function() {
      this.el = document.createElement("div");
      this.el.id = "info-panel";

      this.container = document.createElement("div");
      this.container.className = "container";
      this.el.appendChild(this.container);

      var c = d3.select(this.container);

      this.logo = c.append("div")
        .attr({"class": "logo"});

      this.svg = c.append("svg")
        .attr({
          width: this.container.outerWidth,
          height: 300
        });
    },

    addTo: function(root) {
      root.appendChild(this.el);
    },

    setMunicipality: function(municipality) {
      this.municipality = municipality;
      this.animateLogo();
    },

    animateLogo: function() {
      var circle = this.logo.selectAll("img")
        .data([this.municipality.average_person.logo], function(d) { return d; });

      circle.enter().append("img")
        .attr({src: _.identity})
        .style({opacity: 0});

      circle.transition()
        .style({opacity: 1});

      circle.exit().transition()
        .style({opacity: 0, zIndex: 2})
        .remove();
    }
  });

  return InfoPanel;
});

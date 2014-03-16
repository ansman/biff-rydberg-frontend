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

      this.header = c.append("div")
        .attr({"class": "header"});

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
      this.el.classList.add("show");
      this.municipality = municipality;
      this.animateHeader();
    },

    animateHeader: function() {
      var m = this.municipality;
      var circle = this.header.selectAll("img")
        .data([this.municipality.average_person.logo], function(d) { return d; });

      circle.enter().append("img")
        .attr({src: _.identity})
        .style({opacity: 0});

      circle.transition()
        .style({opacity: 1});

      circle.exit().transition()
        .style({opacity: 0})
        .remove();

      this.animateText(this.header, m.name, "muni");
      this.animateText(this.header, m.average_person.stereotype, "name");
    },

    animateText: function(root, text, cls) {
      var els = root.selectAll("." + cls)
        .data([text], function(d) { return d; });

      els.enter().append("div")
        .attr({"class": cls})
        .style({opacity: 0})
        .text(this.prettify);

      els.transition()
        .style({opacity: 1});

      els.exit().transition()
        .style({opacity: 0})
        .remove();
    },

    prettify: function(str) {
      str = str.replace(/_/g, " ");
      return str[0].toUpperCase() + str.slice(1);
    },
  });

  return InfoPanel;
});

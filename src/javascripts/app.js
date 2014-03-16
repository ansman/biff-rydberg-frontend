define("app", ["circle-layer", "d3", "fetcher"], function(CircleLayer, d3, fetcher) {
  return {
    start: function() {
      circleLayer = new CircleLayer();
      window.map = L.map('map', {attributionControl: false})
        .setView([59.329444, 18.068611], 9)
        .addControl(L.control.attribution({prefix: "Källor och teknologier"})
          .addAttribution("Mapbox")
          .addAttribution("Leaflet")
          .addAttribution("D3.js")
          .addAttribution("Kolada")
          .addAttribution("SCB")
          .addAttribution("Socialstyrelsen"))
        .addLayer(L.mapbox.tileLayer('ansman.hhae4g97', {
          detectRetina: true
        }))
        .addLayer(circleLayer);

      document.addEventListener("keyup", function(ev) {
        switch (ev.keyCode) {
          case 74:
            circleLayer.decreaseYear();
            break;

          case 75:
            circleLayer.increaseYear();
            break;

          default:
            return;
        }
        ev.preventDefault();
      });
    }
  };
});

  var map = L.map('map', {
    center: [37.8, -96],
    zoom: 5
  });

  var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 30,
    ext: 'png'
  }).addTo(map);

  var featureGroup; 

  function getColor(d) {
    return d > 100 ? '#800026' :
           d > 50  ? '#BD0026' :
           d > 30  ? '#E31A1C' :
           d > 20  ? '#FC4E2A' :
           d > 10   ? '#FD8D3C' :
           d > 5   ? '#FEB24C' :
           d > 1   ? '#FED976' :
                      '#FFEDA0';
  }

  var base_map_style = function(feature){
    // console.log(feature);
    return {
      fillColor: getColor(feature.properties.Deaths),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    info.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    featureGroup.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
      this._div.innerHTML = `<h4>US Coronavirus Counts</h4>${props ?
        '<b>' + props.name + '</b><br />' + props.Confirmed + ' people confirmed' + '<br />' + props.Deaths + ' people dead' + '<br />' + props.Recovered + ' people recovered'
        : 'Hover over a state'}`;
  };

  info.addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          levels = [0, 1, 5, 10, 20, 30, 50, 100];
      div.innerHTML = ('<h4>US Coronavirus Death Count</h4>')
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < levels.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
              levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
      }
      return div;
  };

  legend.addTo(map);

  var eachFeatureFunction = function(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  };

  $(document).ready(function() {
    featureGroup = L.geoJson(statesData, {
      style: base_map_style,
      onEachFeature: eachFeatureFunction
    }).addTo(map);
    $('.leaflet-control-zoom').hide();
  });
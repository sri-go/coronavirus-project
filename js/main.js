  //Initalize Leaflet Map
  var map = L.map('map', {
    center: [37.8, -96],
    zoom: 5
  }); 

  //Define what Map Tile Style to use
  var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 30,
    ext: 'png'
  }).addTo(map);

  var featureGroup; 
  
  //Determine Color Scheme
  function getColor(d) {
    return d > 100 ? '#084594' :
           d > 50  ? '#2171b5' :
           d > 30  ? '#4292c6' :
           d > 20  ? '#6baed6' :
           d > 10   ? '#9ecae1' :
           d > 5   ? '#c6dbef' :
           d > 1   ? '#deebf7' :
                      '#f7fbff';
  }

  //Logic for how the color is applied...by default it is applied to the Death count by state
  var base_map_style = function(feature, count='Deaths'){
    // console.log(feature);
    // console.log(change)
    return {
      fillColor: getColor(feature.properties[count]),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  }

  //On Highlight or Mouse Hover What Happens
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

  //Reset Highlight When The Mouse Leaves
  function resetHighlight(e) {
    featureGroup.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  var title = L.control({position: 'topleft'});

  title.onAdd = function(map){
    var div = L.DomUtil.create('div', 'title');
    div.innerHTML = '<h1>US Coronavirus Situation Map</h1> <h3><h3>Updated as of 26-Mar-2020</h3>';
    return div;
     
  };

  title.addTo(map);

  var filter = L.control({position: 'bottomleft'});
  filter.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'filter');
    this.select();
    return this._div;
  };

  filter.select = function(){
    this._div.innerHTML = '<h1>Filter Controls</h1>'
    + '<input type="checkbox" id="cbox-input1" checked>' + '<label id="checkbox-label1" for="cbox-input1">Confirmed</label>'
    + '<input type="checkbox" id="cbox-input2">' + '<label id="checkbox-label2" for="cbox-input2">Dead</label>'
    + '<input type="checkbox" id="cbox-input3">' + '<label id="checkbox-label3" for="cbox-input3">Recovered</label>';

  };

  function onlyOne(checkbox) {
    var checkboxes = document.getElementsByName('check')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    });
  };

  filter.addTo(map); 
  
  var info = L.control();

  info.onAdd = function (map) {
    // create a div with a class "info"
      this._div = L.DomUtil.create('div', 'info'); 
      this.update();
      return this._div;
  };

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
      div.innerHTML = ('<h4>US Coronavirus Death Count</h4>');
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
    console.log(statesData);
    featureGroup = L.geoJson(statesData, {
      style: base_map_style,
      onEachFeature: eachFeatureFunction
    }).addTo(map);
    $('.leaflet-control-zoom').hide();
        
    
    $('input[type="checkbox"]').on('change', function() {
      $('input[type="checkbox"]').not(this).prop('checked', false);
   });
  });


  
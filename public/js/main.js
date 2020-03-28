  var url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-27-2020.csv';
  var featureGroup;
  
  //Determine Color Scheme
  function getColor(d) {
    return d > 100 ? '#084594' :
      d > 50 ? '#2171b5' :
      d > 30 ? '#4292c6' :
      d > 20 ? '#6baed6' :
      d > 10 ? '#9ecae1' :
      d > 5 ? '#c6dbef' :
      d > 1 ? '#deebf7' :
      '#f7fbff';
  }

  //Logic for how the color is applied...by default it is applied to the Death count by state
  var style = 'Deaths';
  var mortality_style = function (feature) {
    // console.log(feature);
      return {
      fillColor: getColor(feature.properties[style]),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  };

  var confirmed_style = function(feature){
    return {
      fillColor: getColor(feature.properties.Confirmed),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  };

  var recovered_style = function(feature){
    return {
      fillColor: getColor(feature.properties.Recovered),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  };

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
    div.innerHTML = '<h1>US Coronavirus Situation Map</h1> <h3><h3>Updated as of 27-Mar-2020</h3>';
    return div;

  };

  title.addTo(map);

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
    this._div = L.DomUtil.create('div', 'info legend'),
    levels = [0, 1, 5, 10, 20, 30, 50, 100];
    this._div.innerHTML = ('<h4>US Coronavirus Death Count</h4>');
    for (var i = 0; i < levels.length; i++) {
      this._div.innerHTML +=
          '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
          levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
  }      
    return this._div;
  };

  legend.update = function(str){
     this._div.innerHTML = ('<h4>US Coronavirus '+str+' Count</h4>');
     for (var i = 0; i < levels.length; i++) {
      this._div.innerHTML +=
          '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
          levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
  }      
  };

  legend.addTo(map);

  var filter = L.control({position: 'bottomleft'});

  filter.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'filter');
    this.select();
    return this._div;
  };

  filter.select = function(){
    this._div.innerHTML = '<h1>Filter Controls</h1>'
    + '<input name="check" type="checkbox" id="cbox-input1" onclick="filter_data(this)">' + '<label id="checkbox-label1" for="cbox-input1">Confirmed</label>'
    + '<input name="check" type="checkbox" id="cbox-input2" onclick="filter_data(this)" checked>' + '<label id="checkbox-label2" for="cbox-input2">Dead</label>'
    + '<input name="check" type="checkbox" id="cbox-input3" onclick="filter_data(this)">' + '<label id="checkbox-label3" for="cbox-input3">Recovered</label>';
  };

  function filter_data(checkbox) {
    var checkboxes = document.getElementsByName('check');
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false;
    });
    if (checkbox.id == 'cbox-input1'){
      style = 'Confirmed';
      featureGroup.setStyle(confirmed_style);
      legend.update('Confirmed');
    }
    if (checkbox.id == 'cbox-input2'){
      style = 'Deaths';
      featureGroup.setStyle(mortality_style);
      legend.update('Death');

    }
    if (checkbox.id == 'cbox-input3'){
      style = 'Recovered';
      featureGroup.setStyle(recovered_style);
      legend.update('Recovered');

    }
  };

  filter.addTo(map); 

  var eachFeatureFunction = function(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  };

  $(document).ready(function() {
    get_data(url).done(function(){
      featureGroup = L.geoJson(statesData, {
        style: mortality_style,
        onEachFeature: eachFeatureFunction
      }).addTo(map);
    });
    // console.log(combined_data);
    $('.leaflet-control-zoom').hide();
  });

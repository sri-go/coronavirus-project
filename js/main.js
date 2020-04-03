  //Returns the date in month, year, day
  //If time is 7pm returns latest, day...this is when the latest data is published, otherwise it returns the previous day
  function getDate() {
    var d = new Date();
    // console.log(d);
    if (d.getMonth <= 9) {
      var month = ('0' + (d.getMonth() + 1));
    } else {
      var month = ((d.getMonth() + 1));
    }
    var month = ('0' + (d.getMonth() + 1));
    var x = d.toString()
    var date = x.split(' ');
    var day = date[2];
    day = (parseInt(day)-1);
    day = ('0'+day);
    var year = date[3];
    var dash = '-';

    return {
      month,
      year,
      day,
      dash
    };
  };

  //defining the url from which to fetch the data
  //utilizng ajax to fetch latest data from github repo
  var date = getDate();
  var url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' +
    date.month + date.dash + date.day + date.dash + date.year + '.csv';
  var featureGroup;
  var featureGroup2;

  //Color Scale for each of the different counts
  function getColor(d, style) {
    if (style === "Deaths") {
      return d > 200 ? '#084594' :
        d > 100 ? '#2171b5' :
        d > 50 ? '#4292c6' :
        d > 10 ? '#6baed6' :
        d > 5 ? '#9ecae1' :
        d > 1 ? '#c6dbef' :
        '#eff3ff';
    } else if (style === "Confirmed") {
      return d > 35000 ? '#084594' :
        d > 15000 ? '#3182bd' :
        d > 1000 ? '#6baed6' :
        d > 100 ? '#bdd7e7' :
        d > 1 ? '#eff3ff' :
        '#ffffff';
    } else {
      return d > 100 ? '#084594' :
        '#f7fbff';
    }
  }
  //Logic for how the color is applied...by default the style is the mortality_style
  var mortality_style = function (feature) {
    var style = 'Deaths';
    return {
      fillColor: getColor(feature.properties.Deaths, style),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  };

  var confirmed_style = function (feature) {
    var style = 'Confirmed';
    return {
      fillColor: getColor(feature.properties.Confirmed, style),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '2',
      fillOpacity: 0.7
    };
  };

  var recovered_style = function (feature) {
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
    // console.log(layer)
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
    // featureGroup.resetStyle(e.target);
    var checkboxes = document.getElementsByName('check');
    if (checkboxes[0].checked === true) {
      featureGroup.setStyle(confirmed_style);
    } else if (checkboxes[2].checked === true) {
      featureGroup.setStyle(recovered_style);
    } else {
      featureGroup.setStyle(mortality_style);
    }
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  //Defining The Title For the map
  var title = L.control({
    position: 'topleft'
  });

  title.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'title');
    div.innerHTML = '<h1>US Coronavirus Situation Map</h1><h3>Updated as of ' + date.month + date.dash + date.day + date.dash + date.year + '</h3>';
    return div;

  };

  title.addTo(map);

  //Information on each state upon hover
  var info = L.control();

  info.onAdd = function (map) {
    // create a div with a class "info"
    this._div = L.DomUtil.create('div', 'info');
    this._div = L.DomUtil.create('div', 'info');
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

  //Legend which shows the color scale for each of the different counts
  var legend = L.control({
    position: 'bottomright'
  });
  legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info legend'),
      levels = [1, 5, 10, 50, 100, 200];
    this._div.innerHTML = ('<h4>US Coronavirus Death Count</h4>');
    for (var i = 0; i < levels.length; i++) {
      this._div.innerHTML +=
        '<i style="background:' + getColor((levels[i] + 1), 'Deaths') + '"></i> ' +
        levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
    }
    return this._div;
  };

  legend.update = function (string, style, levels) {
    this._div.innerHTML = ('<h4>US Coronavirus ' + string + ' Count</h4>');
    for (var i = 0; i < levels.length; i++) {
      this._div.innerHTML +=
        '<i style="background:' + getColor((levels[i] + 1), style) + '"></i> ' +
        levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
    }
  };

  legend.addTo(map);

  //Select which count the user wants to see
  var filter = L.control({
    position: 'bottomleft'
  });

  filter.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'filter');
    this.select();
    return this._div;
  };

  filter.select = function () {
    this._div.innerHTML = '<h1>Filter Controls</h1>' +
      '<label class="container" id="checkbox-label1" for="cbox-input1">Confirmed' + '<input name="check" type="checkbox" id="cbox-input1" onclick="filter_data(this)">' + '<span class="checkmark"></span></label>' +
      '<label class="container" id="checkbox-label2" for="cbox-input2">Dead<input name="check" type="checkbox" id="cbox-input2" onclick="filter_data(this)" checked><span class="checkmark"></span></label>' +
      '<label class="container" id="checkbox-label3" for="cbox-input3">Recovered<input name="check" type="checkbox" id="cbox-input3" onclick="filter_data(this)"><span class="checkmark"></span></label>';
  };

  function filter_data(checkbox) {
    var checkboxes = document.getElementsByName('check');
    checkboxes.forEach((item) => {
      if (item !== checkbox) item.checked = false;
    });
    if (checkbox.id === 'cbox-input1') {
      var string = "Confirmed";
      var style = 'Confirmed';
      var levels = [1, 100, 1000, 15000, 35000];
      legend.update(string, style, levels);
      featureGroup.setStyle(confirmed_style);
      // console.log(style);
    } else if (checkbox.id === 'cbox-input2') {
      var string = "Death";
      var style = 'Deaths';
      var levels = [1, 5, 10, 50, 100, 200];
      featureGroup.setStyle(mortality_style);
      legend.update(string, style, levels);
      // console.log(style);
    } else {
      var string = "Recovered";
      var style = "Recovered";
      var levels = [0, 100];
      featureGroup.setStyle(recovered_style);
      legend.update(string, style, levels);
      // console.log('Filter Data:' ,style);
    };
  };

  filter.addTo(map);

  var eachFeatureFunction = function (feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  };

  //On document load, the functions execute
  $(document).ready(function () {
    get_data(url).done(function () {
      featureGroup = L.geoJson(statesData, {
        style: mortality_style,
        onEachFeature: eachFeatureFunction
      }).addTo(map);
    });
  });
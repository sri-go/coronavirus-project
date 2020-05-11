  //On document load, the functions execute
  $(document).ready(function () {
      //   var url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/05-07-2020.csv';
      var date = getDate();
      var a = get_data(date.url);
      //   a.done(console.log)
      //   a.done(console.log)
      //Initalize Map + Mapbox API
      mapboxgl.accessToken = 'pk.eyJ1Ijoic3JpLWdvIiwiYSI6ImNrODUyeHp1YjAyb2wzZXA4b21veGhqdjgifQ.wprAUOeXWkoWy1-nbUd1NQ';
      var map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
          center: [-95.713405, 37.093379], // starting position [lng, lat]
          zoom: 4 // starting zoom
      });

      //Changing Map Styles - Recovered and Deaths 
      var hoveredStateId = null;
      map.on('load', function () {
          // Info Container at Top with Total Counts
          var stats = document.querySelector('.covid-stats');
          var date_updated = document.createElement('H1')
          date_updated.innerHTML = `Last Updated: ${date.date}`;
          var confirmed_title = document.createElement('H1')
          confirmed_title.innerHTML = `Total US Confirmed Count: ${statesData.us_confirmed_total.toLocaleString()}`;
          var death_title = document.createElement('H1')
          death_title.innerHTML = `Total US Death Count: ${statesData.us_death_total.toLocaleString()}`;
          stats.append(date_updated);
          stats.append(confirmed_title);
          stats.append(death_title);
          // Load Source Data for States Data GeoJson
          // You can get this GEOJSON from the US Census Bureau, via a shapefile
          map.addSource('states_data', {
              type: 'geojson',
              data: statesData
          });
          //Styling For US Deaths, Default Visibiliy is On
          map.addLayer({
              'id': 'Deaths_Style',
              'type': 'fill',
              'source': 'states_data',
              'paint': {
                  'fill-color': {
                      'property': 'Deaths',
                      //red colors
                      'stops': [
                          [0, '#fff5f0'],
                          [50, '#fee0d2'],
                          [100, '#fcbba1'],
                          [500, '#fc9272'],
                          [1000, '#fb6a4a'],
                          [5000, '#ef3b2c'],
                          [10000, '#cb181d'],
                          [20000, '#99000d']
                      ]
                  },
                  //change opacity on hover, default to 50% opacity
                  'fill-opacity': [
                      'case',
                      ['boolean', ['feature-state', 'hover'], false], 1, 0.5
                  ]
              },
              'layout': {
                  // make layer visible by default
                  'visibility': 'visible'
              },
              'maxzoom': 5.5
          });
          //Styling For US Confirmed, Default Visibility is Off
          map.addLayer({
              'id': 'Confirmed_Style',
              'type': 'fill',
              'source': 'states_data',
              'paint': {
                  'fill-color': {
                      'property': 'Confirmed',
                      'stops': [
                          [0, '#f7fbff'],
                          [100, '#deebf7'],
                          [500, '#c6dbef'],
                          [1000, '#9ecae1'],
                          [5000, '#6baed6'],
                          [10000, '#4292c6'],
                          [50000, '#2171b5'],
                          [100000, '#084594']
                      ]
                  },
                  //change opacity on hover, default to 50% opacity
                  'fill-opacity': [
                      'case',
                      ['boolean', ['feature-state', 'hover'], false], 1, 0.5
                  ]
              },
              'layout': {
                  // make layer hidden by default
                  'visibility': 'none'
              },
              'maxzoom': 5.5
          });
          // Load Source Data + Polygon Boundaries for US County 
          map.addSource('counties_data', {
              type: 'geojson',
              data: counties
          });
          // Map Styling For US Counties, Deaths, Default Visibility is On
          map.addLayer({
              'id': 'counties_data_outline',
              'type': 'fill',
              'source': 'counties_data',
              'paint': {
                  'fill-outline-color': 'rgba(218, 223, 247,0.75)'
              },
              'minzoom': 5.5,
          }, 'settlement-label');
          // Map Styling For US Counties, Deaths, Default Visibility is On
          map.addLayer({
              'id': 'County_Deaths_Style',
              'type': 'fill',
              'source': 'counties_data',
              'paint': {
                  'fill-color': {
                      'property': 'Deaths',
                      //red colors
                      'stops': [
                          [0, '#fff5f0'],
                          [50, '#fee0d2'],
                          [100, '#fcbba1'],
                          [500, '#fc9272'],
                          [1000, '#fb6a4a'],
                          [1500, '#ef3b2c'],
                          [2500, '#cb181d'],
                          [5000, '#99000d']
                      ]
                  },    
                  //change opacity on hover, default to 50% opacity
                  'fill-opacity': [
                      'case',
                      ['boolean', ['feature-state', 'hover'], false], 1, 0.5
                  ]
              },
              'layout': {
                  // make layer visible by default
                  'visibility': 'visible'
              },
              'minzoom': 5.5,
          }, 'settlement-label');
          // Map Styling For US Counties, Confirmed, Default Visibility is Off
          map.addLayer({
              'id': 'County_Confirmed_Style',
              'type': 'fill',
              'source': 'counties_data',
              'paint': {
                  'fill-color': {
                      'property': 'Confirmed',
                      //blue colors
                      'stops': [
                          [0, '#f7fbff'],
                          [100, '#deebf7'],
                          [500, '#c6dbef'],
                          [1000, '#9ecae1'],
                          [5000, '#6baed6'],
                          [10000, '#4292c6'],
                          [50000, '#2171b5'],
                          [100000, '#084594']
                      ]
                  },
                  //change opacity on hover, default to 50% opacity
                  'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5]
              },
              'layout': {
                  // make layer visible by default
                  'visibility': 'none'
              },
              'minzoom': 5.5,
          }, 'settlement-label');
          // Switch Between Layers (Deaths + Recovered)
          var layer = document.getElementById('layer');
          //Get the text of the Button on Click and then change it to the other style
          var clickedLayer = layer.innerHTML;
          layer.addEventListener('click', function (e) {
              var clickedLayer = this.textContent;
              console.log(e)
              e.preventDefault();
              e.stopPropagation();
              if (clickedLayer) {
                var stateDeathLegendEl = document.getElementById('state-death-legend');
                var countyDeathLegendEl = document.getElementById('county-death-legend');
                var stateConfirmedLegendEl = document.getElementById('state-confirmed-legend');
                var countyConfirmedLegendEl = document.getElementById('county-confirmed-legend');
                  var visibility_deaths = map.getLayoutProperty('Deaths_Style', 'visibility');
                  if (visibility_deaths === 'visible') {
                      map.setLayoutProperty('Deaths_Style', 'visibility', 'none');
                      map.setLayoutProperty('Confirmed_Style', 'visibility', 'visible');
                      map.setLayoutProperty('County_Deaths_Style', 'visibility', 'none');
                      map.setLayoutProperty('County_Confirmed_Style', 'visibility', 'visible');
                      e.srcElement.textContent = "Toggle Deaths";
                      e.srcElement.style.borderColor = '#084594';
                      state_style = 'Confirmed_Style';
                      county_style = 'County_Confirmed_Style';
                      map.on('zoom', function () {
                        if (map.getZoom() > 5.5) {
                            stateConfirmedLegendEl.style.display = 'none';
                            countyConfirmedLegendEl.style.display = 'block';
                        } else {
                            stateConfirmedLegendEl.style.display = 'block';
                            countyConfirmedLegendEl.style.display = 'none';
                        }
                    });
                  } else {
                      map.setLayoutProperty('Confirmed_Style', 'visibility', 'none');
                      map.setLayoutProperty('Deaths_Style', 'visibility', 'visible');
                      map.setLayoutProperty('County_Deaths_Style', 'visibility', 'visible');
                      map.setLayoutProperty('County_Confirmed_Style', 'visibility', 'none');
                      e.srcElement.textContent = "Toggle Confirmed";
                      e.srcElement.style.borderColor = 'tomato';
                      state_style = 'Deaths_Style';
                      county_style = 'County_Deaths_Style';
                      map.on('zoom', function () {
                        if (map.getZoom() > 5.5) {
                            stateDeathLegendEl.style.display = 'none';
                            countyDeathLegendEl.style.display = 'block';
                        } else {
                            stateDeathLegendEl.style.display = 'block';
                            countyDeathLegendEl.style.display = 'none';
                        }
                    });
                  }
              }
          });
          // Create a popup, but don't add it to the map yet.
          var popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false
          });
          var stateStyles = ['Deaths_Style', 'Confirmed_Style'];
          var countyStyles = ['County_Deaths_Style', 'County_Confirmed_Style'];

          //attach mousemove and mouseleave popups for each style
          stateStyles.forEach(function (style) {
              map.on('mousemove', style, function (e) {
                  //   console.log(style);
                  // console.log(e.features)
                  if (e.features.length > 0) {
                      //   console.log(e.features);
                      if (hoveredStateId) {
                          map.setFeatureState({
                              source: 'states_data',
                              id: hoveredStateId
                          }, {
                              hover: false
                          });
                      }
                      hoveredStateId = e.features[0].id;
                      map.setFeatureState({
                          source: 'states_data',
                          id: hoveredStateId
                      }, {
                          hover: true
                      });
                      var name = e.features[0].properties.name;
                      var coordinates = e.lngLat;
                      var Deaths = e.features[0].properties.Deaths;
                      var Confirmed = e.features[0].properties.Confirmed;
                      var description = `<strong>${name.toLocaleString()}</strong><br/><strong>Deaths: ${Deaths.toLocaleString()}</strong><br/><strong>Confirmed: ${Confirmed.toLocaleString()}</strong>`;
                      popup.setLngLat(coordinates).setHTML(description).addTo(map);
                  }
              });
              map.on('mouseleave', style, function (e) {
                  //   console.log(style);
                  if (hoveredStateId) {
                      map.setFeatureState({
                          source: 'states_data',
                          id: hoveredStateId
                      }, {
                          hover: false
                      });
                      popup.remove();
                  }
                  hoveredStateId = null;
              });
          });
          countyStyles.forEach(function (style) {
              map.on('mousemove', style, function (e) {
                //   console.log(e.features[0].id);
                //   console.log(e.features);
                  //   console.log(style);
                  if (e.features.length > 0) {
                    //   console.log(e.features);
                      if (hoveredStateId) {
                          map.setFeatureState({
                              source: 'counties_data',
                              id: hoveredStateId
                          }, {
                              hover: false
                          });
                      }
                      hoveredStateId = e.features[0].id;
                      map.setFeatureState({
                          source: 'counties_data',
                          id: hoveredStateId
                      }, {
                          hover: true
                      });
                      var name = e.features[0].properties.name;
                      var coordinates = e.lngLat;
                      var Deaths = e.features[0].properties.Deaths;
                      var Confirmed = e.features[0].properties.Confirmed;
                      var description = `<strong>${name}</strong><br/><strong>Deaths: ${Deaths.toLocaleString()}</strong><br/><strong>Confirmed: ${Confirmed.toLocaleString()}</strong>`;
                      popup.setLngLat(coordinates).setHTML(description).addTo(map);
                  };
              });
              map.on('mouseleave', style, function (e) {
                  if (hoveredStateId) {
                      map.setFeatureState({
                          source: 'counties_data',
                          id: hoveredStateId
                      }, {
                          hover: false
                      });
                        popup.remove();
                  }
                  hoveredStateId = null;
              });
          });
      });
  });
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

var featureGroup, featureGroup_2;

var myFilter = function(feature){
  if(feature.properties['Country/Region'] == 'US'){ 
    return true;
  };
};

var data_map_style = function(feature){
  console.log(feature);
  return {
    opacity: 0
  };
}

var base_map_style = function(feature){}

var eachFeatureFunction = function(layer) {
  layer.on('click', function (e) {})
};

$(document).ready(function() {
  featureGroup = L.geoJson(statesData, {
    style: base_map_style
  }).addTo(map);
  
  featureGroup_2 = L.geoJson(geo_data, {
    style: data_map_style,
    filter: myFilter
  }).addTo(map);
  featureGroup.eachLayer(eachFeatureFunction);
});
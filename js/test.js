_.each(geo_data.features, function(feature){
    if(feature.properties['Country/Region'] == 'US'){
        // console.log(feature.properties['Province/State']);
        _.find(statesData.features, function(state_feature){
            if(feature.properties['Province/State'] == state_feature.properties.name){
                state_feature.properties['Last Update'] = feature.properties['Last Update'];
                state_feature.properties['Confirmed'] = feature.properties['Confirmed'];
                state_feature.properties['Deaths'] = feature.properties['Deaths'];
                state_feature.properties['Recovered'] = feature.properties['Recovered'];
                delete state_feature.properties.density;
            }
        });
        return true;
    }
});
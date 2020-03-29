//This function downloads the CSV File data, processess it to GEOJSON, and then Filters it for the US Subsect, 
//and finally adds it to the states js file
var get_data = function (url) {
    var download = $.ajax({
        url: url
    });
    var combined_promise = download.done(function (downloaded_data) {
        if (typeof downloaded_data !== 'undefined') {
            csv2geojson.csv2geojson(downloaded_data, function (err, data) {
                // console.log(data);
                var us_subsect = filter_us_data(data);
                var calc_total = calc_totals(us_subsect);
                var combined_data = combine_files(calc_total);
                // console.log(combined_data);
            });
        };
        // console.log(statesData);
        return statesData;        
        // console.log('Converted Data to GEOJSON');
    });

    var filter_us_data = function (data) {
        var us_subsect = [];
        // filter out for only US Data
        _.filter(data.features, function (feature) {
            // console.log(feature);
            var not_in = ['Grand Princess', 'Diamond Princess', 'Wuhan Evacuee', 'Recovered'];
            // if(feature.properties.)  
            if (not_in.indexOf(feature.properties['Province_State']) >= 0) {
                delete feature;
            } else if (feature.properties['Country_Region'] == 'US') {
                us_subsect.push(feature);
            }
        });
        // console.log(us_subsect);
        return us_subsect;
    };

    var calc_totals = function (us_subsect_data) {
        //calculate totals for each state;
        var confirmed_state_total = _.reduce(us_subsect_data, function (memo, item) {
            memo[item.properties.Province_State] = (memo[item.properties.Province_State] || 0) + parseInt(item.properties.Confirmed);
            return memo;
        }, {});
        // console.log(confirmed_state_total);
        var death_state_total = _.reduce(us_subsect_data, function (memo, item) {
            memo[item.properties.Province_State] = (memo[item.properties.Province_State] || 0) + parseInt(item.properties.Deaths);
            return memo;
        }, {});
        // console.log(death_state_total);
        var recovered_state_total = _.reduce(us_subsect_data, function (memo, item) {
            memo[item.properties.Province_State] = (memo[item.properties.Province_State] || 0) + parseInt(item.properties.Recovered);
            return memo;
        }, {});
        // console.log(recovered_state_total);
        return {
            confirmed_state_total: confirmed_state_total,
            death_state_total: death_state_total,
            recovered_state_total: recovered_state_total
        };
    }

    var combine_files = function (data_totals) {
        //add COVID-19 data to the states.js file
        // console.log(Object.keys(data_totals));
        var combined = _.each(statesData.features, function (state_feature) {
            var state = state_feature.properties.name;
            state_feature.properties.Confirmed = data_totals['confirmed_state_total'][state];
            state_feature.properties.Deaths = data_totals['death_state_total'][state];
            state_feature.properties.Recovered = data_totals['recovered_state_total'][state];
            delete state_feature.properties.density;
        });
        //  console.log(statesData.features);
        return combined;
    };
    return combined_promise;
};
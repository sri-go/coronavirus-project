//This function downloads the CSV File data, processess it to GEOJSON, and then Filters it for the US Subsect, 
//and finally adds it to the states js file
var get_data = function (url) {
    var download = $.ajax({
        url: url
    });
    var combined_promise = download.done(function (downloaded_data) {
        if (typeof downloaded_data !== 'undefined') {
            csv2geojson.csv2geojson(downloaded_data, function (err, data) {
                var us_only_counties = filter_counties(data);
                var calc_county_totals = county_totals(us_only_counties);
                var combined_data = combined_county(calc_county_totals);

                var us_subsect = filter_us_data(data);
                var calc_total = calc_totals(us_subsect);
                var combined_data = combine_files(calc_total);
                // console.log(combined_data);
            });
        };
    });

    //County Level Data
    var filter_us_county_data = function (data) {
        //filter our GUAM, VIRGIN ISLANDS
        var not_in = ['66', '78'];
        if (not_in.indexOf(data.properties.FIPS) >= 0) {
            delete data;
        } else {
            return data;
        }
    }
    var filter_counties = function (data) {
        var z = _.each(data.features, function (feature) {
            // console.log(feature.properties.FIPS);
            return filter_us_county_data(feature);
        });
        return z;
    };
    var county_totals = function (data) {
        var county_confirmed_totals = _.reduce(data, function (memo, item) {
            // console.log(item);
            memo[item.properties.FIPS] = (memo[item.properties.FIPS] || 0) + parseInt(item.properties.Confirmed);
            return memo;
        }, {});
        // console.log(county_confirmed_totals);
        var county_deaths_totals = _.reduce(data, function (memo, item) {
            memo[item.properties.FIPS] = (memo[item.properties.FIPS] || 0) + parseInt(item.properties.Deaths);
            return memo;
        }, {});
        // console.log(county_deaths_totals);
        return {
            confirmed_county_total: county_confirmed_totals,
            death_county_total: county_deaths_totals
        };
    };
    var combined_county = function(data_totals) {
        //The data file clips 0's off the FIPS column, so we need to go back and
        //add them back in.  
        var fix_fips = _.each(data_totals, function(total){
            // keep track of the keys old and new
            var new_keys = [];
            var old_keys = [];
            //for each key lets replace make a new key from the old
            // add the result the the respective array (old and new)
            var a = _.each(Object.keys(total), function(fips){
                var neww;
                old_keys.push(fips);
                // console.log(fips.length)
                if(fips.length === 2){
                    neww = '000'+fips;
                    // console.log(neww);
                    new_keys.push(neww);
                }
                else if(fips.length === 4){
                    neww = '0'+fips;
                    // console.log(neww);
                    new_keys.push(neww);
                }
                else{
                    // console.log('else',fips);
                    new_keys.push(fips);
                }
            });
            // console.log('new_keys_length',new_keys.length);
            // console.log('old_keys_length',old_keys.length);
            i = 0;
            var b = _.map(old_keys, function(key){
                if (key !== new_keys[i]) {
                    Object.defineProperty(total, new_keys[i],
                        Object.getOwnPropertyDescriptor(total, key));
                    delete total[key];
                }
                i++;
            });
        });
        // 
        id = 01;
        var combined = _.map(counties.features, function (county_feature) {
            var county = county_feature.properties.fips;
            county_feature.id = id;
            id++;
            county_feature.properties.Confirmed = data_totals['confirmed_county_total'][county];
            county_feature.properties.Deaths = data_totals['death_county_total'][county];
            var deaths = data_totals['death_county_total'][county];
            if(!(county in data_totals['confirmed_county_total'])){
                // console.log(county);
                county_feature.properties.Confirmed = 0;
            }
            if(!(county in data_totals['death_county_total'])){
                county_feature.properties.Deaths = 0;
            }
        });
        return combined;
    };

    //State Level Data
    //filtering for only usa data at state level
    //also removing some misc data that has USA listed as its country
    var filter_us_data = function (data) {
        var us_subsect = [];
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
    //reduce function boils list down to one number for each state
    //utilizing it here to get one total for each state
    var calc_totals = function (us_subsect_data) {
        // console.log(us_subsect_data)
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
        var total_death_us = 0;
        var us_death_total = _.each(death_state_total, function(state){
            // console.log(state);
            total_death_us = total_death_us + state;
        });
        console.log(total_death_us);
        var total_confirmed_us = 0;
        var us_confirmed_total = _.each(confirmed_state_total, function(state){
            // console.log(state);
            total_confirmed_us = total_confirmed_us + state;
        });
        console.log(total_confirmed_us);
        return {
            confirmed_state_total: confirmed_state_total,
            death_state_total: death_state_total,
            recovered_state_total: recovered_state_total,
            us_death_total: total_death_us,
            us_confirmed_total: total_confirmed_us
        };
    };
    //combining data back to one file
    var combine_files = function (data_totals) {
        //add COVID-19 data to the states.js file
        statesData.us_death_total = data_totals.us_death_total;
        statesData.us_confirmed_total = data_totals.us_confirmed_total;
        console.log(statesData);
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
//Define an angular module for our app
var app = angular.module('myApp', ['ui-rangeSlider']);
window.DEFAULT_CITY = 'Maringá';
window.DEFAULT_PROPERTY_TYPE = 'TERRENO';


app.controller('dataController', function($scope, $http) {

	//prepare range filters
	$scope.rangeFilters = getRangeFilters();

	
	//cache data
	getAllProperties(DEFAULT_CITY, DEFAULT_PROPERTY_TYPE, function(data){
		$scope.properties = function(){return getFilteredProperties($scope.cachedProperties);};
	});

	

	function getLowestValue(data, field){
		_.min(data, function(d){return d[field];});
	}

	function getHighestValue(data, field){
		_.max(data, function(d){return d[field];});
	}

	function getFilteredProperties(cachedProperties){
		console.log('filtering...');
		var filteredData;
		filteredData = filterByRangeFilter($scope.rangeFilters, cachedProperties);
		console.log(filteredData);
		return filteredData;
	}

	function filterByRangeFilter(rangeFilters, data){
		var filteredData = [];
		for(var i=0; i<data.length; i++){
			var passesFilter = true;

			for(var j=0; j<rangeFilters.length; j++){
				var elementValue = getValue(data[i],rangeFilters[j].dbName);
				//if doesnt pass filter
				if(rangeFilters[j].lowValue > elementValue || rangeFilters[j].upValue < elementValue){
					passesFilter = false;
					break;
				}
			}

			if(passesFilter){
				filteredData.push(data[i]);
			}
		}
		return filteredData;
	}


	//main data request is based on (city, property_type). 
	//All matching data is cached, so that user-side filtering doesn't need any new data request.
	function getAllProperties(city, property_type, callback){
		$http.get("ajax/getAllProperties.php?city="+city+"&property_type="+property_type).success(function(data){
			console.log(data);
			$scope.cachedProperties = data;
			callback(data);
		});
	};
 
});



//very stupid and restricted parser to get the value of dbName in element.
//the idea is that it is able to handle cases of simple ratios (/) and multiplications (*)
function getValue(element, dbName){
	if(dbName.indexOf('/')>=0){
		var splitDbName = dbName.split('/');
		return element[splitDbName[0]] / element[splitDbName[1]];
	}
	if(dbName.indexOf('*')>=0){
		var splitDbName = dbName.split('*');
		return element[splitDbName[0]] * element[splitDbName[1]];
	}
	return element[dbName];
}

function getRangeFilters(){
	var rangeFilters = [];
	//var distanceToCenterFilter = {"name":"distancia ao centro","dbName":"distance_center","unit":"km","lowBound":0,"upBound":10,"lowValue":2,"upValue":4,"decimalPlaces":1};
	//rangeFilters.push(distanceToCenterFilter);
	var propertySizeFilter = {"name":"tamanho do terreno","dbName":"area_total","unit":"m\xB2","lowBound":0,"upBound":1000,"lowValue":200,"upValue":800,"decimalPlaces":0};
	rangeFilters.push(propertySizeFilter);
	var propertyPricePerAreaFilter = {"name":"preco por m\xB2","dbName":"price/area_total","unit":"R$/m\xB2","lowBound":0,"upBound":1000,"lowValue":100,"upValue":1000,"decimalPlaces":0};
	rangeFilters.push(propertyPricePerAreaFilter);
	return rangeFilters;
}



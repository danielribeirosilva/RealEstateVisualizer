//Define an angular module for our app
var app = angular.module('myApp', ['ui-rangeSlider', 'ngMap']);
window.DEFAULT_CITY = 'Maringá';
window.DEFAULT_PROPERTY_TYPE = 'TERRENO';
//TODO: get from URL
window.city = DEFAULT_CITY;
window.property_type = DEFAULT_PROPERTY_TYPE;


app.controller('dataController', function($scope, $http, $timeout) {


	
	//first of all, cache all the data (creates $scope.cachedProperties)
	getAllProperties(DEFAULT_CITY, DEFAULT_PROPERTY_TYPE, function(){
		//then, get all neighborhoods (creates $scope.neigborhoods)
		getAllNeighborhoods(DEFAULT_CITY, DEFAULT_PROPERTY_TYPE, function(){


			//prepare range filters
			$scope.rangeFilters = getRangeFilters();

			//prepare checkbox filters
			$scope.checkBoxFilters = getCheckBoxFilters($scope.neighborhoods);

			//get data after filtering
			$scope.getConsideredProperties = function(){return getConsideredProperties($scope.cachedProperties);};
			
			//stats variables
			$scope.totalPropertiesOverall = $scope.cachedProperties.length;
			$scope.totalPropertiesConsidered = function(){return $scope.getConsideredProperties().length;};

			//checkbox aux
			$scope.selectAllCheckBoxes = function(data){return setAllCheckBoxesTo(data, true);};
			$scope.unselectAllCheckBoxes = function(data){return setAllCheckBoxesTo(data, false);};

			

			//map
			$scope.markers = [];
			for (var i=0; i<$scope.cachedProperties.length ; i++) {
				$scope.markers[i] = new google.maps.Marker({title: "dummy"});
	            $scope.markers[i].setVisible(false);
			}
			
			$scope.updateMarkers = function(){
				console.log('a');
				updateMarkers(getConsideredProperties($scope.cachedProperties));
				$timeout($scope.updateMarkers,1000);
			};

			$timeout($scope.updateMarkers,1000);


		});
	});

	


	function getLowestValue(data, field){
		return _.min(data, function(d){return parseFloat(d[field]);})[field];
	}

	function getHighestValue(data, field){
		return _.max(data, function(d){return parseFloat(d[field]);})[field];
	}


	//-------------------
	//		FILTERS
	//-------------------

	//apply all filters
	function getConsideredProperties(cachedProperties){
		var filteredData;
		
		//filter by range filters
		filteredData = filterByRangeFilter($scope.rangeFilters, cachedProperties);

		filteredData = filterByCheckBoxFilter($scope.checkBoxFilters, filteredData);

		return filteredData;
	}

	//apply range filters to data
	function filterByRangeFilter(rangeFilters, data){
		var filteredData = [];
		for(var i=0; i<data.length; i++){
			var passesFilter = true;

			for(var j=0; j<rangeFilters.length; j++){
				var elementValue = getValue(data[i],rangeFilters[j].dbName);
				//if pointer is on upBound, don't filter high values
				if(rangeFilters[j].lowValue < elementValue && rangeFilters[j].upValue == rangeFilters[j].upBound){
					continue;
				}
				//same for lower bound
				if(rangeFilters[j].upValue > elementValue && rangeFilters[j].lowValue == rangeFilters[j].lowBound){
					continue;
				}
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


	//apply check box filters to data
	function filterByCheckBoxFilter(checkBoxFilters, data){
		var filteredData = [];

		//for data each point
		for(var i=0; i<data.length; i++){
			var passesFilter = true;
			

			//for each check box filter
			for(var j=0; j<checkBoxFilters.length; j++){

				var currentFilterData = checkBoxFilters[j].data;

				//for each check box
				for(var k = 0; k<currentFilterData.length; k++){

					if(data[i].neighborhood == currentFilterData[k].option){
						if(!currentFilterData[k].active){
							passesFilter = false;
						}
						break;
					}
				}

				if(!passesFilter){
					break;
				}

			}

			if(passesFilter){
				filteredData.push(data[i]);
			}
		}
		return filteredData;
	}


	//prepares the range filters
	function getRangeFilters(){
		var rangeFilters = [];
		//DISTANCE TO CENTER
		//var distanceToCenterFilter = {"name":"distancia ao centro","dbName":"distance_center","unit":"km","lowBound":0,"upBound":10,"lowValue":2,"upValue":4,"decimalPlaces":1};
		//rangeFilters.push(distanceToCenterFilter);
		//PROPERTY SIZE
		var propertySizeFilter = {"name":"tamanho do terreno","dbName":"area_total","unit":"m\xB2","lowBound":0,"upBound":1000,"lowValue":200,"upValue":330,"decimalPlaces":0};
		rangeFilters.push(propertySizeFilter);
		//PRICE PER AREA
		var propertyPricePerAreaFilter = {"name":"preco por m\xB2","dbName":"price/area_total","unit":"R$/m\xB2","lowBound":0,"upBound":800,"lowValue":100,"upValue":370,"decimalPlaces":0};
		rangeFilters.push(propertyPricePerAreaFilter);
		return rangeFilters;
	}


	//prepares the check box filters
	function getCheckBoxFilters(neighborhoods){
		var checkBoxFilters = [];
		//NEIGHBORHOODS
		var neighborhoodFilter = {"name":"bairros","dbName":"neighborhood","data":neighborhoods};
		checkBoxFilters.push(neighborhoodFilter);

		return checkBoxFilters;
	}

	//very stupid and restricted parser to get the value of dbName in element.
	//the idea is that it is able to handle cases of simple ratios (/) and multiplications (*)
	function getValue(element, dbName){
		if(dbName.indexOf('/')>=0){
			var splitDbName = dbName.split('/');
			if(element[splitDbName[1]] == 0){return 0;}
			return element[splitDbName[0]] / element[splitDbName[1]];
		}
		if(dbName.indexOf('*')>=0){
			var splitDbName = dbName.split('*');
			return element[splitDbName[0]] * element[splitDbName[1]];
		}
		return element[dbName];
	}



	function setAllCheckBoxesTo(dataList, selectedBoolean){
		for(var i=0; i<dataList.length; i++){
			dataList[i].active = selectedBoolean;
		}
	}


	//-------------------
	//		MAP
	//-------------------

	function updateMarkers(filteredPoints){

		makeAllMarkersInvisible();

		var currentMarker = 0;
		for (var i=0; i<filteredPoints.length ; i++) {
			
			var neighborhood = filteredPoints[i].neighborhood;
			if($scope.neighborhoodInfo.hasOwnProperty(neighborhood)){

				var lat = $scope.neighborhoodInfo[neighborhood].lat;
				var lon = $scope.neighborhoodInfo[neighborhood].lon;
				var loc = new google.maps.LatLng(lat, lon);

				$scope.markers[currentMarker].setVisible(true);
				$scope.markers[currentMarker].setTitle(neighborhood);
            	$scope.markers[currentMarker].setPosition(loc);
            	$scope.markers[currentMarker].setMap($scope.map);

				currentMarker++;
			}

		}
		
	}


	function makeAllMarkersInvisible(){
		for(var i=0; i<$scope.markers.length; i++){
			$scope.markers[i].setVisible(false);
		}
	}



	//-------------------
	//		AJAX
	//-------------------

	//main data request is based on (city, property_type). 
	//All matching data is cached, so that user-side filtering doesn't need any new data request.
	function getAllProperties(city, property_type, callback){
		console.log('querying db ...');
		$http.get("ajax/getAllProperties.php?city="+city+"&property_type="+property_type).success(function(data){
			$scope.cachedProperties = data;
			callback();
		});
	};

	//data request for neighborhood list for given (city, property_type).
	function getAllNeighborhoods(city, property_type, callback){
		console.log('querying db ...');
		$http.get("ajax/getAllNeighborhoods.php?city="+city+"&property_type="+property_type).success(function(data){
			var neighborhoodList = [];
			var neighborhoodInfo = [];
			
			for(var i=0; i<data.length; i++){
				//activate all initially
				neighborhoodList.push({'option':data[i].neighborhood,'active':true});
				//record geographic coordinates
				if(data[i].lat != null){
					neighborhoodInfo[data[i].neighborhood] = {'lat':data[i].lat, 'lon':data[i].lon};
				}
			}
			$scope.neighborhoods = neighborhoodList;
			$scope.neighborhoodInfo = neighborhoodInfo;
			callback();
		});
	};
 
});//end of app








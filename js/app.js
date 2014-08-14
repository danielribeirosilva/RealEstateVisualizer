//Define an angular module for our app
var app = angular.module('myApp', []);
var DEFAULT_CITY = 'Maringá';
 
app.controller('dataController', function($scope, $http) {

	//get default data
	getAllProperties(DEFAULT_CITY);

	
	function getAllProperties(city){
		$http.get("ajax/getAllProperties.php?city="+city).success(function(data){
			$scope.properties = data;
			console.log(data);
		});
	};


 
});
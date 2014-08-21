<?php

require_once('../utils/database.php');

$DEFAULT_CITY = 'Maringá';
$DEFAULT_PROPERTY_TYPE = 'TERRENO';


$city = $DEFAULT_CITY;
$property_type = $DEFAULT_PROPERTY_TYPE;

if(isset($_GET['city'])){
	//TODO: sanitize
	// $city = $_GET['city'];
	// $city = html_entity_decode($city);
	// $property_type = $_GET['property_type'];
	// $property_type = html_entity_decode($property_type);
}
if(isset($_GET['property_type'])){
	//TODO: sanitize
	$property_type = $_GET['property_type'];
	$property_type = html_entity_decode($property_type);
}

echo json_encode(getAllNeighborhoods($city, $property_type));

function getAllNeighborhoods($city, $property_type){
	$dbh = Database::connect();
	$query = "SELECT DISTINCT(neighborhood) AS neighborhood FROM properties
			  WHERE `city` = '" . $city . "' AND `property_type` = '" . $property_type . "'
			  ORDER BY neighborhood";
	$sth = $dbh->prepare($query);
	$sth->execute();
	$res = array() ;
	for($i = 0 ; $i < $sth->rowCount() ; $i++){
		$res[$i] = $sth->fetch()['neighborhood'];
	}
	return $res;
}

?>
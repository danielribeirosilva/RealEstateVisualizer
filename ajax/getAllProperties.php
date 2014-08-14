<?php

require_once('../utils/database.php');

$DEFAULT_CITY = 'Maringá';


$city = $DEFAULT_CITY;

if(isset($_GET['city'])){
	//TODO: sanitize
	$city = $_GET['city'];
}

echo json_encode(getAllProperties($city));

function getAllProperties($city){
	$dbh = Database::connect();
	$query = "SELECT * FROM properties WHERE `city` = '" . $city . "' LIMIT 10";
	$sth = $dbh->prepare($query);
	$sth->execute();
	$res = array() ;
	for($i = 0 ; $i < $sth->rowCount() ; $i++){
		$res[$i] = $sth->fetch();
	}
	return $res;
}

?>
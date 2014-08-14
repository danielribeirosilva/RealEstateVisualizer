<?php

$DBH = null;

class Database {

	public static function connect() {

		global $DBH;

		$dsn = 'mysql:dbname=real_estate_analytics;host=localhost';
		$user = 'root';
		$password = 'root';

		if ($DBH == null){
			try {
				$dbh = new PDO($dsn, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
				$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			} catch (PDOException $e) {
				echo 'Connection failed : ' . $e->getMessage();
				exit(0);
			}

			$DBH = $dbh;
			return $dbh;
		} else {
			return $DBH;
		}
	}
}

?>
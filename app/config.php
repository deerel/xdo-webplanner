<?php 
return [
	
	'app' => [
		'name'			=> 'Xdo',
		'domain'		=> 'http://YOURDOMAIN',
		'debug'	 		=> true,
		'maintenance' 	=> false,
	],

	'email' => [
		'headers'  => [
			"MIME-Version: 1.0",
			"Content-type: text/html; charset=UTF-8",
			"From: xdo <noreply@xdo.se>",
		], 
	],
	
	'database' => [
		'user' 			=> 'USER',
		'password' 		=> 'PASS',
		'name' 			=> 'DBNAME',
		'connection' 	=> 'mysql:host=127.0.0.1',
		'options'		=> [
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"
		],
	],

];
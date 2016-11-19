<?php 
return [
	
	'app' => [
		'name'			=> 'Xdo',
		'domain'		=> 'http://xdo.se',
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
		'user' 			=> 'u_xdo',
		'password' 		=> 'ba9360c05632efe5c1bc633701b8a561',
		'name' 			=> 'xdo',
		'connection' 	=> 'mysql:host=127.0.0.1',
		'options'		=> [
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"
		],
	],

];
<?php
require_once 'app/init.php';

$uri = isset($_GET['uri']) ? '/' . $_GET['uri'] : '/';

if(!array_key_exists($uri, $routes = require 'app/routes.php'))
{
	App::die(404);
}

$page = $routes[$uri];

$device = App::get('device')->isMobile() ? 'Mobile' : 'Desktop';

if($device == 'Desktop') 
{
	$mode = (isset($_GET['mode']) && $_GET['mode'] == 'month') ? 'month' : 'week';
}
else
{
	$mode = 'month';
}


App::get('view')->share('device', $device);
App::get('view')->share('mode', $mode);

App::get('view')->cdata = [
	'USER_AGENT' 	=> $device,
	'CURRENT_PAGE' 	=> $page,
	'MODE'			=> $mode,
	'DOMAIN' 		=> App::config('app.domain'),
];

App::get('view')->render($page);

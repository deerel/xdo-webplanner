<?php

function dd($item, $die = false)
{
	echo '<pre>', print_r($item), '</pre>';
	if($die) die();
}

function url(string $url)
{
	return App::config('app.domain') . $url;
}

function redirect(string $url)
{
	header('Location: ' . url($url));
	exit();
}

function template(string $template)
{
	if(file_exists($template = VIEW_PATH . "/templates/{$template}.view.php"))
	{
		extract(View::data());

		require $template;
	}
}



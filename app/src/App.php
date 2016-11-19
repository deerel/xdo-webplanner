<?php

class App
{
	private static $registry = [];

	public static function get(string $key)
	{
		return isset(self::$registry[$key]) ? self::$registry[$key] : null;
	}

	public static function bind(string $key, $value)
	{
		if(array_key_exists($key, self::$registry))
		{
			throw new Exception("Key {$key} has already been bound to the application.");
		}

		self::$registry[$key] = $value;
	}

	public static function config(string $path)
	{
		if(!App::get('config'))
		{
			throw new Exception("No configurations have been loaded.");
		}

		$segments = explode('.', $path);
		$config = App::get('config');

		foreach($segments as $key => $val)
		{	
			if(!isset($config[$val]))
		 	{
				throw new Exception("Key {$val} does not exist");
			}

		 	$config = $config[$val];
		}

		return $config;
	}

	public static function mail($receipient, $subject, $template)
	{
		if(is_array($receipient))
		{
			$receipient = implode(',', $receipient);
		}

		$template = VIEW_PATH . "/emails/{$template}.view.php";
		
		if(file_exists($template))
		{			
			ob_start();
			include($template);
			$message = ob_get_clean();

			mail($receipient, $subject, $message, implode("\r\n", App::config('email.headers')));
		}		
	}

	public static function die($state)
	{
		switch($state)
		{
			case 403:
				header('HTTP/1.0 403 Forbidden');
				break;

			case 404:
				header('HTTP/1.0 404 Not Found');
				App::get('view')->render('404');
				break;
			
			case 503:
				header('HTTP/1.0 503 Service Temporarily Unavailable');
				header('Status: 503 Service Temporarily Unavailable');
				App::get('view')->render('503');
				break;
		}

		exit();
	}
}
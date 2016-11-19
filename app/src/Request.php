<?php

class Request
{
	public static function has()
	{
		$arguments = func_get_args();

		foreach($arguments as $argument)
		{
			if( isset($_POST[$argument]) ) continue; 
			if( isset($_FILES[$argument]) ) continue;
			if( isset($_GET[$argument]) ) continue;

			return false;
		}

		return true;
	}

	public static function input()
	{	
		if(!$arguments = func_get_args()) 
		{
			throw new Exception("Request::input requires at least 1 parameter, 0 given.");
		}

		$output = [];

		foreach($arguments as $argument)
		{
			if ( isset($_POST[$argument]) )
			{
				$output[$argument] = $_POST[$argument];
				continue;
			}

			if ( isset($_FILES[$argument]) )
			{
				$output[$argument] = $_FILES[$argument];
				continue;
			}

			if ( isset($_GET[$argument]) )
			{
				$output[$argument] = $_GET[$argument];
			} 
		}

		return func_num_args() > 1 ? $output : $output[$arguments[0]]; 
	}

	public static function file(string $file)
	{
		if (isset($_FILES[$file]) && $_FILES[$file]['tmp_name'] != '' && !$_FILES[$file]['error'])
		{
			return (object) $_FILES[$file];
		}

		return false;
	}
}
<?php
class Session
{
	const OVERWRITE_MODE = 1;

	public static function flash($type, $message, array $bag = [])
	{
		if (self::OVERWRITE_MODE || !self::exists('flash')) 
		{
			self::set('flash', ['type' => $type, 'message' => $message, 'bag' => $bag]);
		}
	}

	public static function get($key)
	{
		$segments = array_filter(explode('.', $key));
		
		if (!self::exists($segments[0]))
		{
			throw new InvalidArgumentException("Session $key does not exists.");
		}

		$session = $_SESSION[$segments[0]];
		array_shift($segments);

		foreach($segments as $bit)
		{
			if(isset($session[$bit]))
			{
				$session = $session[$bit];
			}
		}

		return $session;
	}

	public static function set(string $key, $data)
	{
		$_SESSION[$key] = $data;
	}

	public static function destroy($key)
	{
		unset($_SESSION[$key]);
	}

	public static function exists(string $key)
	{
		return isset($_SESSION[$key]);
	}
}
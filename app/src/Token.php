<?php 
class Token
{
	public static function make()
	{
		Session::destroy('token');
		
		Session::set('token', self::generate());

		return Session::get('token');
	}

	public static function verify($token)
	{
		if (Session::exists('token')) 
		{
			if(hash_equals(Session::get('token'), $token))
			{
				Session::destroy('token');

				return true;
			}
		} 
		
		Session::destroy('token');
		
		return false;
	}
	
	public static function generate()
	{
		return bin2hex(random_bytes(32));
	}
}
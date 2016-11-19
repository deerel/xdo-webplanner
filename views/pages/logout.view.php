<?php

if(User::auth())
{
	$user->update(['cookie' => '']);
	
	unset($_COOKIE['remember-login']);
	setcookie('remember-login', '', time() - 3600);

	Session::destroy('userid');
}

redirect('/');
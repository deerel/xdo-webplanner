<?php
if(Request::has('token'))
{
	$token = preg_replace('/[^0-9a-z]/', '', Request::input('token'));
	$user = App::get('database')->query("SELECT id FROM users WHERE token = ? AND activated = '0'", [$token])->first();
	
	if($user)
	{
		App::get('database')->query("UPDATE users SET activated = '1', token = '' WHERE id = ?", [$user['id']]);
		Session::flash('success', '<strong>Nice!</strong> Your account has been activated.');
		redirect('/');
	}
}
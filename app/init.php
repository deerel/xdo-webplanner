<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

define('APP_PATH', __DIR__);
define('ASSET_PATH', __DIR__ . '/../assets');
define('VIEW_PATH', __DIR__ . '/../views');
define('VENDOR_PATH', __DIR__ . '/../vendors');
define('UPLOAD_PATH', __DIR__ . '/../assets/img/uploads');

require_once 'utilities.php';

require_once 'src/App.php';
require_once 'src/Database.php';
require_once 'src/Request.php';
require_once 'src/Session.php';
require_once 'src/Token.php';
require_once 'src/User.php';
require_once 'src/Validation.php';
require_once 'src/View.php';

require_once VENDOR_PATH . '/MobileDetect/MobileDetect.php';
require_once VENDOR_PATH . '/ImageUpload/ImageUpload.php';

// Load configurations
App::bind('config', require_once 'config.php');

// Bind various stuff we will use
App::bind('database', new Database());
App::bind('view', new View());
App::bind('device', new MobileDetect());

if (!User::auth() && isset($_COOKIE['remember-login'])) 
{
	list($userid, $token, $mac) = explode(':', $_COOKIE['remember-login']);
	
	if (hash_equals(hash_hmac('sha256', $userid . ':' . $token, 'secret'), $mac)) 
	{
		if($user = App::get('database')->query("SELECT * FROM users WHERE id = ?", [$userid])->first())
		{	
			if (hash_equals($user['cookie'], $token)) 
			{
			    Session::set('userid', $user['id']);
			}
		}
	}
}	

// Bind logged in user to the application and the view component
if(User::auth())
{
	App::bind('user', new User(Session::get('userid')));
	
	App::get('view')->share('user', App::get('user'));
}


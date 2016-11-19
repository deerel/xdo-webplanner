<?php
if(User::auth())
{
	redirect('/planner');
}

if(Request::has('email', 'password'))
{
	// if (!Token::verify(Request::input('csrftoken')))
	// {
	// 	Session::flash('error', 'Unexpected error.');
	// 	redirect('/');
	// }	

	$validator = new Validation();
	$validator->validate(Request::input('email', 'password'), [
		'email' 	=> 'required|email|max:100',
		'password' 	=> 'required'
	]);

	if($validator->failed())
	{
		Session::flash('error', '<strong>Whoops!</strong> There were some problems with your input.', $validator->getErrors());
		redirect('/');
	}

	$sql = "SELECT * FROM users WHERE email = ? AND activated = '1' LIMIT 1";
	$user = App::get('database')->query($sql, [Request::input('email')])->first();

	if(empty($user) || !password_verify($_POST['password'], $user['password']))
	{
    	Session::Flash('error', 'Invalid email or password.');
    	redirect('/');
	}

	// Create new user object
	$user = new User($user);

	if (isset($_POST['rememberme'])) 
	{
		$token = Token::generate();
		$user->update(['cookie' => $token]); 		

		$cookie = $user->id . ':' . $token;
		$mac = hash_hmac('sha256', $cookie, 'secret');
		$cookie .= ':' . $mac;

		setcookie('remember-login', $cookie, strtotime('+30 days'));
	}

	// Sign user in
	$user->login();

    // Redirect to dashboard 
    Session::flash('success', "Welcome back $user->firstname!");
    redirect('/planner');
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Sign in</title>
	<?php template('head'); ?>
</head>
<body>
	<div class="container">
		<div id="logo" class="col-md-offset-1">
			<img src="<?=url('/assets/img/logo.png')?>" alt="">
		</div>
		<div class="xs-hidden sm-hidden col-md-4 col-md-offset-1">
			<div id="promo"><img src="<?=url('/assets/img/cover2.png')?>" alt=""></div>
		</div>
		<div class="panel col-xs-12 col-sm-12 col-md-6 col-md-push-1">
			<div class="panel-mast">
				<h5>Sign in to your xdo account</h5>
			</div>
			<div class="panel-body">
				<?php template('flash'); ?>
				<form id="loginForm" class="form" method="POST" action="<?= url('/') ?>">
					
					<!-- Email -->
					<div class="form-field">
						<h6>Email</h6>
						<input class="form-input" type="text" name="email" />
					</div>

					<!-- Password -->
					<div class="form-field">
						<h6>Password</h6>
						<input class="form-input" type="password" name="password" />
					</div>

					<!-- Remember -->
					<div class="form-field">
						<h6 class="flex flex-vcenter">
							<span>Remember?</span> 
							<input type="checkbox" name="rememberme" value="1">
						</h6>
					</div>

					<!-- Submit -->
					<div class="form-field">	
						<button class="form-submit btn btn-sm btn-primary">Sign in</button>
						<a class="btn-sm pull-right" href="<?=url('/register')?>">Not a user?</a>
					</div>
					
				</form>
			</div>
		</div>
	</div>
	<?=template('footer')?>
</body>
</html>
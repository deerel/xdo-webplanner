<?php
if(User::auth())
{
    redirect('/planner');
}

if(Request::has('email', 'fname', 'lname', 'password')) 
{
	// if (!Token::verify(Request::input('csrftoken')))
	// {
	// 	Session::flash('error', 'Unexpected error.');
	// 	redirect('/');
	// }

	$validator = new Validation();
	$validator->validate(Request::input('email', 'fname', 'lname', 'password', 'passwordRepeat'), 
    [
        'email' => 'bail|required|email|max:50|unique:users',
        'fname' => 'required|alpha|min:2|max:30',
        'lname' => 'required|alpha|min:3|max:30',
        'password' => 'required|min:6|max:45|match:passwordRepeat'
	]);

	if($validator->failed())
	{
		Session::flash('error', '<strong>Whoops</strong>, there were some problems with your input:', $validator->getErrors());
		redirect('/register');
	}

	App::get('database')->insert('users', [
		'email' 	 => Request::input('email'),
		'firstname'  => Request::input('fname'),
		'lastname' 	 => Request::input('lname'),
		'password' 	 => password_hash(Request::input('password'), PASSWORD_DEFAULT),
		'token' 	 => md5(time()),
	]);
	
	App::mail(Request::input('email'), 'Activate your xdo account.', 'welcome');

	Session::flash('success', '<strong>Nice!</strong> We have sent a confirmation email to you.');
	redirect('/');
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Register</title>
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
				<h5>Register a new account on xdo</h5>
			</div>
			<div class="panel-body">
				<?php template('flash'); ?>
				<form id="registerForm" class="form" method="POST">
					
					<!-- Email -->
					<div class="form-field">
						<h6>E-mail</h6>
						<input class="form-input" type="text" name="email" />
					</div>

					<!-- First name -->
					<div class="form-field">
						<h6>First name</h6>
						<input class="form-input" type="text" name="fname" />
					</div>

					<!-- Last name -->
					<div class="form-field">
						<h6>Last name</h6>
						<input class="form-input" type="text" name="lname" />
					</div>

					<!-- Password -->
					<div class="form-field">
						<h6>Password</h6>
						<input class="form-input" type="password" name="password" />
					</div>

					<!-- Password confirm -->
					<div class="form-field">
						<h6>Confirm password</h6>
						<input class="form-input" type="password" name="passwordRepeat" />
					</div>

					<!-- Submit -->
					<div class="form-field">	
						<button class="form-submit btn btn-sm btn-primary" type="submit">Sign up</button>
						<a href="<?=url('/')?>" class="pull-right btn-sm">Back to login</a>
					</div>
				</form>				
			</div>
		</div>
	</div>
	
</body>
</html>
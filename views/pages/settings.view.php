<?php 
if(!User::auth())
{
	Session::flash('info', 'You must be logged in to view that page.');
	redirect('/');
}

if(Request::has('password', 'passwordrepeat', 'avatar'))
{
	// if(!Token::verify(Request::input('csrftoken')))	
	// {
	// 	throw new Exception("Token mismatch.");
	// }
	
	$validator = new Validation();
	$validator->validate(Request::input('password', 'passwordrepeat', 'avatar'), [
        'password' => 'min:6|max:45|match:passwordrepeat',
        'avatar' => 'file|mimes:png,jpg,jpeg,gif|size:2000000'
	]);

	if ($validator->failed())
	{
		Session::flash('error', 'Whoops, there were some problems with your input.', $validator->getErrors());
		redirect('/settings');
	}

	$data = [];

	// If avatar exists
	if ($file = Request::file('avatar'))
	{
		// Remove old profile picture
		if($user->avatar != 'default-avatar.png')
		{
			if(file_exists(UPLOAD_PATH . '/' . $user->avatar))
			{
				unlink(UPLOAD_PATH . '/' . $user->avatar);
			}
		}

		$name = md5($user->id . time());
		$destination = $name . '.' . strtolower(pathinfo($file->name, PATHINFO_EXTENSION));

		$uploader = new ImageUpload((array) $file);
		$uploader->file_new_name_body = $name;
		$uploader->image_resize = true;
		$uploader->image_ratio_crop = true;
		$uploader->image_x = 100;
		$uploader->image_y = 100;
		$uploader->Process(UPLOAD_PATH);

		$data['avatar'] = $destination;
	}

	// If new password exists
	if(!empty(Request::input('password')))
	{
		$data['password'] = password_hash(Request::input('password'), PASSWORD_DEFAULT);
	}

	$user->update($data);
}
?>
<!DOCTYPE html>
<html>
<head>
	<?php template('head') ?>
</head>
<body class="page-settings">
	<?php template('header') ?>
	<div id="wrapper">
		<div class="container vert-offset-top-2">
			<?= template('flash'); ?>
			<div class="row">
				<h2>Account Settings</h2>
				<div class="vert-offset-top-1 col-md-6">
					<div class="panel">
						<div class="panel-mast">
							<h5>Update your account settings</h5>
						</div>
						<div class="panel-body">

							<form method="POST" action="<?=url('/settings')?>" enctype="multipart/form-data">										
								<!-- Passowrd -->
								<div class="form-field">
									<h6>Change password</h6>
									<input name="password" class="form-input vert-offset-top-1" type="password">
								</div>
							
								<!-- Password Repeat -->
								<div class="form-field">
									<h6>Repeat new password</h6>
									<input name="passwordrepeat" class="form-input vert-offset-top-1" type="password">
								</div>
							
								<!-- Avatar -->
								<div class="form-field">
									<h6>Change your profile picture</h6>
									<div class="vert-offset-top-1 form-upload">
										<div><i class="fs-3 fa fa-cloud-download"></i></div>
										<div>Click to browse</div>
										<input class="hidden" name="avatar" type="file">
									</div>
								</div>
							
								<!-- Submit Button -->
								<div class="form-field">
									<button class="btn btn-sm btn-success">Update</button>
								</div>

							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>
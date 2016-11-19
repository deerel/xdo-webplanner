<?php 
$user = App::get('database')->query("SELECT token FROM users WHERE email = ?", [Request::input('email')])->first();
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome to xdo</title>
</head>
<body style="background-color:#f1f1f1;">
<table align="center" cellspacing="0" cellpadding="0" width="600" style="font-family:verdana;font-size:10pt;font-weight:100;background-color:#ffffff;">
	<tr>
		<td>
			<table cellspacing="20" align="center" width="500" style="">
				<tr>
					<td>
						<h2>Activate your xdo account</h2>
						<p>You are receiving this email because your email was registered on xdo.se. If you do not recognize this, you can simply ignore this email.</p>
						<p>Before you can start using our service your account needs to be activated. Please note that accounts that are not activated within 24 hours are automatically deleted.</p>
					</td>
				</tr>
				<tr style="padding-top:20px;">
					<td>
						<p>
							<a style="color:#fff;text-decoration: none;background-color:#222d32;font-size:1.1em; padding: 15px 20px;" href="<?=url('/account/activate')?>?token=<?=$user['token']?>">Activate account</a>
						</p>
					</td>
				</tr>
				<tr>
					<td>
						<p><i>Sincerely,<br>The xdo team</i></p>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<td>
			<table width="500" align="center" cellspacing="10" style="border-top:1px solid #eee;">
				<tr>
					<td>
						<p><a style="color:#08c;" href="<?=url('/')?>">http://www.xdo.se</a></p>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>	
</body>
</html>
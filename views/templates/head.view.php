<!-- Meta -->
<meta charset="utf-8">
<?php if($device == 'Desktop') : ?>
	<meta name="viewport" content="width=device-width, initial-scale=1">
<?php else : ?>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">
<?php endif; ?>
<!-- <meta name="csrf_token" content="<?=Token::make()?>"> -->

<!-- Stylesheets -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600">
<link rel="stylesheet" href="<?= url('/app.min.css') ?>">

<?php if(!App::get('device')->isMobile()) : ?>

	<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
	<script src="http://code.jquery.com/jquery-3.1.1.min.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
	
<?php endif; ?>

<?php App::get('view')->cdata(); ?>
<script type="text/javascript" src="<?= url('/app.min.js') ?>"></script>

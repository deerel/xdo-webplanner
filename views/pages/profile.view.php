<?php 
if(!User::auth())
{
	Session::flash('info', 'You must be logged in to view that page.');
	redirect('/');
}

$dates = [];
$DT = new DateTime();
$start = $DT->format('Y-m-d');
$end = $DT->add(new DateInterval('P1W'))->format('Y-m-d');
foreach($user->getActivitiesByDate($start, $end) as $activity)
{
	$dates[$activity['date']][] = $activity;
}

$friends = $user->fetchRandomFriends(9);
?>
<!DOCTYPE html>
<html>
<head>
	<?php template('head') ?>
</head>
<body class="page-profile">
	<?php template('header') ?>
	<div id="wrapper">
		<div class="container vert-offset-top-2">
			<div class="row">
				<h2>Your Profile</h2>
				<div class="col-md-3">

					<!-- Profile info -->
					<div class="panel col-sm-6 col-md-12 vert-offset-top-1">
						<div class="panel-mast">
							<h5>Profile information</h5>
						</div>
						<div class="list">
							<div class="list-item">
								<h5>Name</h5>
								<div class="fs-sm"><?=$user->getName()?></div>
							</div>
							<div class="list-item">
								<h5>Email</h5>
								<div class="fs-sm"><?=$user->email?></div>
							</div>
							<div class="list-item">
								<h5>Joined</h5>
								<div class="fs-sm"><?=date('d M Y', strtotime($user->created_at))?></div>
							</div>
						</div>
					</div>
					
					<!-- Friends -->
					<div class="panel col-sm-5 col-sm-push-1 col-md-push-0 col-md-12 vert-offset-top-1">
						<div class="panel-mast">
							<h5>Friends</h5>
						</div>
						<div class="row">
							<?php foreach($friends as $friend) : $friend = new User($friend['id']) ?>
								<div class="col-xs-3 col-sm-4">
									<div class="avatar avatar-fluid" title="<?=$friend->getName()?>">
										<img src="<?=$friend->avatar()?>">
									</div>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</div>

				<div class="col-sm-12 col-md-offset-1 col-md-7">
					
					<!-- Upcoming activities -->
					<div class="panel vert-offset-top-1">
						<div class="panel-mast">
							<h5>Upcoming activities</h5>
						</div>
						<div class="list activities">		
							<?php foreach($dates as $date => $activities) : ?>
								<div class="list-item">
									<h5 class="date"><?=date('D j', strtotime($date))?></h5>
									<?php foreach($activities as $activity) : ?>
										<div class="activity row">
											<aside class="left">
												<span class="timestamp"><?=$activity['timestart']?></span>
											</aside>
											<div class="description">
												<h4 class="title"><?=$activity['title']?></h4>	
												<p><?=$activity['description']?></p>
											</div>
										</div>
									<?php endforeach; ?>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php template('footer') ?>
</body>
</html>
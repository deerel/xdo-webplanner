<?php
if(!User::auth())
{
	Session::flash('info', 'You must be logged in to view that page.');
	redirect('/');
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Planner</title>
	<?php template('head'); ?>
</head>
<body>
	<!-- Header -->
	<?php template('header'); ?>

	<div id="wrapper">
	
		<!-- Flash -->
		<?php template('flash'); ?>
	
		<!-- Planner -->
	    <div id="planner" data-mode="<?=$mode?>">	 
	    	<header id="plannerHeader" class="row">
				<div class="pull-right">
					<?php if($mode == 'week') : ?>
						<div id="add" class="hidden btn btn-sm btn-default"><i class="fa fa-plus"></i></div>
						<a class="inline" href="<?=url('/planner?mode=month')?>">	
							<div id="planner-mode-month" class="btn btn-sm btn-default spanicon">
								<i class="fa fa-calendar spanicon"></i>
								<i class="fa fa-toggle-off"></i>
							</div>
						</a>	
					<?php elseif ($device != 'Mobile') :?>	
						<a class="inline" href="<?=url('/planner?mode=week')?>">	
							<div id="planner-mode-month" class="btn btn-sm btn-default spanicon">
								<i class="fa fa-calendar spanicon"></i>
								<i class="fa fa-toggle-on"></i>
							</div>
						</a>		
					<?php endif; ?>
					<div id="previous" class="btn btn-sm btn-default">
						<i class="fa fa-angle-left"></i>
					</div>
					<div id="current" class="btn btn-sm btn-default">Today</div>
					<div id="next" class="btn btn-sm btn-default spanicon">
						<i class="fa fa-angle-right"></i>
					</div>
				</div>
				<span id="plannerHeading"></span>
			</header>
		<?php if($mode == 'month') : ?>	
            <div id="plannerMonthDays" class="row">
                <div class="pull-left weekday"><span>Mon</span></div>
                <div class="pull-left weekday"><span>Tue</span></div>
                <div class="pull-left weekday"><span>Wed</span></div>
                <div class="pull-left weekday"><span>Thu</span></div>
                <div class="pull-left weekday"><span>Fri</span></div>
                <div class="pull-left weekday"><span>Sat</span></div>
                <div class="pull-left weekday"><span>Sun</span></div>
            </div>        
	        <div id="plannerMonthGrid" class="row" ></div>
	        <div class="row vert-offset-top-1"> 
	        	<div id="add" class="btn btn-sm btn-default"><i class="fa fa-plus spanicon"></i>Add activity</div>
	        </div>	 
	        <div id="plannerMonthDayInfo" class="row"></div>		 
		<?php else : ?>
			<div id="plannerWeekDays" class="row"></div>
			<div id="plannerMain" class="row">
				<aside id="plannerSidebar">
					<div class="time-cell">00:00</div>
					<div class="time-cell">01:00</div>
					<div class="time-cell">02:00</div>
					<div class="time-cell">03:00</div>
					<div class="time-cell">04:00</div>
					<div class="time-cell">05:00</div>
					<div class="time-cell">06:00</div>
					<div class="time-cell">07:00</div>
					<div class="time-cell">08:00</div>
					<div class="time-cell">09:00</div>
					<div class="time-cell">10:00</div>
					<div class="time-cell">11:00</div>
					<div class="time-cell">12:00</div>
					<div class="time-cell">13:00</div>
					<div class="time-cell">14:00</div>
					<div class="time-cell">15:00</div>
					<div class="time-cell">16:00</div>
					<div class="time-cell">17:00</div>
					<div class="time-cell">18:00</div>
					<div class="time-cell">19:00</div>
					<div class="time-cell">20:00</div>
					<div class="time-cell">21:00</div>
					<div class="time-cell">22:00</div>
					<div class="time-cell">23:00</div>
				</aside>
				<div id="plannerContent"></div>
			</div>
		<?php endif; ?>
		</div>
	</div>
	
	<!-- Footer -->
	<?php template('footer'); ?>
</body>
</html>
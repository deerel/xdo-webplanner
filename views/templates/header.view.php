<?php if($device == 'Desktop') : ?>
	<header id="header" class="site-header">
		<nav class="navigation">
			<ul>
				<li><a href="<?= url('/planner') ?>" class="link">Planner</a></li>
			</ul>
		</nav>
	
		<?php if(User::auth()) : ?>
			<div class="menu">
				<ul>
					<li id="userNotifier">
						<a class="link">
							<i class="fa fa-bell fs-1" id="notificationBell"></i>
						</a>
	                    <div id="notificationList" class="hidden"></div>
					</li>
					<li id="userMenu">
						<a class="link" href="<?= url('/profile') ?>">
							<span class="spanicon avatar avatar-sm is-circle">
								<img src="<?= $user->avatar() ?>">
							</span>
							<?=App::get('user')->getName()?>
						</a>
						<ul class="sub-menu">
	                        <li>
								<a class="link" href="<?= url('/friends') ?>"><i class="spanicon fa fa-users"></i>Friends</a>
							</li>
							<li>
								<a class="link" href="<?= url('/settings') ?>"><i class="spanicon fa fa-cog"></i>Settings</a>
							</li>
							<li>
								<a class="link" href="<?= url('/logout') ?>"><i class="spanicon fa fa-sign-out"></i>Logout</a>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		<?php endif; ?>
	</header>
<?php else : ?>
	<header id="headerMobile" class="site-header">
		<div id="headerMobileBar">
			<div class="item" data-group="toggleDropdown" data-role="toggle">
				<i class="fa fa-bars"></i>
			</div>
			<div id="userNotifier" class="item pull-right" data-group="toggleNotifications" data-role="toggle">
				<i class="fa fa-bell fs-1" id="notificationBell"></i>
			</div>
		</div>
	 	<div id="notificationList" data-group="toggleNotifications" data-role="target" class="dropdown hidden"></div>
		<ul data-group="toggleDropdown" data-role="target" class="dropdown hidden">
			<li>
				<a href="<?= url('/planner') ?>" class="link">Planner</a>
			</li>
            <li>
            	<a class="link" href="<?= url('/profile') ?>">Profile</a>
			</li> 
            <li>
				<a class="link" href="<?= url('/friends') ?>">Friends</a>
			</li>
			<li>
				<a class="link" href="<?= url('/settings') ?>">Settings</a>
			</li>
			<li>
				<a class="link" href="<?= url('/logout') ?>">Logout</a>
			</li>
		</ul>
	</header>
<?php endif; ?>
<?php if(Session::exists('flash')) : ?>
	<div class="flash <?= Session::get('flash.type') ?>">
		<span><?=Session::get('flash.message')?></span>
		<i class="flash-close fa fa-times" aria-hidden="true"></i>
		<?php if(!empty(Session::get('flash.bag'))) : ?>
			<div class="flash-bag">
				<?php foreach(Session::get('flash.bag') as $item) : ?>
					<div class="item"><?=$item?></div>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
	<?php Session::destroy('flash'); ?>
<?php endif; ?>
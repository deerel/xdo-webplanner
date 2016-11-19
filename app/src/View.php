<?php

class View
{
	private $data = [];

	public $cdata = [];

	public function render(string $page)
	{
		if(!file_exists($page = 'views/pages/' . $page . '.view.php'))
		{
			throw new Exception("Page {$page} does not exist.");
		}
		
		extract($this->data);

		require_once $page;
	}

	public function share(string $variable, $value = null)
	{
		if(array_key_exists($variable, $this->data))
		{
			throw new Exception("Variable {$variable} already shared in view composer.");
		}

		$this->data[$variable] = $value;
	}

	public static function data()
	{
		return App::get('view')->data;
	}

	public function cdata()
	{
		$cdata = '';
		foreach($this->cdata as $key => $value)
		{
			$cdata .= $key .': "'.$value .'",';
		}

		echo '<script type="text/javascript">/* <![CDATA[ */APP = {'.$cdata.'}/* ]]> */</script>';
	}
}
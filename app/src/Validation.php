<?php 
class Validation
{

	private $input = [];
	
	private $errors = [];

	private $contract = [];

	private $files = [];

	private $passed = null;

	private $isFile = null;


	public function validate (array $input, array $contract)
	{
		$this->input = $input;
		$this->contract = $contract;

		foreach ($contract as $key => $value)
		{	
			if (!array_key_exists($key, $input))
			{
				throw new Exception("Contract violation: Array key {$key} missing.");
			}
			
			$rules = explode('|', $this->contract[$key]);

			$required = in_array('required', $rules);
			
			// Keep track of which fields to treat as files
			if ($this->isFile = in_array('file', $rules)) 
			{
				$this->files[$key] = $this->input[$key];
			}

			// If current field is a file, is optional and has no tmp_name value
			if ( !$required && $this->isFile && $this->input[$key]['tmp_name'] == '' ) continue;  

			// If current field is optional and has no value
			if ( !$required && $this->input[$key] == '' ) continue; 

			$bail = in_array('bail', $rules);

			foreach($rules as $rule)
			{
				if($rule == 'bail' || $rule == 'file') continue;

				if( !$this->validateRuleValue($key, $rule) )
				{
					$this->errors[] = $this->getErrorMessage($key, $rule);

					if ($bail) break;
				}
			}
		}

		$this->passed = empty($this->errors) ? true : false;

		return $this;
	}

	private function validateRuleValue($key, $rule)
	{
		$value = $this->input[$key];

		if(strpos($rule, ':') !== false)
		{
			$multirule = explode(':', $rule);
			$rule = $multirule[0];
		}

		switch($rule)
		{
			case 'alpha':
				return preg_match('/[^a-zåäöÅÄÖ]+/i', $value) ? false : true;

			case 'alphanumeric':
				return preg_match('/[^0-9a-zåäöÅÄÖ]+/i', $value) ? false : true;

			case 'email':
				return !filter_var($value, FILTER_VALIDATE_EMAIL) ? false : true;

			case 'match':
				return $value != $this->input[$multirule[1]] ? false : true;

			case 'max':
				return (strlen($value) > $multirule[1]) ? false : true;

			case 'min':
				return (strlen($value) < $multirule[1]) ? false : true;
				
			case 'mimes':
				if(!$this->isFile)
					throw new Exception("Contract violation: Invalid rule mimes for key {$key}.");
				else
					return $this->validateFileMimeType($key, $multirule[1]);

			case 'numeric':
				return preg_match('/[^0-9]+/', $value) ? false : true;

			case 'required':
				if($this->isFile)
					return (array_key_exists($key, $this->input) && $this->input[$key]['tmp_name'] != '');
				else
					return (!isset($value) || empty($value)) ? false : true;

			case 'size':
				if($this->isFile)
					return $this->validateFileSize($key, $multirule[1]);
				else 
					throw new Exception("Contract violation: Invalid rule size for key {$key}.");

			case 'unique':
				$q = App::get('database')->query("SELECT * FROM {$multirule[1]} WHERE {$key} = ? LIMIT 1", [$value])->first();
				return !empty($q) ? false : true;

			default:
				throw new Exception("Contract violation: Invalid rule {$rule} supplied to validator.");
		}
	}

	private function getErrorMessage($key, $rule)
	{
		if(strpos($rule, ':') !== false)
		{
			$multirule = explode(':', $rule);	
			$rule = $multirule[0];
			$rulevalue = $multirule[1];
		}

		switch($rule)
		{
			case 'alpha':
				return "The {$key} must only contain alphabetic characters.";

			case 'alphanumeric':
				return "The {$key} must only contain alphanumeric characters.";

			case 'email':
				return "Invalid email address.";

			case 'match':
				return "The {$key} fields must match.";

			case 'max':
				return "Field {$key} must not exceed {$rulevalue} characters.";

			case 'min':
				return "Field {$key} must be at least {$rulevalue} characters.";

			case 'mimes':
				return "File must be of type ({$rulevalue})";

			case 'numeric':
				return "Field {$key} must only contain numeric characters.";

			case 'required':
				return "The {$key} field is required.";
			
			case 'size':
				return "File size exceeded {$rulevalue} bytes";

			case 'unique':
				return "This {$key} has already been registered.";

			default:
				return "Contract violation for {$key}. Rule {$rule} not satisfied.";
		}
	}

	private function validateFileUpload($key)
	{
		return ( $this->files[$key]['error'] || $this->files[$key]['tmp_name'] == '' ) ? false : true;
	}

	private function validateFileMimeType($key, $mimes)
	{	
		$extension = strtolower(pathinfo($this->input[$key]['name'], PATHINFO_EXTENSION));
		
		$allowedExtensions = explode(',', $mimes);
	
		return in_array($extension, $allowedExtensions);
	}

	private function validateFileSize($key, $size)
	{	
		return $this->input[$key]['size'] <= $size;
	}

	public function failed()
	{
		return $this->passed ? false : true;
	}

	public function passed()
	{
		return $this->passed ? true : false;
	}

	public function getErrors()
	{
		return $this->errors;
	}

	public function flush()
	{
		$this->input = [];
		$this->errors = [];
		$this->contract = [];
		$this->files = [];
		$this->passed = null;
		$this->isFile = null;
	}
}
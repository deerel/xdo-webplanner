<?php

class Database
{
	private $pdo = null;

	private $result = [];
    
    public $lastId;

	public function __construct()
	{
		$this->pdo = $this->connect();
	}

	private function connect()
	{
		try 
		{
			return new PDO (
               App::config('database.connection').';dbname='.App::config('database.name'), 
               App::config('database.user'), 
               App::config('database.password'), 
               App::config('database.options')
            );
		} 
		catch (PDOException $e) 
		{
			die($e->getMessage());
		}
	}

	
	public function selectAll($table)
	{
		$this->result = [];

		try
		{
			$statement = $this->pdo->prepare("SELECT * FROM {$table}");

			$statement->execute();

			return $this->result = $statement->fetchAll(PDO::FETCH_ASSOC);
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function insert(string $table, array $parameters)
	{
		$this->result = [];

		$sql = sprintf("INSERT INTO %s (%s) VALUES (%s)", 
           $table, 
           implode(',', array_keys($parameters)), 
           ':' . implode(', :', array_keys($parameters))
        );

		try
		{
			$statement = $this->pdo->prepare($sql);

			return $statement->execute($parameters);	
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}
	
	public function query(string $sql, $parameters = [])
	{
		$this->result = [];
		$queryType = strtolower(explode(' ', $sql)[0]);
		
		try
		{
			$statement = $this->pdo->prepare($sql);

			if(!empty($parameters))
			{	
				foreach($parameters as $key => &$parameter)
				{
					$statement->bindParam(++$key, $parameter);
				}
			}

			if($queryType == 'select')
			{	
				$statement->execute();

				$this->result = $statement->fetchAll(PDO::FETCH_ASSOC);

				return $this;
			}

			return $statement->execute();	
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}
  
	public function procedure(string $procedure, $parameters = [])
	{
		$this->result = [];
		$queryType = substr($procedure, 0, 5);
		$parameterCount = count($parameters);;

    	$placeHolder = "?";
	    
	    while(--$parameterCount > 0) $placeHolder .= ", ?";

		$sql = "CALL {$procedure} ($placeHolder)";

		try
		{
			$statement = $this->pdo->prepare($sql);

			if(!empty($parameters))
			{	
				foreach($parameters as $key => &$parameter)
				{
					$statement->bindParam(++$key, $parameter);
				}
			}

			if($queryType == 'fetch')
			{	
				$statement->execute();

				$this->result = $statement->fetchAll(PDO::FETCH_ASSOC);

				return $this;
			}
            
            if($queryType == 'creat')
			{	

				return $statement->execute();
               

			}
            
            if($queryType == 'delet')
			{	
				$statement->execute();

				return $this->pdo->lastInsertId();
			}
            
			return $statement->execute();	
		}
		catch(Exception $e)
		{
			die($e->getMessage());
		}
	}

	public function first()
	{
		return !empty($this->result) ? $this->result[0] : [];
	}

	public function last()
	{
		return !empty($this->result) ? end($this->result) : [];
	}

	public function fetch()
	{
		return $this->result;
	}
}
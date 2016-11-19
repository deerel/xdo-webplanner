<?php

class User
{
    /**
     * The name of the database table
     */
    protected $table = 'users';

    /**
     * User properties
     */
    protected $data = [];

    /** 
     * Hidden user properties
     */
    protected $hidden = ['password'];


    public function __construct($user = null)
    {
        if(!is_array($user) && !is_numeric($user))
        {   
            throw new Exception("User object expects parameter to be array or int.");
        }

        // Create user from id
        if(is_numeric($user))
        {        
            $user = $this->find($user);
        }

        if(!is_null($user))
        {
            $this->build($user);
        }
    }


    /**
     * Builds a new user
     *
     * @param array
     * @return void
     */
    protected function build(array $user)
    {
        if(empty($user))
        {
            throw new Exception("User object could not be instantiated.");
        }

        if( !$this->isInstantiated )
        {        
            foreach($user as $key => $value)
            {
                $this->$key = $value;
            }

            $this->isInstantiated = true;
        }
    }


    /**
     * Selects a user from the database based on the user's id
     *
     * @param int
     * @return array
     */
    public function find(int $user)
    {
        return App::get('database')->query("SELECT * FROM {$this->table} WHERE id = ?", [$user])->first();
    }


    /**
     * Returns the user's avatar.
     *
     * @param void
     * @return string
     */
    public function avatar()
    {
        return $this->avatar ? url('/assets/img/uploads/') . $this->avatar : 'http://www.gravatar.com/avatar/' . md5($this->email);
    }


    /** 
     * Updates user information.
     *
     * @param array
     * @return void
     */
    public function update(array $input)
    {
        if(!empty($input))
        { 
            $sql = "UPDATE users SET";
            
            foreach($input as $key => $value)
            {
                $sql .= " $key = ?,";
            }

            $sql = rtrim($sql, ',');
            $sql .= " WHERE id = {$this->id}";

            App::get('database')->query($sql, array_values($input));
        }
    }


    /**
     * Returns name of the user.
     *
     * @param void
     * @return string
     */
    public function getName()
    {
        return $this->firstname . ' ' . $this->lastname;
    }


    /**
     * Returns user activities.
     *
     * @param string 'yyyy-mm-dd'
     * @param string 'yyyy-mm-dd'
     * @return array
     */
    public function getActivitiesByDate($start, $end)
    {
        return App::get('database')->procedure('fetchActivitiesByDate', [$this->id, $start, $end])->fetch();
    }


    /**
     * Gets all notifications for the user.
     *
     * @param void
     * @return array
     */
    public function getNotifications()
    {
        $sql = "SELECT * FROM notifications WHERE receiver = ?";

        return App::get("database")->query($sql, [$this->id])->fetch();
    }


    /**
     * Get all notifications that have not been read by the user.
     *
     * @param void
     * @return int
     */
    public function getNotificationCount()
    {
        $sql = "SELECT COUNT(id) as count FROM notifications WHERE receiver = ? AND isread = 0";
        
        return (int) App::get("database")->query($sql, [$this->id])->first()['count'];
    }


    /**
     * Checks whether the user is friends with another user.
     *
     * @param int
     * @return bool
     */
    public function isFriendWith($userid)
    {
        $sql = "SELECT user_id, friend_id FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)";

        $result = App::get("database")->query($sql, [$this->id, $userid, $userid, $this->id])->first();

        return count($result) >= 1;
    }
    
    /**
     * Returns list of all friends.
     *
     * @param void
     * @return array
     */
    public function fetchFriends()
    {
        return App::get("database")->procedure("fetchUsersFriends", [$this->id])->fetch();
    }


    public function fetchRandomFriends(int $num)
    {
        return App::get("database")->procedure("fetchRandomFriends", [$this->id, $num])->fetch();
    }


    /**
     * Creates a new friend request.
     *
     * @param int
     * @return void
     */
    public function addFriend($friend)
    {
        if(!is_numeric($friend))
        {
            $friend = $this->getIdByEmail($friend);
        }
        
        if(!$this->isFriendWith($friend) && User::exists($friend))
        {
            App::get("database")->procedure("createUserFriend", [$this->id, $friend]);

            return true;
        }

        return false;
    }


    /**
     * Cancels a friend request.
     *
     * @param int
     * @return void
     */
    public function withdrawFriendRequest(int $friend)
    {
        $sql = "DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND ISNULL(status)";
        App::get('database')->query($sql, [$this->id, $friend]);
        
        //Remove notifications related to the user-friend relationship
        $sql = "DELETE FROM notifications WHERE (initiator = ? AND receiver = ?) OR (initiator = ? AND receiver = ?)";
        App::get('database')->query($sql, [$this->id, $friend, $friend, $this->id]);
    }
    
    /**
     * Get user id by email.
     *
     * @param string
     * @return int
     */
    public function getIdByEmail($mail)
    {
        $sql = "SELECT id FROM users WHERE email = ?";
        $result = App::get("database")->query($sql, [$mail])->first();

        return isset($result["id"]) ? $result["id"] : 0;
    }
    
    
    /**
     * Removes friends from a comma separated list or array
     *
     * @param mixed
     * @return void
     */
    public function removeFriend($friends)
    {
        if(!is_array($friends))
        {
            $friends = explode(',', $friends);
        }

        if(is_array($friends))
        {
            foreach($friends as $friend)
            {
                $sql = "DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?) AND status = 'accepted'";
                App::get('database')->query($sql, [$this->id, $friend, $friend, $this->id]);
                
                //Remove all activities where user invited friend or friend invited user.
                $sql = "SELECT user_id, activity_id FROM user_activity JOIN (SELECT * FROM activities WHERE owner_id = ? OR owner_id = ?) AS ACT ON user_activity.activity_id = ACT.id WHERE user_id = ? OR user_id = ?";
                $deleteElements = App::get('database')->query($sql, [$this->id, $friend, $this->id, $friend])->fetch();
                foreach($deleteElements as $element) {
                    $sql = "DELETE FROM user_activity WHERE user_id = ? AND activity_id = ?";
                    App::get('database')->query($sql, [$element["user_id"], $element["activity_id"]]);
                }
                
                //Remove notifications related to the user-friend relationship
                $sql = "DELETE FROM notifications WHERE (initiator = ? AND receiver = ?) OR (initiator = ? AND receiver = ?)";
                App::get('database')->query($sql, [$this->id, $friend, $friend, $this->id]);
            }
        }
    }
    


    /**
     * Fetches a list of pending friend requests initiated by the current user.
     *
     * @param void
     * @return array
     */
    public function fetchPendingFriendRequests()
    {
        $sql = 'SELECT friends.*, users.* FROM friends JOIN users ON users.id = friend_id WHERE user_id = ? AND ISNULL(status)';
        return App::get('database')->query($sql, [$this->id])->fetch();
    }

    /**
     * Returns the user's friends
     * 
     * @param mixed
     * @return array
     */
    public function searchFriend($input)
    {
        return App::get("database")->procedure("friendsList", [$input, $this->id])->fetch();    
    }


    /**
     * Signs out the current user.
     *
     * @param void
     * @return void
     */
    public function logout()
    {
        unset($_COOKIE['remember-login']);
        setcookie('remember-login', '', time() - 3600);

        Session::destroy('userid');
    }


    /**
     * Sign in user by setting the session.
     *
     * @param void
     * @return void
     */
    public function login()
    {
        if(User::auth()) 
        {
            throw new Exception("Warning, user ({$this->id}) has already been logged in.");
        }
            
        Session::set('userid', $this->id);
    }


    /**
     * Checks whether the user session is set.
     *
     * @param void
     * @return bool
     */
    public static function auth()
    {
        return Session::exists('userid');
    }


    /**
     * Checks if a user is registered. 
     *
     * @param string
     * @return bool 
     */
    public static function exists($user)
    {      
        if(is_numeric($user))
        {
            return empty(App::get('database')->query('SELECT * FROM users WHERE id = ?', [$user])->fetch()) ? false : true;
        }
        else
        {
            return empty(App::get('database')->query('SELECT * FROM users WHERE email = ?', [$user])->fetch()) ? false : true;
        }
    }

    /**
     * Returns user data if the given key exists.
     *
     * @param string
     * @return mixed|null
     */
    public function __get(string $key)
    {
        return isset($this->data[$key]) ? $this->data[$key] : null; 
    }


    /**
     * Stores the key value pair in the data array.
     *
     * @param string
     * @param mixed
     * @return void
     */
    public function __set(string $key, $value)
    {
        if(!isset($this->data[$key]) && !in_array($key, $this->hidden))
        {
            $this->data[$key] = $value;
        }
    }
}
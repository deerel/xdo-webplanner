<?php
if(!User::auth())
{
    Session::flash('info', 'You must be logged in to view that page.');
    redirect('/');
}

if(isset($_GET['request']))
{
   
    switch($_GET['request']) 
    {
        case 'updateActivityInvitedUsers':
            $friends_id = explode(',', $_POST['friends_id']);
            //$friends_id = array_unique($friends_id);
        	$activity_id = $_POST['activity_id'];

            App::get('database')->procedure('deleteActivityInvitedUsers', [$activity_id]);
            
            foreach($friends_id as $friend_id) 
            {
                App::get('database')->procedure('updateActivityInvitedUser', [$activity_id, $friend_id, $user->id]);
            }
            break;

        //Planner.js 
        //Notifications.js
        case 'fetchActivitiesByDate':
            echo json_encode(App::get('database')->procedure('fetchActivitiesByDate', [$user->id, $_POST['activity_start'], $_POST['activity_end']])->fetch());
            break;
       
        //Modal.js
        case 'fetchFriendsByName':
            // "\P{L}" = Letter in any language
            $user_input = preg_replace('/\P{L}+/', '', $_POST["searchstring"]); 
            
            $result = App::get('database')->procedure('fetchFriendsByName', [$user_input, $user->id])->fetch();
            echo json_encode($result);
            break;
            
        //Planner.js
        case 'updateActivity':
        
            //Make changes to activity
        	App::get('database')->procedure('updateActivity', [
                htmlspecialchars($_POST['activity_title']), 
                htmlspecialchars($_POST['activity_description']), 
                $_POST['activity_start'], 
                $_POST['activity_end'], 
                $_POST['activity_id'],
                $user->id,
            ]);

            //Get user id for all invited friends
            $sql = 'SELECT user_id AS id, accepted FROM user_activity WHERE activity_id = ?';
            $invitedInDB = App::get('database')->query($sql, [$_POST['activity_id']])->fetch();    
            
            $invitedAccept = array();;
            for($i = 0; $i<count($invitedInDB); $i++) {
                $invitedAccept[$invitedInDB[$i]["id"]] = $invitedInDB[$i]["accepted"];
            }
            
            //Add notifiction to all invited users
            $invited = $_POST['invited_str'];
            $invited = explode(',', $invited);
            $invited = array_unique($invited);

            //Add user to activity and add notification
            foreach($invited as $invited_id) 
            {
                if($user->isFriendWith($invited_id))
                {
                    $firstTimer = true;
                    
                    if(array_key_exists($invited_id, $invitedAccept)) {
                        
                        //Remove from list of previusly invited friend
                        $acceptState = $invitedAccept[$invited_id];
                        unset($invitedAccept[$invited_id]);
                        
                        //Friend hade been invited before
                        if($acceptState == "1") {
                            //Friend has already accepted invitation, needs update.
                            //Check if pending notification
                            $sql = "SELECT COUNT(N.id) AS numof FROM notifications AS N JOIN notification_activity AS NA ON N.id = NA.notification_id WHERE NA.activity_id = ? AND N.receiver = ?";
                            $unread = App::get('database')->query($sql, [$_POST['activity_id'], $invited_id])->first();
                            if($unread["numof"] > 0) {
                                //Friend got an unread notification already. No more, that's spam!
                                continue;
                            } else {
                                //Friend needs update
                                $notificationType = 4;
                                $firstTimer = false;
                            }
                        } else {
                        //Friend has got a pending invitation. No more, that's spam!
                            continue;
                        }
                    } else {
                        //Friend is a first timer. Send invitation.
                        $notificationType = 3;
                    }
                   
                    
                    //Add new notification to friend
                    $sql = 'INSERT INTO notifications (initiator, receiver, type) VALUES(?, ?, ?);';
                    App::get('database')->query($sql, [$user->id, $invited_id, $notificationType]);
                    //Get last inserted id for notification
                    $sql = 'SELECT id FROM notifications ORDER BY id DESC LIMIT 1;';
                    $lastNotificationsId = App::get('database')->query($sql)->first();
                    //Insert data in notifications_activity
                    $sql = 'INSERT INTO notification_activity (activity_id, notification_id) VALUES(?, ?);';
                    App::get('database')->query($sql, [$_POST['activity_id'], $lastNotificationsId['id']]);

                    
                    if($firstTimer == true) {
                        //Add user to activity
                        $sql = 'INSERT INTO user_activity (user_id, activity_id) VALUES(?,?);';
                        App::get('database')->query($sql, [$invited_id, $_POST['activity_id']]);
                    }
                }
            }
            
            
            //Delete all remaining - friends who where removed from activity
            foreach($invitedAccept as $id => $value) {
                //Delete the actual activity connection
                $sql = 'DELETE FROM user_activity WHERE activity_id = ? AND user_id = ?';
                App::get('database')->query($sql, [$_POST['activity_id'], $id]);
                
                //Fetch id on unread notification
                $sql = "SELECT N.id AS notificationId FROM notifications AS N JOIN notification_activity AS NA ON N.id = NA.notification_id WHERE NA.activity_id = ? AND N.receiver = ?";
                $unreadID = App::get('database')->query($sql, [$_POST['activity_id'], $id])->first();

                //If there is an unread notifications, delete it.
                if(count($unreadID)>0) {
                    $sql = 'DELETE FROM notifications WHERE id = ?';
                    App::get('database')->query($sql, [$unreadID["notificationId"]]); 
                }
            }
            
            $invitedFriends = App::get('database')->procedure('fetchInvitedUsersByActivityId', [$_POST['activity_id']])->fetch();
            $invitedFriends = array_values($invitedFriends);
            
            $return = [
            	'id' 				=> $_POST['activity_id'],
            	'title' 			=> $_POST['activity_title'],
            	'description' 		=> $_POST['activity_description'],
            	'timestart' 	=> $_POST['activity_start'],
            	'timeend' 		=> $_POST['activity_end'],
                'isOwner'         => $_POST['isOwner'],
                'invited'       => $invitedFriends
            ];
            echo json_encode((object)$return);
            break;
            
        //Planner.js
        case 'createActivity':
            //Add activity
        	App::get('database')->procedure('createActivity', [
                htmlspecialchars($_POST['title']), 
                htmlspecialchars($_POST['description']), 
                $_POST['activity_start'], 
                $_POST['activity_end'], 
                $user->id
            ]); 
            
            //Get last inserted id
            $sql = 'SELECT id FROM activities ORDER BY id DESC LIMIT 1;';
            $lastId = App::get('database')->query($sql)->first();
            $lastId = $lastId['id'];

            if($lastId > 0) //New activity is added
            {
                //Add notification to all invited users
                $invited = $_POST['invited_str'];
                $invited = explode(',', $invited);
                $invited = array_unique($invited);
                
                foreach($invited as $invited_id) 
                {
                    if($user->isFriendWith($invited_id))
                    {
                        //Add new notification to friend
                        $sql = 'INSERT INTO notifications (initiator, receiver, type) VALUES(?, ?, ?);';
                        App::get('database')->query($sql, [$user->id, $invited_id, "3"]);
                        //Get last inserted id for notification
                        $sql = 'SELECT id FROM notifications ORDER BY id DESC LIMIT 1;';
                        $lastNotificationsId = App::get('database')->query($sql)->first();
                        //Insert data in notifications_activity
                        $sql = 'INSERT INTO notification_activity (activity_id, notification_id) VALUES(?, ?);';
                        App::get('database')->query($sql, [$lastId, $lastNotificationsId['id']]);
                        
                        //Add user to activity
                        $sql = 'INSERT INTO user_activity (user_id, activity_id) VALUES(?,?);';
                        App::get('database')->query($sql, [$invited_id, $lastId]);
                    }
                }
                
            }
            
            $invitedFriends = App::get('database')->procedure('fetchInvitedUsersByActivityId', [$lastId])->fetch();
            $invitedFriends = array_values($invitedFriends);
            
            $return = [
            	'id' 				=> $lastId,
            	'title' 			=> $_POST['title'],
            	'description' 		=> $_POST['description'],
            	'timestart' 	=> $_POST['activity_start'],
            	'timeend' 		=> $_POST['activity_end'],
                'date'          => $_POST['date'],
                'isOwner'         => 1,
                'invited'       => $invitedFriends
            ];
            
            echo json_encode((object)$return);
            break;
            
        //Planner.js
        case 'deleteActivity':
        
            $sql = "SELECT notification_id AS id FROM notification_activity WHERE activity_id = ?";
            $notifications = App::get('database')->query($sql, [$_POST['activity_id']])->fetch();
                
            App::get('database')->procedure('deleteActivity',  [$_POST['activity_id'], $user->id]);
            
            $sql = "SELECT COUNT(id) AS numof FROM activities WHERE id = ? AND owner_id = ?";
            $confirm = App::get('database')->query($sql, [$_POST['activity_id'], $user->id])->first();

            if($confirm["numof"] == 0) {
                for($i = 0; $i < count($notifications); $i++) {
                    $sql = "DELETE FROM notifications WHERE id = ?";
                    App::get('database')->query($sql, [$notifications[$i]["id"]]);
                }
            }
            echo json_encode(['activity_id' => $_POST['activity_id']]);
            break;
        
        //Modal.js
        case 'fetchInvitedUsersByActivityId':
            echo json_encode(App::get('database')->procedure('fetchInvitedUsersByActivityId', [$_POST['activity_id']])->fetch());
            break;
        
        //Planner.js
        case 'declineActivityInvite':
            $sql = "DELETE FROM user_activity WHERE user_id=? AND activity_id=?";
            App::get('database')->query($sql, [$user->id, $_POST['activity_id']]);

            $return = [
                'activity_id' => $_POST['activity_id'],
            ];
            
            echo json_encode((object)$return);
            break;
        
        //Notifications.js
        case 'fetchCountNotifications':
            $sql = "SELECT COUNT(id) AS count FROM notifications WHERE receiver = ? AND isread = ?";
            echo json_encode(App::get('database')->query($sql, [$user->id, '0'])->first());
            break;
        
        //Notifications.js        
        case 'fetchNotifications':
            echo json_encode(App::get('database')->procedure('fetchNotifications', [$user->id])->fetch());
            break;
         
        //Notifications.js 
        case 'answerNotifications':
            $notificationId = $_POST['notification_id'];
            $action = $_POST['action'];
            $sql = "SELECT * FROM notifications WHERE id = ? AND receiver = ?";
            $notification = App::get('database')->query($sql, [$notificationId, $user->id])->first();
            if($notification["type"] == 1) { //FRIEND REQUEST
                if($action === "accept") {
                    //Change friend state to accepted
                    $sql = "UPDATE friends SET status = ? WHERE friend_id = ?";
                    App::get('database')->query($sql, ["accepted", $user->id]);
                    //Add notification to initiator
                    $sql = "INSERT INTO notifications (type, initiator, receiver) VALUES(?,?,?)";
                    App::get('database')->query($sql, ["2", $notification["receiver"], $notification["initiator"]]);
                    
                } else {
                    //Delete friend request
                    $sql = "DELETE FROM friends WHERE friend_id = ?";
                    App::get('database')->query($sql, [$user->id]); 
                }
            } elseif($notification["type"] == 3) { //ACTIVITY INVITATION
                $sql = "SELECT * FROM notification_activity WHERE notification_id = ?";
                $activity = App::get('database')->query($sql, [$notificationId])->first();
                $activityId = $activity["activity_id"];
                if($action === "accept") {
                    //Change user_activity to accepted
                    $sql = "UPDATE user_activity SET accepted = ? WHERE user_id = ? AND activity_id = ?";
                    App::get('database')->query($sql, ["1", $user->id, $activityId]);
                    //Add notification to initiator
                    $sql = "INSERT INTO notifications (type, initiator, receiver) VALUES(?,?,?)";
                    App::get('database')->query($sql, ["5", $notification["receiver"], $notification["initiator"]]);
                } else {
                    //Delete user_activity request
                    $sql = "DELETE FROM user_activity WHERE user_id = ? AND activity_id = ?";
                    App::get('database')->query($sql, [$user->id, $activityId]);                     
                }
            }
            
            //Delete notification
            $sql = "DELETE FROM notifications WHERE id = ?";
            App::get('database')->query($sql, [$notification["id"]]);
            
            break;
        
        //Notifications.js
        case 'setNotificationsToRead':
            $sql = "UPDATE notifications SET isread = ? WHERE receiver = ?";
            App::get('database')->query($sql, ["1", $user->id]);
            break;
    }
}
?>
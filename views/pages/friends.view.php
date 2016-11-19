<?php
if(!User::auth())
{
    Session::flash('info', 'You must be logged in to view that page.');
    redirect('/');
}

if(Request::has('action'))
{
    // if(!Token::verify(Request::input('csrftoken'))) 
    // {
    //     throw new Exception("Token mismatch.");
    // }

    $action = Request::input('action');

    if($action == 'sendFriendRequest')
    {
        $validator = new Validation();
        $validator->validate($_POST, [
            'email' => 'bail|required|email'
        ]);
        
        $email = strtolower(Request::input('email'));

        if($validator->failed())
        {
            Session::flash('error', '<strong>Whoops</strong>, there were some problems with your input:', $validator->getErrors());
            redirect('/friends');
        }

        if(!User::exists($email))
        {
            Session::flash('error', 'User does not exist');
            redirect('/friends');
        }

        if($user->addFriend($email))
        {
            Session::flash('info', 'Your friend request was successfully sent.');
        }
        else
        {
            Session::flash('error', 'You are already friends with this user.');
        }
    }
    else if($action == 'removeFriend')
    {
        $friends = [];

        foreach(Request::input('friends') as $friend)
        {
            if($user->isFriendWith($friend))
            {
                $friends[] = $friend;
            }
        }

        $user->removeFriend($friends);

        Session::flash('success', 'You removed ' . count($friends) . ' friend(s).');
        redirect('/friends');
    }
    else if($action == 'cancelFriendRequest')
    {
        $validator = new Validation();
        $validator->validate($_POST, [
            'requester' => 'bail|required|numeric'
        ]);

        if($validator->passed())
        {
            $requester = new User(Request::input('requester'));
            if($user->withdrawFriendRequest($requester->id))
            {
                Session::flash('info', 'You are no longer friends with ' . $requester->getName());
                redirect('/friends');
            }
        }
    }
}

$friends = $user->fetchFriends();
$pendingFriendRequests =  $user->fetchPendingFriendRequests();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Friends</title>
    <?php template('head'); ?>
</head>
<body class="page-planner">

    <?php template('header'); ?>
    
    <div id="wrapper">
        <div class="container vert-offset-top-2">
            <?php template('flash'); ?>
            <div class="row">
                <h2>Friends</h2>
                
                <div class="vert-offset-top-1 col-md-5">
                    
                    <div class="panel">
                        <div class="panel-mast">
                            <h5>Add friends by their email</h5>
                        </div>
                        
                        <div class="panel-body">
                            <form id="friendForm" method="POST" action="<?=url('/friends')?>">
                                <div class="form-field">
                                    <h6>E-mail:</h6>
                                    <input name="email" class="form-input vert-offset-top-1" type="text">
                                </div>
                                <div class="form-field">
                                    <button class="btn btn-sm btn-success">Send Friend Request</button>
                                </div>
                                <input type="hidden" name="action" value="sendFriendRequest">
                            </form>
                        </div>
                    </div>

                    <div class="panel vert-offset-top-2">
                        <div class="panel-mast">
                            <h5>Pending friend requests</h5>
                        </div>
                        <div class="list"> 
                            <?php foreach($pendingFriendRequests as $friend) : $friend = new User($friend['id']); ?>
                                <form class="row list-item" action="" method="POST">
                                    <div class="pull-left flex flex-vcenter"> 
                                        <div class="inline avatar avatar-sm is-circle spanicon">
                                            <img src="<?=$friend->avatar()?>">
                                        </div>
                                        <span><?=$friend->getName()?></span>
                                    </div>
                                    <div class="pull-right">
                                        <button class="btn btn-sm btn-default">Withdraw friend request</button>
                                    </div>
                                    <input type="hidden" name="requester" value="<?=$friend->id?>">
                                    <input type="hidden" name="action" value="cancelFriendRequest">
                                </form>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <div class="vert-offset-top-1 col-md-offset-1 col-md-6">
                    <div class="panel">
                        <div class="panel-mast">
                            <h5>Friends (<?=count($friends)?>)</h5>
                        </div>
                        <form name="delete" action="<?=url('/friends')?>" method="POST">
                            <div class="list">
                                <?php foreach($friends as $friend) : $friend = new User($friend['id']); ?>
                                    <div class="list-item flex flex-vcenter">
                                        <div class="row-select">
                                            <input type="checkbox" name="friends[]" value="<?=$friend->id?>" />
                                        </div>
                                        <div class="inline avatar avatar-sm is-circle spanicon">
                                            <img src="<?=$friend->avatar()?>">
                                        </div>
                                        <div><?=$friend->getName()?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="panel-body row">
                                <?php if(count($friends)): ?>
                                    <button class="pull-right btn btn-default btn-sm">Unfriend</button>
                                <?php endif; ?>
                            </div>  
                            <input type="hidden" name="action" value="removeFriend">
                        </form>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <?php template('footer'); ?>
</body>
</html>
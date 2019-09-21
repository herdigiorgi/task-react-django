import React from 'react'
import Badge from '@material-ui/core/Badge';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { useUserServiceState, UserService } from '../bloc/UserService';
import Stars from '@material-ui/icons/Stars';
import { makeStyles } from '@material-ui/core/styles';

export function UserIcon(props) {
    const cursorStyle = props.onClick? "pointer" : "default";
    return(
        <Badge badgeContent={props.user.is_admin? <Stars/>: undefined}>
            <Avatar alt={props.user.first_name} src={props.user.picture} 
                onClick={props.onClick} style={{cursor: cursorStyle}}/>
        </Badge>
    )
}

export function UserIdIconList(props) {
    const classes = makeStyles(theme => ({
        root: {
          marginRight: '5px',
          height: "2em",
          display: 'inline'
        }
    }))();
    const users = props.ids.map((x) => UserService.idToUser(x))
    const userIcons = users.map(user => {
        if(user) {
            return(
                <div className={classes.root} key={`user-icon-${user.id}`}
                    title={user.first_name}> 
                    <UserIcon  user={user}/>
                </div>
            )
        } else {
            return <div/>
        }
    })
    return <div>{userIcons}</div>
} 

function UserListItem(props) {
    const useDivider = props.length!==props.index+1
    const user = props.user
    function onUserClick() {
        if(props.onClick) {
            props.onClick(props.user)
        }
    }
    return(
        <ListItem className="userListItem" button={true}
                      divider={useDivider}
                      onClick={onUserClick}>
            <ListItemAvatar>
                <UserIcon user={user}/>
            </ListItemAvatar>
            <ListItemText 
                primary={user.first_name + ' ' + user.last_name} 
                secondary={user.email} />
        </ListItem>
    )
}

export function UserList(props) {
    const userState = useUserServiceState()
    const length = userState.allUsers.length
    let items = []
    function onUserClick(user) {
        UserService.login(user.id)
    }
    userState.allUsers.forEach((user, index) => {
        items.push(
            <UserListItem user={user} index={index} length={length}
                          key={user.id}
                          onClick={onUserClick}/>
        )
    })
    return <List>
        {items}
    </List>
}
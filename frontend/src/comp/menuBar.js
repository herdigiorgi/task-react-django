import React, {Component} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {UserService} from '../bloc/UserService';
import {UserIcon} from './User';

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    title: {
      flexGrow: 1,
    },
}));

function InnerMenuBar(props) {
    const classes = useStyles(props);
    let userIcon;
    if(props.user) {
        userIcon = <UserIcon 
                        user={props.user} 
                        onClick={props.onUserClick}/>
    }
    return(
        <AppBar position="static" className={classes.root}>
            <Toolbar>
            <Typography variant="h6" className={classes.title}>
                Tasks App
            </Typography>
            {userIcon}
            </Toolbar>
        </AppBar>
    )
}

export default class MenuBar extends Component {

    constructor() {
        super()
        this.state = {}
    }

    render() {
        return <InnerMenuBar user={this.state.currentUser}
            onUserClick={() => this.onUserClick() }/>
    }

    componentDidMount() {
        this.subscription = UserService.getSubject().subscribe(state => {
            this.setState(state)
        })
    }

    componentWillUnmount(){
        this.subscription.unsubscribe()
    }

    onUserClick() {
        UserService.logOut()
    }
}
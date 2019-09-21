import './App.css'
import React from 'react';
import { UserList } from './comp/User';
import { useUserServiceState } from './bloc/UserService';
import Container from '@material-ui/core/Container';
import MenuBar from './comp/menuBar';
import TaskManager from './comp/TaskManager';

export default function App() {
  const userState = useUserServiceState()
  const innerComponent = userState.currentUser? 
    <TaskManager/> : 
    <UserList/>;
  
  return (
    <div>
      <MenuBar/>
      <Container maxWidth="sm">
        {innerComponent}
      </Container>
    </div>
  ); 
}


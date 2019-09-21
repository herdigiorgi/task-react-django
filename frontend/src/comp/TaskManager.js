import React, { useState, useReducer } from 'react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import { SelectUser, SelectStatus } from './Selects';
import { Map } from 'immutable';
import { DefaultButton } from './Common';
import { TaskService, useTaskServiceState } from '../bloc/TaskService';
import { 
    ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions,
    Divider
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CancelIcon from '@material-ui/icons/Cancel';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';


import { makeStyles } from '@material-ui/core/styles';
import { UserIdIconList } from './User';




function TaskStatusIcon(props) {
    switch(props.status) {
        case 'new':
            return <FiberManualRecordIcon style={{color: 'rgb(33, 147, 80)'}}/>
        case 'in progress':
            return <FlightTakeoffIcon style={{color: '#1d57c1'}} />
        case 'completed':
            return <DoneOutlineIcon style={{color: 'rgb(67, 23, 191)'}} />
        default:
            return <CancelIcon style={{color: 'rgb(93, 84, 121)'}} />
    }
}

function EdiTask(props){
    const [task, setTask] = useState(Map(props.task))
    
    function onSetTaskAttr(attr) {
        return (e) => {
            setTask(task.set(attr, e.target.value))
        }
    }

    var titleText, submitText;
    if(props.update) {
        titleText = "Task Modification"
        submitText = "Update"
    } else {
        titleText = "Task Creation";
        submitText = "Create"
    }

    function onSubmit() {
        const taskObj = task.toObject()
        if(props.update) {
            TaskService.updateTask(taskObj)
        } else {
            TaskService.createTask(taskObj)
        }
        if(props.onSubmit) {
            props.onSubmit(taskObj)
        }
    }

    function onCancel() {
        if(props.onCancel) {
            props.onCancel()
        }
    }

    const classes = makeStyles(theme => ({
        cancelButton: {
          marginLeft: '5px',
        }
    }))();

    return(
        <div>  
            <Typography variant="h4" component="h4">
                {titleText}
            </Typography>
            <TextField fullWidth label="Title" 
                value={task.get('title')}
                onChange={onSetTaskAttr('title')} />
            <TextField fullWidth label="Description" multiline rows={4}
                value={task.get('description')}
                onChange={onSetTaskAttr('description')} />
            <SelectStatus
                value={task.get('status')}
                onChange={onSetTaskAttr('status')}/>
            <SelectUser
                value={task.get('assignees')}
                onChange={onSetTaskAttr('assignees')}/>
            <DefaultButton onClick={onSubmit}>
                {submitText}
            </DefaultButton>
            <DefaultButton onClick={onCancel} className={classes.cancelButton} >
                Cancel
            </DefaultButton>
        </div>
    );
}


function TaskList(props) {
    const taskState = useTaskServiceState()
    const classes = makeStyles(theme => ({
        root: {
          width: '100%',
        },
        heading: {
          fontSize: theme.typography.pxToRem(15),
          fontWeight: theme.typography.fontWeightRegular,
          textTransform: 'capitalize'
        },
        details: {
            display: 'block',
            paddingTop: 0,
            paddingBottom: '0.5em'
        },
        description: {
            display: 'block',
            paddingBottom: '1em',
            color: "#5e5e5e"
        },
      }))();

    function onEdit(task) {
        if(props.onEdit) {
            props.onEdit(task)
        }
    }

    function onComments(task) {
        if(props.onComments) {
            props.onComments(task)
        }
    } 

    const items = taskState.tasks.map(item => 
        <ExpansionPanel key={`task-item-${item.id}`}>
            <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}>
                <TaskStatusIcon status={item.status} />
                <Typography className={classes.heading}>
                    {item.title}            
                </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.details}>
                <Typography className={classes.description}>
                    {item.description}
                </Typography>
                <UserIdIconList ids={item.assignees}/>
            </ExpansionPanelDetails>
            <Divider />
            <ExpansionPanelActions>
                <Button size="small" onClick={() => onEdit(item)}>
                    Edit
                </Button>
                <Button size="small" onClick={() => onComments(item)}>
                    Comments
                </Button>
            </ExpansionPanelActions>
        </ExpansionPanel>
    )
    return <List>
        {items}
    </List>
}


export default function TaskManager() {
    const initialState = Map({
        showNewButton: true,
        editingTask: null,
        creatingTask: null
    })
    const hiddenState = initialState.set('showNewButton', false)
    const reducer = (state, action) => {
        switch(action.type) {
            case 'task-edit-click':
                return hiddenState.set('editingTask', action.task)
            default:
                break
        }
        switch(action){
            case 'new-task-click':
                return hiddenState.set('creatingTask', true)
            case 'task-change-submitted':
                return initialState
            case 'task-change-cancel':
                return initialState
            default:
                break
        }
        return state
    }
    const [state, dispatch] = useReducer(reducer, initialState)

    return(
        <div>
            {state.get('showNewButton') &&
                <DefaultButton 
                    onClick={() => dispatch('new-task-click')}>
                    New Tasks
                </DefaultButton>
            }
            {state.get('creatingTask') &&
                <EdiTask create={true} 
                    onCancel={() => dispatch('task-change-cancel')}
                    onSubmit={() => dispatch('task-change-submitted')} />
            }
            {state.get('editingTask') &&
                <EdiTask update={true}
                    task={state.get('editingTask')}
                    onCancel={() => dispatch('task-change-cancel')}
                    onSubmit={() => dispatch('task-change-submitted')} />
            }
            {state.get('showNewButton') &&
                <TaskList
                    onEdit={(task) => dispatch({
                        type: 'task-edit-click',
                        task
                    })}
                />
            }
        </div>
    )
}
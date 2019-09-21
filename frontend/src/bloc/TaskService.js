import { useState, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Map } from 'immutable';
import { UserService } from './UserService';

class _TaskService {
    constructor() {
        this.state = Map({
            editingTask: null,
            creatingTask: null,
            tasks: []
        })
        this.subject = new BehaviorSubject(this.state.toObject())
        UserService.getSubject().subscribe((x) => this.onUserStateChange(x))
    }

    getSubject() {
        return this.subject;
    }

    onUserStateChange(state) {
        if(state.currentUser && this.state.get('tasks').length <= 0) {
            this._fetchTasks()
        }
    }

    startEditingTask(task) {
        this._updateState('editingTask', task)
    }

    startCreatingTask() {
        this._updateState('creatingTask', true)
    }

    createTask(task) {
        UserService.fetch('/task/', {
            method: 'POST',
            body: JSON.stringify(task)
        }).subscribe(r => {
            this._updateState('tasks', r)
        })
    }

    updateTask(task) {
        const {created_by, id, ...toUpdate} = task
        UserService.fetch(`/task/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(toUpdate)
        }).subscribe(r => {
            this._updateState('tasks', r)
        })
    }

    _fetchTasks() {
        UserService.fetch('/task/').subscribe(r => {
            this._updateState('tasks', r)
        })
    }

    _updateState(key, value) {
        this.state = this.state.set(key, value)
        this.subject.next(this.state.toObject())
    }

}

export const TaskService = new _TaskService()
export function useTaskServiceState() {
    const [taskState, setTaskState] = useState(TaskService.state.toObject())
    useEffect(()=> {
        const sub = TaskService.getSubject().subscribe(val => {
            setTaskState(val)
        })
        return () => sub.unsubscribe()
    })
    return taskState
}

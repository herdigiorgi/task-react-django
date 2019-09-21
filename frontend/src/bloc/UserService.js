import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { Map } from 'immutable';
import { useEffect, useState } from 'react';


class _UserService {
    constructor() {
        this.state = Map({
            allUsers: [],
            currentUser: null
        })
        this.subject = new BehaviorSubject(this.state.toObject())
        this._fetchUsers()
    }

    getSubject() {
        return this.subject.asObservable()
    }

    _fetchUsers() {
        fromFetch('/user/').pipe(
            switchMap(x => x.json())
        ).subscribe(r => {
            this.state = this.state.set('allUsers', r)
            this.subject.next(this.state.toObject())
        })
    }

    idToUser(userId) {
        let user
        for(user of this.state.get('allUsers')) {
            if(user.id === userId) {
                return user
            }
        }
    }

    login(userId) {
        fromFetch(`/token/${userId}/`, {method: 'POST'}).pipe(
            switchMap(x => x.json())
        ).subscribe(r => {
            this.state = this.state.set('currentUser', r)
            this.subject.next(this.state.toObject())
        })
    }

    logOut() {
        this.state = this.state.set('currentUser', null)
        this.subject.next(this.state.toObject())
    }

    fetch(url, opts = {}) {
        const token = this.state.get('currentUser').token || ""
        return fromFetch(url, {
            ...opts,
            headers: {
                'Authorization': 'Token ' + token,
                'Content-Type': 'application/json'
            }
        }).pipe(
            switchMap(x => x.json())
        )
    }
}

export const UserService = new _UserService()
export function useUserServiceState() {
    const [userState, setUserState] = useState(UserService.state.toObject())
    useEffect(()=> {
        const sub = UserService.getSubject().subscribe(val => {
            setUserState(val)
        })
        return () => sub.unsubscribe()
    })
    return userState
}

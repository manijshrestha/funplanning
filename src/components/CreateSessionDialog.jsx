import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import firebase from 'firebase';
import firebaseApp from '../FirebaseApp';

export default class CreateSessionDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sessionName: "",
            username: ""
        }
    }

    createSession() {
        console.log("Going to initialize session");
        // Request Login
        firebaseApp.auth().signInAnonymously()
            .catch(error => { console.log("Error loging in", error.code, error.message) })

        // Login Info obtained
        firebaseApp.auth().onAuthStateChanged(user => {
            console.log("Login state changed", user)
            var sessionId = this.addSessionToDb(this.state.sessionName, this.state.username, user.uid)
            this.setState({ sessionName: "", username: "" })
            this.props.onCreateSuccess(sessionId)
        })
    }

    addSessionToDb(sessionName, username, uid) {
        var planningSession = firebaseApp.database().ref('planning-sessions').push()
        var newSession = {
            "id": planningSession.key, "name": sessionName, "revealed": false, "created": firebase.database.ServerValue.TIMESTAMP
        }
        planningSession.set(newSession)

        var members = firebaseApp.database().ref('planning-members/' + planningSession.key).child(uid)
        var user = {
            "uid": uid,
            "name": username,
            "isAdmin": true
        }

        members.set(user)
        return newSession.id
    }

    onSessionNameChange(e) {
        this.setState({ sessionName: e.target.value })
    }

    onUserNameChange(e) {
        this.setState({ username: e.target.value })
    }

    render() {
        return (
            <Modal isOpen={this.props.showing}>
                <ModalHeader>Create session</ModalHeader>
                <ModalBody>
                    Creates a new plannig session to vote on
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">#</InputGroupAddon>
                        <Input placeholder="Session Name" value={this.state.sessionName} onChange={(e) => this.onSessionNameChange(e)} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">@</InputGroupAddon>
                        <Input placeholder="Your Name" value={this.state.username} onChange={(e) => this.onUserNameChange(e)} />
                    </InputGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.createSession()} disabled={this.state.username.length < 2 || this.state.sessionName.length < 2}>Create</Button>
                    <Button color="secondary" onClick={() => this.props.onCreateCancel()}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
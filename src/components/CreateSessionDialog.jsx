import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, InputGroupAddon, Input, Label } from 'reactstrap';
import firebase from 'firebase';
import firebaseApp from '../FirebaseApp';

export default class CreateSessionDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            sessionName: "",
            username: "",
            nonVoter: false,
            allowVoteChange: true
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
            var sessionId = this.addSessionToDb(this.state.sessionName, this.state.username, this.state.nonVoter, this.state.allowVoteChange, user.uid)
            this.setState({ sessionName: "", username: "" })
            this.props.onCreateSuccess(sessionId)
        })
    }

    addSessionToDb(sessionName, username, nonVoter, allowVoteChange, uid) {
        var planningSession = firebaseApp.database().ref('planning-sessions').push()
        var newSession = {
            "id": planningSession.key, "name": sessionName, "revealed": false, "created": firebase.database.ServerValue.TIMESTAMP,
            "allowVoteChange": allowVoteChange
        }
        planningSession.set(newSession)

        var members = firebaseApp.database().ref('planning-members/' + planningSession.key).child(uid)
        var user = {
            "uid": uid,
            "name": username,
            "isAdmin": true,
            "nonVoter": nonVoter
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

    onAllowVoteChange(e) {
        this.setState({ allowVoteChange: e.target.checked })
    }

    onNonVoterChange(e) {
        this.setState({ nonVoter: e.target.checked })
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
                    <div className="mx-4">
                        <Label check>
                            <Input type="checkbox" checked={this.state.nonVoter} onChange={(e) => this.onNonVoterChange(e)} />
                            I wont be voting, I am just watching.
                        </Label>
                    </div>
                    <br />
                    <div className="mx-4">
                        <Label check>
                            <Input type="checkbox" checked={this.state.allowVoteChange} onChange={(e) => this.onAllowVoteChange(e)} />
                            Allow vote to be changed after voting
                        </Label>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.createSession()} disabled={this.state.username.length < 2 || this.state.sessionName.length < 2}>Create</Button>
                    <Button color="secondary" onClick={() => this.props.onCreateCancel()}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
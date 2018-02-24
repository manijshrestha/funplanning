import React from 'react'
import UserNameDialog from './UserNameDialog'
import Votes from './Votes'
import Ballot from './Ballot'
import { Alert, Container, Row, Col } from 'reactstrap'
import firebaseApp from '../FirebaseApp'

export default class PlanningSession extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            usernameDialogShowing: false,
            invalidSession: false,
            sessionId: "",
            sessionName: "",
            reveal: false,
            voter: {}
        }
    }

    componentWillMount() {
        this.setState({ sessionId: this.props.match.params.session })
        firebaseApp.auth().signInAnonymously().then(() => {
            let planningReg = firebaseApp.database().ref('planning-sessions/' + this.props.match.params.session)

            // Set one time record
            planningReg.once('value', snapshot => {
                let record = snapshot.val()
                if (record) {
                    console.log("name: ", record)
                    this.setState({ sessionName: record.name, reveal: record.revealed })
                } else {
                    this.setState({ invalidSession: true })
                }
            })

            // watch for updates
            planningReg.on('value', snapshot => {
                let record = snapshot.val()
                this.setState({ sessionName: record.name, reveal: record.revealed })
            })

            var loggedInUserId = firebaseApp.auth().currentUser.uid

            // find if the user exists
            firebaseApp.database().ref('planning-members/' + this.props.match.params.session)
                .orderByChild("uid").equalTo(loggedInUserId).on('value', snapshot => {
                    if (snapshot.val() === null) {
                        this.showUserNameDialog()
                    } else {
                        snapshot.forEach(user => {
                            console.log("me: ", user.val())
                            this.setState({ voter: user.val() })
                        })
                    }
                })
        })
    }

    showUserNameDialog() {
        this.setState({ usernameDialogShowing: true })
    }

    hideUserNameDialog() {
        this.setState({ usernameDialogShowing: false })
    }

    handleUserNameSet(username) {
        this.hideUserNameDialog()
        console.log('set the session name to ', username)
        var userId = firebaseApp.auth().currentUser.uid
        var userRecord = firebaseApp.database().ref('planning-members/' + this.state.sessionId).child(userId)
        var currentUser = { "uid": userId, "name": username }
        userRecord.set(currentUser)
    }

    handleUserNameCancel() {
        // take the user back to home if user had not set the name
        this.hideUserNameDialog()
    }

    handleCastBallot(vote) {
        console.log("Will vote ", vote)
        firebaseApp.database().ref('planning-members/' + this.state.sessionId + '/' + this.state.voter.uid)
            .update({ voted: true, vote: vote })
    }

    handleReveal(flag) {
        firebaseApp.database().ref('planning-sessions/' + this.props.match.params.session).update({ revealed: flag })
    }

    render() {
        let invalidSession = null
        if (this.state.invalidSession) {
            invalidSession = <Alert color="danger"> Planning session you are trying to access no longer exists. </Alert>
        }

        return (
            <div className="mx-auto">
                {invalidSession}
                {this.state.invalidSession === false &&
                    <div>
                        <Container>
                            <Row>
                                <Col>
                                    <h2>Planning Session: {this.state.sessionName}</h2>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={{ size: 6, offset: 2 }}>
                                    <Votes sessionId={this.state.sessionId} reveal={this.state.reveal} onReveal={(flag) => this.handleReveal(flag)} />
                                </Col>
                                <Col xs={{ size: 3, offset: 1 }}>
                                    <Ballot voter={this.state.voter} onCastVote={(vote) => this.handleCastBallot(vote)} />
                                </Col>
                            </Row>
                        </Container>
                        <UserNameDialog showing={this.state.usernameDialogShowing} onUserNameSet={(username) => this.handleUserNameSet(username)} onUserNameCancel={() => this.handleUserNameCancel()} />
                    </div>
                }
            </div>
        )
    }
}
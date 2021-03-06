import React from 'react'
import UserNameDialog from './UserNameDialog'
import Votes from './Votes'
import Viewers from './Viewers'
import Ballot from './Ballot'
import { Alert, Container, Row, Col } from 'reactstrap'
import firebaseApp from '../FirebaseApp'
import QRCode from 'qrcode.react'

export default class PlanningSession extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            usernameDialogShowing: false,
            invalidSession: false,
            sessionId: "",
            sessionName: "",
            reveal: false,
            voter: {},
            allowVoteChange: false
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
                if (record) {
                    this.setState({ sessionName: record.name, reveal: record.revealed, allowVoteChange: record.allowVoteChange })
                } else {
                    this.setState({ invalidSession: true })
                }
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

    handleUserNameSet(username, nonVoter) {
        this.hideUserNameDialog()
        console.log('set the session name to ', username)
        var userId = firebaseApp.auth().currentUser.uid
        var userRecord = firebaseApp.database().ref('planning-members/' + this.state.sessionId).child(userId)
        var currentUser = { "uid": userId, "name": username, "nonVoter": nonVoter }
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

                            <Row className="justify-content-center">
                                <Col xs="mx-auto mt-2 mb-2">
                                    <Ballot voter={this.state.voter} onCastVote={(vote) => this.handleCastBallot(vote)} allowVoteChange={this.state.allowVoteChange} />
                                </Col>
                            </Row>
                        </Container>

                        <Votes sessionId={this.state.sessionId} reveal={this.state.reveal} onReveal={(flag) => this.handleReveal(flag)} />

                        <Row className="justify-content-center">
                            <Col xs="3">
                                <Viewers sessionId={this.state.sessionId} />
                            </Col>
                        </Row>

                        <QRCode value={window.location.href} xs="mx-auto" />

                        <UserNameDialog showing={this.state.usernameDialogShowing} onUserNameSet={(username, nonVoter) => this.handleUserNameSet(username, nonVoter)} onUserNameCancel={() => this.handleUserNameCancel()} />
                    </div>
                }
            </div>
        )
    }
}
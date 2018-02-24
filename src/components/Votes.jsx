import React from 'react'
import { Container, Row, Col, Table, Badge, Button } from 'reactstrap'
import firebaseApp from '../FirebaseApp'

class VoterRow extends React.Component {

    render() {
        let voteState = null
        if (this.props.user.vote && this.props.reveal) {
            voteState = <h4>{this.props.user.vote}</h4>
        } else {
            voteState = <h4>-</h4>
        }
        return (
            <tr>
                <td>
                    {this.props.isAdmin && !this.props.isYou ? <button type="button" className="close" aria-label="Close" onClick={() => this.props.onRemove(this.props.user)}><span aria-hidden="true">&times;</span></button> : null}
                    {this.props.user.name} {this.props.isYou ? <Badge color="success">You</Badge> : ""} {this.props.user.isAdmin ? <Badge color="danger">Admin</Badge> : ""}
                </td>
                <td>
                    <h3>
                        {this.props.user.voted ? <Badge color="success">Yes</Badge> : <Badge color="secondary">No</Badge>}
                    </h3>
                </td>
                <td>
                    {voteState}
                </td>
            </tr>
        )
    }
}

export default class Votes extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loggedInUid: "",
            isAdmin: false,
            voters: []
        }
    }

    componentWillMount() {
        firebaseApp.auth().signInAnonymously().then(() => {
            var uid = firebaseApp.auth().currentUser.uid
            this.setState({ loggedInUid: uid })
            var votersRef = firebaseApp.database().ref('planning-members/' + this.props.sessionId)
            // On added
            votersRef.on('child_added', snapshot => {
                var voter = snapshot.val()
                this.setState({ voters: this.state.voters.concat(voter) })

                if (voter.isAdmin && voter.uid === uid) {
                    this.setState({ isAdmin: true })
                }
            })

            // On changed from backend
            votersRef.on('child_changed', snapshot => {
                console.log('Child updated', snapshot.val())
                let voter = snapshot.val()
                let voters = this.state.voters
                let index = voters.findIndex(item => voter.uid === item.uid)
                voters[index] = voter
                this.setState({ voters: voters })
            })

            // On voter removed
            votersRef.on('child_removed', snapshot => {
                console.log('Child removed', snapshot.val())
                let voter = snapshot.val()
                let voters = this.state.voters
                let index = voters.findIndex(item => voter.uid === item.uid)
                console.log("index to remove", index)
                voters.splice(index, 1)
                this.setState({ voters: voters })
            })

        })
    }

    onResetVotes() {
        console.log('Resetting votes')
        this.props.onReveal(false)
        firebaseApp.database().ref('planning-members/' + this.props.sessionId)
            .once('value', snapshot => {
                snapshot.forEach(user => {
                    user.ref.update({ vote: 0, voted: false })
                })
            })
    }

    onRemoveVoter(user) {
        console.log('Removing user: ', user)
        firebaseApp.database().ref('planning-members/' + this.props.sessionId + '/' + user.uid).remove()
    }

    render() {
        return (
            <Container style={{ width: '600px' }}>
                <Row>
                    {this.state.isAdmin ?
                        <Col sm={{ size: 6, offset: 6 }} style={{ padding: '.5rem' }} >
                            <Button color="danger" onClick={() => this.onResetVotes()}>Reset</Button>{'   '}
                            <Button color="primary" onClick={() => this.props.onReveal(true)}>Reveal</Button>
                        </Col>
                        : null}
                </Row>
                <Row>
                    <Table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Voted?</th>
                                <th>Vote</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.voters.map(user => <VoterRow
                                user={user}
                                isAdmin={this.state.isAdmin}
                                isYou={user.uid === this.state.loggedInUid}
                                reveal={this.props.reveal}
                                onRemove={(user) => { this.onRemoveVoter(user) }}
                                key={user.uid} />)}
                        </tbody>
                    </Table>
                </Row>
            </Container>
        )
    }
}
import React from 'react'
import { Container, Row, Table, Badge } from 'reactstrap'
import firebaseApp from '../FirebaseApp'

class ViewerRow extends React.Component {

    render() {
        return (
            <tr>
                <td>
                    {this.props.isAdmin && !this.props.isYou ? <button type="button" className="close" aria-label="Close" onClick={() => this.props.onRemove(this.props.user)}><span aria-hidden="true">&times;</span></button> : null}
                    {this.props.user.name} {this.props.isYou ? <Badge color="success">You</Badge> : ""} {this.props.user.isAdmin ? <Badge color="danger">Admin</Badge> : ""}
                </td>
            </tr>
        )
    }
}

export default class Viewers extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loggedInUid: "",
            isAdmin: false,
            viewers: []
        }
    }

    componentWillMount() {
        firebaseApp.auth().signInAnonymously().then(() => {
            var uid = firebaseApp.auth().currentUser.uid
            this.setState({ loggedInUid: uid })
            var viewerRef = firebaseApp.database().ref('planning-members/' + this.props.sessionId)

            // On added
            viewerRef.on('child_added', snapshot => {
                var viewer = snapshot.val()
                this.setState({ viewers: this.state.viewers.concat(viewer) })

                if (viewer.isAdmin && viewer.uid === uid) {
                    this.setState({ isAdmin: true })
                }
            })

            // On changed from backend
            viewerRef.on('child_changed', snapshot => {
                console.log('Child updated', snapshot.val())
                let viewer = snapshot.val()
                let viewers = this.state.viewers
                let index = viewers.findIndex(item => viewer.uid === item.uid)
                viewers[index] = viewer
                this.setState({ viewers: viewers })
            })

            // On voter removed
            viewerRef.on('child_removed', snapshot => {
                console.log('Child removed', snapshot.val())
                let viewer = snapshot.val()
                let viewers = this.state.viewers
                let index = viewers.findIndex(item => viewer.uid === item.uid)
                console.log("index to remove", index)
                viewers.splice(index, 1)
                this.setState({ viewers: viewers })
            })

        })
    }

    onRemoveViewer(user) {
        console.log('Removing viewer: ', user)
        firebaseApp.database().ref('planning-members/' + this.props.sessionId + '/' + user.uid).remove()
    }

    render() {
        return (
            <Container>
                <Row>
                    <Table>
                        <thead>
                            <tr>
                                <th>Viewer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.viewers.filter(user => user.nonVoter === true)
                                .map(user => <ViewerRow
                                    user={user}
                                    isAdmin={this.state.isAdmin}
                                    isYou={user.uid === this.state.loggedInUid}
                                    onRemove={(user) => { this.onRemoveViewer(user) }}
                                    key={user.uid} />)}
                        </tbody>
                    </Table>
                </Row>
            </Container>
        )
    }
}
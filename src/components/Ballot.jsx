import React from 'react'
import { Card, CardBody, CardTitle, CardText, Button, Input } from 'reactstrap'

export default class Ballot extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            vote: ""
        }
    }

    onVoteChange(e) {
        this.setState({ vote: e.target.value })
    }

    onCastVote() {
        let vote = this.state.vote
        this.props.onCastVote(vote)
        this.setState({ vote: "" })
    }

    render() {
        return (
            <Card>
                <CardBody>
                    <CardTitle>{this.props.voter.name}</CardTitle>
                    <CardText>
                        <Input placeholder="Vote" disabled={!this.props.allowVoteChange && this.props.voter.voted} value={this.state.vote} onChange={e => this.onVoteChange(e)} />
                    </CardText>
                    <Button color="success" disabled={this.state.vote.length < 1} onClick={() => this.onCastVote()}>Vote</Button>
                </CardBody>
            </Card>
        )
    }
}
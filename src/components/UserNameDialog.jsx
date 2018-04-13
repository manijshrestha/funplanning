import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, InputGroupAddon, Input, Label } from 'reactstrap';

export default class UserNameDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            username: props.username,
            nonVoter: false
        }
    }

    onNameChange(e) {
        this.setState({ username: e.target.value })
    }

    onNonVoterChange(e) {
        this.setState({ nonVoter: e.target.checked })
    }

    render() {
        return (
            <Modal isOpen={this.props.showing}>
                <ModalHeader>Name</ModalHeader>
                <ModalBody>
                    Enter your name to identify yourself?
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">@</InputGroupAddon>
                        <Input placeholder="Name" value={this.state.username} onChange={(e) => this.onNameChange(e)} />
                    </InputGroup>
                    <br />
                    <div className="mx-4">
                        <Label check>
                            <Input type="checkbox" checked={this.state.nonVoter} onChange={(e) => this.onNonVoterChange(e)} />
                            I wont be voting, I am just watching.
                        </Label>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={() => this.props.onUserNameSet(this.state.username, this.state.nonVoter)} disabled={this.state.username.length < 2}>Set</Button>
                    <Button color="link" onClick={() => this.props.onUserNameCancel()}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

UserNameDialog.defaultProps = {
    username: ""
}
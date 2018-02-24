import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';

export default class UserNameDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = { username: props.username }
    }

    onNameChange(e) {
        this.setState({ username: e.target.value })
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
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={() => this.props.onUserNameSet(this.state.username)} disabled={this.state.username.length < 2}>Set</Button>
                    <Button color="link" onClick={() => this.props.onUserNameCancel()}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

UserNameDialog.defaultProps = {
    username: ""
}
import React from 'react';
import { Card, CardBody, CardTitle, Button } from 'reactstrap';
import CreateSessionDialog from './CreateSessionDialog';


export default class CreateNewSession extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alertShowing: false
        }
    }

    openCreateModal(e) {
        console.log("Will show create alert.");
        this.setState({ alertShowing: true });
    }

    handleCreateCancel() {
        console.log("Will dismiss alert.");
        this.setState({ alertShowing: false });
    }

    handleCreateSuccess(sessionId) {
        console.log("Session create success ", sessionId);
        this.setState({ alertShowing: false });
        this.props.history.push('/planning/' + sessionId);
    }

    render() {
        return (
            <div className="mx-auto" style={{ width: '20rem' }} >
                <Card body>
                    <CardTitle>Create Session</CardTitle>
                    <CardBody>Create a new planning session</CardBody>
                    <Button color="success" onClick={e => this.openCreateModal(e)}>Create</Button>
                </Card>
                <CreateSessionDialog showing={this.state.alertShowing} onCreateCancel={() => this.handleCreateCancel()} onCreateSuccess={(sessionId) => this.handleCreateSuccess(sessionId)} />
            </div>
        );
    }
}
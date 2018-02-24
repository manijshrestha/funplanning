import React from 'react';
import {Navbar, NavbarBrand} from 'reactstrap';

export default class AppBar extends React.Component {

    render() {
        return (
            <div>
                <Navbar color="primary" light expand="md">
                    <NavbarBrand className="text-white">Funplanning</NavbarBrand>
                </Navbar>
            </div>
        )
    }
}
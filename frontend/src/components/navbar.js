import React from 'react';
import AntdDrop from './antdDrop.js';
import iconImage from '../assets/images/logo192.png';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#060A1B' }}>
            <div className="container-fluid">
                <a className="navbar-brand" href="/" style={{ color: '#C0C2C6' }}>
                    <img src={iconImage} alt="Navbar Icon" style={{ width: '30px' }} />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse d-flex justify-content-end" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                        <li className="nav-item mx-4">
                            <a className="nav-link active" aria-current="page" href="/test" style={{ color: '#C0C2C6', lineHeight: 'normal' }}>測路由</a>
                        </li>
                        <li className="nav-item mx-4">
                            <a className="nav-link active" aria-current="page" href="#" style={{ color: '#C0C2C6', lineHeight: 'normal' }}>個股</a>
                        </li>
                        <li className="nav-item mx-4">
                            <a className="nav-link active" aria-current="page" href="#" style={{ color: '#C0C2C6', lineHeight: 'normal' }}>熱門成交股</a>
                        </li>
                        <li className="nav-item mx-4">
                            <a className="nav-link active" aria-current="page" href="#" style={{ color: '#C0C2C6', lineHeight: 'normal' }}>台灣五十股</a>
                        </li>
                        <li className="nav-item mx-2">
                            <AntdDrop items={[
                                {
                                    label: '1st menu item',
                                    key: '1',
                                },
                                {
                                    label: '2nd menu item',
                                    key: '2',
                                },
                                {
                                    label: '3rd menu item',
                                    key: '3',
                                },
                            ]} />
                        </li>
                        <li className="nav-item mx-4" style={{ border: '1px solid #ffffff' }}>
                            <a className="nav-link text-nowrap d-flex justify-content-center" id="btnb" href="#" style={{ width: '100px', height: '37px', color: 'white' }}>LOG IN</a>
                        </li>
                        <li className="nav-item mx-4" style={{ backgroundColor: '#424551' }}>
                            <a className="nav-link text-nowrap d-flex justify-content-center" id="btnb" href="#" style={{ width: '200px', height: '38px', color: 'white' }}>CREATE ACCOUNT</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

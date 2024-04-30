import React from 'react';
import AntdDrop from './antdDrop.js';
import iconImage from '../assets/images/logo192.png';
import '../assets/css/login.css';

const Navbar = () => {
    return (
        <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#060A1B" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="/#">
            <img
              src={iconImage}
              alt=""
              className="img-fluid"
              style={{ width: 30 }}
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNavDropdown"
          >
            <ul className="navbar-nav">
            <li className="nav-item">
                <a className="nav-link active me-3" aria-current="page" href="/test">
                  測路由
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active me-3" aria-current="page" href="#">
                  個股
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-3" href="#">
                  熱門成交股
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link me-3" href="#">
                  台灣五十股
                </a>
              </li>
              <li className="nav-item">
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
              <li className="nav-item">
                <a
                  className="nav-link me-3 ms-2 text-center"
                  href="login"
                  id="btnb"
                  style={{ width: 100, height: 37 }}
                >
                  LOG IN
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link me-3 text-center"
                  href="/signUp"
                  id="btnb"
                  style={{ backgroundColor: "#424551", width: 200, height: 38 }}
                >
                  CREATE ACCOUNT
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
}

export default Navbar;

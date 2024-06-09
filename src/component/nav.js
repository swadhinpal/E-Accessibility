import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css'; // Import your CSS file

function Nav() {
    return (
        <nav>
            <div className="nav-links"> {/* Add a class to style the links */}
                <Link to='/Register' className="nav-link">Register</Link> {/* Add a class to style the link */}
                <Link to='/Login' className="nav-link">Login</Link>  {/* Add a class to style the link */}
            </div>
        </nav>
    );
}

export default Nav;


{/*<Link to='/'> Home </Link>
            <Link to='/tweet'> Tweet </Link>
             <Link to='/Input'> Input </Link>
    <Link to='/output'> Output </Link> */}
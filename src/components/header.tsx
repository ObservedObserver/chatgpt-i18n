import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = (props) => {
    return (
        <header className="bg-gray-800 shadow-lg mb-6 text-white">
            <nav className="mx-auto flex max-w-7xl items-center p-4 lg:px-6" aria-label="Global">
                <div className="cursor-pointer border-b-2 border-transparent grow-0 rounded-md hover:bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                    <Link to="/">i18n.ai</Link>
                </div>
                <div className="cursor-pointer border-b-2 border-transparent grow-0 rounded-md hover:bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                    <Link to="/translate">Translate</Link>
                </div>
                {/* <div className="cursor-pointer border-b-2 border-transparent grow-0">
                    <Link to={'/setting'}>Setting</Link>
                </div> */}
                <div className="float-right cursor-pointer border-b-2 border-transparent grow-0 rounded-md hover:bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                    <a href="https://github.com/ObservedObserver/chatgpt-i18n">Github</a>
                </div>
            </nav>
        </header>
    );
};

export default Header;
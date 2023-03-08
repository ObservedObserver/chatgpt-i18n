import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = (props) => {
    return (
        <header className="bg-gray-900 shadow-lg mb-6 text-white">
            <nav className="mx-auto flex max-w-7xl items-center p-6 lg:px-8" aria-label="Global">
                <div className="cursor-pointer border-b-2 border-transparent grow-0">
                    <Link to="/">i18n.ai</Link>
                </div>
                <div className="cursor-pointer border-b-2 border-transparent hover:border-gray-50 grow-0 ml-6">
                    <Link to="/translate">Translate</Link>
                </div>
                {/* <div className="cursor-pointer border-b-2 border-transparent hover:border-gray-50 grow-0 ml-6">
                    <Link to={'/setting'}>Setting</Link>
                </div> */}
                <div className="float-right cursor-pointer border-b-2 border-transparent hover:border-gray-50 grow-0 ml-6">
                    <a href="https://github.com/ObservedObserver/chatgpt-i18n">Github</a>
                </div>
            </nav>
        </header>
    );
};

export default Header;
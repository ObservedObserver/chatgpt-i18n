import React from "react";
import { Link } from "react-router-dom";

const Banner: React.FC = (props) => {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-50 sm:text-6xl">Translate Your Locale Files with AI</h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">Streamline your multilingual website or app with our i18n translation tool powered by ChatGPT. Get accurate translations in a variety of languages with just a few clicks. Try it now to start saving time and ensuring accuracy!</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <span
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Link to="/translate">Get started</Link>
                </span>
                <a href="https://github.com/ObservedObserver/chatgpt-i18n" className="text-sm font-semibold leading-6 text-gray-50">
                    Learn more <span aria-hidden="true">→</span>
                </a>
            </div>
        </div>
    );
};

export default Banner;

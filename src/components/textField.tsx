import React, { FC } from "react";

interface ITextFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}
const TextField: FC<ITextFieldProps> = (props) => {
    const { label, placeholder, value, onChange } = props;
    return (
        <div>
            <div className="flex justify-between">
                <label className="block text-sm font-medium leading-6 text-gray-500">
                    {label}
                </label>
            </div>
            <input
                type="text"
                className="block w-full rounded-md bg-zinc-900 border-0 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
        </div>
    );
};

export default TextField;

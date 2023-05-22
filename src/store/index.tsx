import { createContext, useContext } from "react";
import { CommonStore } from "./common";

const initStore: {
    commonStore: CommonStore;
} = {
    commonStore: new CommonStore(),
};

const StoreContext = createContext(initStore);

export function StoreWrapper(props: { children: React.ReactNode }) {
    return <StoreContext.Provider value={initStore}>{props.children}</StoreContext.Provider>;
}

export function useGlobalStore () {
    return useContext(StoreContext);
}
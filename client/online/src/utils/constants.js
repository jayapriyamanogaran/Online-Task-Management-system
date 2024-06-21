
import React from 'react';

export const UseDebounce = () => {

    const [timeoutState, setTimeoutState] = React.useState("");

    const debounce = (callback, delay = 1000) => {
        clearTimeout(timeoutState);
        const timer = setTimeout(() => callback(), delay)
        setTimeoutState(timer)
    }

    return debounce
}
export let LocalStorageKeys = {
    authToken: "token",
    user: "user"

};
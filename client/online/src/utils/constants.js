
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
export const transformObjectsArray = (arr) => {
    return arr?.map(obj => ({
        value: obj.id,
        label: obj.name,
        ...obj
    }));
}

export const toShow = () => {
    const user = localStorage.getItem(LocalStorageKeys.user) && JSON.parse(localStorage.getItem(LocalStorageKeys.user))
    const allowedRoles = ["Admin", "HR", "Manager"]
    return allowedRoles.includes(user?.role)
}
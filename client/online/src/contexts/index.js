import React from "react";

export let FirebaseContext = React.createContext({
    token: "",
    isTokenFound: false,
    getToken: () => false,
    requestPermission: () => false,
    deleteToken: () => false
})
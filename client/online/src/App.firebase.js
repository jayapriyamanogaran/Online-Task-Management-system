import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import "firebase/messaging";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import { ToastContainer, toast } from 'react-toastify';
import { FirebaseContext } from './contexts';
import { LocalStorageKeys } from './utils/constants';

class AppFireBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: "",
            isTokenFound: false,
            messaging: null
        }
    }

    componentDidMount() {
        this.firebaseInitialization();
    }

    firebaseInitialization = () => {
        try {
            const firebaseConfig = {
                apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.REACT_APP_FIREBASE_APP_ID,
                measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
            };

            const intializedApp = initializeApp(firebaseConfig);
            this.checkNotificationPermission(intializedApp);
        } catch (error) {
            console.log("Firebase already registered: ", error)
        }
    }

    checkNotificationPermission = async (intializedApp) => {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            this.getToken(intializedApp);
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            let permission = await Notification.requestPermission();
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                this.getToken(intializedApp);
            }
        }
    }

    getToken = async (intializedApp) => {
        const messaging = getMessaging(intializedApp);
        try {
            let currentToken = await getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPIDKEY });
            this.setState({
                token: currentToken,
                isTokenFound: currentToken ? true : false,
                messaging: messaging
            }, () => {
                localStorage.setItem(LocalStorageKeys.deviceToken, currentToken);
                this.receiveForeGroundNotifications(messaging)
            })
        } catch (error) {
            console.log("An error occurred while retrieving token. ", error);
        }
    }

    receiveForeGroundNotifications = (messaging) => {
        onMessage(messaging, (payload) => {
            toast.info(payload.data.body, {
                position: "bottom-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                onClick: () => {
                    window.location.replace("/" + payload.data.activity_id)
                }
            });
        });
    }

    deleteLocalToken = () => {
        deleteToken(this.state.messaging).then(isFullFilled => {
            if (isFullFilled) {
                console.log("Token Deleted...!");
                localStorage.removeItem(LocalStorageKeys.deviceToken);
            }
        }).catch(err => {
            console.log("Error while deleting token", err);
        });
    }

    render() {
        return <FirebaseContext.Provider
            value={{
                ...this.state,
                getToken: this.getToken,
                requestPermission: this.checkNotificationPermission,
                deleteToken: this.deleteLocalToken
            }}
        >
            {this.props.children}
            <ToastContainer
                position="bottom-right"
                autoClose={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
            />
        </FirebaseContext.Provider>
    }
}

export default AppFireBase;
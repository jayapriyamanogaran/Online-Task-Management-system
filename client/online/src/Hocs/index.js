// components/hocs/CombinedNavBar.js
import React from 'react';
import TopNavBar from '../components/topNavBar';
import SideNavBar from '../components/sideBar';


const CombinedNavBar = (WrappedComponent) => {
    return class extends React.Component {
        render() {
            return (
                <div>
                    <TopNavBar />
                    <div className="d-flex">
                        <div className="sidebar">
                            <SideNavBar />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <WrappedComponent {...this.props} />
                        </div>
                    </div>
                </div>
            );
        }
    };
};

export default CombinedNavBar;

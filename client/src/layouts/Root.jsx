import React from 'react';
import { Outlet } from 'react-router';

const Root = () => {
    return (
        <div>
            root
            <Outlet />
        </div>
    );
};

export default Root;
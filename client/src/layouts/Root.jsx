import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Root = () => {
    return (
        <div>
            <Navbar />
            <main className='min-h-[calc(100vh-50px)]'>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Root;
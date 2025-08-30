import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './Main';
import Signup from './Signup';
import Login from './Login';
import Schedule from './Schedule';
import BlogList from './BlogList';
import Write from './Write';
import BlogDetail from './BlogDetail'; 
import MyPage from './MyPage';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Main />} /> {/* 메인 페이지 */}
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/bloglist" element={<BlogList />} />
                    <Route path="/write" element={<Write />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/mypage" element={<MyPage />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // react-router-dom에서 Link 가져오기
import '../Main.css'; // 필요한 스타일 불러오기

const Header = () => {
    // 로그인 상태 관리 (초기값은 비로그인 상태로 설정)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(''); // 로그인한 사용자 이름

    // 로그인 상태 확인 (로컬 스토리지나 API 등을 통해 확인 가능)
    useEffect(() => {
        // 로컬 스토리지에서 로그인 상태를 확인
        const user = JSON.parse(localStorage.getItem('user')); // 사용자 정보 저장 예시
        if (user && user.isLoggedIn) {
            setIsLoggedIn(true);
            setUsername(user.username);
        }
    }, []);

    // 로그아웃 처리 함수
    const handleLogout = () => {
        // 로컬 스토리지에서 사용자 정보 삭제
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUsername('');
        alert('로그아웃 되었습니다.');
        
        // 페이지 새로고침
        window.location.reload();
    };

    return (
        <header>
            <div className="container header-flex">
                <div className="logo">
                    <h1>하루 한 컷</h1>
                </div>
                <nav>
                    <ul className="nav-links">
                        <li><Link to="/">홈</Link></li>
                        <li><Link to="/schedule">일정</Link></li>
                        <li><Link to="/bloglist">블로그</Link></li>
                        <li><Link to="/contact">하루 한 줄</Link></li>
                    </ul>
                </nav>

                <div className="auth-links">
                    {isLoggedIn ? (
                        // 로그인 상태일 때 사용자 이름을 마이페이지로 이동하는 링크로 설정
                        <>
                            <Link to="/mypage" className="username-link">{username} 님</Link> {/* 사용자 이름 클릭 시 마이페이지로 이동 */}
                            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                        </>
                    ) : (
                        // 비로그인 상태일 때 회원가입/로그인 링크 표시
                        <>
                            <Link to="/signup">회원가입</Link>
                            <Link to="/login">로그인</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

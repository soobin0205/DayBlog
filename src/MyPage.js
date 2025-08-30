import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css'; // 필요한 CSS 파일 불러오기
import Header from './common/Header'; // Header 컴포넌트 가져오기

const MyPage = () => {
    const [user, setUser] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [newProfileImage, setNewProfileImage] = useState('');
    const navigate = useNavigate();

    // 로그인된 사용자 정보 가져오기
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (loggedUser && loggedUser.username) {
            setUser(loggedUser);
            setNewUsername(loggedUser.username);
            setProfileImage(loggedUser.profileImage || 'default-profile.png');
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [navigate]);

    // 사용자 이름 변경
    const handleUsernameChange = (e) => {
        setNewUsername(e.target.value);
    };

    // 프로필 이미지 변경
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 정보 수정 저장 (localStorage만 업데이트)
    const handleSaveChanges = () => {
        const updatedUser = {
            ...user,
            username: newUsername,
            profileImage: newProfileImage || profileImage,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('사용자 정보가 수정되었습니다.');
    };

    // 회원탈퇴 처리 (서버 + localStorage)
    const handleDeleteAccount = async () => {
        if (window.confirm('정말로 회원탈퇴를 진행하시겠습니까?')) {
            try {
                const token = localStorage.getItem('token'); // ✅ JSON.parse 제거

                const response = await fetch('http://localhost:3001/api/delete-account', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    alert('회원탈퇴가 완료되었습니다.');
                    navigate('/signup');
                } else {
                    alert(data.error || '회원탈퇴 중 오류 발생');
                }
            } catch (err) {
                console.error(err);
                alert('서버와 연결할 수 없습니다.');
            }
        }
    };

    return (
        <div>
            <Header />
            <div className="mypage-container">
                <h2>마이페이지</h2>
                <div className="profile-section">
                    <img
                        src={newProfileImage || profileImage}
                        className="profile-image"
                        alt="프로필"
                    />
                    <input type="file" onChange={handleProfileImageChange} />
                </div>
                <div className="info-section">
                    <label>사용자 이름:</label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={handleUsernameChange}
                    />
                    <button onClick={handleSaveChanges}>정보 수정</button>
                </div>
                <button onClick={handleDeleteAccount} className="delete-account-btn">
                    회원탈퇴
                </button>
            </div>
        </div>
    );
};

export default MyPage;

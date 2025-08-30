import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    // 폼 제출 처리
    const handleSubmit = (event) => {
        event.preventDefault(); // 폼 제출 기본 동작 방지

        // 서버로 로그인 요청
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),  // 이메일과 비밀번호 전송
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);  // 오류 메시지 설정
            } else {
                // 로그인 성공 시 토큰을 로컬 스토리지에 저장
                localStorage.setItem('token', data.token);  // 토큰 저장

                // 로그인 성공 시 사용자 정보를 로컬 스토리지에 저장 (ID 포함)
                const userInfo = {
                    username: data.user.username,  // 서버로부터 받은 사용자 이름
                    id: data.user.id, // 사용자 ID 추가
                    isLoggedIn: true
                };
                localStorage.setItem('user', JSON.stringify(userInfo)); // ID 포함

                // 로그인 후 로그 출력
                console.log('로그인 후 저장되는 사용자 정보:', userInfo);

                // 로그인 성공 시 메인 페이지로 리다이렉트
                navigate('/'); // "/" 경로로 이동 (메인 페이지)
            }
        })
        .catch(error => {
            console.error('로그인 요청 실패:', error);
            setError('서버와의 연결에 실패했습니다.');
        });
    };

    return (
        <div className="login-page">
            <div className="form-container">
                <h2>로그인</h2>
                <form onSubmit={handleSubmit}> {/* 폼 제출 시 handleSubmit 호출 */ }
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}  {/* 오류 메시지 표시 */}
                    <button type="submit" className="submit-btn">로그인</button>
                </form>
                <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import './Signup.css'; // 필요한 스타일 불러오기

const Signup = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    // 비밀번호 일치 여부 체크 함수
    const checkPasswordMatch = (password, confirmPassword) => {
        if (password === confirmPassword) {
            setPasswordMatch('비밀번호가 일치합니다.');
        } else {
            setPasswordMatch('비밀번호가 일치하지 않습니다.');
        }
    };

    // 폼 제출 처리
    const handleSubmit = (event) => {
        event.preventDefault(); // 기본 폼 제출 동작 방지
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 서버로 데이터 전송
        const username = event.target.username.value;
        const email = event.target.email.value;

        fetch('http://localhost:3001/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                setError(data.error); // 오류 메시지 표시
            } else {
                // 회원가입 성공 시 메인 페이지로 이동
                alert('회원가입 성공');
                navigate('/'); // 메인 페이지로 이동
            }
        })
        .catch((error) => {
            console.error('회원가입 요청 실패:', error);
            setError('서버와의 연결에 실패했습니다.');
        });
    };

    return (
        <div className="signup-page"> {/* signup-page 클래스 추가 */}
            <div className="signup-container">
                <h2 className="signup-title">회원가입</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="signup-form-group">
                        <label htmlFor="username" className="signup-label">사용자 이름</label>
                        <input type="text" id="username" name="username" className="signup-input" required />
                    </div>
                    <div className="signup-form-group">
                        <label htmlFor="email" className="signup-label">이메일</label>
                        <input type="email" id="email" name="email" className="signup-input" required />
                    </div>
                    <div className="signup-form-group">
                        <label htmlFor="password" className="signup-label">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="signup-input"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            required
                        />
                    </div>
                    <div className="signup-form-group">
                        <label htmlFor="confirm-password" className="signup-label">비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirm-password"
                            className="signup-input"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                checkPasswordMatch(password, e.target.value);
                            }}
                            required
                        />
                        <div className={`signup-password-match ${password === confirmPassword ? 'signup-valid' : ''}`}>
                            {passwordMatch}
                        </div>
                    </div>
                    {error && <p className="error-message">{error}</p>}  {/* 오류 메시지 표시 */}
                    <button type="submit" className="signup-submit-btn">회원가입</button>
                </form>
                <p className="signup-login-prompt">이미 계정이 있으신가요? <Link to="/login" className="signup-login-link">로그인</Link></p>
            </div>
        </div>
    );
};

export default Signup;

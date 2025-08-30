import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css'; // 스타일 파일 가져오기
import Header from './common/Header'; // Header 컴포넌트 가져오기

const BlogDetail = () => {
    const { id } = useParams(); // URL에서 게시물 ID 가져오기
    const [post, setPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); // 로그인 페이지로 이동
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPost(data); // 게시물 데이터 상태에 저장
                } else {
                    console.error('게시물 가져오기 실패:', response.statusText);
                }
            } catch (error) {
                console.error('게시물 가져오기 중 오류:', error);
            }
        };

        fetchPost(); // 게시물 데이터 가져오기 실행
    }, [id, navigate]);

    if (!post) {
        return <p>게시물 로딩 중...</p>; // 게시물 로딩 중 메시지
    }

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ko-KR', options); // 한국어 형식으로 변환
    };

    return (
        <div>
            <Header />
            <div className="blog-detail-container">
                <div className=''>
                <h1>{post.title}</h1>
                <p className="post-date">{formatDate(post.created_at)}</p> {/* 날짜 렌더링 */}
                </div>
                
                <div className="blog-detail-separator" /> {/* 제목과 내용 사이의 선 */}
                
                <div className="content-container"> 
                   {/* 이미지가 있을 경우 렌더링 */}
                {post.image && (
                    <div className="image-gallery">
                        <img src={`http://localhost:3001${post.image}`} alt="게시물 이미지" className="blog-image" />
                    </div>
                )}
                
                {/* HTML 태그를 포함한 내용을 렌더링 */}
                <div 
                    className="blog-content" 
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
                </div>
                
                <button onClick={() => navigate('/bloglist')}>목록으로 돌아가기</button>
            </div>
        </div>
    );
};

export default BlogDetail;

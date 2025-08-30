import React, { useEffect, useState } from "react";
import './Main.css'; // 필요한 스타일 불러오기
import Header from './common/Header'; // Header 컴포넌트 가져오기
import Footer from './common/Footer'; // Footer 컴포넌트 가져오기

const Main = () => {
    const [posts, setPosts] = useState([]); // 포스트 상태 정의

    useEffect(() => {
        const fetchPosts = async () => {  
            try {
                const response = await fetch('http://localhost:3001/api/public-posts'); // 로그인 필요 없이 모든 게시물 가져오기
    
                if (response.ok) {
                    const data = await response.json();
                    const sortedPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setPosts(sortedPosts); // 정렬된 포스트 데이터 저장
                } else {
                    console.error('게시물 가져오기 실패:', response.statusText);
                }
            } catch (error) {
                console.error('게시물 가져오기 중 오류:', error);
            }
        };
    
        fetchPosts(); // 게시물 데이터 가져오기 실행
    }, []);

    const handlePostClick = (id) => {
        // 게시물 ID로 링크 이동
        window.location.href = `/blog/${id}`;
    };

    return (
        <div>
            <Header />  {/* 분리된 Header 사용 */}

            <section className="hero_main">
                <div className="container_main">
                    <h2>하루 한 컷에 오신 것을 환영합니다</h2>
                    <p>최신 포스트와 다양한 콘텐츠를 만나보세요.</p>
                </div>
            </section>

            <section className="main-content_main">
                <div className="container_main">
                    <h2>최근 게시물</h2>
                    <div className="post-grid_main">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <article className="post_main" key={post.id} onClick={() => handlePostClick(post.id)} style={{ cursor: 'pointer' }}>
                                    <div className="post-content_main">
                                        <div className="post-meta_main">
                                            <div className="meta-info_main">
                                                <span className="author_main">{post.username}</span>
                                                <span className="date_main">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="post-details_main">
                                            <h3>{post.title}</h3>
                                            <p>{post.summary}</p>
                                        </div>
                                    </div>
                                    {post.image && (
                                        <img className="post-image_main" src={`http://localhost:3001${post.image}`} alt={`포스트 이미지 ${post.title}`} />
                                    )}
                                </article>
                            ))
                        ) : (
                            <p>게시물이 없습니다.</p>
                        )}
                    </div>
                </div>
            </section>

            <Footer /> {/* 분리된 Footer 사용 */}
        </div>
    );
}

export default Main;

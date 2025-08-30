import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogList.css';
import Header from './common/Header';

const BlogList = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]); // 모든 게시물 상태

    // 로그인된 사용자 정보 가져오기
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (loggedUser && loggedUser.id) {
            setUser(loggedUser);
            console.log("로그인한 사용자 ID:", loggedUser.id);
        } else {
            console.error("로그인이 필요합니다. 사용자 정보가 없습니다.");
            navigate('/login');
        }
    }, [navigate]);

    // 서버에서 전체 게시물 가져오기
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/public-posts'); 
                if (response.ok) {
                    const data = await response.json();
                    const sortedPosts = data.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setPosts(sortedPosts);
                } else {
                    console.error('게시물 가져오기 실패:', response.statusText);
                }
            } catch (error) {
                console.error('게시물 가져오기 중 오류:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div>
            <Header />
            <div className="blog-list-container">
                <ul className="blog-list">
                    {posts.length === 0 ? (
                        <p>게시물이 없습니다.</p>
                    ) : (
                        posts.map((post) => (
                            <li
                                key={post.id}
                                className={`blog-list-item ${post.user_id === user?.id ? 'my-post' : ''}`} 
                                onClick={() => navigate(`/blog/${post.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="post-content">
                                    <div className="post-text">
                                        <h2>{new Date(post.created_at).toLocaleDateString()}</h2>
                                        <h3>
                                            {post.title}
                                            {post.user_id === user?.id && <span className="my-label"> (내 글)</span>} 
                                        </h3>
                                        <p>{post.summary}</p>
                                        <p className="author">작성자: {post.username}</p>
                                    </div>
                                    {post.image && (
                                        <img
                                            className="post-image"
                                            src={`http://localhost:3001${post.image}`}
                                            alt={`포스트 이미지 ${post.title}`}
                                        />
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <button
                className="write-button"
                onClick={() => navigate('/write')}
            >
                +
            </button>
        </div>
    );
};

export default BlogList;

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3001;

const JWT_SECRET = 'your_jwt_secret'; // JWT 토큰의 비밀 키

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'soobin',
    database: 'projectdb'
});

// MySQL 연결
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 에러:', err);
    } else {
        console.log('MySQL 연결 성공');
    }
});

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// body-parser 설정
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다.' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) {
            console.error('토큰 인증 오류:', err);
            return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
        }
        req.user = user;
        next();
    });
};

// 이미지 업로드 설정 (multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 이미지 저장 경로
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 고유 파일명
    }
});

const upload = multer({ storage: storage });

// ======================= API =======================

// 게시물 작성 API
app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
    const { title, summary, content } = req.body;
    const userId = req.user.id;
    let imagePath = null;

    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }

    if (!title || !summary || !content) {
        return res.status(400).json({ error: '제목, 요약, 내용을 모두 입력해야 합니다.' });
    }

    const query = 'INSERT INTO posts (user_id, title, summary, content, image) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, title, summary, content, imagePath], (err, result) => {
        if (err) {
            console.error('게시물 저장 중 오류 발생:', err);
            return res.status(500).json({ error: 'DB 오류, 나중에 다시 시도해주세요' });
        }
        console.log('게시물 저장 성공:', result.insertId);
        res.status(201).json({ message: '게시물이 성공적으로 저장되었습니다.', postId: result.insertId });
    });
});

// 업로드된 파일 제공 (정적 경로)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 회원가입 API
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('회원가입 중 오류 발생:', err);
            return res.status(500).json({ error: '서버 오류, 나중에 다시 시도해주세요' });
        }

        console.log('회원가입 성공:', result);
        return res.status(200).json({ message: '회원가입 성공' });
    });
});

// 로그인 API
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('로그인 중 오류 발생:', err);
            return res.status(500).json({ error: '서버 오류, 나중에 다시 시도해주세요' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const user = results[0];

        const passwordValid = bcrypt.compareSync(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        console.log('로그인 성공:', user);
        return res.status(200).json({ message: '로그인 성공', token, user: { id: user.id, username: user.username, email: user.email } });
    });
});

// 본인 게시물 목록 API
app.get('/api/my-posts', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT * FROM posts WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('게시물 가져오기 중 오류 발생:', err);
            return res.status(500).json({ error: 'DB 오류, 나중에 다시 시도해주세요' });
        }

        console.log('가져온 본인 게시물:', results);
        res.status(200).json({ posts: results });
    });
});

// 공개 게시물 목록 API
app.get('/api/public-posts', (req, res) => {
    const query = `
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.user_id = users.id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('게시물 가져오기 중 오류 발생:', err);
            return res.status(500).json({ error: 'DB 오류, 나중에 다시 시도해주세요' });
        }

        console.log('가져온 게시물:', results);
        res.status(200).json({ posts: results });
    });
});

// 게시물 상세 조회 API
app.get('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;

    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('게시물 가져오기 중 오류 발생:', err);
            return res.status(500).json({ error: 'DB 오류, 나중에 다시 시도해주세요' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

        res.status(200).json(results[0]);
    });
});


app.delete('/api/delete-account', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.beginTransaction((err) => {
        if (err) {
            console.error('트랜잭션 시작 오류:', err);
            return res.status(500).json({ error: 'DB 오류' });
        }

        // 1. 게시물 삭제
        db.query('DELETE FROM posts WHERE user_id = ?', [userId], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error('게시물 삭제 오류:', err);
                    res.status(500).json({ error: 'DB 오류 (게시물)' });
                });
            }

            // 2. 회원 삭제
            db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('회원 삭제 오류:', err);
                        res.status(500).json({ error: 'DB 오류 (회원)' });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('트랜잭션 커밋 오류:', err);
                            res.status(500).json({ error: 'DB 오류 (커밋)' });
                        });
                    }
                    console.log('회원 및 게시물 삭제 성공:', userId);
                    res.status(200).json({ message: '회원탈퇴가 완료되었습니다.' });
                });
            });
        });
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

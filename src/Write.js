import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Write.css';

const Write = () => {
  const editorRef = useRef(null); // contentEditable 영역을 참조
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 참조 상태
  const [imageWidth, setImageWidth] = useState(50); // 기본 이미지 너비
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const navigate = useNavigate();

  // 발행 처리 함수
  const handlePublish = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (title && content) {
      try {
        // 순수 텍스트만 가져오기 (HTML 제거)
        const plainTextContent = editorRef.current.textContent;

         // FormData 객체 생성
        const formData = new FormData();
        formData.append('title', title);
        formData.append('summary', plainTextContent.substring(0, 100));
        formData.append('content', plainTextContent);
      
      // 선택된 이미지가 있으면 FormData에 추가
        if (selectedImage) {
          formData.append('image', selectedImage);  // 이미지 파일 추가
         }

          // 서버로 POST 요청 보내기
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // JWT 토큰 추가
        },
        body: formData,  // FormData 사용
      });


      if (!response.ok) {
        const errorText = await response.text(); // HTML 오류 페이지 확인용
        console.error('서버 응답 오류:', errorText);
        alert('서버에서 오류가 발생했습니다.');
        return;
      }



        const data = await response.json();
        if (response.ok) {
          alert('게시물이 성공적으로 저장되었습니다.');
          navigate('/bloglist'); // 발행 후 블로그 리스트로 이동
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('게시물 저장 실패:', error);
        alert('게시물 저장에 실패했습니다.');
      }
    } else {
      alert('제목과 내용을 입력해주세요.');
    }
  };

// 사진 업로드 처리
const handlePhotoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          insertImage(e.target.result); // 이미지 삽입
          setSelectedImage(file); // 이미지 URL 상태에 저장
          console.log('선택된 이미지:', file);
        };
      reader.readAsDataURL(file);
  }
};

  // contentEditable 영역에 이미지 삽입
  const insertImage = (imageSrc) => {
    const editor = editorRef.current;
    if (editor) {
      const imgTag = `
        <div class="image-container">
          <img src="${imageSrc}" class="uploaded-image" style="width: 50%;" alt="Uploaded Image" />
        </div>`;
      editor.innerHTML += imgTag;
    }
  };

  // 이미지 선택 시 참조를 저장하고, 이미지 크기 변경 가능하게 설정
  const handleImageClick = (event) => {
    if (event.target.classList.contains('uploaded-image')) {
      setSelectedImage(event.target);
      setImageWidth(parseInt(event.target.style.width, 10) || 100); // 이미지 현재 너비 저장
    }
  };

  // 이미지 크기 조절
  const handleImageSizeChange = (event) => {
    const newWidth = event.target.value;
    setImageWidth(newWidth);
    if (selectedImage) {
      selectedImage.style.width = `${newWidth}%`; // 이미지의 너비를 변경
    }
  };

  // URL 정보를 삽입하기 위한 함수
  const handleInsertLink = async () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      if (isYouTubeUrl(url)) {
        insertYouTubeVideo(url);
      } else {
        insertLinkPreview(url);
      }
    }
  };

  // YouTube URL 감지 함수
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // YouTube 영상 삽입 함수
  const insertYouTubeVideo = (url) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      const iframeTag = `
        <div class="video-container">
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>`;
      insertAtCursor(iframeTag);
    } else {
      alert('유효한 YouTube URL이 아닙니다.');
    }
  };

  // YouTube 영상 ID 추출 함수
  const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:v\/|watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // 일반 링크 미리보기 삽입 함수 (OpenGraph API 사용)
  const insertLinkPreview = async (url) => {
    try {
      const response = await fetch(`/api/fetch-url-metadata?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.title && data.image) {
        const previewTag = `
          <div class="link-preview">
            <a href="${url}" target="_blank">
              <div class="link-preview-content">
                <img src="${data.image}" alt="${data.title}" class="link-preview-image" />
                <div class="link-preview-text">
                  <h3>${data.title}</h3>
                  <p>${data.description || ''}</p>
                </div>
              </div>
            </a>
          </div>`;
        insertAtCursor(previewTag);
      } else {
        alert('URL의 미리보기 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      alert('URL 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 커서 위치에 HTML 삽입
  const insertAtCursor = (html) => {
    const editor = editorRef.current;
    if (document.selection) {
      // IE 호환성
      editor.focus();
      const sel = document.selection.createRange();
      sel.pasteHTML(html);
    } else if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node, lastNode;
        while ((node = div.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          const newRange = document.createRange();
          newRange.setStartAfter(lastNode);
          newRange.setEndAfter(lastNode);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    }
  };

  // 이미지 업로드 버튼 클릭 시 숨겨진 파일 선택창 열기
  const handleButtonClick = () => {
    document.getElementById('photo-upload').click();
  };

  return (
    <div className="write-container">
      <div className="toolbar">
        <div className="toolbar-icons">
          <button onClick={handleButtonClick}>사진</button>
          <button onClick={handleInsertLink}>영상 링크</button>
          <button>장소</button>
        </div>
        <div className="toolbar-right">
          <button className="publish-btn" onClick={handlePublish}>등록</button>
        </div>
      </div>

      <div className="write-header"></div>
      
      <div className="write-body">
        {/* 제목 입력란 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 본문 내용 입력란 (textarea 대체 contentEditable div) */}
        <div
          ref={editorRef}
          contentEditable
          className="content-editor"
          onClick={handleImageClick} // 이미지 클릭 시 크기 조절 활성화
          onInput={() => setContent(editorRef.current.textContent)}  // HTML 대신 순수 텍스트로 설정
        ></div>

        {/* 숨겨진 파일 입력란 */}
        <input
          type="file"
          id="photo-upload"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handlePhotoUpload}
        />

        {/* 이미지 크기 조절 입력란 */}
        {selectedImage && (
          <div className="image-size-input">
            <label>이미지 너비 (%):</label>
            <input
              type="number"
              value={imageWidth}
              onChange={handleImageSizeChange}
              min="10"
              max="100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Write;

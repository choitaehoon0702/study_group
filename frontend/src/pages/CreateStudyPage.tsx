import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import type { Study } from '../types';

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function CreateStudyPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseName, setCourseName] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [navigate]);

  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join('\n');
    }

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    return '스터디 생성에 실패했습니다.';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await api.post<Study>('/studies', {
        title,
        description,
        courseName,
        maxMembers,
      });

      alert('스터디가 생성되었습니다.');
      navigate(`/studies/${response.data.id}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <h1>스터디 생성</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="title">스터디 제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="운영체제 스터디"
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginTop: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="courseName">과목명</label>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="운영체제"
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginTop: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="maxMembers">최대 인원</label>
          <input
            id="maxMembers"
            type="number"
            value={maxMembers}
            onChange={(event) => setMaxMembers(Number(event.target.value))}
            min={2}
            max={20}
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginTop: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="description">스터디 설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="스터디 목표, 진행 방식, 준비물 등을 적어주세요."
            required
            rows={6}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginTop: '4px',
            }}
          />
        </div>

        {errorMessage && (
          <p style={{ color: 'red', whiteSpace: 'pre-line' }}>
            {errorMessage}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : '스터디 생성'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/studies')}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
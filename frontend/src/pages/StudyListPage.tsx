import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import type { Study } from '../types';

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function StudyListPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join('\n');
    }

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    return '스터디 목록을 불러오지 못했습니다.';
  };

  const fetchStudies = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get<Study[]>('/studies');
      setStudies(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  if (isLoading) {
    return <p>스터디 목록을 불러오는 중...</p>;
  }

  if (errorMessage) {
    return (
      <div>
        <p style={{ color: 'red', whiteSpace: 'pre-line' }}>{errorMessage}</p>
        <button onClick={fetchStudies}>다시 시도</button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1>스터디 목록</h1>

        <Link to="/studies/new">
          <button>스터디 생성</button>
        </Link>
      </div>

      {studies.length === 0 ? (
        <p>아직 생성된 스터디가 없습니다.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '16px',
          }}
        >
          {studies.map((study) => (
            <article
              key={study.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>{study.title}</h2>

              <p>
                <strong>과목:</strong> {study.courseName}
              </p>

              <p>{study.description}</p>

              <p>
                <strong>인원:</strong>{' '}
                {study.currentMembers ?? study.members?.length ?? 0} /{' '}
                {study.maxMembers}
              </p>

              {study.leader && (
                <p>
                  <strong>스터디장:</strong> {study.leader.name} (
                  {study.leader.email})
                </p>
              )}

              <Link to={`/studies/${study.id}`}>
                <button>상세 보기</button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
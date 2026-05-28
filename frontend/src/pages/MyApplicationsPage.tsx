import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import type { StudyApplication } from '../types';

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function getStatusLabel(status: StudyApplication['status']) {
  switch (status) {
    case 'PENDING':
      return '승인 대기';
    case 'APPROVED':
      return '승인됨';
    case 'REJECTED':
      return '거절됨';
    default:
      return status;
  }
}

export function MyApplicationsPage() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<StudyApplication[]>([]);
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

    return '내 신청 목록을 불러오지 못했습니다.';
  };

  const fetchMyApplications = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get<StudyApplication[]>('/me/applications');
      setApplications(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  if (isLoading) {
    return <p>내 신청 목록을 불러오는 중...</p>;
  }

  if (errorMessage) {
    return (
      <div>
        <p style={{ color: 'red', whiteSpace: 'pre-line' }}>
          {errorMessage}
        </p>

        <button type="button" onClick={fetchMyApplications}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1>내 신청 목록</h1>

      {applications.length === 0 ? (
        <div>
          <p>아직 신청한 스터디가 없습니다.</p>

          <Link to="/studies">
            <button type="button">스터디 목록 보러가기</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {applications.map((application) => (
            <article
              key={application.id}
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {application.study?.title ?? `스터디 #${application.studyId}`}
              </h2>

              {application.study?.courseName && (
                <p>
                  <strong>과목:</strong> {application.study.courseName}
                </p>
              )}

              {application.study?.description && (
                <p>
                  <strong>설명:</strong> {application.study.description}
                </p>
              )}

              <p>
                <strong>신청 상태:</strong>{' '}
                {getStatusLabel(application.status)}
              </p>

              <p>
                <strong>신청일:</strong>{' '}
                {new Date(application.createdAt).toLocaleString('ko-KR')}
              </p>

              {application.study?.leader && (
                <p>
                  <strong>스터디장:</strong>{' '}
                  {application.study.leader.name} ({application.study.leader.email})
                </p>
              )}

              {application.study?._count && (
                <p>
                  <strong>현재 인원:</strong>{' '}
                  {application.study._count.members} /{' '}
                  {application.study.maxMembers}
                </p>
              )}

              <Link to={`/studies/${application.studyId}`}>
                <button type="button">스터디 상세 보기</button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
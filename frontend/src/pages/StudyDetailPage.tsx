import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import type { Study, StudyApplication, User } from '../types';

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function getStoredUser(): User | null {
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

function formatDateTime(dateTime: string) {
  return new Date(dateTime).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function StudyDetailPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState<Study | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const [applications, setApplications] = useState<StudyApplication[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [processingApplicationId, setProcessingApplicationId] = useState<number | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [votingOptionId, setVotingOptionId] = useState<number | null>(null);
  const [closingPollId, setClosingPollId] = useState<number | null>(null);
  
  const currentUser = getStoredUser();

  const numericStudyId = Number(studyId);

  const isLeader = useMemo(() => {
    if (!study || !currentUser) {
      return false;
    }

    return study.leader?.id === currentUser.id || study.leaderId === currentUser.id;
  }, [study, currentUser]);

  const isMember = useMemo(() => {
    if (!study || !currentUser) {
      return false;
    }

    return study.members?.some((member) => member.userId === currentUser.id) ?? false;
  }, [study, currentUser]);

  
  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join('\n');
    }

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    return '스터디 정보를 불러오지 못했습니다.';
  };

  const fetchStudy = async () => {
    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      setErrorMessage('잘못된 스터디 ID입니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get<Study>(`/studies/${numericStudyId}`);
      setStudy(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      return;
    }

    if (!isLeader) {
      return;
    }

    setIsLoadingApplications(true);
    setErrorMessage('');

    try {
      const response = await api.get<StudyApplication[]>(
        `/studies/${numericStudyId}/applications`,
      );

      setApplications(response.data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleToggleApplications = async () => {
    const nextShow = !showApplications;
    setShowApplications(nextShow);

    if (nextShow) {
      await fetchApplications();
    }
  };

  const handleApproveApplication = async (applicationId: number) => {
    const confirmed = window.confirm('이 신청을 승인하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setProcessingApplicationId(applicationId);
    setErrorMessage('');

    try {
      await api.patch(`/applications/${applicationId}/approve`);

      alert('신청을 승인했습니다.');

      await fetchApplications();
      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    const confirmed = window.confirm('이 신청을 거절하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setProcessingApplicationId(applicationId);
    setErrorMessage('');

    try {
      await api.patch(`/applications/${applicationId}/reject`);

      alert('신청을 거절했습니다.');

      await fetchApplications();
      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setProcessingApplicationId(null);
    }
  };  

  const fetchMyApplications = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token || !numericStudyId || Number.isNaN(numericStudyId)) {
      return;
    }

    try {
      const response = await api.get('/me/applications');

      const exists = response.data.some(
        (application: { studyId: number; status: string }) =>
          application.studyId === numericStudyId &&
          application.status === 'PENDING',
      );

      setHasApplied(exists);
    } catch {
      setHasApplied(false);
    }
  };

  const handleApply = async () => {
    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      alert('잘못된 스터디 ID입니다.');
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const confirmed = window.confirm('이 스터디에 참가 신청하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setIsApplying(true);
    setErrorMessage('');

    try {
      await api.post(`/studies/${numericStudyId}/applications`);

      alert('참가 신청이 완료되었습니다.');
      await fetchStudy();
      await fetchMyApplications();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsApplying(false);
    }
  };

  const handleLeaveStudy = async () => {
    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      alert('잘못된 스터디 ID입니다.');
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const confirmed = window.confirm(
      '정말 이 스터디에서 나가시겠습니까?',
    );

    if (!confirmed) {
      return;
    }

    setIsLeaving(true);
    setErrorMessage('');

    try {
      await api.post(`/studies/${numericStudyId}/leave`);

      alert('스터디에서 나갔습니다.');

      await fetchStudy();
      await fetchMyApplications();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRemoveMember = async (targetUserId: number) => {
    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      alert('잘못된 스터디 ID입니다.');
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!isLeader) {
      alert('스터디장만 멤버를 탈퇴시킬 수 있습니다.');
      return;
    }

    const targetMember = study?.members?.find(
      (member) => member.userId === targetUserId,
    );

    const targetName = targetMember?.user?.name ?? `User #${targetUserId}`;

    const confirmed = window.confirm(
      `${targetName} 님을 스터디에서 탈퇴시키겠습니까?`,
    );

    if (!confirmed) {
      return;
    }

    setRemovingUserId(targetUserId);
    setErrorMessage('');

    try {
      await api.delete(`/studies/${numericStudyId}/members/${targetUserId}`);

      alert('멤버를 탈퇴시켰습니다.');
      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleCreateMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      alert('잘못된 스터디 ID입니다.');
      return;
    }

    if (!isMember) {
      alert('스터디 멤버만 자료를 공유할 수 있습니다.');
      return;
    }

    if (!materialTitle.trim()) {
      alert('자료 제목을 입력해주세요.');
      return;
    }

    if (!materialUrl.trim()) {
      alert('자료 URL을 입력해주세요.');
      return;
    }

    setIsCreatingMaterial(true);
    setErrorMessage('');

    try {
      await api.post(`/studies/${numericStudyId}/materials`, {
        title: materialTitle,
        description: materialDescription,
        url: materialUrl,
      });

      alert('자료가 공유되었습니다.');

      setMaterialTitle('');
      setMaterialDescription('');
      setMaterialUrl('');
      setShowMaterialForm(false);

      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingMaterial(false);
    }
  };  

  const handleCreatePoll = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!numericStudyId || Number.isNaN(numericStudyId)) {
      alert('잘못된 스터디 ID입니다.');
      return;
    }

    if (!isLeader) {
      alert('스터디장만 투표를 생성할 수 있습니다.');
      return;
    }

    const filteredOptions = pollOptions
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    if (!pollTitle.trim()) {
      alert('투표 제목을 입력해주세요.');
      return;
    }

    if (filteredOptions.length < 2) {
      alert('날짜 후보는 2개 이상 입력해야 합니다.');
      return;
    }

    setIsCreatingPoll(true);
    setErrorMessage('');

    try {
      await api.post(`/studies/${numericStudyId}/polls`, {
        title: pollTitle,
        options: filteredOptions.map((option) => new Date(option).toISOString()),
      });

      alert('날짜 투표가 생성되었습니다.');

      setPollTitle('');
      setPollOptions(['', '']);
      setShowPollForm(false);

      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingPoll(false);
    }
  };

  const handleChangePollOption = (index: number, value: string) => {
    setPollOptions((prev) =>
      prev.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const handleAddPollOption = () => {
    setPollOptions((prev) => [...prev, '']);
  };

  const handleRemovePollOption = (index: number) => {
    setPollOptions((prev) => {
      if (prev.length <= 2) {
        alert('날짜 후보는 최소 2개 이상이어야 합니다.');
        return prev;
      }

      return prev.filter((_, optionIndex) => optionIndex !== index);
    });
  };

  const handleVote = async (optionId: number) => {
    if (!isMember) {
      alert('스터디 멤버만 투표할 수 있습니다.');
      return;
    }

    const confirmed = window.confirm('이 날짜에 투표하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setVotingOptionId(optionId);
    setErrorMessage('');

    try {
      await api.post(`/poll-options/${optionId}/vote`);

      alert('투표가 완료되었습니다.');
      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setVotingOptionId(null);
    }
  };

  const handleClosePoll = async (pollId: number) => {
    if (!isLeader) {
      alert('스터디장만 투표를 종료할 수 있습니다.');
      return;
    }

    const confirmed = window.confirm('이 투표를 종료하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setClosingPollId(pollId);
    setErrorMessage('');

    try {
      await api.patch(`/polls/${pollId}/close`);

      alert('투표가 종료되었습니다.');
      await fetchStudy();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setClosingPollId(null);
    }
  };

  useEffect(() => {
    fetchStudy();
    fetchMyApplications();
  }, [numericStudyId]);

  if (isLoading) {
    return <p>스터디 정보를 불러오는 중...</p>;
  }

  if (errorMessage) {
    return (
      <div>
        <p style={{ color: 'red', whiteSpace: 'pre-line' }}>{errorMessage}</p>
        <button onClick={fetchStudy}>다시 시도</button>
      </div>
    );
  }

  if (!study) {
    return <p>스터디 정보가 없습니다.</p>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button type="button" onClick={() => navigate('/studies')}>
        목록으로
      </button>

      <section
        style={{
          marginTop: '16px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h1>{study.title}</h1>

        <p>
          <strong>과목:</strong> {study.courseName}
        </p>

        <p>
          <strong>설명:</strong> {study.description}
        </p>

        <p>
          <strong>인원:</strong>{' '}
          {study.currentMembers ?? study.members?.length ?? 0} / {study.maxMembers}
        </p>

        {study.leader && (
          <p>
            <strong>스터디장:</strong> {study.leader.name} ({study.leader.email})
          </p>
        )}

        <p>
          <strong>내 권한:</strong>{' '}
          {!currentUser
            ? '비로그인'
            : isLeader
              ? '스터디장'
              : isMember
                ? '스터디 멤버'
                : '비멤버'}
        </p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {!currentUser && (
            <Link to="/login">
              <button>로그인 후 참가 신청</button>
            </Link>
          )}

          {currentUser && !isMember && !isLeader && hasApplied && (
            <button type="button" disabled>
              신청 대기 중
            </button>
          )}

          {currentUser && !isMember && !isLeader && !hasApplied && (
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? '신청 중...' : '참가 신청'}
            </button>
          )}

          {isMember && !isLeader && (
            <button
              type="button"
              onClick={handleLeaveStudy}
              disabled={isLeaving}
            >
              {isLeaving ? '나가는 중...' : '스터디 나가기'}
            </button>
          )}

          {isLeader && (
            <>
              <button type="button" onClick={handleToggleApplications}>
                {showApplications ? '신청 목록 닫기' : '신청 목록 보기'}
              </button>

              <button
                type="button"
                onClick={() => setShowPollForm((prev) => !prev)}
              >
                {showPollForm ? '투표 생성 취소' : '투표 생성'}
              </button>
            </>
          )}
        </div>
      </section>

      <section style={{ marginTop: '32px' }}>
        <h2>멤버 목록</h2>
          {isLeader && showApplications && (
            <section style={{ marginTop: '32px' }}>
              <h2>참가 신청 목록</h2>

              {isLoadingApplications ? (
                <p>신청 목록을 불러오는 중...</p>
              ) : applications.length === 0 ? (
                <p>참가 신청이 없습니다.</p>
              ) : (
                <ul>
                  {applications.map((application) => (
                    <li
                      key={application.id}
                      style={{
                        marginBottom: '16px',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <strong>
                          {application.user?.name ?? `User #${application.userId}`}
                        </strong>
                        {application.user?.email && <> ({application.user.email})</>}
                      </div>

                      {application.message && (
                        <p>
                          <strong>메시지:</strong> {application.message}
                        </p>
                      )}

                      <p>
                        <strong>상태:</strong> {application.status}
                      </p>

                      <p>
                        <strong>신청일:</strong>{' '}
                        {new Date(application.createdAt).toLocaleString('ko-KR')}
                      </p>

                      {application.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveApplication(application.id)}
                            disabled={processingApplicationId === application.id}
                          >
                            {processingApplicationId === application.id
                              ? '처리 중...'
                              : '승인'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectApplication(application.id)}
                            disabled={processingApplicationId === application.id}
                          >
                            {processingApplicationId === application.id
                              ? '처리 중...'
                              : '거절'}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

        {!study.members || study.members.length === 0 ? (
          <p>아직 멤버가 없습니다.</p>
        ) : (
          <ul>
            {study.members.map((member) => (
              <li key={member.id}>
                {member.user?.name ?? `User #${member.userId}`} - {member.role}
                {isLeader && member.role !== 'LEADER' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removingUserId === member.userId}
                    style={{ marginLeft: '8px' }}
                  >
                    {removingUserId === member.userId ? '탈퇴 처리 중...' : '탈퇴시키기'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    
    {isMember && (
      <section style={{ marginTop: '32px' }}>
        <h2>자료 목록</h2>

        <button
          type="button"
          onClick={() => setShowMaterialForm((prev) => !prev)}
          style={{ marginBottom: '12px' }}
        >
          {showMaterialForm ? '자료 공유 취소' : '자료 공유'}
        </button>

        {showMaterialForm && (
          <form
            onSubmit={handleCreateMaterial}
            style={{
              marginBottom: '20px',
              padding: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="materialTitle">자료 제목</label>
              <input
                id="materialTitle"
                type="text"
                value={materialTitle}
                onChange={(event) => setMaterialTitle(event.target.value)}
                placeholder="1주차 정리 자료"
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
              <label htmlFor="materialDescription">자료 설명</label>
              <textarea
                id="materialDescription"
                value={materialDescription}
                onChange={(event) => setMaterialDescription(event.target.value)}
                placeholder="자료에 대한 간단한 설명을 입력하세요."
                rows={3}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="materialUrl">자료 URL</label>
              <input
                id="materialUrl"
                type="url"
                value={materialUrl}
                onChange={(event) => setMaterialUrl(event.target.value)}
                placeholder="https://drive.google.com/..."
                required
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isCreatingMaterial}>
                {isCreatingMaterial ? '공유 중...' : '공유하기'}
              </button>

              <button
                type="button"
                onClick={() => setShowMaterialForm(false)}
                disabled={isCreatingMaterial}
              >
                취소
              </button>
            </div>
          </form>
        )}

        {!study.materials || study.materials.length === 0 ? (
          <p>공유된 자료가 없습니다.</p>
        ) : (
          <ul>
            {study.materials.map((material) => (
              <li key={material.id} style={{ marginBottom: '12px' }}>
                <div>
                  <strong>{material.title}</strong>
                </div>

                {material.description && <div>{material.description}</div>}

                <div>
                  <a href={material.url} target="_blank" rel="noreferrer">
                    자료 링크 열기
                  </a>
                </div>

                {material.uploader && (
                  <small>
                    업로더: {material.uploader.name} ({material.uploader.email})
                  </small>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    )}
  
    {isLeader && showPollForm && (
      <section
        style={{
          marginTop: '32px',
          padding: '16px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h2>날짜 투표 생성</h2>

        <form onSubmit={handleCreatePoll}>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="pollTitle">투표 제목</label>
            <input
              id="pollTitle"
              type="text"
              value={pollTitle}
              onChange={(event) => setPollTitle(event.target.value)}
              placeholder="이번 주 스터디 날짜 투표"
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
            <strong>날짜 후보</strong>

            {pollOptions.map((option, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="datetime-local"
                  value={option}
                  onChange={(event) =>
                    handleChangePollOption(index, event.target.value)
                  }
                  required
                  style={{
                    padding: '8px',
                    flex: 1,
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleRemovePollOption(index)}
                  disabled={pollOptions.length <= 2 || isCreatingPoll}
                >
                  삭제
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPollOption}
              disabled={isCreatingPoll}
              style={{ marginTop: '8px' }}
            >
              날짜 후보 추가
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={isCreatingPoll}>
              {isCreatingPoll ? '생성 중...' : '투표 생성'}
            </button>

            <button
              type="button"
              onClick={() => setShowPollForm(false)}
              disabled={isCreatingPoll}
            >
              취소
            </button>
          </div>
        </form>
      </section>
    )}

    {isMember && (
      <section style={{ marginTop: '32px' }}>
        <h2>날짜 투표</h2>

        {!study.polls || study.polls.length === 0 ? (
          <p>등록된 투표가 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {study.polls.map((poll) => (
              <article
                key={poll.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <h3>{poll.title}</h3>

                    {isLeader && !poll.closed && (
                      <button
                        type="button"
                        onClick={() => handleClosePoll(poll.id)}
                        disabled={closingPollId === poll.id}
                      >
                        {closingPollId === poll.id ? '종료 중...' : '투표 종료'}
                      </button>
                    )}
                  </div>

                  <p>{poll.closed ? '마감됨' : '진행 중'}</p>
                <ul>
                  {poll.options.map((option) => {
                    const hasVotedOption =
                      option.votes?.some((vote) => vote.userId === currentUser?.id) ?? false;

                    return (
                      <li key={option.id}>
                        {formatDateTime(option.dateTime)} - 투표 수:{' '}
                        {option._count?.votes ?? option.votes?.length ?? 0}

                        {isMember && !poll.closed && (
                          <>
                            {hasVotedOption ? (
                              <button type="button" disabled style={{ marginLeft: '8px' }}>
                                투표 완료
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleVote(option.id)}
                                disabled={votingOptionId === option.id}
                                style={{ marginLeft: '8px' }}
                              >
                                {votingOptionId === option.id ? '투표 중...' : '투표하기'}
                              </button>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    )}
    </div>
  );
}
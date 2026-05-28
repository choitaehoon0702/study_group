import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../api/client';

type LoginResponse = {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
};

type LoginErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<LoginErrorResponse>;
    const responseMessage = axiosError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join('\n');
    }

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }

    return '로그인에 실패했습니다.';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/studies');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h1>로그인</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="test@test.com"
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
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            required
            minLength={4}
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p style={{ marginTop: '16px' }}>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}
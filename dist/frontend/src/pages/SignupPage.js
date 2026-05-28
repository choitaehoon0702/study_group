import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
export function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const getErrorMessage = (error) => {
        const axiosError = error;
        const responseMessage = axiosError.response?.data?.message;
        if (Array.isArray(responseMessage)) {
            return responseMessage.join('\n');
        }
        if (typeof responseMessage === 'string') {
            return responseMessage;
        }
        return '회원가입에 실패했습니다.';
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        try {
            await api.post('/auth/signup', {
                email,
                password,
                name,
            });
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            navigate('/login');
        }
        catch (error) {
            setErrorMessage(getErrorMessage(error));
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h1>회원가입</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">이메일</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="test@test.com" required style={{
            display: 'block',
            width: '100%',
            padding: '8px',
            marginTop: '4px',
        }}/>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호" required minLength={4} style={{
            display: 'block',
            width: '100%',
            padding: '8px',
            marginTop: '4px',
        }}/>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name">이름</label>
          <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="홍길동" required style={{
            display: 'block',
            width: '100%',
            padding: '8px',
            marginTop: '4px',
        }}/>
        </div>

        {errorMessage && (<p style={{ color: 'red', whiteSpace: 'pre-line' }}>
            {errorMessage}
          </p>)}

        <button type="submit" disabled={isLoading}>
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>);
}
//# sourceMappingURL=SignupPage.js.map
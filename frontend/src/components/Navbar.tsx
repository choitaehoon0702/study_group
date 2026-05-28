import { Link, useNavigate } from 'react-router-dom';

type User = {
  id: number;
  email: string;
  name: string;
};

export function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  const userJson = localStorage.getItem('user');

  let user: User | null = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <Link to="/studies">스터디 목록</Link>
      <Link to="/studies/new">스터디 생성</Link>
      <Link to="/me/applications">내 신청 목록</Link>

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {token && user ? (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user.email}
              </div>
            </div>

            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}
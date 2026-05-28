import { Link, useNavigate } from 'react-router-dom';
export function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };
    return (<nav style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 24px',
            borderBottom: '1px solid #ddd',
        }}>
      <Link to="/studies">스터디 목록</Link>
      <Link to="/studies/new">스터디 생성</Link>
      <Link to="/me/applications">내 신청 목록</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
        {token ? (<button onClick={handleLogout}>로그아웃</button>) : (<>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>)}
      </div>
    </nav>);
}
//# sourceMappingURL=Navbar.js.map
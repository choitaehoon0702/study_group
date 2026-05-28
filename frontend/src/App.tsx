import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { StudyListPage } from './pages/StudyListPage';
import { CreateStudyPage } from './pages/CreateStudyPage';
import { StudyDetailPage } from './pages/StudyDetailPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';

function App() {
  return (
    <>
      <Navbar />

      <main style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<StudyListPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/studies" element={<StudyListPage />} />
          <Route path="/studies/new" element={<CreateStudyPage />} />
          <Route path="/studies/:studyId" element={<StudyDetailPage />} />
          <Route path="/me/applications" element={<MyApplicationsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
import React from 'react';
import store from './state';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 메인 화면
import Sidebar from './Main/Sidebar';
import SideScreen from './Main/side';
import Statistics from './Main/statistics';
import Planner from './Main/planner';
import Login from './Main/login';
import CreateId from './Main/createId';
import HomeScreen from './Main/HomeScreen';

// 게시판
import BoardScreen from './Board/BoardScreen';
import BoardScreenWeb from './Board/BoardScreenWeb';

// 기출 문제
import PracticeRoundSelect from './Practice/PracticeRoundSelect';
import ProblemDetail from './Practice/ProblemDetail';
import PracticeResult from './Practice/PracticeResult';
import ProblemCommentary from './Practice/ProblemCommentary';

// 퀴즈 게임
import QuizGame from './Game/QuizGame';
import UnsolvedScreen from './Game/UnsolvedScreen';

function AppWeb() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoardScreenWeb />} />
      </Routes>
    </Router>
  );
}
export default AppWeb;

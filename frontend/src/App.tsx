import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes to be added */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        <Route path="/" element={<div>App is running</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

const page = (title: string) => <main><h1>{title}</h1><p>Library Management System</p></main>;

export default function App() {
  return <BrowserRouter>
    <nav>
      <Link to="/dashboard">Dashboard</Link>{' | '}
      <Link to="/books">Books</Link>{' | '}
      <Link to="/users">Users</Link>{' | '}
      <Link to="/borrow-records">Borrow records</Link>
    </nav>
    <Routes>
      <Route path="/" element={page('Welcome to the Library')} />
      <Route path="/login" element={page('Login')} />
      <Route path="/dashboard" element={page('Dashboard')} />
      <Route path="/books" element={page('Books')} />
      <Route path="/users" element={page('Users')} />
      <Route path="/borrow-records" element={page('Borrow Records')} />
    </Routes>
  </BrowserRouter>;
}


import { useEffect, useState } from 'react';
import './App.css';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { User } from './types/User';

function load(key: string): User | null {
  const item = window.sessionStorage.getItem(key);
  return item != null ? JSON.parse(item) : null;
}

function App() {
  const [user, setUser] = useState<User | null>(() => load('blch-user'));

  useEffect(() => {
    window.sessionStorage.setItem('blch-user', JSON.stringify(user));
  }, [user]);

  let content;
  if (!user) {
    content = <Login onLogin={setUser} />;
  } else {
    content = <AdminPanel user={user} />;
  }

  return (
    <>
      <header>
        <span>Blockchain Voting App</span>
        {user && <button onClick={() => setUser(null)}>Logout</button>}
      </header>
      <main>
        {content}
      </main>
      <footer>
        <p>this is footer</p>
      </footer>
    </>
  );
}

export default App;

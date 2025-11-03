import { useState } from 'react';
import './App.css';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import VoterPanel from './components/VoterPanel';
import { User } from './types/User';

function App() {
  const [user, setUser] = useState<User | null>(null);

  let content;
  if (!user) {
    content = <Login onLogin={setUser} />;
  } else if (user.role === "admin") {
    content = <AdminPanel user={user} />;
  } else {
    content = <VoterPanel user={user} />;
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

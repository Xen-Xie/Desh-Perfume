import React from 'react'
import SignUp from '../components/SignUp'
import { useAuth } from '../auth/useAuth'
import Profile from '../components/Profile'


function Account() {
  const { user } = useAuth(); // ✅ call the hook

  return (
    <div className="">
      {!user ? <SignUp /> : <Profile />}
    </div>
  );
}

export default Account;

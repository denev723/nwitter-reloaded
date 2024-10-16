import { auth } from "../firebase";

export default function Home() {
  const logout = () => {
    auth.signOut();
  };
  return (
    <h1>
      <button onClick={logout}>Logout</button>
    </h1>
  );
}

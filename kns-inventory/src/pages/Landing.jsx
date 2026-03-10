import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function Landing() {
  return (
    <div className="auth-body">
      <div className="landing-page">
        <img src="/logo.png" alt="KNS Logo" className="logo-large" />
        <h1>WELCOME TO KNS INVENTORY</h1>
        <Link to="/signup" className="btn-danger">Get Started</Link>
      </div>
    </div>
  );
}

import { BrowserRouter as Router } from "react-router-dom";
import TopNav from "./pages/topnav";
import { AuthProvider } from "./components/authcontext";
import Main from "./pages/Main";

const App = () => {
  // Check if the user is logged in using localStorage
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  return (
    <AuthProvider>
      <Router>
        {/* Conditionally render TopNav based on loggedIn status */}
        {!loggedIn && (
          <header className="w-screen fixed top-0 z-10000">
            <TopNav />
          </header>
        )}

        <div>
          <Main />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;



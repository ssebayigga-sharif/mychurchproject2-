import { AppRouter } from "./app/routes";
import { AuthProvider } from "./context/AuthContext";
// Carbon theme setup - define CSS variables
import "./styles/carbon-theme.scss";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
export default App;

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

import MyTasks from "./pages/tasks/MyTasks";
import Inbox from "./pages/inbox/Inbox";
import { ThemeProvider } from "./components/theme-provider";
import TeamsPage from "./pages/teams/TeamsPage";
import { useSelector } from "react-redux";
import Auth from "./lib/Auth";
import ProjectBoard from "./components/projects/ProjectBoard";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { session, isLoading } = useSelector((state) => state.user);
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <BrowserRouter>
          <Auth />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes wrapper */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/projects/:projectId" element={<ProjectBoard />} />
              <Route path="/tasks" element={<MyTasks />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/teams/:teamId" element={<TeamsPage />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-gray-600 mt-2">Page not found</p>
                    <button
                      onClick={() => window.history.back()}
                      className="mt-4 text-blue-500 hover:underline"
                    >
                      Go back
                    </button>
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;

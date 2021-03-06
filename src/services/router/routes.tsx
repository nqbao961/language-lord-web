import { RouteObject, useRoutes } from 'react-router-dom';
import Admin from '../../pages/admin';
import Auth from '../../pages/auth';
import Dashboard from '../../pages/dashboard';
import LevelCreate from '../../pages/levelCreate';
import Levels from '../../pages/levels';
import Login from '../../pages/login';
import NotFound from '../../pages/notfound';
import Play from '../../pages/play';
import QuizCreate from '../../pages/quizCreate';
import Quizzes from '../../pages/quizzes';
import RequireAuth from '../../pages/requireAuth';
import Users from '../../pages/users';

interface RouteWithTitleObject extends RouteObject {
  title?: string;
  faIcon?: string;
  children?: RouteWithTitleObject[];
}
export const adminRoutes: RouteWithTitleObject[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
    title: 'Dashboard',
    faIcon: 'fa-chart-tree-map',
  },
  {
    path: 'quizzes',
    title: 'Quizzes',
    faIcon: 'fa-puzzle',
    children: [
      {
        index: true,
        element: <Quizzes />,
      },
      {
        path: 'create-quiz',
        element: <QuizCreate />,
      },
    ],
  },
  {
    path: 'levels',
    title: 'Levels',
    faIcon: 'fa-arrow-up-big-small',
    children: [
      {
        index: true,
        element: <Levels />,
      },
      {
        path: 'create-level',
        element: <LevelCreate />,
      },
    ],
  },
  {
    path: 'users',
    element: <Users />,
    title: 'Users',
    faIcon: 'fa-user-astronaut',
  },
];

export const routes: RouteWithTitleObject[] = [
  { path: 'login', element: <Login /> },
  { path: 'google/redirect', element: <Auth /> },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { path: 'play', element: <Play /> },
      {
        path: 'admin',
        element: <Admin />,
        title: 'Admin',
        children: adminRoutes,
      },
    ],
  },
  { path: '*', element: <NotFound /> },
];

export function Routes() {
  const routesElement = useRoutes(routes);

  return routesElement;
}

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppFab from '../components/layout/WhatsAppFab';
import PrivateRoute from './PrivateRoute';

// Lazy public pages
const Home = lazy(() => import('../pages/Home'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const Contact = lazy(() => import('../pages/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Lazy admin chunk (all admin pages in one chunk)
const AdminLogin = lazy(() => import('../pages/admin/Login'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProjectList = lazy(() => import('../pages/admin/ProjectList'));
const AdminProjectForm = lazy(() => import('../pages/admin/ProjectForm'));
const AdminCategoryManager = lazy(() => import('../pages/admin/CategoryManager'));
const AdminInquiryList = lazy(() => import('../pages/admin/InquiryList'));

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="page-loading" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}

function AdminLayout() {
  return (
    <Suspense fallback={<div className="page-loading" />}>
      <Outlet />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/portfolio/:slug', element: <ProjectDetail /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/login', element: <AdminLayout><AdminLogin /></AdminLayout> },
  {
    path: '/admin',
    element: <PrivateRoute><AdminLayout /></PrivateRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'projects', element: <AdminProjectList /> },
      { path: 'projects/new', element: <AdminProjectForm /> },
      { path: 'projects/:id', element: <AdminProjectForm /> },
      { path: 'categories', element: <AdminCategoryManager /> },
      { path: 'inquiries', element: <AdminInquiryList /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

// Router — React Router v6 RouterProvider with lazy-loaded route chunks.
//
// Routes:
//   /                     → lazy: Home
//   /portfolio            → lazy: Portfolio
//   /portfolio/:slug      → lazy: ProjectDetail
//   /contact              → lazy: Contact
//   /admin/login          → lazy: admin/Login
//   /admin/*              → PrivateRoute guard → lazy admin bundle:
//     /admin              → Dashboard
//     /admin/projects     → ProjectList
//     /admin/projects/new → ProjectForm (create mode)
//     /admin/projects/:id → ProjectForm (edit mode)
//     /admin/categories   → CategoryManager
//     /admin/inquiries    → InquiryList
//   *                     → NotFound
//
// Error boundary at router level with branded fallback component.
// All public routes wrapped in layout with Navbar + Footer + WhatsAppFab.
// Admin routes wrapped in admin layout (no public footer/fab).

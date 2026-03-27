// api.js — single Axios instance for all API communication.
//
// Config:
//   baseURL: import.meta.env.VITE_API_BASE_URL
//   withCredentials: true  (httpOnly JWT cookie sent automatically)
//
// Response interceptor:
//   On 401 → show Toast "Session expired — please log in again"
//             → redirect to /admin/login
//
// Exported functions (to be implemented by Frontend Engineers):
//   Projects:    getProjects(params), getProject(slug), createProject(data),
//                updateProject(id, data), deleteProject(id),
//                publishProject(id), unpublishProject(id)
//   Categories:  getCategories(), createCategory(data),
//                updateCategory(id, data), deleteCategory(id)
//   Contact:     submitContact(data)
//   Auth:        login(credentials), logout()
//   Upload:      getSignedUrl(contentType, fileSize)
//   Admin stats: getAdminStats()
//   Inquiries:   getInquiries(params), markInquiryRead(id), markInquiryUnread(id)

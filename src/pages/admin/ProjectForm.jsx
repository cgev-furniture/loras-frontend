// Admin ProjectForm — /admin/projects/new and /admin/projects/:id
// Fields: Title (required), Description (textarea, required),
//   Category tags (multi-select chips), Publish/Draft toggle.
// Image upload: drag-and-drop + file picker (multiple);
//   immediate upload via signed URL flow (POST /api/v1/upload/image/sign);
//   per-file progress bar; failed uploads show retry button;
//   submit disabled while any upload is in-flight;
//   uploaded images shown as previews with delete (×) button;
//   drag-to-reorder to set sort_order (image at sort_order=0 = thumbnail).
// Video upload: optional single file; same signed URL flow; preview player.
// All text via useTranslation('admin')
export default function ProjectForm() {
  return null;
}

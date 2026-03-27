import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useCategories } from '../../hooks/useCategories';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  description: z.string().min(1, 'Description is required'),
  published: z.boolean(),
  featured: z.boolean(),
  categoryIds: z.array(z.number()).min(0),
});

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-');
}

// Single image upload state shape:
// { id, file, preview, status: 'pending'|'uploading'|'done'|'error', progress, publicUrl, objectPath, signedUrl }

export default function ProjectForm() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { categories } = useCategories();

  const [images, setImages] = useState([]); // array of upload state objects
  const [video, setVideo] = useState(null); // single video upload state
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const dragOverIdx = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      published: false,
      featured: false,
      categoryIds: [],
    },
  });

  // Load existing project for edit mode
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/v1/admin/projects/${id}`)
      .then(res => {
        const p = res.data;
        reset({
          title: p.title || '',
          slug: p.slug || '',
          description: p.description || '',
          published: p.published || false,
          featured: p.featured || false,
          categoryIds: p.categories?.map(c => c.id) || [],
        });
        // Populate images
        if (p.images?.length) {
          setImages(p.images.map(img => ({
            id: img.id || Math.random().toString(36),
            file: null,
            preview: img.publicUrl,
            status: 'done',
            progress: 100,
            publicUrl: img.publicUrl,
            objectPath: img.objectPath,
          })));
        }
        if (p.videoUrl) {
          setVideo({
            id: 'existing',
            status: 'done',
            publicUrl: p.videoUrl,
            preview: p.videoUrl,
          });
        }
      })
      .catch(() => {});
  }, [id, isEdit, reset]);

  // Auto-generate slug from title on blur
  function handleTitleBlur() {
    const title = getValues('title');
    const slug = getValues('slug');
    if (title && !slug) {
      setValue('slug', slugify(title), { shouldValidate: true });
    }
  }

  // Upload a single image file through signed URL
  async function uploadImageFile(fileEntry) {
    const { file, id: entryId } = fileEntry;

    // Step 1: get signed URL
    let signData;
    try {
      const res = await api.post('/api/v1/upload/image/sign', {
        contentType: file.type,
        fileSize: file.size,
      });
      signData = res.data;
    } catch {
      setImages(prev =>
        prev.map(img => img.id === entryId ? { ...img, status: 'error' } : img)
      );
      return;
    }

    setImages(prev =>
      prev.map(img =>
        img.id === entryId
          ? { ...img, status: 'uploading', signedUrl: signData.signedUrl, publicUrl: signData.publicUrl, objectPath: signData.objectPath }
          : img
      )
    );

    // Step 2: PUT directly to GCS using XHR for progress tracking
    await new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signData.signedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setImages(prev =>
            prev.map(img => img.id === entryId ? { ...img, progress } : img)
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setImages(prev =>
            prev.map(img => img.id === entryId ? { ...img, status: 'done', progress: 100 } : img)
          );
        } else {
          setImages(prev =>
            prev.map(img => img.id === entryId ? { ...img, status: 'error' } : img)
          );
        }
        resolve();
      };

      xhr.onerror = () => {
        setImages(prev =>
          prev.map(img => img.id === entryId ? { ...img, status: 'error' } : img)
        );
        resolve();
      };

      xhr.send(file);
    });
  }

  function addImageFiles(files) {
    const MAX_SIZE = 10 * 1024 * 1024;
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

    const newEntries = Array.from(files)
      .filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE)
      .map(file => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
        publicUrl: null,
        objectPath: null,
      }));

    setImages(prev => [...prev, ...newEntries]);

    // Kick off uploads
    newEntries.forEach(entry => uploadImageFile(entry));
  }

  async function retryImageUpload(entryId) {
    const entry = images.find(img => img.id === entryId);
    if (!entry || !entry.file) return;
    setImages(prev =>
      prev.map(img => img.id === entryId ? { ...img, status: 'pending', progress: 0 } : img)
    );
    await uploadImageFile(entry);
  }

  function removeImage(entryId) {
    setImages(prev => prev.filter(img => img.id !== entryId));
  }

  // Drag-to-reorder
  function onDragStart(idx) {
    setDraggingIdx(idx);
  }

  function onDragOver(e, idx) {
    e.preventDefault();
    dragOverIdx.current = idx;
  }

  function onDrop(e) {
    e.preventDefault();
    const from = draggingIdx;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) {
      setDraggingIdx(null);
      return;
    }
    setImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingIdx(null);
    dragOverIdx.current = null;
  }

  // Video upload
  async function uploadVideoFile(file) {
    const MAX_VIDEO = 30 * 1024 * 1024;
    if (file.type !== 'video/mp4' || file.size > MAX_VIDEO) return;

    const entryId = Math.random().toString(36).slice(2);
    const vEntry = {
      id: entryId,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      publicUrl: null,
    };
    setVideo(vEntry);

    let signData;
    try {
      const res = await api.post('/api/v1/upload/image/sign', {
        contentType: file.type,
        fileSize: file.size,
      });
      signData = res.data;
    } catch {
      setVideo(v => v ? { ...v, status: 'error' } : v);
      return;
    }

    await new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signData.signedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setVideo(v => v ? { ...v, progress } : v);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setVideo(v => v ? { ...v, status: 'done', progress: 100, publicUrl: signData.publicUrl } : v);
        } else {
          setVideo(v => v ? { ...v, status: 'error' } : v);
        }
        resolve();
      };
      xhr.onerror = () => {
        setVideo(v => v ? { ...v, status: 'error' } : v);
        resolve();
      };
      xhr.send(file);
    });
  }

  // Check if any upload in-flight
  const uploadsInFlight = images.some(img => img.status === 'uploading' || img.status === 'pending')
    || (video && (video.status === 'uploading'));

  async function onSubmit(data) {
    if (uploadsInFlight) return;
    setSubmitError(null);

    const payload = {
      ...data,
      images: images
        .filter(img => img.status === 'done' && img.publicUrl)
        .map((img, idx) => ({ publicUrl: img.publicUrl, objectPath: img.objectPath, sortOrder: idx })),
      videoUrl: video?.status === 'done' ? video.publicUrl : null,
    };

    try {
      if (isEdit) {
        await api.patch(`/api/v1/admin/projects/${id}`, payload);
      } else {
        await api.post('/api/v1/admin/projects', payload);
      }
      navigate('/admin/projects');
    } catch (err) {
      setSubmitError(err.response?.data?.message || t('project_form.error', 'Failed to save project.'));
    }
  }

  // Drag-and-drop zone
  function onDropZone(e) {
    e.preventDefault();
    addImageFiles(e.dataTransfer.files);
  }
  function onDragOverZone(e) { e.preventDefault(); }

  const watchedCategoryIds = watch('categoryIds') || [];

  function toggleCategory(catId) {
    const current = getValues('categoryIds') || [];
    if (current.includes(catId)) {
      setValue('categoryIds', current.filter(id => id !== catId), { shouldValidate: true });
    } else {
      setValue('categoryIds', [...current, catId], { shouldValidate: true });
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
        {isEdit ? t('project_form.edit_heading', 'Edit Project') : t('project_form.new_heading', 'New Project')}
      </h1>

      {submitError && (
        <div role="alert" style={{ backgroundColor: '#fdecea', color: 'var(--color-error)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-small)' }}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Title */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="title" className="form-label">{t('project_form.title', 'Title')} *</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            onBlur={handleTitleBlur}
            className={`form-input${errors.title ? ' error' : ''}`}
          />
          {errors.title && <span className="form-error">{errors.title.message}</span>}
        </div>

        {/* Slug */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="slug" className="form-label">{t('project_form.slug', 'Slug')} *</label>
          <input
            id="slug"
            type="text"
            {...register('slug')}
            className={`form-input${errors.slug ? ' error' : ''}`}
          />
          {errors.slug && <span className="form-error">{errors.slug.message}</span>}
          <span className="form-hint">{t('project_form.slug_hint', 'Auto-generated from title. Only lowercase letters, numbers, hyphens.')}</span>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="description" className="form-label">{t('project_form.description', 'Description')} *</label>
          <textarea
            id="description"
            rows={5}
            {...register('description')}
            className={`form-textarea${errors.description ? ' error' : ''}`}
          />
          {errors.description && <span className="form-error">{errors.description.message}</span>}
        </div>

        {/* Categories */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="form-label">{t('project_form.categories', 'Categories')}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: '0.5rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className="chip"
                aria-pressed={watchedCategoryIds.includes(cat.id)}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', cursor: 'pointer', userSelect: 'none' }}>
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <input type="checkbox" {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)} />
              )}
            />
            <span className="form-label" style={{ margin: 0 }}>{t('project_form.published', 'Published')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', cursor: 'pointer', userSelect: 'none' }}>
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <input type="checkbox" {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)} />
              )}
            />
            <span className="form-label" style={{ margin: 0 }}>{t('project_form.featured', 'Featured')}</span>
          </label>
        </div>

        {/* Image upload */}
        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="form-label">{t('project_form.images', 'Images')}</span>
          <div
            onDrop={onDropZone}
            onDragOver={onDragOverZone}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label={t('project_form.drop_zone_label', 'Drop images here or click to select')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 'var(--space-3)',
              transition: 'border-color var(--transition-fast)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-white)',
            }}
          >
            <p style={{ marginBottom: '0.5rem', fontWeight: 'var(--font-weight-medium)' }}>
              {t('project_form.drop_zone_text', 'Drag & drop images here')}
            </p>
            <p style={{ fontSize: 'var(--text-small)' }}>
              {t('project_form.drop_zone_hint', 'JPEG, PNG, WebP — max 10 MB each')}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => addImageFiles(e.target.files)}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-2)' }}>
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={onDrop}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: draggingIdx === idx ? '2px solid var(--color-caramel)' : '2px solid var(--color-border)',
                    cursor: 'grab',
                    opacity: img.status === 'uploading' ? 0.8 : 1,
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <img
                    src={img.preview}
                    alt=""
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Thumbnail badge */}
                  {idx === 0 && img.status === 'done' && (
                    <span style={{
                      position: 'absolute', top: 4, left: 4,
                      backgroundColor: 'var(--color-caramel)', color: 'var(--color-cream)',
                      fontSize: '10px', fontWeight: 'var(--font-weight-semibold)',
                      padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                    }}>
                      {t('project_form.thumbnail_badge', 'Thumbnail')}
                    </span>
                  )}

                  {/* Progress bar */}
                  {img.status === 'uploading' && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ height: '100%', width: `${img.progress}%`, backgroundColor: 'var(--color-caramel)', transition: 'width 0.2s' }} />
                    </div>
                  )}

                  {/* Error + retry */}
                  {img.status === 'error' && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(211,47,47,0.7)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    }}>
                      <span style={{ color: '#fff', fontSize: 'var(--text-xs)' }}>{t('project_form.upload_failed', 'Failed')}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); retryImageUpload(img.id); }}
                        style={{ color: '#fff', fontSize: 'var(--text-xs)', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '2px 8px', cursor: 'pointer' }}
                      >
                        {t('project_form.retry', 'Retry')}
                      </button>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                    aria-label={t('project_form.remove_image', 'Remove image')}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 22, height: 22,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px',
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video upload */}
        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="form-label">{t('project_form.video', 'Video (optional)')}</span>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: '0.5rem', flexWrap: 'wrap' }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-small)' }}
              onClick={() => videoInputRef.current?.click()}
              disabled={!!video && video.status === 'uploading'}
            >
              {t('project_form.select_video', 'Select video (MP4)')}
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) uploadVideoFile(e.target.files[0]); }}
            />
            <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              {t('project_form.video_hint', 'MP4 only, max 30 MB')}
            </span>
          </div>

          {video && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              {video.status === 'uploading' && (
                <div>
                  <p style={{ fontSize: 'var(--text-small)', marginBottom: '0.5rem' }}>
                    {t('project_form.video_uploading', 'Uploading…')} {video.progress}%
                  </p>
                  <div style={{ height: 6, backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', maxWidth: '300px' }}>
                    <div style={{ height: '100%', width: `${video.progress}%`, backgroundColor: 'var(--color-caramel)' }} />
                  </div>
                </div>
              )}
              {video.status === 'done' && video.preview && (
                <video
                  src={video.preview}
                  controls
                  preload="none"
                  style={{ maxWidth: '400px', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                />
              )}
              {video.status === 'error' && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-small)' }}>
                  {t('project_form.video_error', 'Video upload failed.')}
                </p>
              )}
              <button
                type="button"
                onClick={() => setVideo(null)}
                style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {t('project_form.remove_video', 'Remove video')}
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || uploadsInFlight}
          >
            {isSubmitting
              ? t('project_form.saving', 'Saving…')
              : uploadsInFlight
              ? t('project_form.uploads_in_progress', 'Uploading…')
              : isEdit
              ? t('project_form.save', 'Save Changes')
              : t('project_form.create', 'Create Project')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="btn btn-secondary"
          >
            {t('project_form.cancel', 'Cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

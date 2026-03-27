import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function CategoryManager() {
  const { t } = useTranslation('admin');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteErrors, setDeleteErrors] = useState({}); // id -> error message
  const [deletingId, setDeletingId] = useState(null);
  const editInputRef = useRef(null);

  function fetchCategories() {
    setLoading(true);
    api.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddError(null);
    setAddingNew(true);
    try {
      await api.post('/api/v1/admin/categories', { name: newName.trim() });
      setNewName('');
      fetchCategories();
    } catch (err) {
      setAddError(err.response?.data?.message || t('categories.add_error', 'Failed to add category.'));
    } finally {
      setAddingNew(false);
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setEditValue(cat.name);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }

  async function saveEdit(catId) {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await api.patch(`/api/v1/admin/categories/${catId}`, { name: editValue.trim() });
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: editValue.trim() } : c));
      setEditingId(null);
    } catch {
      setEditingId(null);
    }
  }

  function handleEditKeyDown(e, catId) {
    if (e.key === 'Enter') saveEdit(catId);
    if (e.key === 'Escape') setEditingId(null);
  }

  async function handleDelete(cat) {
    setDeletingId(cat.id);
    setDeleteErrors(prev => { const n = { ...prev }; delete n[cat.id]; return n; });
    try {
      await api.delete(`/api/v1/admin/categories/${cat.id}`);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteErrors(prev => ({
          ...prev,
          [cat.id]: t('categories.delete_conflict', 'Cannot delete — category has projects assigned.'),
        }));
      } else {
        setDeleteErrors(prev => ({
          ...prev,
          [cat.id]: t('categories.delete_error', 'Failed to delete category.'),
        }));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '680px' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
        {t('categories.heading', 'Categories')}
      </h1>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={t('categories.add_placeholder', 'New category name…')}
          className="form-input"
          style={{ maxWidth: '320px' }}
          aria-label={t('categories.add_label', 'New category name')}
          maxLength={80}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={addingNew || !newName.trim()}
        >
          {addingNew ? t('categories.adding', 'Adding…') : t('categories.add_btn', 'Add')}
        </button>
        {addError && (
          <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-small)', alignSelf: 'center' }}>
            {addError}
          </span>
        )}
      </form>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-error)' }}>{t('categories.error', 'Failed to load categories.')}</p>
      ) : categories.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>{t('categories.empty', 'No categories yet.')}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {categories.map(cat => (
            <li
              key={cat.id}
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                padding: 'var(--space-2) var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {/* Name / inline edit */}
                {editingId === cat.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(cat.id)}
                    onKeyDown={e => handleEditKeyDown(e, cat.id)}
                    className="form-input"
                    style={{ maxWidth: '260px', padding: '0.35rem 0.6rem', minHeight: 36 }}
                    aria-label={t('categories.rename_label', 'Rename category')}
                    maxLength={80}
                  />
                ) : (
                  <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', flex: 1 }}>
                    {cat.name}
                  </span>
                )}

                {/* Project count */}
                <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {t('categories.project_count', '{{count}} project', { count: cat.projectCount ?? cat.count ?? 0 })}
                </span>

                {/* Edit button */}
                {editingId !== cat.id && (
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: 'var(--text-xs)', minHeight: 32 }}
                  >
                    {t('categories.edit', 'Rename')}
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  className="btn btn-danger"
                  style={{ padding: '0.3rem 0.75rem', fontSize: 'var(--text-xs)', minHeight: 32 }}
                  aria-label={t('categories.delete_aria', 'Delete {{name}}', { name: cat.name })}
                >
                  {deletingId === cat.id ? '…' : t('categories.delete', 'Delete')}
                </button>
              </div>

              {/* Inline error */}
              {deleteErrors[cat.id] && (
                <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-small)' }}>
                  {deleteErrors[cat.id]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

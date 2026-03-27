import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/v1/categories')
      .then(res => setCategories(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}

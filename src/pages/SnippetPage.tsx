import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SnippetEditor } from '../components/SnippetEditor';
import { useSnippets } from '../hooks/useSnippets';

export function SnippetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, getSnippet, updateSnippet, deleteSnippet } = useSnippets();

  const snippet = id ? getSnippet(id) : undefined;

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCopy = useCallback(() => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
    }
  }, [snippet]);

  const handleDelete = useCallback(() => {
    if (id) {
      deleteSnippet(id);
      navigate('/');
    }
  }, [id, deleteSnippet, navigate]);

  // Redirect to home if snippet not found (after loading completes)
  useEffect(() => {
    if (!loading && !snippet) {
      navigate('/', { replace: true });
    }
  }, [loading, snippet, navigate]);

  if (!snippet) {
    return null;
  }

  return (
    <SnippetEditor
      snippet={snippet}
      onBack={handleBack}
      onUpdate={(updates) => updateSnippet(snippet.id, updates)}
      onCopy={handleCopy}
      onDelete={handleDelete}
    />
  );
}

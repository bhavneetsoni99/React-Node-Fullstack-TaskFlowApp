import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../api/api';
import type { TaskComment } from '../../types/types';
import { selectUsers } from '../../selectors/userSelectors';
import { useAppSelector } from '../../hooks/hooks';
import styles from './TaskComments.module.scss';

interface TaskCommentsProps {
  taskId: string;
  currentUserId?: string;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function TaskComments({ taskId, currentUserId = '1' }: TaskCommentsProps) {
  const users = useAppSelector(selectUsers);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userMap = useMemo(() => {
    return new Map(users.map((user) => [user.id, user.name]));
  }, [users]);

  const isMountedRef = useRef(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.fetchComments(taskId);
      if (isMountedRef.current) {
        setComments(response.comments);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [taskId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchComments();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchComments]);

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await api.createComment(taskId, currentUserId, trimmedComment);
      if (isMountedRef.current) {
        setComments((prev) => [...prev, response.comment]);
        setNewComment('');
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to add comment');
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.commentsSection} data-testid="task-comments">
      <h4>Comments</h4>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {loading ? (
        <p role="status" aria-live="polite" className={styles.loadingText}>Loading comments...</p>
      ) : (
        <div className={styles.commentsList} aria-live="polite">
          {comments.length === 0 ? (
            <p className={styles.noComments}>No comments yet</p>
          ) : (
            comments.map((comment) => {
              const authorName = userMap.get(comment.userId) || 'Unknown User';
              return (
                <div key={comment.id} className={styles.comment}>
                  <strong>{authorName}</strong>
                  <p>{comment.content}</p>
                  <small>{formatTimestamp(comment.createdAt)}</small>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className={styles.addComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={submitting ? 'Posting comment...' : 'Add a comment...'}
          aria-label="Add a comment"
          data-testid="comment-input"
          disabled={submitting || loading}
        />
        <button
          onClick={handleAddComment}
          data-testid="add-comment-button"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </div>
  );
}

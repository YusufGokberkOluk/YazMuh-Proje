"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { apiClient } from '@/lib/api';
import { 
  MessageSquare, 
  Reply, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Check,
  X,
  User,
  Clock
} from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  mentions: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
  isResolved: boolean;
  resolvedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface CommentsPanelProps {
  pageId: string;
  blockId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  pageId,
  blockId,
  isOpen,
  onClose
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { 
    isConnected, 
    joinPage, 
    leavePage, 
    addComment, 
    updateComment, 
    deleteComment,
    on, 
    off 
  } = useSocket({ token });

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Join page for real-time comments
  useEffect(() => {
    if (isConnected && pageId) {
      joinPage(pageId);
      
      // Listen for real-time comment updates
      on('comment-added', handleRemoteCommentAdd);
      on('comment-updated', handleRemoteCommentUpdate);
      on('comment-deleted', handleRemoteCommentDelete);
      
      return () => {
        leavePage(pageId);
        off('comment-added', handleRemoteCommentAdd);
        off('comment-updated', handleRemoteCommentUpdate);
        off('comment-deleted', handleRemoteCommentDelete);
      };
    }
  }, [isConnected, pageId]);

  // Load comments
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, pageId, blockId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getComments(pageId, blockId);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time event handlers
  const handleRemoteCommentAdd = (data: any) => {
    setComments(prev => {
      // Avoid duplicates
      if (prev.some(c => c._id === data.commentData._id)) {
        return prev;
      }
      return [...prev, data.commentData];
    });
    scrollToBottom();
  };

  const handleRemoteCommentUpdate = (data: any) => {
    setComments(prev => prev.map(comment => 
      comment._id === data.commentId 
        ? { ...comment, content: data.content, updatedAt: new Date().toISOString() }
        : comment
    ));
  };

  const handleRemoteCommentDelete = (data: any) => {
    setComments(prev => prev.filter(comment => comment._id !== data.commentId));
  };

  // Mention handling
  const handleMentionSearch = async (query: string) => {
    if (query.length < 2) {
      setMentionUsers([]);
      setShowMentions(false);
      return;
    }

    try {
      const response = await apiClient.getSearchSuggestions(query, 'users');
      if (response.success) {
        setMentionUsers(response.data);
        setShowMentions(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const insertMention = (user: any) => {
    const mentionText = `@${user.username} `;
    setNewComment(prev => {
      const atIndex = prev.lastIndexOf('@');
      return prev.substring(0, atIndex) + mentionText + prev.substring(prev.indexOf(' ', atIndex) + 1);
    });
    setShowMentions(false);
    setMentionUsers([]);
  };

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    // Check for mentions
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1 && atIndex === value.length - 1) {
      setShowMentions(true);
    } else if (atIndex !== -1) {
      const searchQuery = value.substring(atIndex + 1);
      if (searchQuery.includes(' ')) {
        setShowMentions(false);
      } else {
        handleMentionSearch(searchQuery);
      }
    } else {
      setShowMentions(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtering and sorting
  const filteredComments = comments.filter(comment => {
    // Filter by resolved status
    if (!showResolved && comment.isResolved) return false;
    
    // Filter by search term
    if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by author
    if (filterAuthor && comment.author.username !== filterAuthor) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getUniqueAuthors = () => {
    const authors = comments.map(c => c.author);
    return authors.filter((author, index, self) => 
      self.findIndex(a => a._id === author._id) === index
    );
  };

  // Comment operations
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        blockId: blockId || undefined
      };

      const response = await apiClient.createComment(pageId, commentData);
      if (response.success) {
        setNewComment('');
        setReplyingTo(null);
        
        // Emit real-time event
        addComment(pageId, response.data);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const commentData = {
        content,
        blockId: blockId || undefined,
        parentId
      };

      const response = await apiClient.createComment(pageId, commentData);
      if (response.success) {
        setReplyingTo(null);
        
        // Emit real-time event
        addComment(pageId, response.data);
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await apiClient.updateComment(commentId, editContent);
      if (response.success) {
        setEditingComment(null);
        setEditContent('');
        
        // Emit real-time event
        updateComment(pageId, commentId, editContent);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await apiClient.deleteComment(commentId);
      if (response.success) {
        // Emit real-time event
        deleteComment(pageId, commentId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const response = await apiClient.resolveComment(commentId);
      if (response.success) {
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, isResolved: !comment.isResolved }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  // Filter comments
  const filteredComments = comments.filter(comment => 
    showResolved ? true : !comment.isResolved
  );

  // Render comment
  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingComment === comment._id;
    const isReplying = replyingTo === comment._id;

    return (
      <div key={comment._id} className={`${isReply ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className={`bg-white rounded-lg p-3 mb-3 ${comment.isResolved ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {comment.author.avatar ? (
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
              )}
              <span className="font-medium text-sm">{comment.author.username}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {comment.isResolved && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Resolved
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {!comment.isResolved && (
                <button
                  onClick={() => handleResolveComment(comment._id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Resolve comment"
                >
                  <Check className="h-3 w-3 text-green-600" />
                </button>
              )}
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment._id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  setEditingComment(isEditing ? null : comment._id);
                  setEditContent(isEditing ? '' : comment.content);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Edit"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded resize-none"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateComment(comment._id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {comment.mentions && comment.mentions.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Mentioned: {comment.mentions.map(m => `@${m.username}`).join(', ')}
            </div>
          )}

          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                placeholder={`Reply to ${comment.author.username}...`}
                className="w-full p-2 border border-gray-300 rounded resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const target = e.target as HTMLTextAreaElement;
                    handleReply(comment._id, target.value);
                  }
                }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    const target = e.target as HTMLButtonElement;
                    const textarea = target.parentElement?.previousElementSibling as HTMLTextAreaElement;
                    handleReply(comment._id, textarea.value);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Reply
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-medium">Comments</h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {filteredComments.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filters and search */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show resolved</span>
          </label>

          {/* Author filter */}
          <select
            value={filterAuthor || ''}
            onChange={(e) => setFilterAuthor(e.target.value || null)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All authors</option>
            {getUniqueAuthors().map(author => (
              <option key={author._id} value={author.username}>
                {author.username}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredComments.length} of {comments.length} comments</span>
          <span>{comments.filter(c => !c.isResolved).length} unresolved</span>
        </div>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Start a conversation!</p>
          </div>
        ) : (
          filteredComments.map(comment => renderComment(comment))
        )}
        <div ref={commentsEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2 relative">
          {/* Mention suggestions */}
          {showMentions && mentionUsers.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto z-10">
              {mentionUsers.map((user, index) => (
                <button
                  key={user.value}
                  onClick={() => insertMention({ username: user.value })}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center space-x-2 text-sm"
                >
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    {user.title[0].toUpperCase()}
                  </div>
                  <span>{user.title}</span>
                  <span className="text-gray-500">@{user.value}</span>
                </button>
              ))}
            </div>
          )}

          <textarea
            value={newComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Add a comment... (Type @ to mention someone)"
            className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSubmitComment();
              }
              if (e.key === 'Escape') {
                setShowMentions(false);
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Press Ctrl+Enter to submit
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel; 
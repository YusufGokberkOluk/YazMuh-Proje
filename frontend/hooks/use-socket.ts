import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  token?: string;
  autoConnect?: boolean;
}

interface SocketEvents {
  'block-updated': (data: any) => void;
  'block-created': (data: any) => void;
  'block-deleted': (data: any) => void;
  'blocks-reordered': (data: any) => void;
  'cursor-moved': (data: any) => void;
  'user-joined-page': (data: any) => void;
  'user-left-page': (data: any) => void;
  'user-typing': (data: any) => void;
  'comment-added': (data: any) => void;
  'comment-updated': (data: any) => void;
  'comment-deleted': (data: any) => void;
  'notification': (data: any) => void;
  'workspace-notification': (data: any) => void;
  'page-notification': (data: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', token, autoConnect = true } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    setIsConnecting(true);
    setError(null);

    socketRef.current = io(url, {
      auth: { token },
      autoConnect,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setIsConnecting(false);
      setError(err.message);
      console.error('Socket connection error:', err);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [url, token, autoConnect]);

  // Join workspace
  const joinWorkspace = (workspaceId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-workspace', workspaceId);
    }
  };

  // Leave workspace
  const leaveWorkspace = (workspaceId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-workspace', workspaceId);
    }
  };

  // Join page
  const joinPage = (pageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-page', pageId);
    }
  };

  // Leave page
  const leavePage = (pageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-page', pageId);
    }
  };

  // Block operations
  const updateBlock = (pageId: string, blockId: string, content: any, type: string, cursor?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('block-update', { pageId, blockId, content, type, cursor });
    }
  };

  const createBlock = (pageId: string, blockData: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('block-create', { pageId, blockData });
    }
  };

  const deleteBlock = (pageId: string, blockId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('block-delete', { pageId, blockId });
    }
  };

  const reorderBlocks = (pageId: string, blocks: any[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('block-reorder', { pageId, blocks });
    }
  };

  // Cursor operations
  const moveCursor = (pageId: string, cursor: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('cursor-move', { pageId, cursor });
    }
  };

  // Comment operations
  const addComment = (pageId: string, commentData: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('comment-add', { pageId, commentData });
    }
  };

  const updateComment = (pageId: string, commentId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('comment-update', { pageId, commentId, content });
    }
  };

  const deleteComment = (pageId: string, commentId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('comment-delete', { pageId, commentId });
    }
  };

  // Typing indicator
  const startTyping = (pageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-start', { pageId });
    }
  };

  const stopTyping = (pageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-stop', { pageId });
    }
  };

  // Event listeners
  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    joinWorkspace,
    leaveWorkspace,
    joinPage,
    leavePage,
    updateBlock,
    createBlock,
    deleteBlock,
    reorderBlocks,
    moveCursor,
    addComment,
    updateComment,
    deleteComment,
    startTyping,
    stopTyping,
    on,
    off
  };
} 
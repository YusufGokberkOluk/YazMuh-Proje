"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { apiClient } from '@/lib/api';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Image as ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  CheckSquare
} from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: any;
  order: number;
  parent?: string;
  children?: Block[];
}

interface BlockEditorProps {
  pageId: string;
  initialBlocks?: Block[];
  onSave?: (blocks: Block[]) => void;
  readOnly?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  pageId,
  initialBlocks = [],
  onSave,
  readOnly = false
}) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeUsers, setActiveUsers] = useState<{[key: string]: any}>({});
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [editingBlocks, setEditingBlocks] = useState<{[key: string]: string}>({});
  const [blockHistory, setBlockHistory] = useState<{[key: string]: string[]}>({});
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{blockId: string, position: 'above' | 'below'} | null>(null);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { 
    isConnected, 
    joinPage, 
    leavePage, 
    updateBlock, 
    createBlock, 
    deleteBlock, 
    reorderBlocks,
    startTyping, 
    stopTyping,
    on, 
    off 
  } = useSocket({ token });

  // Join page for real-time collaboration
  useEffect(() => {
    if (isConnected && pageId) {
      joinPage(pageId);
      
      // Listen for real-time updates
      on('block-updated', handleRemoteBlockUpdate);
      on('block-created', handleRemoteBlockCreate);
      on('block-deleted', handleRemoteBlockDelete);
      on('blocks-reordered', handleRemoteBlocksReorder);
      on('user-typing', handleUserTyping);
      
      return () => {
        leavePage(pageId);
        off('block-updated', handleRemoteBlockUpdate);
        off('block-created', handleRemoteBlockCreate);
        off('block-deleted', handleRemoteBlockDelete);
        off('blocks-reordered', handleRemoteBlocksReorder);
        off('user-typing', handleUserTyping);
      };
    }
  }, [isConnected, pageId]);

  // Load blocks from API
  useEffect(() => {
    loadBlocks();
  }, [pageId]);

  const loadBlocks = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getBlocks(pageId);
      if (response.success) {
        setBlocks(response.data || []);
      }
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time event handlers
  const handleRemoteBlockUpdate = useCallback((data: any) => {
    setBlocks(prev => prev.map(block => 
      block._id === data.blockId 
        ? { ...block, content: data.content, type: data.type }
        : block
    ));
    
    // Update editing indicators
    setEditingBlocks(prev => ({
      ...prev,
      [data.blockId]: data.user.username
    }));
    
    // Clear editing indicator after 2 seconds
    setTimeout(() => {
      setEditingBlocks(prev => {
        const updated = { ...prev };
        delete updated[data.blockId];
        return updated;
      });
    }, 2000);
  }, []);

  const handleRemoteBlockCreate = useCallback((data: any) => {
    setBlocks(prev => {
      const newBlocks = [...prev, data.blockData];
      return newBlocks.sort((a, b) => a.order - b.order);
    });
  }, []);

  const handleRemoteBlockDelete = useCallback((data: any) => {
    setBlocks(prev => prev.filter(block => block._id !== data.blockId));
  }, []);

  const handleRemoteBlocksReorder = useCallback((data: any) => {
    setBlocks(data.blocks);
  }, []);

  const handleUserTyping = useCallback((data: any) => {
    if (data.isTyping) {
      setTypingUsers(prev => new Set([...prev, data.user.username]));
    } else {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.user.username);
        return updated;
      });
    }
  }, []);

  // Block operations
  const createNewBlock = async (type: string, afterBlockId?: string) => {
    try {
      const order = afterBlockId 
        ? getInsertOrder(afterBlockId)
        : blocks.length;

      const newBlock = {
        type,
        content: getDefaultContent(type),
        order
      };

      const response = await apiClient.createBlock(pageId, newBlock);
      if (response.success) {
        const createdBlock = response.data;
        setBlocks(prev => {
          const updated = [...prev, createdBlock];
          return updated.sort((a, b) => a.order - b.order);
        });
        
        // Emit real-time event
        createBlock(pageId, createdBlock);
        setSelectedBlockId(createdBlock._id);
        
        return createdBlock;
      }
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const updateBlockContent = async (blockId: string, content: any, type?: string) => {
    try {
      // Start typing indicator
      startTyping(pageId);
      
      // Optimistic update
      setBlocks(prev => prev.map(block =>
        block._id === blockId 
          ? { ...block, content, type: type || block.type }
          : block
      ));

      // Debounced API call
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          const response = await apiClient.updateBlock(blockId, { content, type });
          
          if (response.success) {
            // Emit real-time event
            updateBlock(pageId, blockId, content, type || 'text');
          }
        } catch (error) {
          console.error('Error updating block:', error);
          // Revert optimistic update
          loadBlocks();
        } finally {
          stopTyping(pageId);
        }
      }, 1000);

      setTypingTimeout(timeout);
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const deleteBlockById = async (blockId: string) => {
    try {
      // Optimistic update
      setBlocks(prev => prev.filter(block => block._id !== blockId));

      const response = await apiClient.deleteBlock(blockId);
      
      if (response.success) {
        // Emit real-time event
        deleteBlock(pageId, blockId);
        
        // Clear selection if deleted block was selected
        if (selectedBlockId === blockId) {
          setSelectedBlockId(null);
        }
      } else {
        // Revert on failure
        loadBlocks();
      }
    } catch (error) {
      console.error('Error deleting block:', error);
      loadBlocks();
    }
  };

  const duplicateBlock = async (blockId: string) => {
    const originalBlock = blocks.find(b => b._id === blockId);
    if (originalBlock) {
      await createNewBlock(originalBlock.type);
    }
  };

  // Helper functions
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: '' };
      case 'heading1':
        return { text: '', level: 1 };
      case 'heading2':
        return { text: '', level: 2 };
      case 'heading3':
        return { text: '', level: 3 };
      case 'list':
        return { items: [''] };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'quote':
        return { text: '' };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'checklist':
        return { items: [{ text: '', checked: false }] };
      default:
        return { text: '' };
    }
  };

  const getInsertOrder = (afterBlockId: string): number => {
    const afterBlock = blocks.find(b => b._id === afterBlockId);
    const nextBlock = blocks.find(b => b.order > (afterBlock?.order || 0));
    
    if (afterBlock && nextBlock) {
      return (afterBlock.order + nextBlock.order) / 2;
    } else if (afterBlock) {
      return afterBlock.order + 1;
    }
    return 0;
  };

  const updateBlockContent = async (blockId: string, content: any) => {
    try {
      const response = await apiClient.updateBlock(blockId, { content });
      if (response.success) {
        setBlocks(prev => prev.map(block => 
          block._id === blockId 
            ? { ...block, content }
            : block
        ));
        
        // Emit real-time event
        updateBlock(pageId, blockId, content, blocks.find(b => b._id === blockId)?.type || 'text');
      }
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const deleteBlockById = async (blockId: string) => {
    try {
      const response = await apiClient.deleteBlock(blockId);
      if (response.success) {
        setBlocks(prev => prev.filter(block => block._id !== blockId));
        
        // Emit real-time event
        deleteBlock(pageId, blockId);
      }
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  // Typing indicator
  const handleBlockChange = (blockId: string, content: any) => {
    // Start typing indicator
    startTyping(pageId);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      stopTyping(pageId);
      updateBlockContent(blockId, content);
    }, 1000);
    
    setTypingTimeout(timeout);
    
    // Update local state immediately
    setBlocks(prev => prev.map(block => 
      block._id === blockId 
        ? { ...block, content }
        : block
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    const position = e.clientY < midPoint ? 'above' : 'below';
    
    setDropIndicator({ blockId, position });
  };

  const handleDrop = async (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    
    if (!draggedBlock || draggedBlock === targetBlockId) {
      setDraggedBlock(null);
      setDropIndicator(null);
      return;
    }

    const sourceBlock = blocks.find(b => b._id === draggedBlock);
    const targetBlock = blocks.find(b => b._id === targetBlockId);
    
    if (sourceBlock && targetBlock) {
      const newOrder = dropIndicator?.position === 'above' 
        ? targetBlock.order - 0.5
        : targetBlock.order + 0.5;
        
      await moveBlock(draggedBlock, newOrder);
    }
    
    setDraggedBlock(null);
    setDropIndicator(null);
  };

  const moveBlock = async (blockId: string, newOrder: number) => {
    try {
      const updatedBlocks = blocks.map(block => 
        block._id === blockId ? { ...block, order: newOrder } : block
      ).sort((a, b) => a.order - b.order);
      
      setBlocks(updatedBlocks);
      
      const response = await apiClient.reorderBlocks(pageId, updatedBlocks);
      if (response.success) {
        reorderBlocks(pageId, updatedBlocks);
      }
    } catch (error) {
      console.error('Error moving block:', error);
      loadBlocks();
    }
  };

  // Render block content based on type
  const renderBlockContent = (block: Block) => {
    const isSelected = selectedBlockId === block._id;
    const isBeingEdited = editingBlocks[block._id];
    const isDragging = draggedBlock === block._id;
    
    const blockClasses = `
      relative group mb-1 p-2 rounded-md transition-all duration-200
      ${isSelected ? 'bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}
      ${isDragging ? 'opacity-50 scale-95' : ''}
      ${isBeingEdited ? 'ring-2 ring-green-200 bg-green-50' : ''}
    `;
    
    switch (block.type) {
      case 'text':
        return (
          <div 
            className={blockClasses}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(e, block._id)}
            onDragOver={(e) => handleDragOver(e, block._id)}
            onDrop={(e) => handleDrop(e, block._id)}
          >
            {/* Drop indicator */}
            {dropIndicator?.blockId === block._id && (
              <div className={`absolute left-0 right-0 h-0.5 bg-blue-400 ${
                dropIndicator.position === 'above' ? '-top-1' : '-bottom-1'
              }`} />
            )}
            
            <textarea
              value={block.content.text || ''}
              onChange={(e) => updateBlockContent(block._id, { text: e.target.value })}
              className="w-full min-h-[1.5em] border-none outline-none resize-none bg-transparent"
              placeholder="Type '/' for commands..."
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            
            {/* Block controls */}
            {isSelected && !readOnly && (
              <div className="absolute -left-10 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, block._id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => deleteBlockById(block._id)}
                  className="p-1 rounded hover:bg-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => duplicateBlock(block._id)}
                  className="p-1 rounded hover:bg-blue-200 text-blue-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Editing indicator */}
            {isBeingEdited && (
              <div className="absolute -right-2 -top-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {isBeingEdited} is editing
              </div>
            )}
          </div>
        );
        
      case 'heading1':
        return (
          <div 
            className={blockClasses}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(e, block._id)}
            onDragOver={(e) => handleDragOver(e, block._id)}
            onDrop={(e) => handleDrop(e, block._id)}
          >
            {dropIndicator?.blockId === block._id && (
              <div className={`absolute left-0 right-0 h-0.5 bg-blue-400 ${
                dropIndicator.position === 'above' ? '-top-1' : '-bottom-1'
              }`} />
            )}
            
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => updateBlockContent(block._id, { text: e.target.value })}
              className="w-full text-3xl font-bold border-none outline-none bg-transparent"
              placeholder="Heading 1"
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            
            {isSelected && !readOnly && (
              <div className="absolute -left-10 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, block._id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => deleteBlockById(block._id)}
                  className="p-1 rounded hover:bg-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {isBeingEdited && (
              <div className="absolute -right-2 -top-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {isBeingEdited} is editing
              </div>
            )}
          </div>
        );
        
      case 'heading2':
        return (
          <div className="relative group">
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => handleBlockChange(block._id, { text: e.target.value })}
              className="w-full text-2xl font-semibold p-2 border-none outline-none bg-transparent"
              placeholder="Heading 2"
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            {isSelected && !readOnly && (
              <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        );
        
      case 'heading3':
        return (
          <div className="relative group">
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => handleBlockChange(block._id, { text: e.target.value })}
              className="w-full text-xl font-medium p-2 border-none outline-none bg-transparent"
              placeholder="Heading 3"
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            {isSelected && !readOnly && (
              <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        );
        
      case 'list':
        return (
          <div className="relative group flex items-start">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-2 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => handleBlockChange(block._id, { text: e.target.value })}
              className="flex-1 p-2 border-none outline-none bg-transparent"
              placeholder="List item"
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            {isSelected && !readOnly && (
              <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        );
        
      case 'code':
        return (
          <div className="relative group">
            <pre className="bg-gray-100 p-4 rounded-md font-mono text-sm">
              <textarea
                value={block.content.code || ''}
                onChange={(e) => handleBlockChange(block._id, { code: e.target.value })}
                className="w-full min-h-[100px] bg-transparent border-none outline-none resize-none font-mono"
                placeholder="Enter code..."
                readOnly={readOnly}
                onFocus={() => setSelectedBlockId(block._id)}
                onBlur={() => setSelectedBlockId(null)}
              />
            </pre>
            {isSelected && !readOnly && (
              <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        );
        
      case 'quote':
        return (
          <div className="relative group border-l-4 border-gray-300 pl-4 italic">
            <textarea
              value={block.content.text || ''}
              onChange={(e) => handleBlockChange(block._id, { text: e.target.value })}
              className="w-full min-h-[1.5em] p-2 border-none outline-none resize-none bg-transparent italic"
              placeholder="Quote"
              readOnly={readOnly}
              onFocus={() => setSelectedBlockId(block._id)}
              onBlur={() => setSelectedBlockId(null)}
            />
            {isSelected && !readOnly && (
              <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="p-2 text-gray-500">
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  // Block toolbar
  const BlockToolbar: React.FC<{ block: Block }> = ({ block }) => {
    if (readOnly) return null;
    
    return (
      <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button
          onClick={() => createNewBlock('text', block._id)}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add text block"
        >
          <Plus className="h-3 w-3" />
        </button>
        <button
          onClick={() => deleteBlockById(block._id)}
          className="p-1 hover:bg-gray-200 rounded text-red-500"
          title="Delete block"
        >
          <Trash2 className="h-3 w-3" />
        </button>
        <button
          onClick={() => {/* TODO: Add comment */}}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add comment"
        >
          <MessageSquare className="h-3 w-3" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No content yet. Start typing to create your first block.</p>
            {!readOnly && (
              <button
                onClick={() => createNewBlock('text')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add your first block
              </button>
            )}
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block._id} className="relative group">
              {renderBlockContent(block)}
              <BlockToolbar block={block} />
            </div>
          ))
        )}
      </div>
      
      {/* Collaboration indicators */}
      <div className="mt-8 space-y-4">
        {/* Active users */}
        {Object.keys(activeUsers).length > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {Object.keys(activeUsers).length} user{Object.keys(activeUsers).length > 1 ? 's' : ''} editing
            </span>
            <div className="flex space-x-1">
              {Object.values(activeUsers).map((user: any) => (
                <div
                  key={user.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ backgroundColor: `hsl(${user.id.slice(-6)}, 70%, 50%)` }}
                  title={user.username}
                >
                  {user.username[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Block type selector */}
      {selectedBlockId && !readOnly && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-2 flex gap-2 z-50">
          <button
            onClick={() => updateBlockContent(selectedBlockId, getDefaultContent('text'), 'text')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Text"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => updateBlockContent(selectedBlockId, getDefaultContent('heading1'), 'heading1')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => updateBlockContent(selectedBlockId, getDefaultContent('heading2'), 'heading2')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* TODO: Change block type */}}
            className="p-2 hover:bg-gray-100 rounded"
            title="List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* TODO: Change block type */}}
            className="p-2 hover:bg-gray-100 rounded"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* TODO: Change block type */}}
            className="p-2 hover:bg-gray-100 rounded"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockEditor; 
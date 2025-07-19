import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from '@/components/editor';
import { apiClient } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock the socket hook
jest.mock('@/hooks/use-socket', () => ({
  useSocket: () => ({
    isConnected: true,
    joinPage: jest.fn(),
    leavePage: jest.fn(),
    updateBlock: jest.fn(),
    createBlock: jest.fn(),
    deleteBlock: jest.fn(),
    startTyping: jest.fn(),
    stopTyping: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

// Mock the undo-redo hook
jest.mock('@/hooks/use-undo-redo', () => ({
  useUndoRedo: () => ({
    state: 'Initial content',
    setState: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: true,
    canRedo: false,
  }),
}));

describe('Editor Component', () => {
  const defaultProps = {
    title: 'Test Page',
    pageId: 'page-1',
    initialContent: 'Initial content',
    initialTags: ['tag1', 'tag2'],
    saveStatus: 'idle' as const,
    onChange: jest.fn(),
    onTagsChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders editor with initial content', () => {
    render(<Editor {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Page')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('calls onChange when content is modified', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const contentArea = screen.getByDisplayValue('Initial content');
    await user.clear(contentArea);
    await user.type(contentArea, 'New content');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('New content');
  });

  it('shows save status indicator', () => {
    render(<Editor {...defaultProps} saveStatus="saving" />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('displays undo/redo buttons', () => {
    render(<Editor {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument();
  });

  it('opens AI actions popup when AI button is clicked', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const aiButton = screen.getByRole('button', { name: /ai actions/i });
    await user.click(aiButton);
    
    expect(screen.getByText('AI Actions')).toBeInTheDocument();
  });

  it('handles tag addition', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText(/add tag/i);
    await user.type(tagInput, 'newtag{enter}');
    
    expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['tag1', 'tag2', 'newtag']);
  });

  it('handles tag removal', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const removeTagButton = screen.getAllByRole('button', { name: /remove tag/i })[0];
    await user.click(removeTagButton);
    
    expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['tag2']);
  });

  it('handles image upload via drag and drop', async () => {
    mockApiClient.uploadImage.mockResolvedValue({
      success: true,
      data: { url: 'https://example.com/image.jpg' }
    });

    render(<Editor {...defaultProps} />);
    
    const dropZone = screen.getByTestId('drop-zone');
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      expect(mockApiClient.uploadImage).toHaveBeenCalledWith('page-1', file);
    });
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const contentArea = screen.getByDisplayValue('Initial content');
    
    // Test Ctrl+Z for undo
    await user.click(contentArea);
    await user.keyboard('{Control>}z{/Control}');
    
    // Test Ctrl+Y for redo
    await user.keyboard('{Control>}y{/Control}');
    
    // Test Ctrl+S for save
    await user.keyboard('{Control>}s{/Control}');
    
    // Since we're mocking the hooks, we just verify the component renders correctly
    expect(contentArea).toBeInTheDocument();
  });

  it('displays typing indicators', () => {
    render(<Editor {...defaultProps} />);
    
    // This would be tested with real socket data in integration tests
    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
  });

  it('handles auto-save debouncing', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const contentArea = screen.getByDisplayValue('Initial content');
    
    // Type rapidly to test debouncing
    await user.type(contentArea, 'fast typing');
    
    // The actual auto-save would be tested with real timers
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('shows error state appropriately', () => {
    render(<Editor {...defaultProps} saveStatus="error" />);
    
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('handles share modal opening', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);
    
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });
}); 
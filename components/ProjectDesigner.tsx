
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, ArrowLeft, MoreHorizontal, Plus, 
  Layout, Server, Database, Globe, Settings, 
  FileText, FolderOpen, Search, ChevronRight, ChevronDown,
  Monitor,
  Loader2,
  Save,
  Play,
  Smartphone,
  Menu,
  AlignLeft,
  Box,
  Package,
  FolderInput,
  Folder as FolderIcon,
  ChevronLeft,
  GitGraph,
  PanelBottom,
  Bug,
  Eraser,
  Filter,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { Language, FileSystemItem, FileType } from '../types';
import { LOCALE } from '../constants';
import FrontendDesigner from './designer/FrontendDesigner';
import BackendDesigner from './designer/BackendDesigner';
import DatabaseDesigner from './designer/DatabaseDesigner';
import ExternalApiDesigner from './designer/ExternalApiDesigner';
import GitRepository from './designer/GitRepository';
import ProjectSettings from './designer/ProjectSettings';
import DebugConsole from './designer/DebugConsole';
import { ProjectExplorer } from './designer/ProjectExplorer';
import { ContextMenu, FileTree } from './designer/FileTree';
import { 
    fetchProjectFiles, 
    createNode, 
    updateNode, 
    deleteNode, 
    moveNode, 
    copyNode 
} from '../services/mockService';

interface ProjectDesignerProps {
  project: any;
  lang: Language;
  onBack: () => void;
}

interface Tab {
  id: string;
  fileId: string;
  title: string;
  type: FileType;
  rootType?: string; // Additional meta for specific tabs like git
}

// Dialog State Interface
interface FileDialogState {
  isOpen: boolean;
  type: 'create_file' | 'create_folder' | 'rename';
  targetId: string | null;
  value: string;
  parentType?: FileType; // To know if we are creating frontend/backend/db file
  rootType?: string; // If creating at root
}

const ProjectDesigner: React.FC<ProjectDesignerProps> = ({ project, lang, onBack }) => {
  const t = LOCALE[lang];
  
  // --- State ---
  const [pages, setPages] = useState<FileSystemItem[]>([]);
  const [apps, setApps] = useState<FileSystemItem[]>([]);
  const [apis, setApis] = useState<FileSystemItem[]>([]);
  const [models, setModels] = useState<FileSystemItem[]>([]);
  const [externalApis, setExternalApis] = useState<FileSystemItem[]>([]);
  
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const [activeTabId, setActiveTabId] = useState<string>('');
  const [tabs, setTabs] = useState<Tab[]>([]);
  
  // UI State
  const [showExplorer, setShowExplorer] = useState(true); // Default show
  const [clipboard, setClipboard] = useState<{ type: 'cut' | 'copy', item: FileSystemItem } | null>(null);
  const [isProjectDirOpen, setIsProjectDirOpen] = useState(false); // Project Directory Dialog State
  
  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  // Bottom Debug Panel State
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  // Context Menu State (Tree)
  const [contextMenu, setContextMenu] = useState<{
    x: number, 
    y: number, 
    item: FileSystemItem | null, 
    rootType?: string 
  }>({
    x: 0, y: 0, item: null
  });

  // Tab Context Menu State
  const [tabContextMenu, setTabContextMenu] = useState<{x: number, y: number, tabId: string | null}>({
    x: 0, y: 0, tabId: null
  });

  // Dialog State
  const [dialog, setDialog] = useState<FileDialogState>({
    isOpen: false, type: 'create_file', targetId: null, value: ''
  });

  // Mock local files for sync dialog
  const initialLocalFiles: FileSystemItem[] = useMemo(() => [
      { id: 'loc_1', name: 'src', type: 'folder', children: [
          { id: 'loc_1_1', name: 'App.tsx', type: 'file' },
          { id: 'loc_1_2', name: 'index.css', type: 'file' }
      ]},
      { id: 'loc_2', name: 'package.json', type: 'file' },
      { id: 'loc_3', name: 'README.md', type: 'file' },
  ], []);

  // --- Initialize Data ---
  useEffect(() => {
      loadProjectFiles();
  }, [project.id]);

  const loadProjectFiles = async () => {
      setIsLoadingFiles(true);
      try {
          const [p, a, api, m, ext] = await Promise.all([
              fetchProjectFiles(project.id, 'pages'),
              fetchProjectFiles(project.id, 'apps'),
              fetchProjectFiles(project.id, 'apis'),
              fetchProjectFiles(project.id, 'models'),
              fetchProjectFiles(project.id, 'external')
          ]);
          setPages(p);
          setApps(a);
          setApis(api);
          setModels(m);
          setExternalApis(ext);
          
          // Open first file if tabs empty
          if (p.length > 0 && !p[0].children && tabs.length === 0) {
              handleOpenFile(p[0]);
          }
      } catch (err) {
          console.error("Failed to load project files", err);
      } finally {
          setIsLoadingFiles(false);
      }
  };

  // --- Resizing Logic (Sidebar) ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      const newWidth = e.clientX;
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // --- Resizing Logic (Bottom Panel) ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingBottom) return;
      e.preventDefault();
      // Calculate height from bottom
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingBottom(false);
    };

    if (isResizingBottom) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    } else {
        document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingBottom]);

  // --- Helpers ---

  // Recursive search to find an item
  const findItem = (items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to update tree state immutably (local UI update)
  const updateTree = (
    items: FileSystemItem[], 
    targetId: string, 
    updater: (item: FileSystemItem) => FileSystemItem
  ): FileSystemItem[] => {
    return items.map(item => {
      if (item.id === targetId) {
        return updater(item);
      }
      if (item.children) {
        return { ...item, children: updateTree(item.children, targetId, updater) };
      }
      return item;
    });
  };

  // --- Handlers ---

  const handleOpenFile = (file: FileSystemItem) => {
    if (file.type === 'folder') return;
    
    const existingTab = tabs.find(t => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTabId = `t_${Date.now()}`;
      setTabs([...tabs, { id: newTabId, fileId: file.id, title: file.name, type: file.type }]);
      setActiveTabId(newTabId);
    }
  };

  const handleOpenSettings = () => {
    const settingsTabId = 'tab_settings';
    const existingTab = tabs.find(t => t.id === settingsTabId);
    
    if (existingTab) {
        setActiveTabId(settingsTabId);
    } else {
        const newTab: Tab = {
            id: settingsTabId,
            fileId: 'project_settings',
            title: 'Project Settings',
            type: 'settings'
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(settingsTabId);
    }
  };

  const handleToggleFolder = (itemId: string) => {
    if (findItem(pages, itemId)) {
      setPages(prev => updateTree(prev, itemId, item => ({ ...item, isOpen: !item.isOpen })));
    } else if (findItem(apps, itemId)) {
      setApps(prev => updateTree(prev, itemId, item => ({ ...item, isOpen: !item.isOpen })));
    } else if (findItem(apis, itemId)) {
      setApis(prev => updateTree(prev, itemId, item => ({ ...item, isOpen: !item.isOpen })));
    } else if (findItem(models, itemId)) {
      setModels(prev => updateTree(prev, itemId, item => ({ ...item, isOpen: !item.isOpen })));
    } else if (findItem(externalApis, itemId)) {
      setExternalApis(prev => updateTree(prev, itemId, item => ({ ...item, isOpen: !item.isOpen })));
    }
  };

  // Node Context Menu
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    setContextMenu({ x: e.clientX, y: e.clientY, item, rootType: undefined });
  };

  // Root Header Context Menu
  const handleRootContextMenu = (e: React.MouseEvent, rootType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item: null, rootType });
  };

  // Tab Context Menu Handlers
  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setTabContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleCloseOthers = () => {
    if (!tabContextMenu.tabId) return;
    const targetTab = tabs.find(t => t.id === tabContextMenu.tabId);
    if (targetTab) {
        setTabs([targetTab]);
        setActiveTabId(targetTab.id);
    }
    setTabContextMenu({ ...tabContextMenu, tabId: null });
  };

  const handleCloseAll = () => {
    setTabs([]);
    setActiveTabId('');
    setTabContextMenu({ ...tabContextMenu, tabId: null });
  };

  const handleCloseRight = () => {
    if (!tabContextMenu.tabId) return;
    const index = tabs.findIndex(t => t.id === tabContextMenu.tabId);
    if (index !== -1) {
        const newTabs = tabs.slice(0, index + 1);
        setTabs(newTabs);
        if (!newTabs.find(t => t.id === activeTabId)) {
            setActiveTabId(tabContextMenu.tabId);
        }
    }
    setTabContextMenu({ ...tabContextMenu, tabId: null });
  };

  const handleCloseLeft = () => {
    if (!tabContextMenu.tabId) return;
    const index = tabs.findIndex(t => t.id === tabContextMenu.tabId);
    if (index !== -1) {
        const newTabs = tabs.slice(index);
        setTabs(newTabs);
        if (!newTabs.find(t => t.id === activeTabId)) {
            setActiveTabId(tabContextMenu.tabId);
        }
    }
    setTabContextMenu({ ...tabContextMenu, tabId: null });
  };

  // Handle Drag and Drop Move
  const handleMoveNode = async (draggedId: string, targetId: string, rootType: string) => {
    // Optimistic UI Update not done here for move to keep tree consistent via reload or complex local logic
    // Just calling API and reloading for now for simplicity and correctness
    try {
        await moveNode(project.id, draggedId, targetId, rootType);
        // Refresh specific tree
        const newTree = await fetchProjectFiles(project.id, rootType);
        if (rootType === 'pages') setPages(newTree);
        else if (rootType === 'apps') setApps(newTree);
        else if (rootType === 'apis') setApis(newTree);
        else if (rootType === 'models') setModels(newTree);
        else if (rootType === 'external') setExternalApis(newTree);
    } catch (e) {
        console.error("Move failed", e);
    }
  };

  const handleContextMenuAction = async (action: string, item: FileSystemItem | null, rootType?: string) => {
    setContextMenu({ ...contextMenu, item: null }); // Close menu
    
    // Determine context (Item or Root)
    const targetId = item ? item.id : null;
    const currentRootType = rootType || (item && findItem(pages, item.id) ? 'pages' : 
                                         item && findItem(apps, item.id) ? 'apps' : 
                                         item && findItem(apis, item.id) ? 'apis' : 
                                         item && findItem(models, item.id) ? 'models' : 'external');

    if (!currentRootType) return;

    if (action === 'open_dir') {
        setIsProjectDirOpen(true);
        return;
    }

    if (action === 'open_git') {
        const existingTab = tabs.find(t => t.fileId === `git_${currentRootType}`);
        if (existingTab) {
            setActiveTabId(existingTab.id);
        } else {
            const newTab: Tab = {
                id: `tab_git_${Date.now()}`,
                fileId: `git_${currentRootType}`,
                title: `${t.codeRepository} (${currentRootType})`,
                type: 'git_repo',
                rootType: currentRootType
            };
            setTabs([...tabs, newTab]);
            setActiveTabId(newTab.id);
        }
        return;
    }

    if (action === 'new_file') {
      let type: FileType = 'frontend';
      if (currentRootType === 'apis') type = 'backend';
      if (currentRootType === 'models') type = 'database';
      if (currentRootType === 'external') type = 'external';
      
      setDialog({ isOpen: true, type: 'create_file', targetId: targetId, value: '', parentType: type, rootType: currentRootType });
    } else if (action === 'new_folder') {
      setDialog({ isOpen: true, type: 'create_folder', targetId: targetId, value: '', rootType: currentRootType });
    } else if (action === 'rename' && item) {
      setDialog({ isOpen: true, type: 'rename', targetId: item.id, value: item.name, rootType: currentRootType });
    } else if (action === 'duplicate' && item) {
        await copyNode(project.id, item.id);
        // Refresh tree
        const newTree = await fetchProjectFiles(project.id, currentRootType);
        updateStateForRoot(currentRootType, newTree);
    } else if (action === 'cut' && item) {
        setClipboard({ type: 'cut', item });
    } else if (action === 'copy' && item) {
        setClipboard({ type: 'copy', item });
    } else if (action === 'paste' && item) {
        if (!clipboard) return;
        const targetParentId = item.id; // Paste into this folder
        
        if (clipboard.type === 'cut') {
            await moveNode(project.id, clipboard.item.id, targetParentId, currentRootType);
            setClipboard(null);
        } else {
            // Backend copy with new parent logic would be needed, leveraging copyNode logic but with target parent
            // For now, simple duplicate in place then move simulation or assume copyNode supports target
            // We'll just call copyNode then moveNode for simplicity in this mock
            const newItem = await copyNode(project.id, clipboard.item.id);
            if (newItem) await moveNode(project.id, newItem.id, targetParentId, currentRootType);
        }
        // Refresh tree
        const newTree = await fetchProjectFiles(project.id, currentRootType);
        updateStateForRoot(currentRootType, newTree);

    } else if (action === 'delete' && item) {
      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        await deleteNode(project.id, item.id);
        // Refresh tree
        const newTree = await fetchProjectFiles(project.id, currentRootType);
        updateStateForRoot(currentRootType, newTree);
        
        const tab = tabs.find(t => t.fileId === item.id);
        if (tab) handleCloseTab(tab.id, null);
      }
    }
  };

  const updateStateForRoot = (rootType: string, data: FileSystemItem[]) => {
      if (rootType === 'pages') setPages(data);
      else if (rootType === 'apps') setApps(data);
      else if (rootType === 'apis') setApis(data);
      else if (rootType === 'models') setModels(data);
      else if (rootType === 'external') setExternalApis(data);
  };

  const handleDialogSubmit = async () => {
    const { type, targetId, value, parentType, rootType } = dialog;
    if (!value.trim() || !rootType) return;

    try {
        if (type === 'rename' && targetId) {
            await updateNode(project.id, targetId, { name: value });
            // Update Tab if open
            setTabs(prev => prev.map(t => t.fileId === targetId ? { ...t, title: value } : t));
        } else {
            // Create File or Folder
            const isFolder = type === 'create_folder';
            const fileType = isFolder ? 'folder' : (parentType || 'frontend');
            const newItem = await createNode(project.id, rootType, targetId, { name: value, type: fileType });
            if (type === 'create_file') {
                handleOpenFile(newItem);
            }
        }
        // Refresh tree
        const newTree = await fetchProjectFiles(project.id, rootType);
        updateStateForRoot(rootType, newTree);
    } catch (e) {
        console.error("Action failed", e);
    }
    
    setDialog({ ...dialog, isOpen: false });
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent | null) => {
    if (e) e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : '');
    }
  };

  const addRootItem = (root: 'pages' | 'apps' | 'apis' | 'models' | 'external', isFolder: boolean) => {
      let type: FileType = 'frontend';
      if (root === 'apis') type = 'backend';
      if (root === 'models') type = 'database';
      if (root === 'external') type = 'external';
      
      setDialog({ isOpen: true, type: isFolder ? 'create_folder' : 'create_file', targetId: null, value: '', parentType: type, rootType: root });
  };

  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeFileObject = activeTab ? { id: activeTab.fileId, title: activeTab.title, type: activeTab.type, rootType: activeTab.rootType } : null;

  return (
    <div 
      className="flex h-screen bg-gray-50 dark:bg-gray-900 text-sm overflow-hidden font-sans" 
      onClick={() => {
        setContextMenu({ ...contextMenu, item: null, rootType: undefined });
        setTabContextMenu({ ...tabContextMenu, tabId: null });
      }}
    >
      
      {/* 1. Project Explorer Sidebar (Full Height, Left Side) */}
      <ProjectExplorer 
        isVisible={showExplorer}
        width={sidebarWidth}
        onResizeStart={() => setIsResizing(true)}
        activeFileId={activeTab?.fileId || null}
        items={{
          pages,
          apps,
          apis,
          models,
          external: externalApis
        }}
        onOpenFile={handleOpenFile}
        onToggleFolder={handleToggleFolder}
        onContextMenu={handleContextMenu}
        onRootContextMenu={handleRootContextMenu}
        onMoveNode={handleMoveNode}
        onAddRootItem={addRootItem}
      />

      {/* 2. Main Right Column (Header + Content + Debug Panel) */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Header */}
          <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-20 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-4">
               {/* Back Button */}
               <button onClick={onBack} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded text-gray-500 transition-colors">
                 <ArrowLeft size={18} />
               </button>
               
               {/* Fixed Project Resource Icon (Toggle Explorer) */}
               <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${showExplorer ? 'bg-nebula-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-nebula-600 dark:hover:text-white'}`}
                       onClick={() => setShowExplorer(!showExplorer)}
                       title="Toggle Project Explorer"
                  >
                     {showExplorer ? <AlignLeft size={18} /> : <Package size={18} />}
                  </div>
               </div>
            </div>

            {/* Tab Bar - Fixed vertical scrolling issue & hidden scrollbar */}
            <div className="flex-1 mx-6 overflow-x-auto overflow-y-hidden flex items-end h-full pt-2 gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {tabs.map(tab => {
                 let Icon = Layout;
                 if (tab.type === 'backend') Icon = Server;
                 if (tab.type === 'database') Icon = Database;
                 if (tab.type === 'external') Icon = Globe;
                 if (tab.type === 'settings') Icon = Settings;
                 if (tab.type === 'git_repo') Icon = GitGraph;

                 const isActive = tab.id === activeTabId;

                 return (
                   <div 
                     key={tab.id}
                     onClick={() => setActiveTabId(tab.id)}
                     onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                     className={`
                       group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer border-t border-l border-r border-transparent transition-all
                       ${isActive 
                         ? 'bg-gray-100 dark:bg-gray-800 text-nebula-600 dark:text-white border-gray-200 dark:border-gray-700 font-medium relative top-[1px] shadow-sm z-10' 
                         : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700'}
                     `}
                     style={{ minWidth: '120px', maxWidth: '200px' }}
                   >
                     <Icon size={12} className={isActive ? 'text-nebula-500' : 'text-gray-400'} />
                     <span className="truncate flex-1">{tab.title}</span>
                     <button 
                       onClick={(e) => handleCloseTab(tab.id, e)}
                       className={`p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all ${isActive ? 'opacity-100' : ''}`}
                     >
                       <X size={10} />
                     </button>
                   </div>
                 );
               })}
            </div>

            <div className="flex items-center gap-2">
               {/* Run Button (Swapped) */}
               <button className="flex items-center gap-1 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-medium hover:opacity-80 transition-opacity">
                  <Play size={12} /> Run
               </button>
               {/* Debug Toggle (Swapped) */}
               <button 
                 onClick={() => setShowBottomPanel(!showBottomPanel)} 
                 className={`p-1.5 rounded transition-colors ${showBottomPanel ? 'bg-nebula-100 text-nebula-600 dark:bg-nebula-900/30 dark:text-nebula-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                 title="Toggle Debug Console"
               >
                  <Bug size={18} />
               </button>
               <button onClick={handleOpenSettings} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"><Settings size={18} /></button>
            </div>
          </header>

          {/* Editor Area */}
          <div 
              className="flex-1 bg-white dark:bg-gray-900 relative overflow-hidden"
              onClick={() => showExplorer && setShowExplorer(false)} 
          >
             {isLoadingFiles ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <Loader2 className="animate-spin mb-2" size={32} />
                     <p>Loading project resources...</p>
                 </div>
             ) : activeFileObject ? (
                <>
                  {activeFileObject.type === 'frontend' && <FrontendDesigner file={activeFileObject} lang={lang} />}
                  {activeFileObject.type === 'backend' && <BackendDesigner file={activeFileObject} />}
                  {activeFileObject.type === 'database' && <DatabaseDesigner file={activeFileObject} />}
                  {activeFileObject.type === 'external' && <ExternalApiDesigner file={activeFileObject} />}
                  {activeFileObject.type === 'settings' && <ProjectSettings />}
                  {activeFileObject.type === 'git_repo' && <GitRepository lang={lang} rootType={activeFileObject.rootType || ''} />}
                </>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
                   <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                      <FolderOpen size={40} className="opacity-30" />
                   </div>
                   <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No File Selected</p>
                   <p className="text-xs mt-2 opacity-60">
                      Click the <Package className="inline w-3 h-3 mx-1" /> icon to open Project Explorer.
                   </p>
                </div>
             )}
          </div>

          {/* Debug Console Bottom Panel */}
          {showBottomPanel && (
             <DebugConsole 
                lang={lang}
                height={bottomPanelHeight}
                onClose={() => setShowBottomPanel(false)}
                onResizeStart={() => setIsResizingBottom(true)}
             />
          )}
      </div>

      {/* Context Menu */}
      {(contextMenu.item || contextMenu.rootType) && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          targetItem={contextMenu.item} 
          rootType={contextMenu.rootType}
          onClose={() => setContextMenu({ ...contextMenu, item: null, rootType: undefined })}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Tab Context Menu */}
      {tabContextMenu.tabId && (
        <div 
          className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs text-gray-700 dark:text-gray-200"
          style={{ top: tabContextMenu.y, left: tabContextMenu.x }}
        >
           <button onClick={handleCloseOthers} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t.closeOthers}</button>
           <button onClick={handleCloseRight} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t.closeRight}</button>
           <button onClick={handleCloseLeft} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t.closeLeft}</button>
           <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
           <button onClick={handleCloseAll} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">{t.closeAll}</button>
        </div>
      )}

      {/* Input Dialog for Rename/Create */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">
                 {dialog.type === 'rename' ? 'Rename' : dialog.type === 'create_folder' ? 'New Folder' : 'New File'}
              </h3>
              <input 
                type="text" 
                value={dialog.value} 
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleDialogSubmit()}
              />
              <div className="flex justify-end gap-2">
                 <button onClick={() => setDialog({ ...dialog, isOpen: false })} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Cancel</button>
                 <button onClick={handleDialogSubmit} className="px-3 py-1.5 text-xs font-medium bg-nebula-600 text-white hover:bg-nebula-700 rounded-md">Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* Project Directory Dialog */}
      {isProjectDirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-6">
           <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                 <div className="flex items-center gap-2">
                    <FolderInput className="text-nebula-600" size={20} />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t.openProjectDir}</h2>
                 </div>
                 <button onClick={() => setIsProjectDirOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              {/* File Selector */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                 <label className="flex items-center gap-3 cursor-pointer w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-nebula-500 dark:hover:border-nebula-500 transition-colors">
                    <FolderIcon className="text-gray-400" size={24} />
                    <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">Select Local Project Directory</span>
                        <span className="text-xs text-gray-500 block">Click to browse folder...</span>
                    </div>
                    {/* Note: webkitdirectory is non-standard but widely supported for directory selection */}
                    <input type="file" className="hidden" multiple {...{webkitdirectory: "", directory: ""}} />
                 </label>
              </div>

              {/* Two Column Layout with Arrows */}
              <div className="flex-1 flex overflow-hidden">
                 {/* Online Tree */}
                 <div className="flex-1 border-r border-gray-200 dark:border-gray-700 flex flex-col min-w-0">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        Online Files (Remote)
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <FileTree 
                            items={pages} 
                            activeId={null}
                            onSelect={() => {}} 
                            onToggle={() => {}} 
                            onContextMenu={() => {}}
                            showDetails={true}
                        />
                    </div>
                 </div>

                 {/* Middle Action Bar */}
                 <div className="w-14 bg-gray-50 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 z-10 shadow-sm">
                    <button className="p-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-nebula-600 hover:border-nebula-500 transition-all shadow-sm" title="Sync to Local">
                        <ChevronRight size={16} />
                    </button>
                    <button className="p-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-nebula-600 hover:border-nebula-500 transition-all shadow-sm" title="Sync to Remote">
                        <ChevronLeft size={16} />
                    </button>
                 </div>

                 {/* Local Tree */}
                 <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        Local Files (Unseen)
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <FileTree 
                            items={initialLocalFiles} 
                            activeId={null}
                            onSelect={() => {}} 
                            onToggle={() => {}} 
                            onContextMenu={() => {}}
                            showDetails={true}
                        />
                    </div>
                 </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                 <button onClick={() => setIsProjectDirOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm">
                    Close
                 </button>
                 <button className="px-6 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium text-sm flex items-center gap-2">
                    Sync Changes
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDesigner;

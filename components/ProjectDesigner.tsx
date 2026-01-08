
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
  GitGraph
} from 'lucide-react';
import { Language } from '../types';
import { LOCALE } from '../constants';
import FrontendDesigner from './designer/FrontendDesigner';
import BackendDesigner from './designer/BackendDesigner';
import DatabaseDesigner from './designer/DatabaseDesigner';
import ExternalApiDesigner from './designer/ExternalApiDesigner';
import GitRepository from './designer/GitRepository';
import ProjectSettings from './designer/ProjectSettings';
import { FileTree, FileSystemItem, ContextMenu, FileType } from './designer/FileTree';

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
  
  // --- Initial Data ---
  const initialPages: FileSystemItem[] = [
    { id: 'p1', name: '登录页面', type: 'frontend', lastModified: '2023-10-25 10:00' },
    { id: 'p2', name: '工作台', type: 'frontend', lastModified: '2023-10-24 14:30' },
    { 
      id: 'f_auth', name: '认证模块', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
      children: [
        { id: 'p3', name: '注册页面', type: 'frontend', lastModified: '2023-10-21 11:20' },
        { id: 'p4', name: '忘记密码', type: 'frontend', lastModified: '2023-10-22 16:45' }
      ]
    }
  ];

  const initialApps: FileSystemItem[] = [
    { id: 'app1', name: '移动端首页', type: 'frontend', lastModified: '2023-10-25 10:00' },
    { id: 'app2', name: '个人中心', type: 'frontend', lastModified: '2023-10-24 14:30' }
  ];

  const initialApis: FileSystemItem[] = [
    { id: 'a1', name: 'auth_login', type: 'backend', lastModified: '2023-10-25 10:00' },
    { id: 'a2', name: 'get_user_info', type: 'backend', lastModified: '2023-10-24 14:30' },
    {
      id: 'f_users', name: '用户管理', type: 'folder', isOpen: false, lastModified: '2023-10-20 09:15',
      children: [
        { id: 'a3', name: 'create_user', type: 'backend', lastModified: '2023-10-21 11:20' },
        { id: 'a4', name: 'delete_user', type: 'backend', lastModified: '2023-10-22 16:45' }
      ]
    }
  ];

  const initialModels: FileSystemItem[] = [
    { 
        id: 'db_main', name: 'Main Database', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
        children: [
            { id: 'd1', name: 'sys_user', type: 'database', lastModified: '2023-10-21 11:20' },
            { id: 'd2', name: 'sys_role', type: 'database', lastModified: '2023-10-22 16:45' },
        ]
    },
    {
        id: 'db_logs', name: 'Log Database', type: 'folder', isOpen: false, lastModified: '2023-10-20 09:15',
        children: [
            { id: 'd3', name: 'sys_log', type: 'database', lastModified: '2023-10-21 11:20' }
        ]
    }
  ];

  const initialExternalApis: FileSystemItem[] = [
    {
        id: 'ext_erp', name: 'ERP System', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
        children: [
            { id: 'ext_1', name: 'Get Order', type: 'external', lastModified: '2023-10-21 11:20' },
            { id: 'ext_2', name: 'Sync Inventory', type: 'external', lastModified: '2023-10-22 16:45' }
        ]
    },
    {
        id: 'ext_pay', name: 'Payment Gateway', type: 'folder', isOpen: false, lastModified: '2023-10-20 09:15',
        children: [
            { id: 'ext_3', name: 'Create Charge', type: 'external', lastModified: '2023-10-21 11:20' }
        ]
    }
  ];

  // Mock Local Files for Directory Dialog
  const initialLocalFiles: FileSystemItem[] = [
      { id: 'loc_1', name: 'index.html', type: 'frontend', lastModified: '2023-10-26 09:00' },
      { id: 'loc_2', name: 'package.json', type: 'frontend', lastModified: '2023-10-26 09:00' },
      { 
          id: 'loc_f1', name: 'src', type: 'folder', isOpen: true, lastModified: '2023-10-26 09:00',
          children: [
              { id: 'loc_3', name: 'App.tsx', type: 'frontend', lastModified: '2023-10-26 09:05' },
              { id: 'loc_4', name: 'main.tsx', type: 'frontend', lastModified: '2023-10-26 09:05' }
          ]
      }
  ];

  // --- State ---
  const [pages, setPages] = useState<FileSystemItem[]>(initialPages);
  const [apps, setApps] = useState<FileSystemItem[]>(initialApps);
  const [apis, setApis] = useState<FileSystemItem[]>(initialApis);
  const [models, setModels] = useState<FileSystemItem[]>(initialModels);
  const [externalApis, setExternalApis] = useState<FileSystemItem[]>(initialExternalApis);

  const [activeTabId, setActiveTabId] = useState<string>('t1');
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 't1', fileId: 'p1', title: '登录页面', type: 'frontend' }
  ]);
  
  const [sidebarExpanded, setSidebarExpanded] = useState({
    pages: true,
    apps: true,
    apis: true,
    models: true,
    external: true
  });

  // UI State
  const [showExplorer, setShowExplorer] = useState(false);
  const [clipboard, setClipboard] = useState<{ type: 'cut' | 'copy', item: FileSystemItem } | null>(null);
  const [isProjectDirOpen, setIsProjectDirOpen] = useState(false); // Project Directory Dialog State
  
  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // --- Resizing Logic ---
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

  // --- Filtering Logic ---
  const filterTree = (items: FileSystemItem[], query: string): FileSystemItem[] => {
    if (!query) return items;
    
    return items.reduce<FileSystemItem[]>((acc, item) => {
      const matchesName = item.name.toLowerCase().includes(query.toLowerCase());
      
      if (item.children) {
        const filteredChildren = filterTree(item.children, query);
        if (matchesName || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren,
            isOpen: true // Automatically expand matched paths
          });
        }
      } else {
        if (matchesName) {
          acc.push(item);
        }
      }
      return acc;
    }, []);
  };

  const visiblePages = useMemo(() => filterTree(pages, searchQuery), [pages, searchQuery]);
  const visibleApps = useMemo(() => filterTree(apps, searchQuery), [apps, searchQuery]);
  const visibleApis = useMemo(() => filterTree(apis, searchQuery), [apis, searchQuery]);
  const visibleModels = useMemo(() => filterTree(models, searchQuery), [models, searchQuery]);
  const visibleExternal = useMemo(() => filterTree(externalApis, searchQuery), [externalApis, searchQuery]);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchActive]);

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

  // Helper to find parent of a specific item
  const findParent = (items: FileSystemItem[], childId: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.children) {
        if (item.children.some(c => c.id === childId)) return item;
        const found = findParent(item.children, childId);
        if (found) return found;
      }
    }
    return null;
  };

  const getFileById = (id: string): FileSystemItem | null => {
    return findItem(pages, id) || findItem(apps, id) || findItem(apis, id) || findItem(models, id) || findItem(externalApis, id);
  };

  // Helper to update tree state immutably
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

  // Helper to add item to tree
  const addToTree = (
    items: FileSystemItem[], 
    parentId: string | null, 
    newItem: FileSystemItem
  ): FileSystemItem[] => {
    if (!parentId) {
      // Add to root
      return [...items, newItem];
    }
    return items.map(item => {
      if (item.id === parentId && item.type === 'folder') {
        return { ...item, children: [...(item.children || []), newItem], isOpen: true };
      }
      if (item.children) {
        return { ...item, children: addToTree(item.children, parentId, newItem) };
      }
      return item;
    });
  };

  // Helper to delete from tree
  const deleteFromTree = (items: FileSystemItem[], targetId: string): FileSystemItem[] => {
    return items.filter(item => item.id !== targetId).map(item => {
      if (item.children) {
        return { ...item, children: deleteFromTree(item.children, targetId) };
      }
      return item;
    });
  };

  // Helper to duplicate item in tree
  const duplicateInTree = (items: FileSystemItem[], targetId: string): FileSystemItem[] => {
    // Deep copy helper with ID regeneration
    const cloneItem = (item: FileSystemItem, suffix: string = ''): FileSystemItem => {
        const newId = `${item.type}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        return {
            ...item,
            id: newId,
            name: suffix ? `${item.name}${suffix}` : item.name,
            children: item.children ? item.children.map(c => cloneItem(c)) : undefined
        };
    };

    let result: FileSystemItem[] = [];
    for (const item of items) {
        result.push(item);
        if (item.id === targetId) {
            result.push(cloneItem(item, ' 副本'));
        }
        if (item.children) {
            item.children = duplicateInTree(item.children, targetId);
        }
    }
    return result;
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
  const handleMoveNode = (draggedId: string, targetId: string, rootType: string) => {
    // 1. Determine which tree to update
    let setTree: React.Dispatch<React.SetStateAction<FileSystemItem[]>> | null = null;
    let items: FileSystemItem[] = [];

    if (rootType === 'pages') { setTree = setPages; items = pages; }
    else if (rootType === 'apps') { setTree = setApps; items = apps; }
    else if (rootType === 'apis') { setTree = setApis; items = apis; }
    else if (rootType === 'models') { setTree = setModels; items = models; }
    else if (rootType === 'external') { setTree = setExternalApis; items = externalApis; }

    if (!setTree) return;

    // 2. Find the dragged item and target item
    const draggedItem = findItem(items, draggedId);
    const targetItem = findItem(items, targetId);
    
    if (!draggedItem || !targetItem) return;

    // 3. Determine new parent
    let newParentId: string | null = null;
    if (targetItem.type === 'folder') {
       newParentId = targetItem.id;
    } else {
       // If dropping on a file, we move to the same folder (parent) as that file
       const parent = findParent(items, targetItem.id);
       newParentId = parent ? parent.id : null;
    }

    // Prevent dropping into itself or if parent is unchanged (optimization)
    // Note: To be fully correct we should check if newParentId is child of draggedId (if dragging folder)
    if (draggedId === newParentId) return;

    // Call Backend API Mock
    // In real app: await api.moveFile({ fileId: draggedId, newParentId: newParentId, oldParentId: ... })
    console.log(`[API CALL] Moving file ${draggedId} to ${newParentId || 'root'}`);

    // Update UI
    setTree(prevItems => {
        // Remove from old location
        const withoutItem = deleteFromTree(prevItems, draggedId);
        // Add to new location
        return addToTree(withoutItem, newParentId, draggedItem);
    });
  };

  const handleContextMenuAction = (action: string, item: FileSystemItem | null, rootType?: string) => {
    setContextMenu({ ...contextMenu, item: null }); // Close menu
    
    // Determine context (Item or Root)
    const targetId = item ? item.id : null;
    const currentRootType = rootType || (item && findItem(pages, item.id) ? 'pages' : 
                                         item && findItem(apps, item.id) ? 'apps' : 
                                         item && findItem(apis, item.id) ? 'apis' : 
                                         item && findItem(models, item.id) ? 'models' : 'external');

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
        const updateFn = (prev: FileSystemItem[]) => duplicateInTree(prev, item.id);
        if (findItem(pages, item.id)) setPages(updateFn);
        else if (findItem(apps, item.id)) setApps(updateFn);
        else if (findItem(apis, item.id)) setApis(updateFn);
        else if (findItem(models, item.id)) setModels(updateFn);
        else if (findItem(externalApis, item.id)) setExternalApis(updateFn);
    } else if (action === 'cut' && item) {
        setClipboard({ type: 'cut', item });
    } else if (action === 'copy' && item) {
        setClipboard({ type: 'copy', item });
    } else if (action === 'paste' && item) {
        if (!clipboard) return;
        const targetId = item.id; // Paste into this folder
        
        // Helper to clone item with new ID
        const cloneItem = (srcItem: FileSystemItem): FileSystemItem => {
             const newId = `${srcItem.type}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
             return {
                 ...srcItem,
                 id: newId,
                 children: srcItem.children ? srcItem.children.map(cloneItem) : undefined
             };
        };

        const itemToPaste = clipboard.type === 'copy' ? cloneItem(clipboard.item) : clipboard.item;
        
        // Add to new parent
        const addFn = (prev: FileSystemItem[]) => addToTree(prev, targetId, itemToPaste);
        
        if (findItem(pages, targetId)) setPages(addFn);
        else if (findItem(apps, targetId)) setApps(addFn);
        else if (findItem(apis, targetId)) setApis(addFn);
        else if (findItem(models, targetId)) setModels(addFn);
        else if (findItem(externalApis, targetId)) setExternalApis(addFn);

        // If cut, remove from old location
        if (clipboard.type === 'cut') {
             const removeFn = (prev: FileSystemItem[]) => deleteFromTree(prev, clipboard.item.id);
             setPages(removeFn);
             setApps(removeFn);
             setApis(removeFn);
             setModels(removeFn);
             setExternalApis(removeFn);
             setClipboard(null);
        }
    } else if (action === 'delete' && item) {
      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        const updateFn = (prev: FileSystemItem[]) => deleteFromTree(prev, item.id);
        if (findItem(pages, item.id)) setPages(updateFn);
        else if (findItem(apps, item.id)) setApps(updateFn);
        else if (findItem(apis, item.id)) setApis(updateFn);
        else if (findItem(models, item.id)) setModels(updateFn);
        else if (findItem(externalApis, item.id)) setExternalApis(updateFn);
        
        const tab = tabs.find(t => t.fileId === item.id);
        if (tab) handleCloseTab(tab.id, null);
      }
    }
  };

  const handleDialogSubmit = () => {
    const { type, targetId, value, parentType, rootType } = dialog;
    if (!value.trim()) return;

    if (type === 'rename' && targetId) {
      const updateFn = (prev: FileSystemItem[]) => updateTree(prev, targetId, i => ({ ...i, name: value }));
      if (findItem(pages, targetId)) setPages(updateFn);
      else if (findItem(apps, targetId)) setApps(updateFn);
      else if (findItem(apis, targetId)) setApis(updateFn);
      else if (findItem(models, targetId)) setModels(updateFn);
      else if (findItem(externalApis, targetId)) setExternalApis(updateFn);
      
      setTabs(prev => prev.map(t => t.fileId === targetId ? { ...t, title: value } : t));
    } else {
      const newItem: FileSystemItem = {
        id: `${type === 'create_folder' ? 'f' : 'file'}_${Date.now()}`,
        name: value,
        type: type === 'create_folder' ? 'folder' : (parentType || 'frontend'),
        children: type === 'create_folder' ? [] : undefined,
        isOpen: true,
        lastModified: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      const addFn = (prev: FileSystemItem[]) => addToTree(prev, targetId, newItem);
      
      // If targetId is null, we are adding to root, check rootType
      if (rootType === 'pages' || findItem(pages, targetId || '')) setPages(addFn);
      else if (rootType === 'apps' || findItem(apps, targetId || '')) setApps(addFn);
      else if (rootType === 'apis' || findItem(apis, targetId || '')) setApis(addFn);
      else if (rootType === 'models' || findItem(models, targetId || '')) setModels(addFn);
      else if (rootType === 'external' || findItem(externalApis, targetId || '')) setExternalApis(addFn);
      
      if (type === 'create_file') {
          handleOpenFile(newItem);
      }
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

  const toggleSidebarGroup = (group: keyof typeof sidebarExpanded) => {
    setSidebarExpanded(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const addRootItem = (root: 'pages' | 'apps' | 'apis' | 'models' | 'external', isFolder: boolean) => {
      let type: FileType = 'frontend';
      if (root === 'apis') type = 'backend';
      if (root === 'models') type = 'database';
      if (root === 'external') type = 'external';

      const newItem: FileSystemItem = {
          id: `root_${Date.now()}`,
          name: isFolder ? 'New Folder' : 'New File',
          type: isFolder ? 'folder' : type,
          children: isFolder ? [] : undefined,
          lastModified: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      if (root === 'pages') setPages(prev => [...prev, newItem]);
      if (root === 'apps') setApps(prev => [...prev, newItem]);
      if (root === 'apis') setApis(prev => [...prev, newItem]);
      if (root === 'models') setModels(prev => [...prev, newItem]);
      if (root === 'external') setExternalApis(prev => [...prev, newItem]);
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
      <div 
          className={`
              bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col relative
              transition-all duration-300 ease-in-out h-full
          `}
          style={{ width: showExplorer ? sidebarWidth : 0, opacity: showExplorer ? 1 : 0, overflow: showExplorer ? 'visible' : 'hidden', borderRightWidth: showExplorer ? 1 : 0 }}
      >
         {/* Resizer Handle */}
         {showExplorer && (
           <div 
             className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-50 transition-colors"
             onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
           />
         )}

         {/* Inner Container to hold content at fixed width during transition */}
         <div className="flex flex-col h-full overflow-hidden" style={{ width: '100%' }}>
             <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider h-12 flex-shrink-0">
                {isSearchActive ? (
                  <div className="flex items-center flex-1 gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-nebula-500">
                     <Search size={12} className="text-nebula-500" />
                     <input 
                       ref={searchInputRef}
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       onBlur={() => { if(!searchQuery) setIsSearchActive(false); }}
                       className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
                       placeholder="Search files..."
                     />
                     <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>
                  </div>
                ) : (
                  <>
                    <span>Project Explorer</span>
                    <button onClick={() => setIsSearchActive(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded" title="Search Files"><Search size={12} /></button>
                  </>
                )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                
                {/* Web Pages Group */}
                <div>
                   <div 
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => handleRootContextMenu(e, 'pages')}
                   >
                      <button 
                        onClick={() => toggleSidebarGroup('pages')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                      >
                          {sidebarExpanded.pages ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Monitor size={14} className="text-blue-500" />
                          Web端
                      </button>
                      <div className="hidden group-hover:flex">
                          <button onClick={(e) => { e.stopPropagation(); addRootItem('pages', false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><Plus size={10} /></button>
                      </div>
                   </div>
                   {sidebarExpanded.pages && (
                      <div className="mt-1">
                         <FileTree 
                            items={visiblePages} 
                            activeId={activeTab?.fileId || null}
                            onSelect={handleOpenFile}
                            onToggle={handleToggleFolder}
                            onContextMenu={handleContextMenu}
                            onMove={(draggedId, targetId) => handleMoveNode(draggedId, targetId, 'pages')}
                            rootType="pages"
                            showDetails={false}
                         />
                      </div>
                   )}
                </div>

                {/* App Group */}
                <div className="mt-2">
                   <div 
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => handleRootContextMenu(e, 'apps')}
                   >
                      <button 
                        onClick={() => toggleSidebarGroup('apps')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                      >
                          {sidebarExpanded.apps ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Smartphone size={14} className="text-purple-500" />
                          App端
                      </button>
                      <div className="hidden group-hover:flex">
                          <button onClick={(e) => { e.stopPropagation(); addRootItem('apps', false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><Plus size={10} /></button>
                      </div>
                   </div>
                   {sidebarExpanded.apps && (
                      <div className="mt-1">
                         <FileTree 
                            items={visibleApps} 
                            activeId={activeTab?.fileId || null}
                            onSelect={handleOpenFile}
                            onToggle={handleToggleFolder}
                            onContextMenu={handleContextMenu}
                            onMove={(draggedId, targetId) => handleMoveNode(draggedId, targetId, 'apps')}
                            rootType="apps"
                            showDetails={false}
                         />
                      </div>
                   )}
                </div>

                {/* Backend Group */}
                <div className="mt-2">
                   <div 
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => handleRootContextMenu(e, 'apis')}
                   >
                      <button 
                        onClick={() => toggleSidebarGroup('apis')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                      >
                          {sidebarExpanded.apis ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Server size={14} className="text-green-500" />
                          后端服务
                      </button>
                      <div className="hidden group-hover:flex">
                          <button onClick={(e) => { e.stopPropagation(); addRootItem('apis', false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><Plus size={10} /></button>
                      </div>
                   </div>
                   {sidebarExpanded.apis && (
                      <div className="mt-1">
                         <FileTree 
                            items={visibleApis} 
                            activeId={activeTab?.fileId || null}
                            onSelect={handleOpenFile}
                            onToggle={handleToggleFolder}
                            onContextMenu={handleContextMenu}
                            onMove={(draggedId, targetId) => handleMoveNode(draggedId, targetId, 'apis')}
                            rootType="apis"
                            showDetails={false}
                         />
                      </div>
                   )}
                </div>

                {/* Database Group */}
                <div className="mt-2">
                   <div className="flex items-center justify-between group">
                      <button 
                        onClick={() => toggleSidebarGroup('models')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                      >
                          {sidebarExpanded.models ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Database size={14} className="text-amber-500" />
                          数据库
                      </button>
                      <div className="hidden group-hover:flex">
                          <button onClick={(e) => { e.stopPropagation(); addRootItem('models', false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><Plus size={10} /></button>
                      </div>
                   </div>
                   {sidebarExpanded.models && (
                      <div className="mt-1">
                         <FileTree 
                            items={visibleModels} 
                            activeId={activeTab?.fileId || null}
                            onSelect={handleOpenFile}
                            onToggle={handleToggleFolder}
                            onContextMenu={handleContextMenu}
                            onMove={(draggedId, targetId) => handleMoveNode(draggedId, targetId, 'models')}
                            rootType="models"
                            showDetails={false}
                         />
                      </div>
                   )}
                </div>

                {/* External Interfaces Group */}
                <div className="mt-2">
                   <div className="flex items-center justify-between group">
                      <button 
                        onClick={() => toggleSidebarGroup('external')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                      >
                          {sidebarExpanded.external ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Globe size={14} className="text-purple-500" />
                          外部接口
                      </button>
                      <div className="hidden group-hover:flex">
                          <button onClick={(e) => { e.stopPropagation(); addRootItem('external', false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><Plus size={10} /></button>
                      </div>
                   </div>
                   {sidebarExpanded.external && (
                      <div className="mt-1">
                         <FileTree 
                            items={visibleExternal} 
                            activeId={activeTab?.fileId || null}
                            onSelect={handleOpenFile}
                            onToggle={handleToggleFolder}
                            onContextMenu={handleContextMenu}
                            onMove={(draggedId, targetId) => handleMoveNode(draggedId, targetId, 'external')}
                            rootType="external"
                            showDetails={false}
                         />
                      </div>
                   )}
                </div>

             </div>
         </div>
      </div>

      {/* 2. Main Right Column (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
          
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
               <button className="flex items-center gap-1 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-medium hover:opacity-80 transition-opacity">
                  <Play size={12} /> Run
               </button>
               <button onClick={handleOpenSettings} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"><Settings size={18} /></button>
            </div>
          </header>

          {/* Editor Area */}
          <div 
              className="flex-1 bg-white dark:bg-gray-900 relative overflow-hidden"
              onClick={() => showExplorer && setShowExplorer(false)} // Optional: click editor to close sidebar, now maybe not needed if sidebar is pinned
          >
             {activeFileObject ? (
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

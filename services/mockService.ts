
import { User, SystemInfo, GitCommit, GitFileStatus, GitDiffLine, FileSystemItem, FileType } from '../types';
import { MOCK_DEPARTMENTS, MOCK_DEVELOPERS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_TEMPLATE_LIST, MOCK_ORGANIZATIONS, MOCK_RESOURCES } from '../constants';

// ... (Keep existing User/Auth/System/Project services) ...
export const login = async (username: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'u1',
        name: username || 'Admin User',
        avatar: 'https://picsum.photos/100/100',
        role: 'admin'
      });
    }, 800);
  });
};

export const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
  console.log("Calling Backend API [POST /api/user/change-password]");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (oldPass === '123456') {
        resolve(true);
      } else {
        reject(new Error('INVALID_PASSWORD'));
      }
    }, 1200);
  });
};

export const getSystemInfo = async (): Promise<SystemInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        productName: '星云',
        version: '6.8.0.202406',
        edition: '标准版',
        serviceValidUntil: '2099-12-30',
        licenseValidUntil: '2099-12-30',
        copyright: '©2021-2024 上海云座信息科技有限公司版权所有'
      });
    }, 500);
  });
};

export const createProject = async (data: any): Promise<boolean> => {
  console.log("Calling Backend API [POST /api/projects] with data:", data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};

export const getProjectMembers = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, name: 'Alice Smith', role: 'Product Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        { id: 102, name: 'Bob Johnson', role: 'Senior Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { id: 103, name: 'Carol Williams', role: 'UI/UX Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
        { id: 104, name: 'David Brown', role: 'Frontend Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
        { id: 105, name: 'Eva Davis', role: 'Backend Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva' },
        { id: 106, name: 'Frank Miller', role: 'QA Engineer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
      ]);
    }, 600);
  });
};

export const updateProject = async (id: number, data: any): Promise<boolean> => {
  console.log(`Calling Backend API [PUT /api/projects/${id}] with data:`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

export const copyProject = async (id: number): Promise<boolean> => {
  console.log(`Calling Backend API [POST /api/projects/${id}/copy]`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

export const getProjectDeleteInfo = async (id: number): Promise<any> => {
  console.log(`Calling Backend API [GET /api/projects/${id}/delete-info]`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        size: '345.2 MB', 
        stats: {
            frontend: { pages: 28, components: 164 },
            backend: { apis: 45, services: 9 },
            database: { tables: 22, records: 15420 },
            config: { envs: 7, files: 48 }
        },
        backups: { count: 3, size: '512 MB' },
        logs: { count: 1250 }
      });
    }, 800);
  });
};

export const deleteProject = async (id: number, options: any): Promise<boolean> => {
  console.log(`Calling Backend API [DELETE /api/projects/${id}] with params:`, options);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};

// ... (Keep Organization, Dept, Developer, Role, Template, Resource services) ...
export const getOrganizations = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_ORGANIZATIONS]), 600));
};
export const createOrganization = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateOrganization = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteOrganization = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const getDepartments = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DEPARTMENTS]), 600));
};
export const createDepartment = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateDepartment = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteDepartment = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const getDevelopers = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DEVELOPERS]), 600));
};
export const createDeveloper = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateDeveloper = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteDeveloper = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const getRoles = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_ROLES]), 600));
};
export const getPermissions = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PERMISSIONS]), 400));
};
export const createRole = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateRole = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteRole = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const getTemplates = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_TEMPLATE_LIST]), 600));
};
export const createTemplate = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateTemplate = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteTemplate = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const getResources = async (): Promise<any[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_RESOURCES]), 600));
};
export const createResource = async (data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const updateResource = async (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
};
export const deleteResource = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

// --- File System Services (Project Explorer) ---

// In-memory mock database for file system
const MOCK_FILES: Record<string, FileSystemItem[]> = {
    pages: [
        { id: 'p1', name: '登录页面', type: 'frontend', lastModified: '2023-10-25 10:00' },
        { id: 'p2', name: '工作台', type: 'frontend', lastModified: '2023-10-24 14:30' },
        { 
          id: 'f_auth', name: '认证模块', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
          children: [
            { id: 'p3', name: '注册页面', type: 'frontend', lastModified: '2023-10-21 11:20' },
            { id: 'p4', name: '忘记密码', type: 'frontend', lastModified: '2023-10-22 16:45' }
          ]
        }
    ],
    apps: [
        { id: 'app1', name: '移动端首页', type: 'frontend', lastModified: '2023-10-25 10:00' },
        { id: 'app2', name: '个人中心', type: 'frontend', lastModified: '2023-10-24 14:30' }
    ],
    apis: [
        { id: 'a1', name: 'auth_login', type: 'backend', lastModified: '2023-10-25 10:00' },
        { id: 'a2', name: 'get_user_info', type: 'backend', lastModified: '2023-10-24 14:30' },
        {
          id: 'f_users', name: '用户管理', type: 'folder', isOpen: false, lastModified: '2023-10-20 09:15',
          children: [
            { id: 'a3', name: 'create_user', type: 'backend', lastModified: '2023-10-21 11:20' },
            { id: 'a4', name: 'delete_user', type: 'backend', lastModified: '2023-10-22 16:45' }
          ]
        }
    ],
    models: [
        { 
            id: 'db_main', name: 'Main Database', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
            children: [
                { id: 'd1', name: 'sys_user', type: 'database', lastModified: '2023-10-21 11:20' },
                { id: 'd2', name: 'sys_role', type: 'database', lastModified: '2023-10-22 16:45' },
            ]
        }
    ],
    external: [
        {
            id: 'ext_erp', name: 'ERP System', type: 'folder', isOpen: true, lastModified: '2023-10-20 09:15',
            children: [
                { id: 'ext_1', name: 'Get Order', type: 'external', lastModified: '2023-10-21 11:20' },
                { id: 'ext_2', name: 'Sync Inventory', type: 'external', lastModified: '2023-10-22 16:45' }
            ]
        }
    ]
};

// Helper to flatten recursive tree for ID searching
const findNodeInTree = (nodes: FileSystemItem[], id: string): { node: FileSystemItem, parent: FileSystemItem | null, list: FileSystemItem[] } | null => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return { node: nodes[i], parent: null, list: nodes };
        if (nodes[i].children) {
            const found = findNodeInTree(nodes[i].children!, id);
            if (found) {
                if (!found.parent) found.parent = nodes[i]; // Set parent if searching deep
                return found;
            }
        }
    }
    return null;
};

// Find node across all roots
const findNodeAnywhere = (id: string): { node: FileSystemItem, parent: FileSystemItem | null, list: FileSystemItem[], rootType: string } | null => {
    for (const key of Object.keys(MOCK_FILES)) {
        const found = findNodeInTree(MOCK_FILES[key], id);
        if (found) return { ...found, rootType: key };
    }
    return null;
};

export const fetchProjectFiles = async (projectId: string, rootType: string): Promise<FileSystemItem[]> => {
    console.log(`Calling Backend API [GET /api/project/${projectId}/files/${rootType}]`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(MOCK_FILES[rootType] || [])));
        }, 300);
    });
};

export const createNode = async (projectId: string, rootType: string, parentId: string | null, data: { name: string, type: FileType }): Promise<FileSystemItem> => {
    console.log(`Calling Backend API [POST /api/project/${projectId}/files]`, { rootType, parentId, data });
    return new Promise((resolve) => {
        setTimeout(() => {
            const newItem: FileSystemItem = {
                id: `${data.type === 'folder' ? 'f' : 'file'}_${Date.now()}`,
                name: data.name,
                type: data.type,
                children: data.type === 'folder' ? [] : undefined,
                isOpen: true,
                lastModified: new Date().toISOString().slice(0, 16).replace('T', ' ')
            };
            
            // In a real mock, we would update MOCK_FILES here to persist
            if (!parentId) {
                MOCK_FILES[rootType].push(newItem);
            } else {
                const parent = findNodeInTree(MOCK_FILES[rootType], parentId);
                if (parent && parent.node.children) {
                    parent.node.children.push(newItem);
                }
            }
            resolve(newItem);
        }, 400);
    });
};

export const updateNode = async (projectId: string, nodeId: string, updates: { name?: string }): Promise<boolean> => {
    console.log(`Calling Backend API [PUT /api/project/${projectId}/files/${nodeId}]`, updates);
    return new Promise((resolve) => {
        setTimeout(() => {
            const found = findNodeAnywhere(nodeId);
            if (found) {
                if (updates.name) found.node.name = updates.name;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 400);
    });
};

export const deleteNode = async (projectId: string, nodeId: string): Promise<boolean> => {
    console.log(`Calling Backend API [DELETE /api/project/${projectId}/files/${nodeId}]`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const found = findNodeAnywhere(nodeId);
            if (found) {
                if (found.parent) {
                    found.parent.children = found.parent.children?.filter(c => c.id !== nodeId);
                } else {
                    MOCK_FILES[found.rootType] = MOCK_FILES[found.rootType].filter(c => c.id !== nodeId);
                }
                resolve(true);
            } else {
                resolve(false);
            }
        }, 400);
    });
};

export const moveNode = async (projectId: string, nodeId: string, targetParentId: string | null, rootType: string): Promise<boolean> => {
    console.log(`Calling Backend API [POST /api/project/${projectId}/files/move]`, { nodeId, targetParentId });
    return new Promise((resolve) => {
        setTimeout(() => {
            const found = findNodeAnywhere(nodeId);
            if (!found) { resolve(false); return; }

            // Remove from old location
            if (found.parent) {
                found.parent.children = found.parent.children?.filter(c => c.id !== nodeId);
            } else {
                MOCK_FILES[found.rootType] = MOCK_FILES[found.rootType].filter(c => c.id !== nodeId);
            }

            // Add to new location
            if (targetParentId) {
                const newParent = findNodeInTree(MOCK_FILES[rootType], targetParentId);
                if (newParent && newParent.node.children) {
                    newParent.node.children.push(found.node);
                }
            } else {
                MOCK_FILES[rootType].push(found.node);
            }
            resolve(true);
        }, 500);
    });
};

export const copyNode = async (projectId: string, nodeId: string): Promise<FileSystemItem | null> => {
    console.log(`Calling Backend API [POST /api/project/${projectId}/files/${nodeId}/copy]`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const found = findNodeAnywhere(nodeId);
            if (found) {
                // Deep clone logic would go here
                const copy: FileSystemItem = JSON.parse(JSON.stringify(found.node));
                copy.id = `${copy.id}_copy_${Date.now()}`;
                copy.name = `${copy.name} (Copy)`;
                
                // Add to same parent
                if (found.parent && found.parent.children) {
                    found.parent.children.push(copy);
                } else {
                    MOCK_FILES[found.rootType].push(copy);
                }
                resolve(copy);
            } else {
                resolve(null);
            }
        }, 500);
    });
};

// ... (Keep existing Git services) ...
// Helper to generate diff lines
const generateDiff = (baseLines: number, seed: number = 1): { left: GitDiffLine[], right: GitDiffLine[] } => {
    const left: GitDiffLine[] = [];
    const right: GitDiffLine[] = [];
    
    for (let i = 1; i <= baseLines; i++) {
        const text = `  const v${seed}_${i} = computeValue(${i * seed}); // Logic line ${i}`;
        
        if (i % 10 === 0) {
            left.push({ num: i, text: text + ' [OLD]', type: 'remove' });
            right.push({ num: i, text: text + ' [NEW]', type: 'add' });
        } else if (i % 25 === 0) {
            left.push({ num: i, text: text + ' [DEL]', type: 'remove' });
            right.push({ num: null, text: '', type: 'empty' });
        } else if (i % 26 === 0) {
            left.push({ num: null, text: '', type: 'empty' });
            right.push({ num: i, text: text + ' [ADD]', type: 'add' });
        } else {
            left.push({ num: i, text, type: 'normal' });
            right.push({ num: i, text, type: 'normal' });
        }
    }
    return { left, right };
};

const largeDiff1 = generateDiff(120, 1);
const largeDiff2 = generateDiff(80, 2);

const mockWorkingChanges: GitFileStatus[] = [
    { 
        id: 'w1', name: 'src/components/Header.tsx', status: 'modified',
        leftLines: largeDiff1.left, rightLines: largeDiff1.right
    },
    {
        id: 'w2', name: 'src/utils/auth.ts', status: 'added',
        leftLines: [], rightLines: largeDiff2.right.filter(l => l.type !== 'empty')
    },
    {
        id: 'w3', name: 'src/pages/Dashboard/Charts.tsx', status: 'modified',
        leftLines: [{num:1, text:'// Chart Logic', type:'normal'}], rightLines: [{num:1, text:'// Updated Chart Logic', type:'add'}]
    },
    {
        id: 'w4', name: 'public/locales/zh.json', status: 'modified',
        leftLines: [{num:1, text:'"hello": "你好"', type:'normal'}], rightLines: [{num:1, text:'"hello": "您好"', type:'add'}]
    },
    {
        id: 'w5', name: 'src/assets/logo.svg', status: 'deleted',
        leftLines: [{num:1, text:'<svg>...</svg>', type:'normal'}], rightLines: []
    }
];

const mockCommits: GitCommit[] = [
    { id: 'c10', message: 'fix: navigation bar overflow issue', author: 'Admin', date: '2023-10-29 10:00', branch: 'main', files: [] },
    { id: 'c9', message: 'Merge branch feature/login-page', author: 'Admin', date: '2023-10-28 16:30', branch: 'main', files: [] },
    { id: 'c8', message: 'feat: add user profile page', author: 'Alice', date: '2023-10-28 14:20', branch: 'feature/login-page', files: [] },
    { id: 'c7', message: 'chore: update dependencies', author: 'Bob', date: '2023-10-28 09:15', branch: 'feature/login-page', files: [] },
    { id: 'c6', message: 'refactor: extract auth logic', author: 'Alice', date: '2023-10-27 18:45', branch: 'feature/login-page', files: [] },
    { id: 'c5', message: 'style: dark mode improvements', author: 'Admin', date: '2023-10-27 11:00', branch: 'main', files: [] },
    { id: 'c4', message: 'fix: typo in readme', author: 'Bob', date: '2023-10-26 15:30', branch: 'main', files: [] },
    { id: 'c3', message: 'feat: implement search grounding', author: 'Admin', date: '2023-10-26 10:00', branch: 'main', files: [] },
    { id: 'c2', message: 'perf: optimize image loading', author: 'Alice', date: '2023-10-25 16:20', branch: 'main', files: [] },
    { id: 'c1', message: 'init: project setup', author: 'Admin', date: '2023-10-25 09:00', branch: 'main', files: [] },
].map(c => ({
    ...c,
    files: [
        { 
            id: `f_${c.id}_1`, name: `src/components/Comp_${c.id}.tsx`, status: 'modified', 
            leftLines: largeDiff1.left, rightLines: largeDiff1.right 
        },
        {
            id: `f_${c.id}_2`, name: `src/utils/helper_${c.id}.ts`, status: 'added',
            leftLines: [], rightLines: largeDiff2.right.filter(l => l.type !== 'empty')
        }
    ]
}));

export const fetchGitChanges = async (): Promise<GitFileStatus[]> => {
    console.log("Calling Backend API [GET /api/git/changes]");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockWorkingChanges]);
        }, 600);
    });
};

export const fetchGitHistory = async (): Promise<GitCommit[]> => {
    console.log("Calling Backend API [GET /api/git/history]");
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockCommits]);
        }, 800);
    });
};

export const performGitAction = async (action: string, payload: any): Promise<boolean> => {
    console.log(`Calling Backend API [POST /api/git/${action}]`, payload);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 800);
    });
};


import React from 'react';
import { Play, Save, Settings, Globe, Plus, Trash2, Link } from 'lucide-react';

interface ExternalApiDesignerProps {
  file: any;
}

const ExternalApiDesigner: React.FC<ExternalApiDesignerProps> = ({ file }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
      {/* Toolbar */}
      <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <Globe size={16} className="text-purple-500" />
            <span className="font-bold text-gray-700 dark:text-gray-200">{file.title}</span>
         </div>
         <div className="flex items-center gap-2">
           <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
              <Play size={14} /> Send
           </button>
           <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs">
              <Save size={14} /> Save
           </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-auto">
         
         {/* Request Configuration */}
         <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3">
               <select className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 font-bold text-gray-700 dark:text-gray-200 outline-none">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
               </select>
               <input 
                 type="text" 
                 className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 outline-none text-gray-700 dark:text-gray-200" 
                 placeholder="https://api.example.com/v1/resource"
                 defaultValue="https://api.thirdparty.com/orders"
               />
            </div>
            
            <div className="p-4">
               <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-xs uppercase tracking-wider">Params & Headers</h4>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <input type="text" className="w-1/3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1" placeholder="Key" />
                     <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1" placeholder="Value" />
                     <button className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"><Trash2 size={14} /></button>
                  </div>
                  <button className="text-nebula-600 text-xs flex items-center gap-1 hover:underline"><Plus size={12} /> Add Header</button>
               </div>
            </div>
         </div>

         {/* Response Section */}
         <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col">
             <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <span className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase">Response</span>
                <span className="text-green-600 text-xs font-mono">200 OK (124ms)</span>
             </div>
             <div className="flex-1 p-4 font-mono text-xs text-gray-600 dark:text-gray-300 overflow-auto">
<pre>{`{
  "status": "success",
  "data": [
    {
      "id": 1023,
      "amount": 450.00,
      "currency": "USD",
      "status": "shipped"
    },
    {
      "id": 1024,
      "amount": 120.50,
      "currency": "USD",
      "status": "processing"
    }
  ]
}`}</pre>
             </div>
         </div>

      </div>
    </div>
  );
};

export default ExternalApiDesigner;

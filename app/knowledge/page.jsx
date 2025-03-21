'use client';

import React from 'react';
import { Header, Footer } from '@/components/SharedLayout';
import { useRouter } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';

export default function KnowledgeBase() {
  const router = useRouter();
  const [files, setFiles] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [fileContent, setFileContent] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState('');
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    // 初始化时加载README文件
    fetch('/README.md')
      .then(response => response.text())
      .then(content => {
        setFiles([{
          name: 'README.md',
          type: 'markdown',
          content: content,
          editable: false
        }]);
      })
      .catch(error => console.error('Error loading README:', error));
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['doc', 'docx', 'pdf', 'md'].includes(fileType)) {
      alert('只支持 .doc, .docx, .pdf 和 .md 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newFile = {
        name: file.name,
        type: fileType,
        content: e.target.result,
        editable: false
      };
      setFiles(prev => [...prev, newFile]);
    };
    reader.readAsText(file);
  };

  const viewFile = (file) => {
    setSelectedFile(file);
    setFileContent(file.content);
    setEditableContent(file.content);
    setIsEditing(false);
  };

  const toggleEditable = (index) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, editable: !file.editable } : file
    ));
  };

  const handleSave = () => {
    if (!selectedFile) return;
    
    const updatedFiles = files.map(file => 
      file.name === selectedFile.name 
        ? { ...file, content: editableContent }
        : file
    );
    
    setFiles(updatedFiles);
    setFileContent(editableContent);
    setSelectedFile({ ...selectedFile, content: editableContent });
    setIsEditing(false);
  };

  const deleteFile = (index) => {
    const fileToDelete = files[index];
    if (fileToDelete.name === 'README.md') {
      alert('不能删除 README 文件');
      return;
    }
    
    if (confirm(`确定要删除 ${fileToDelete.name} 吗？`)) {
      setFiles(prev => prev.filter((_, i) => i !== index));
      if (selectedFile?.name === fileToDelete.name) {
        setSelectedFile(null);
        setFileContent('');
        setEditableContent('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-color-mode="light">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="absolute top-4 right-4">
            <UserProfile />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">知识库</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            添加知识
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.pdf,.md"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">文件列表</h2>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedFile?.name === file.name
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <button
                    onClick={() => viewFile(file)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`${selectedFile?.name === file.name ? 'text-blue-600 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {file.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleEditable(index)}
                      className={`p-1 rounded ${
                        file.editable 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={file.editable ? "可编辑" : "不可编辑"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {file.name !== 'README.md' && (
                      <button
                        onClick={() => deleteFile(index)}
                        className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                        title="删除文件"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            {selectedFile ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedFile.name}
                  </h2>
                  {selectedFile.editable && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <button
                          onClick={handleSave}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          保存
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          编辑
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {selectedFile.editable && isEditing ? (
                    <MDEditor
                      value={editableContent}
                      onChange={setEditableContent}
                      preview="edit"
                      height={500}
                    />
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {fileContent}
                    </ReactMarkdown>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                请从左侧选择一个文件查看
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

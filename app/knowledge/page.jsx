'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/SharedLayout';
import { useRouter } from 'next/navigation';
import UserProfile from '@/components/UserProfile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';

export default function KnowledgeBase() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = React.createRef(null);

  useEffect(() => {
    // 从localStorage获取之前上传的文件列表（只存储文件元数据）
    const savedFilesMeta = localStorage.getItem('uploadedFilesMeta');
    if (savedFilesMeta) {
      const filesMeta = JSON.parse(savedFilesMeta);
      setFiles(filesMeta.map(meta => ({
        ...meta,
        content: null // 初始不加载内容
      })));
    }
  }, []);

  const handleFileUpload = async (event) => {
    try {
      setIsLoading(true);
      setLoadingMessage('正在处理知识文件...');
      const file = event.target.files[0];
      if (!file) return;

      const fileType = file.name.split('.').pop().toLowerCase();
      if (!['doc', 'docx', 'pdf', 'txt', 'md'].includes(fileType)) {
        alert('只支持 .doc, .docx, .pdf, .txt 和 .md 文件');
        return;
      }

      // 读取文件内容
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // 创建FormData并发送到API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      
      setLoadingMessage('正在生成题目，这可能需要一点时间...');
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成题目失败');
      }

      const data = await response.json();
      
      // 创建文件元数据
      const newFile = {
        name: file.name,
        type: fileType,
        size: file.size,
        lastModified: file.lastModified,
        content: content,
        questions: data.questions, // 保存生成的题目
        editable: false
      };

      // 更新状态
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);

      // 只存储元数据到localStorage
      const filesMeta = updatedFiles.map(({ name, type, size, lastModified, editable, questions }) => ({
        name,
        type,
        size,
        lastModified,
        editable,
        questions
      }));
      localStorage.setItem('uploadedFilesMeta', JSON.stringify(filesMeta));

      // 显示成功消息
      alert(`成功生成 ${data.questions.length} 道题目！`);
      
      // 自动选择新上传的文件
      setSelectedFile(newFile);
      setFileContent(content);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.message || '上传文件时出错');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // 重置文件输入
      }
    }
  };

  const viewFile = async (file) => {
    // 如果文件内容还未加载，则按需加载
    if (!file.content) {
      try {
        // 从localStorage获取文件内容
        const content = localStorage.getItem(`file_content_${file.name}`);
        if (content) {
          file.content = content;
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        alert('加载文件内容失败');
        return;
      }
    }
    
    setSelectedFile(file);
    setFileContent(file.content);
    setEditableContent(file.content);
    setIsEditing(false);
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

    // 更新localStorage中的文件内容
    localStorage.setItem(`file_content_${selectedFile.name}`, editableContent);
    
    // 更新文件元数据
    const filesMeta = updatedFiles.map(({ name, type, size, lastModified, editable, questions }) => ({
      name,
      type,
      size,
      lastModified,
      editable,
      questions
    }));
    localStorage.setItem('uploadedFilesMeta', JSON.stringify(filesMeta));
  };

  const deleteFile = (index) => {
    const fileToDelete = files[index];
    if (!fileToDelete) return;
    
    if (confirm(`确定要删除 ${fileToDelete.name} 吗？`)) {
      // 从localStorage中删除文件内容
      localStorage.removeItem(`file_content_${fileToDelete.name}`);
      
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      
      // 更新文件元数据
      const filesMeta = updatedFiles.map(({ name, type, size, lastModified, editable, questions }) => ({
        name,
        type,
        size,
        lastModified,
        editable,
        questions
      }));
      localStorage.setItem('uploadedFilesMeta', JSON.stringify(filesMeta));

      if (selectedFile?.name === fileToDelete.name) {
        setSelectedFile(null);
        setFileContent('');
        setEditableContent('');
      }
    }
  };

  const toggleEditable = (index) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, editable: !file.editable } : file
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">知识库</h1>
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              添加知识
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              返回游戏设置
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.pdf,.txt,.md"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-4">文件列表</h2>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedFile?.name === file.name
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => viewFile(file)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`${selectedFile?.name === file.name ? 'text-blue-600' : 'text-gray-700'}`}>
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
                    <button
                      onClick={() => deleteFile(index)}
                      className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                      title="删除文件"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-lg p-6 shadow">
            {isLoading && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <p className="text-blue-600">{loadingMessage}</p>
                </div>
              </div>
            )}
            {selectedFile ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
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
                <div className="prose max-w-none">
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
              <div className="text-center text-gray-500">
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

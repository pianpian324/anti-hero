'use client';

export default function HelloPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        <img src="/file.svg" alt="file icon" className="w-5 h-5" />
        知识库
      </button>
      <div className="flex flex-col space-y-2">
        <label className="text-gray-700">选AI模型</label>
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>模型1</option>
          <option>模型2</option>
          <option>模型3</option>
          <option>模型4</option>
          <option>模型5</option>
        </select>
      </div>
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="w-5 h-5" />
        <span>添加AI玩家</span>
      </label>
      <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
        开始
      </button>
    </div>
  );
}
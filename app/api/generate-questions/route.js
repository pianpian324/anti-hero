import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import debugLogger from '@/utils/debug';

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 文件存储路径
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'quizQuestions.json');

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await fs.access(UPLOADS_DIR);
    await debugLogger.info('上传目录已存在', { path: UPLOADS_DIR });
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await debugLogger.info('创建上传目录', { path: UPLOADS_DIR });
  }
}

// 保存上传的文件
async function saveUploadedFile(content, filename) {
  await ensureUploadDir();
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, content);
  await debugLogger.info('文件已保存', { filePath, size: content.length });
  return filePath;
}

// 从文件生成题目
async function generateQuestionsFromFile(filePath) {
  try {
    await debugLogger.info('开始处理文件', { filePath });
    const content = await fs.readFile(filePath, 'utf-8');
    
    const prompt = `请基于以下内容生成5个选择题，使用中文编写题目和选项。每个题目必须严格按照以下JSON格式：

[
  {
    "id": 1,
    "question": "问题内容",
    "options": {
      "A": "选项A",
      "B": "选项B",
      "C": "选项C",
      "D": "选项D"
    },
    "correctAnswer": "A",
    "explanation": "这是正确答案的解释"
  }
]

注意事项：
1. 必须使用英文双引号(")，不能使用中文引号("" ')
2. 所有属性名必须用双引号包裹
3. 所有字符串值必须用双引号包裹
4. 数组和对象的最后一项后面不要加逗号
5. 确保生成的是一个合法的JSON数组

内容：
${content}`;

    await debugLogger.info('准备发送API请求', { 
      url: DEEPSEEK_API_URL,
      contentLength: content.length 
    });

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Pro/deepseek-ai/DeepSeek-V3",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      })
    });

    await debugLogger.api('POST', DEEPSEEK_API_URL, prompt, {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      await debugLogger.error('API请求失败', new Error(`${response.status} ${response.statusText}: ${errorText}`));
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    await debugLogger.info('收到API响应', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('API响应格式异常');
    }

    const generatedContent = data.choices[0].message.content;
    await debugLogger.info('解析生成的内容', { content: generatedContent });

    try {
      // 尝试提取JSON数组部分
      const match = generatedContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!match) {
        throw new Error('未找到有效的JSON数组');
      }

      let cleanedContent = match[0]
        .replace(/^\s+|\s+$/g, '')  // 移除首尾空白
        .replace(/\n/g, '')         // 移除换行
        .replace(/\s+/g, ' ');      // 合并空白字符

      await debugLogger.info('清理后的内容', { cleaned: cleanedContent });

      const generatedQuestions = JSON.parse(cleanedContent);
      await debugLogger.info('成功解析题目', { questions: generatedQuestions });

      if (!Array.isArray(generatedQuestions)) {
        throw new Error('生成的题目不是数组格式');
      }

      const questionsFile = await fs.readFile(QUESTIONS_FILE, 'utf-8');
      const existingData = JSON.parse(questionsFile);
      await debugLogger.info('读取现有题目', { existingData });

      const maxId = Math.max(...existingData.questions.map(q => q.id), 0);
      const newQuestions = generatedQuestions.map((q, index) => ({
        ...q,
        id: maxId + index + 1,
        source: path.basename(filePath) // 添加题目来源
      }));

      existingData.questions = [...existingData.questions, ...newQuestions];

      if (!existingData.categories) {
        existingData.categories = {};
      }
      if (!existingData.categories.knowledge) {
        existingData.categories.knowledge = [];
      }
      existingData.categories.knowledge.push(...newQuestions.map(q => q.id));

      await fs.writeFile(QUESTIONS_FILE, JSON.stringify(existingData, null, 2));
      await debugLogger.info('保存更新后的题目', { 
        totalQuestions: existingData.questions.length,
        newQuestions 
      });

      return newQuestions;
    } catch (parseError) {
      await debugLogger.error('解析生成的内容失败', parseError);
      throw new Error(`解析生成的内容失败: ${parseError.message}`);
    }
  } catch (error) {
    await debugLogger.error('生成题目时出错', error);
    throw error;
  }
}

export async function POST(request) {
  const requestId = Date.now().toString();
  await debugLogger.info('收到新请求', { requestId });

  try {
    const data = await request.formData();
    const file = data.get('file');
    
    if (!file) {
      await debugLogger.error('未提供文件', new Error('No file provided'));
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    await debugLogger.info('文件信息', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const content = await file.text();
    const filename = file.name;
    const filePath = await saveUploadedFile(content, filename);

    const questions = await generateQuestionsFromFile(filePath);
    
    await debugLogger.info('请求处理完成', { 
      requestId,
      questionsGenerated: questions.length 
    });

    return NextResponse.json({ 
      success: true, 
      questions,
      message: `成功生成 ${questions.length} 道题目`
    });

  } catch (error) {
    await debugLogger.error('请求处理失败', error);
    return NextResponse.json({ 
      error: '处理文件时出错', 
      details: error.message,
      requestId
    }, { status: 500 });
  }
}

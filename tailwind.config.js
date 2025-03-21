/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
      // 主要颜色，用于按钮、链接等主要交互元素

        primary: {
        // 默认主色

          DEFAULT: '#2563eb', // 蓝色，用于主要按钮和链接

          hover: '#1d4ed8', // 鼠标悬停时的深蓝色

        },
        secondary: '#64748b', // 灰色，用于次要按钮和文本

        accent: '#0ea5e9', // 浅蓝色，用于强调元素

        success: '#22c55e', // 绿色，用于成功状态

        warning: '#f59e0b', // 橙色，用于警告状态

        danger: '#ef4444', // 红色，用于错误和危险状态

      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

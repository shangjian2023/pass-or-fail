# 📊 期末急救计算器

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>🎯 一款帮助学生快速计算期末成绩、判断是否能及格的在线工具</strong>
</p>

<p align="center">
  <a href="#功能特点">功能特点</a> •
  <a href="#使用方法">使用方法</a> •
  <a href="#在线体验">在线体验</a> •
  <a href="#技术栈">技术栈</a>
</p>

---

## 📖 项目简介

**期末急救计算器**是一款专为大学生设计的成绩计算工具。在期末考试来临之际，帮助学生快速计算：

- 📈 当前成绩能否及格？
- 🎯 期末考试需要考多少分才能不挂科？
- 📊 各项成绩占比情况

> 💡 **开发初衷**  
> 期末考试临近，很多同学都在焦虑自己能不能及格。这个工具可以帮助大家快速算出期末考试需要考多少分，做到心中有数。

---

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 🧮 **成绩计算** | 根据平时成绩、期中成绩、期末成绩占比，计算总成绩 |
| 🎯 **目标分析** | 计算期末考试最低需要多少分才能及格 |
| 📱 **响应式设计** | 完美适配手机、平板、电脑 |
| 🎨 **急救主题** | 红十字风格设计，紧急感拉满 |
| 🔒 **本地计算** | 所有数据在本地处理，保护隐私 |
| ⚡ **零依赖** | 纯前端实现，无需安装任何依赖 |

---

## 🚀 使用方法

### 在线使用

直接访问 GitHub Pages 部署版本，无需下载安装：

👉 [在线体验](https://shangjian2023.github.io/pass-or-fail/)

### 本地运行

```bash
# 克隆项目
git clone https://github.com/shangjian2023/pass-or-fail.git

# 进入项目目录
cd pass-or-fail

# 直接打开 index.html 即可使用
# 或使用本地服务器
python -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## 📝 使用说明

1. **输入平时成绩** - 平时作业、课堂表现等成绩
2. **输入期中成绩** - 期中考试成绩（如有）
3. **设置成绩占比** - 各项成绩占总成绩的百分比
4. **查看结果** - 系统自动计算期末所需最低分数

```
示例：
├── 平时成绩：85分（占比30%）
├── 期中成绩：72分（占比20%）
└── 期末成绩：需要 >= 58分 才能及格（占比50%）
```

---

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计（渐变、动画、响应式）
- **JavaScript** - 逻辑处理
- **Google Fonts** - Noto Sans SC 字体

---

## 📁 项目结构

```
pass-or-fail/
├── index.html      # 单页面应用
├── README.md       # 项目说明
└── LICENSE         # MIT 许可证
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

<p align="center">
  Made with ❤️ for students
</p>
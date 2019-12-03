# 审稿人推荐系统说明文档

## 安装

本插件还在测试阶段，未发布到Chrome Web Store，只能在本地安装。

在Chrome地址栏中输入<chrome://extensions/>进入插件管理页面，打开Developer mode然后再选择Load unpacked选择插件所在文件夹加载。![extension_setting](readme.assets/extension_setting.png)

安装完毕后激活审稿人推荐系统。![1570623180083](readme.assets/1570623180083.png)

## 使用

进入《精准医学杂志》的[编辑中心](http://jpmed.qdu.edu.cn/Journalx_jzyx/manuscript/Editor_Main.action)，选择一个稿件，进入审稿页面。点击浏览器右上角插件区的博士帽图标即可使用该插件，该插件会自动提取稿件的英文关键词（若该稿件没有英文关键词，会自动翻译），点击"Search"图标即可开始搜索，结果在右下侧显示。可以加入筛选条件，默认搜索全部地区的中文使用者，H-index在0-20之间。可以调整排序依据，默认为相关度排序。注意，无论选择何种方式排序，为了方便联络均会把有邮箱的审稿人排在前面。

![reviewer_rec_screenshot](readme.assets/reviewer_rec_screenshot.png)

## 声明

本插件是由[钱雨杰](http://people.csail.mit.edu/yujieq/)开发的[Reviewer Recommender](https://chrome.google.com/webstore/detail/reviewer-recommender/holgegjhfkdkpclackligifbkphemhmg)移植。本插件代码在<https://github.com/xieyt2000/ReviewerRec/tree/chinese>开源。如发现bug或有改进建议，请在GitHub下提出Issue或联系<xieyuntong2000@gmail.com>。

## 0.0.3版本未解决的几个需求

- 可调节的UI大小：因为UI仅使用javascript生成，所以做成可以不变形地调节大小难度很大，暂时无法解决这个问题。

- 没有自动解析出关键词的问题：原因在于有极少部分只写了中文关键词的文章关键词写得过于随意，不是常用的学术语言（如使用复杂结构等），本程序使用的关键词翻译API无法准确翻译这种关键词，于是直接无视这些关键词。这个问题很难解决，暂时只能手动输入关键词。

## 测试注意事项

请测试人员在测试过程中发现bug以后，保存下来对应稿件的地址与出现bug的基本情况，便于开发调试。

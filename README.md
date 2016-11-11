# PTT 全文 RSS 產生器

## 部署及使用方式

1. 到 [Google Apps Script](https://www.google.com/script/start/) 點擊 Start Scripting 開新的專案，將程式碼貼上。
1. 點擊「發佈」、「部署為網路應用程式」。
1. 具有應用程式存取權的使用者，選擇「任何人，甚至匿名使用者」。
1. 點擊「部署」，確認授權。
1. 取得應用程式網址 (https://script.google.com/macros/s/.../exec)。
1. 將欲訂閱的看板英文板名加上 `?b=` 參數，貼到應用程式網址後面，例如電影板的英文板名是 movie，RSS 訂閱網址為：

```
https://script.google.com/macros/s/.../exec?b=movie
```

將以上網址貼到 RSS 閱讀器即可訂閱。

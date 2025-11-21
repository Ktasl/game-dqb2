# Firebase + GitHub Actions Deployment SpecKit

這份文件與腳本旨在協助您快速為任何靜態網頁專案設定 Firebase 自動化部署。

## 包含檔案
1.  **`setup_deploy.sh`**: 自動化設定腳本。
2.  **`deployment_spec_kit.md`**: 本說明文件。

## 使用教學

### 1. 準備工作
- 確保您已經有一個 **GitHub Repository**。
- 確保您已經在 [Firebase Console](https://console.firebase.google.com/) 建立了一個專案，並記下 **Project ID**。

### 2. 執行腳本
將 `setup_deploy.sh` 複製到您的專案根目錄，然後執行：

```bash
# 給予執行權限
chmod +x setup_deploy.sh

# 執行腳本 (替換成您的 Project ID)
./setup_deploy.sh your-project-id-123
```

這個腳本會自動幫您：
- [x] 建立 `firebase.json` (如果不存在)
- [x] 建立 `.firebaserc` 並設定 Project ID
- [x] 建立 `.github/workflows/deploy.yml`
- [x] 更新 `.gitignore` 以避免誤傳 JSON 金鑰

### 3. 設定 GitHub Secrets (必要)
腳本執行完畢後，您還需要手動完成最後一步：

1.  前往 **Firebase Console** > 專案設定 > 服務帳戶 > **產生新的私密金鑰**。
2.  前往 **GitHub Repo** > Settings > Secrets and variables > Actions > **New repository secret**。
3.  **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
4.  **Value**: 貼上 JSON 金鑰內容。

### 4. 推送程式碼
```bash
git add .
git commit -m "Setup Firebase deployment"
git push
```

完成！您的專案現在擁有自動化部署功能了。

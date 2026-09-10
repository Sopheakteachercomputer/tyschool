import { storageService } from './storageService';

export interface DriveStorageQuota {
  limitBytes: number;
  usageBytes: number;
  usageInDriveBytes: number;
  limitFormatted: string;
  usageFormatted: string;
  percentUsed: number;
  userEmail?: string;
  userDisplayName?: string;
  userPhoto?: string;
}

export interface DriveBackupFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  sizeFormatted: string;
  sizeBytes: number;
  webViewLink?: string;
}

const BACKUP_FILE_NAME = 'cambodian_school_management_database.json';

export const formatBytes = (bytes: number): string => {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2);
  return `${val} ${units[i]}`;
};

export const googleDriveService = {
  /**
   * Fetch Google Drive storage quota and user profile
   */
  getDriveQuota: async (token: string): Promise<DriveStorageQuota> => {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const quota = data.storageQuota || {};
    const limit = Number(quota.limit || 16106127360); // 15 GB default if not returned
    const usage = Number(quota.usage || 0);
    const usageInDrive = Number(quota.usageInDrive || 0);

    const percent = limit > 0 ? Math.min(100, Math.round((usage / limit) * 100)) : 0;

    return {
      limitBytes: limit,
      usageBytes: usage,
      usageInDriveBytes: usageInDrive,
      limitFormatted: formatBytes(limit),
      usageFormatted: formatBytes(usage),
      percentUsed: percent,
      userEmail: data.user?.emailAddress,
      userDisplayName: data.user?.displayName,
      userPhoto: data.user?.photoLink
    };
  },

  /**
   * Search for existing system database backup in user's Google Drive
   */
  findBackupFile: async (token: string): Promise<DriveBackupFileInfo | null> => {
    const query = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to find file in Google Drive: ${errText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      const sizeBytes = Number(file.size || 0);
      return {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        sizeFormatted: formatBytes(sizeBytes),
        sizeBytes,
        webViewLink: file.webViewLink
      };
    }

    return null;
  },

  /**
   * Upload / sync full database JSON to Google Drive (create or update)
   */
  uploadDatabaseToDrive: async (
    token: string,
    jsonData: string,
    onProgress?: (status: string) => void
  ): Promise<DriveBackupFileInfo> => {
    if (onProgress) onProgress('កំពុងពិនិត្យឯកសារក្នុង Google Drive...');
    const existing = await googleDriveService.findBackupFile(token);

    const boundary = '-------CambodiaSchoolDriveSync' + Date.now();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadata = {
      name: BACKUP_FILE_NAME,
      mimeType: 'application/json',
      description: 'Cambodian School Management System Full Database & Media Cloud Backup'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      jsonData +
      closeDelim;

    let res: Response;
    if (existing) {
      if (onProgress) onProgress('កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យលើ Google Drive...');
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id,name,modifiedTime,size,webViewLink`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        }
      );
    } else {
      if (onProgress) onProgress('កំពុងបង្កើតឯកសាររក្សាទុកថ្មីលើ Google Drive...');
      res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        }
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`បរាជ័យក្នុងការរក្សាទុកលើ Google Drive (${res.status}): ${errText}`);
    }

    const savedFile = await res.json();
    const sizeBytes = Number(savedFile.size || jsonData.length);

    // Save timestamp to localStorage for reference
    try {
      localStorage.setItem('LAST_GOOGLE_DRIVE_SYNC', new Date().toISOString());
      localStorage.setItem('LAST_GOOGLE_DRIVE_FILE_ID', savedFile.id);
    } catch {}

    return {
      id: savedFile.id,
      name: savedFile.name,
      modifiedTime: savedFile.modifiedTime || new Date().toISOString(),
      sizeFormatted: formatBytes(sizeBytes),
      sizeBytes,
      webViewLink: savedFile.webViewLink
    };
  },

  /**
   * Download and restore database JSON from Google Drive
   */
  downloadDatabaseFromDrive: async (token: string, fileId: string): Promise<string> => {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`បរាជ័យក្នុងការទាញយកពី Google Drive (${res.status}): ${errText}`);
    }

    return await res.text();
  },

  /**
   * High-level sync all data from Local Storage to Google Drive
   */
  syncAllDataToDrive: async (token: string, onProgress?: (msg: string) => void) => {
    if (onProgress) onProgress('កំពុងប្រមូលទិន្នន័យទាំងអស់ក្នុងប្រព័ន្ធ...');
    const fullJson = storageService.exportFullBackup();
    const fileInfo = await googleDriveService.uploadDatabaseToDrive(token, fullJson, onProgress);
    return {
      success: true,
      file: fileInfo,
      message: `បានរក្សាទុកទិន្នន័យសាលារៀនចំនួន ${fileInfo.sizeFormatted} ទៅកាន់ Google Drive ដោយជោគជ័យ!`
    };
  },

  /**
   * High-level restore all data from Google Drive to Local Storage
   */
  restoreAllDataFromDrive: async (token: string, fileId?: string) => {
    let targetId = fileId;
    if (!targetId) {
      const file = await googleDriveService.findBackupFile(token);
      if (!file) {
        throw new Error('មិនមានឯកសារទិន្នន័យសាលារៀននៅលើ Google Drive របស់អ្នកនៅឡើយទេ');
      }
      targetId = file.id;
    }

    const jsonString = await googleDriveService.downloadDatabaseFromDrive(token, targetId);
    const success = storageService.importFullBackup(jsonString);
    if (!success) {
      throw new Error('ឯកសារទិន្នន័យពី Google Drive មិនត្រឹមត្រូវ ឬខូចទម្រង់');
    }

    return {
      success: true,
      message: 'បានស្តារទិន្នន័យសាលារៀនទាំងអស់ពី Google Drive មកកាន់ប្រព័ន្ធដោយជោគជ័យ!'
    };
  }
};

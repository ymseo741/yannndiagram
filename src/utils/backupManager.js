import { saveAs } from 'file-saver';

export const exportBackup = (currentData, config, savedFiles) => {
    const backupData = {
        version: "1.0",
        timestamp: Date.now(),
        current: {
            data: currentData,
            config: config
        },
        savedScenarios: savedFiles
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json;charset=utf-8" });
    const fileName = `YannnDiagram_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    saveAs(blob, fileName);
};

export const parseBackupFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                // Basic validation
                if (!json.current || !json.savedScenarios) {
                    reject(new Error("Invalid backup file format"));
                    return;
                }
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};

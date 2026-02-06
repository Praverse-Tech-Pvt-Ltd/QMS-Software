import React, { useState } from 'react';
import { dmsService } from '../../services/dms.service';

interface UploadModalProps {
  docId: number | string;
  onSuccess: () => void;
  onClose: () => void;
}

export const FileUploadModal: React.FC<UploadModalProps> = ({ docId, onSuccess, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [changeLog, setChangeLog] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version || !changeLog) {
      alert("Please fill in all fields.");
      return;
    }

    setUploading(true);
    try {
      // This calls the service we created earlier
      await dmsService.uploadVersion(docId, file, version, changeLog);
      alert('File uploaded successfully!');
      onSuccess(); // Refresh the parent list
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      alert('Failed to upload. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Upload New Version</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium">Select Document (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Version Number */}
          <div>
            <label className="block text-sm font-medium">Version Number (e.g. 1.0)</label>
            <input 
              type="text" 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Change Log */}
          <div>
            <label className="block text-sm font-medium">Reason for Change</label>
            <textarea 
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
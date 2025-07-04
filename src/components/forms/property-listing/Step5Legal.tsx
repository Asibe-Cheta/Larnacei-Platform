'use client';

import { useState, useRef } from 'react';

interface PropertyListingData {
  hasTitleDeed: boolean;
  titleDeedNumber?: string;
  hasSurveyPlan: boolean;
  surveyPlanNumber?: string;
  hasBuildingApproval: boolean;
  buildingApprovalNumber?: string;
  legalDocuments: File[];
}

interface Step5LegalProps {
  formData: PropertyListingData;
  updateFormData: (updates: Partial<PropertyListingData>) => void;
}

export default function Step5Legal({ formData, updateFormData }: Step5LegalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof PropertyListingData, value: any) => {
    updateFormData({ [field]: value });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );

    if (validFiles.length > 0) {
      const maxFiles = 10;
      if (formData.legalDocuments.length + validFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} documents allowed`);
        return;
      }
      updateFormData({ legalDocuments: [...formData.legalDocuments, ...validFiles] });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 10;
    
    if (formData.legalDocuments.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    updateFormData({ legalDocuments: [...formData.legalDocuments, ...files] });
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = formData.legalDocuments.filter((_, i) => i !== index);
    updateFormData({ legalDocuments: updatedDocuments });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Documentation</h2>
        <p className="text-gray-600">Provide legal documents to verify property ownership and compliance.</p>
      </div>

      {/* Title Deed Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="material-icons text-red-600">description</span>
          <h3 className="text-lg font-medium text-gray-900">Title Deed</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hasTitleDeed"
              checked={formData.hasTitleDeed}
              onChange={(e) => handleInputChange('hasTitleDeed', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="hasTitleDeed" className="text-sm font-medium text-gray-700">
              I have a title deed for this property
            </label>
          </div>

          {formData.hasTitleDeed && (
            <div>
              <label htmlFor="titleDeedNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Title Deed Number (Optional)
              </label>
              <input
                type="text"
                id="titleDeedNumber"
                value={formData.titleDeedNumber || ''}
                onChange={(e) => handleInputChange('titleDeedNumber', e.target.value)}
                placeholder="Enter title deed number if available"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Survey Plan Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="material-icons text-red-600">map</span>
          <h3 className="text-lg font-medium text-gray-900">Survey Plan</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hasSurveyPlan"
              checked={formData.hasSurveyPlan}
              onChange={(e) => handleInputChange('hasSurveyPlan', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="hasSurveyPlan" className="text-sm font-medium text-gray-700">
              I have a survey plan for this property
            </label>
          </div>

          {formData.hasSurveyPlan && (
            <div>
              <label htmlFor="surveyPlanNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Survey Plan Number (Optional)
              </label>
              <input
                type="text"
                id="surveyPlanNumber"
                value={formData.surveyPlanNumber || ''}
                onChange={(e) => handleInputChange('surveyPlanNumber', e.target.value)}
                placeholder="Enter survey plan number if available"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Building Approval Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="material-icons text-red-600">verified</span>
          <h3 className="text-lg font-medium text-gray-900">Building Approval</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hasBuildingApproval"
              checked={formData.hasBuildingApproval}
              onChange={(e) => handleInputChange('hasBuildingApproval', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="hasBuildingApproval" className="text-sm font-medium text-gray-700">
              I have building approval for this property
            </label>
          </div>

          {formData.hasBuildingApproval && (
            <div>
              <label htmlFor="buildingApprovalNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Building Approval Number (Optional)
              </label>
              <input
                type="text"
                id="buildingApprovalNumber"
                value={formData.buildingApprovalNumber || ''}
                onChange={(e) => handleInputChange('buildingApprovalNumber', e.target.value)}
                placeholder="Enter building approval number if available"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Legal Documents</h3>
          <span className="text-sm text-gray-500">
            {formData.legalDocuments.length}/10 documents
          </span>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <span className="material-icons text-4xl text-gray-400">upload_file</span>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your documents here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF, JPG, PNG up to 10MB each. Maximum 10 documents.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 primary-bg text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Select Documents
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Document List */}
        {formData.legalDocuments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</h4>
            <div className="space-y-3">
              {formData.legalDocuments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="material-icons text-gray-400">
                      {file.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legal Requirements Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">Legal Requirements</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Title deeds are required for property sales</li>
          <li>• Survey plans help verify property boundaries</li>
          <li>• Building approvals ensure construction compliance</li>
          <li>• All documents will be verified by our legal team</li>
          <li>• Incomplete documentation may delay listing approval</li>
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Legal Documentation Summary</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Title Deed:</strong> {formData.hasTitleDeed ? 'Yes' : 'No'}</p>
          <p><strong>Survey Plan:</strong> {formData.hasSurveyPlan ? 'Yes' : 'No'}</p>
          <p><strong>Building Approval:</strong> {formData.hasBuildingApproval ? 'Yes' : 'No'}</p>
          <p><strong>Documents Uploaded:</strong> {formData.legalDocuments.length}/10</p>
        </div>
      </div>
    </div>
  );
} 
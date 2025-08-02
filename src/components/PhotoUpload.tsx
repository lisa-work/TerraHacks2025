import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Plus, Image as ImageIcon } from 'lucide-react';

interface Photo {
  file: File;
  preview: string;
  description: string;
}

interface PhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  maxFileSize = 10,
  className = ''
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = URL.createObjectURL(blob);
            
            const newPhoto: Photo = {
              file,
              preview,
              description: ''
            };

            onPhotosChange([...photos, newPhoto]);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files.');
        return;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File size must be less than ${maxFileSize}MB.`);
        return;
      }

      // Check if we've reached the limit
      if (photos.length >= maxPhotos) {
        alert(`Maximum ${maxPhotos} photos allowed.`);
        return;
      }

      const preview = URL.createObjectURL(file);
      const newPhoto: Photo = {
        file,
        preview,
        description: ''
      };

      onPhotosChange([...photos, newPhoto]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    // Clean up object URL
    URL.revokeObjectURL(photos[index].preview);
    onPhotosChange(updatedPhotos);
  };

  const updateDescription = (index: number, description: string) => {
    const updatedPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
    onPhotosChange(updatedPhotos);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Controls */}
      {canAddMore && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1D6FA3] text-white rounded-lg hover:bg-[#1a5f8a] transition-colors"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#1D6FA3] text-[#1D6FA3] rounded-lg hover:bg-[#1D6FA3] hover:text-white transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Camera Interface */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-[#1D6FA3] transition-colors"
              >
                <div className="w-full h-full bg-[#1D6FA3] rounded-full transform scale-75 hover:scale-90 transition-transform" />
              </button>
              
              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Uploaded Photos ({photos.length}/{maxPhotos})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="relative">
                  <img
                    src={photo.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={photo.description}
                    onChange={(e) => updateDescription(index, e.target.value)}
                    placeholder="Describe what this photo shows (e.g., location of pain, visible symptoms, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent resize-none"
                    rows={2}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {photo.description.length}/200 characters
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Photo Guidelines:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Photos are optional but can help with diagnosis</li>
              <li>• Take clear, well-lit photos of the affected area</li>
              <li>• Maximum {maxPhotos} photos, {maxFileSize}MB each</li>
              <li>• Photos will be securely shared with your healthcare provider</li>
              <li>• Add descriptions to help explain what each photo shows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
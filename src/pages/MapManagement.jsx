import React, { useState, useEffect } from "react";
import { Device } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Map, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function MapManagement() {
  const [devices, setDevices] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const devicesData = await Device.list();
    setDevices(devicesData);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const uploadMap = async (deviceId) => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file: selectedFile });
      
      await Device.update(deviceId, {
        current_map: file_url
      });
      
      loadDevices();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Map Management
          </h1>
          <p className="text-gray-600 text-lg">
            Upload and distribute maps to hotel tablets
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  Upload New Map
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="mapFile">Select Map File</Label>
                  <Input
                    id="mapFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported: PNG, JPG, PDF files
                  </p>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <img 
                      src={previewUrl} 
                      alt="Map preview" 
                      className="max-w-full h-48 object-contain mx-auto rounded"
                    />
                  </div>
                )}

                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Ready to Deploy
                    </h4>
                    <p className="text-blue-700 text-sm">
                      File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Device List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-6 h-6" />
                  Deploy to Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div 
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50"
                    >
                      <div>
                        <h4 className="font-semibold">{device.device_name}</h4>
                        <p className="text-sm text-gray-600">{device.location}</p>
                        {device.current_map && (
                          <div className="flex items-center gap-2 mt-1">
                            <Eye className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600">Map loaded</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {device.current_map && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(device.current_map, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => uploadMap(device.id)}
                          disabled={!selectedFile || isUploading}
                          size="sm"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              Deploy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {devices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No devices available</p>
                      <p className="text-sm">Add devices in the Admin Dashboard first</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
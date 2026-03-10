import React, { useState, useEffect } from "react";
import { PaymentInstruction, Device } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Send, History, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function PaymentSystem() {
  const [devices, setDevices] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [devicesData, instructionsData] = await Promise.all([
      Device.list(),
      PaymentInstruction.list('-created_date', 20)
    ]);
    
    setDevices(devicesData);
    setInstructions(instructionsData);
  };

  const sendPaymentInstruction = async (e) => {
    e.preventDefault();
    if (!selectedDevice || !amount || !description) return;

    setIsSending(true);
    try {
      await PaymentInstruction.create({
        device_id: selectedDevice,
        amount: parseFloat(amount),
        description,
        status: "sent"
      });

      // Reset form
      setAmount("");
      setDescription("");
      loadData();
    } catch (error) {
      console.error('Error sending payment instruction:', error);
    }
    setIsSending(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.device_name} (${device.location})` : deviceId;
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
            Payment System
          </h1>
          <p className="text-gray-600 text-lg">
            Send payment instructions to guest tablets remotely
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Send Payment Instruction */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Send Payment Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendPaymentInstruction} className="space-y-6">
                  <div>
                    <Label htmlFor="device">Target Device</Label>
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.filter(d => d.status === 'online').map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.device_name} - {device.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Room service charges, spa treatments, etc."
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isSending || !selectedDevice || !amount || !description}
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Payment Request
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
                  <p className="text-sm text-amber-700">
                    This interface sends payment instructions to the tablet. 
                    Integration with actual payment processing devices requires 
                    additional hardware-specific APIs and configurations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Recent Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {instructions.map((instruction, index) => (
                    <motion.div
                      key={instruction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-lg">
                            ${instruction.amount.toFixed(2)}
                          </span>
                        </div>
                        <Badge className={getStatusColor(instruction.status)}>
                          {instruction.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{instruction.description}</p>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Device: {getDeviceName(instruction.device_id)}</div>
                        <div>
                          Sent: {new Date(instruction.created_date).toLocaleString()}
                        </div>
                        {instruction.transaction_reference && (
                          <div>Ref: {instruction.transaction_reference}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {instructions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No payment instructions sent yet</p>
                      <p className="text-sm">Sent instructions will appear here</p>
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
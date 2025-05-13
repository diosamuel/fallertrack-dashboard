import React, { useState } from "react";
// import { IconHeart } from '@tabler/icons-react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Alert, Snackbar } from '@mui/material';

interface PersonCardProps {
  onSOSStatusChange: (status: boolean) => void;
  isSOSActive: boolean;
}

export default function PersonCard({ onSOSStatusChange, isSOSActive }: PersonCardProps) {
  const [notifyAlert, setNotifyAlert] = useState(false);
  const [sosAlert, setSosAlert] = useState(false);
  
  // Dummy data for the last 7 days
  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stepsData = [4500, 5200, 3800, 6000, 4800, 3500, 4200];
  const heartRateData = [75, 82, 78, 85, 80, 88, 76];

  const handleSOSClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = !isSOSActive;
    console.log("SOS button clicked, new status:", newStatus);
    setSosAlert(true);
    onSOSStatusChange(newStatus);
  };

  const handleCloseNotify = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log("Closing notify alert", reason);
    setNotifyAlert(false);
  };

  const handleCloseSOS = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log("Closing SOS alert", reason);
    setSosAlert(false);
  };

  return (
    <div className="w-full md:w-[500px]">
      {/* Profile */}
      {/* name of each tab group should be unique */}
      <div role="tablist" className="tabs tabs-boxed w-full">
        <input type="radio" name="my_tabs_3" className="tab flex-1" aria-label="Person" defaultChecked/>
        <div className="tab-content border-base-300 p-6">
          <div className="flex items-center gap-4 mb-2">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Linda Nasution" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
            <div>
              <div className="font-semibold text-lg">Timotius Prayoga Gultom</div>
              <div className="flex gap-2 mt-1">
                {/* <span className="badge badge-neutral gap-1"><IconHeart size={16} className="text-red-500" /> 80 years</span> */}
                {/* <span className="badge badge-neutral gap-1"><IconHeart size={16} className="text-red-500" /> Alzheimer</span> */}
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="mt-2">
            <div className="font-semibold mb-1">Deskripsi</div>
            <div className="text-sm text-white leading-snug">
              Memakai Baju Putih
            </div>
          </div>
          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <button 
              type="button"
              onClick={handleSOSClick}
              className={`btn btn-block border-none cursor-pointer transition-colors duration-200 ${
                isSOSActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              {isSOSActive ? 'Nonaktifkan SOS' : 'Aktifkan SOS'}
            </button>
          </div>
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Activity"  />
        <div className="tab-content border-base-300 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Daily Steps</h3>
              <div className="h-[200px] w-full">
                <LineChart
                  series={[
                    {
                      data: stepsData,
                      label: 'Steps',
                      color: '#4CAF50',
                    },
                  ]}
                  xAxis={[{ scaleType: 'point', data: dates }]}
                  height={200}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Heart Rate</h3>
              <div className="h-[200px] w-full">
                <LineChart
                  series={[
                    {
                      data: heartRateData,
                      label: 'BPM',
                      color: '#F44336',
                    },
                  ]}
                  xAxis={[{ scaleType: 'point', data: dates }]}
                  height={200}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialogs */}
      <Snackbar 
        open={notifyAlert} 
        autoHideDuration={6000} 
        onClose={handleCloseNotify}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: '5rem !important' }}
      >
        <Alert 
          onClose={handleCloseNotify} 
          severity="info" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          Notifikasi telah dikirim ke lansia untuk kembali ke panti
        </Alert>
      </Snackbar>

      <Snackbar 
        open={sosAlert} 
        autoHideDuration={6000} 
        onClose={handleCloseSOS}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: '5rem !important' }}
      >
        <Alert 
          onClose={handleCloseSOS} 
          severity={isSOSActive ? "error" : "success"}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {isSOSActive 
            ? "SOS Alert telah dikirim! Tim medis sedang dalam perjalanan"
            : "SOS Alert telah dinonaktifkan"}
        </Alert>
      </Snackbar>
    </div>
  );
} 
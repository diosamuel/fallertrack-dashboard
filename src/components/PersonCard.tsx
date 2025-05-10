import React from "react";
// import { IconHeart } from '@tabler/icons-react';
export default function PersonCard() {
  return (
    <div className="w-[500px]">
      {/* Profile */}
      {/* name of each tab group should be unique */}
      <div role="tablist" className="tabs tabs-boxed w-full">
        <input type="radio" name="my_tabs_3" className="tab flex-1" aria-label="Person" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <div className="flex items-center gap-4 mb-2">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Linda Nasution" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
            <div>
              <div className="font-semibold text-lg">Linda Nasution</div>
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
            <button className="btn btn-block bg-black text-white hover:bg-gray-800 border-none">Notify Back Home</button>
            <button className="btn btn-block bg-gray-100 text-black hover:bg-gray-200 border-none">SOS</button>
          </div>
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Activity" defaultChecked />
        <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>
      </div>

    </div>
  );
} 
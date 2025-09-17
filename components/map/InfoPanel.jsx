import { X } from 'lucide-react';
import Link from 'next/link'; // 1. Import the Link component

export default function InfoPanel({ selectedLocation, onClose }) {
  if (!selectedLocation) return null;

  const slug = selectedLocation.name.toLowerCase().replace(/\s+/g, '-');
  const arLink = `/ar/${slug}`;
  const vrLink = `/vr/${slug}`;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 max-w-md mx-auto flex gap-4 items-center">
      <img src={selectedLocation.image} alt={selectedLocation.name} className="w-20 h-20 rounded-lg object-cover" />
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">{selectedLocation.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500">{selectedLocation.description}</p>
        <div className="mt-3 flex gap-3">
          {/* 2. Replace <a> with <Link> and use the `href` prop */}
          <Link href={arLink} className="flex-1 text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold">
            AR
          </Link>
          <Link href={vrLink} className="flex-1 text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all font-semibold">
            VR
          </Link>
        </div>
      </div>
    </div>
  );
}
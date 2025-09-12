"use client"
import React, { useState } from 'react';

type Props = {
  colors: string[];          // array of hex strings: ['#FF0000', '#00FF00', …]
};

const ColorPalette: React.FC<Props> = ({ colors }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (hex: string) =>
    setSelected(prev =>
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    );

  return (
    <div className='flex-1 p-2'>
        <p className='text-gray-400 text-xs text-center font-light'>Available Color Palette</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',   
          overflowY: 'auto',
          padding:10
        }}
      >
        {colors.map((hex, i) => (
          <div
            key={i}
            onClick={() => toggle(hex)}
            style={{
                borderRadius:"50%",
              backgroundColor: hex,
              opacity:selected.includes(hex)
                ? 1       
                : 0.35,
              width: '100%',
              paddingBottom: '100%',          
              cursor: 'pointer',
              border: selected.includes(hex)
                ? '1px solid black'         
                : '1px solid #ccc',
              scale:selected.includes(hex)
                ? '0.92'         
                : '1'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;

import React from 'react';

const ChoroplethLegend = ({ colorScale, breaks }) => {
  if (!Array.isArray(breaks) || breaks.length < 2) return null;

  const width = 160;
  const height = 20;
  const itemWidth = width / (breaks.length - 1);

  return (
    <div style={{
      backgroundColor: '#1c1c1c',
      padding: '10px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '12px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      minWidth: width + 20
    }}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>EV-to-Charger Ratio</div>
      <svg width={width} height={height + 15}>
        {breaks.slice(0, -1).map((b, i) => (
          <g key={i} transform={`translate(${i * itemWidth}, 0)`}>
            <rect width={itemWidth} height={height} fill={colorScale(i)} />
            <text x={itemWidth / 2} y={height + 12} fontSize={8} textAnchor="middle" fill="#fff">
              {parseFloat(b).toFixed(1)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ChoroplethLegend;

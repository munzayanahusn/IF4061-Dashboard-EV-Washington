import React from 'react';

const BivariateLegend = ({ bivariateColorScale }) => {
  const squareSize = 15;
  const spacing = 0;
  
  return (
    <g>
      {/* 3x3 Grid of squares */}
      <g>
        {/* Top row (High Station count) */}
        <rect x={0} y={0} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('0-2')} stroke="none" />
        <rect x={squareSize} y={0} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('1-2')} stroke="none" />
        <rect x={2 * squareSize} y={0} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('2-2')} stroke="none" />
        
        {/* Middle row */}
        <rect x={0} y={squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('0-1')} stroke="none" />
        <rect x={squareSize} y={squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('1-1')} stroke="none" />
        <rect x={2 * squareSize} y={squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('2-1')} stroke="none" />
        
        {/* Bottom row */}
        <rect x={0} y={2 * squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('0-0')} stroke="none" />
        <rect x={squareSize} y={2 * squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('1-0')} stroke="none" />
        <rect x={2 * squareSize} y={2 * squareSize} width={squareSize} height={squareSize} 
              fill={bivariateColorScale('2-0')} stroke="none" />
      </g>
      
      {/* Vertical arrow and label (Station) */}
      <g transform={`translate(0, ${squareSize * 1.5})`}>
        <path d="M0,-27 L0,22 M-3,-25 L0,-28 L3,-25" stroke="#fff" strokeWidth={1.5} fill="none"/>
      </g>
      
      {/* Horizontal arrow and label (EV) */}
      <g transform={`translate(${squareSize * 1.5}, ${3 * squareSize})`}>
        <path d="M-23,0 L26,0 M24,-3 L27,0 L24,3" stroke="#fff" strokeWidth={1.5} fill="none"/>
      </g>
      
      {/* Station label (vertical) */}
      <text x={-25} y={squareSize * 2.5} fontSize="10" fill="#fff" textAnchor="middle" 
            transform={`rotate(-90, -25, ${squareSize * 1.5})`} fontWeight="normal">
        Station
      </text>
      
      {/* EV label (horizontal) */}
      <text x={squareSize * 1.5} y={3 * squareSize + 15} fontSize="10" fill="#fff" 
            textAnchor="middle" fontWeight="normal">
        EV
      </text>
    </g>
  );
};

export default BivariateLegend;
import React from 'react';

const ChoroplethLegendVert = ({ colorScale, breaks, selectedClass = null }) => {
  if (!Array.isArray(breaks) || breaks.length < 2) return null;

  const classLabels = breaks.slice(0, -1).map((_, i) => {
    const breaks_from = (i == 0)? breaks[i] : breaks[i] + 0.01
    const from = parseFloat(breaks_from).toFixed(2);
    const to = parseFloat(breaks[i + 1]).toFixed(2);
    return { label: `${from}–${to}`, from, to };
  });

  const minValue = parseFloat(breaks[0]).toFixed(2);
  const maxValue = parseFloat(breaks[breaks.length - 1]).toFixed(2);

  return (
    <div
      style={{
        backgroundColor: '#1c1c1c',
        padding: '6px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        width: 'fit-content',
        minWidth: 100
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: '10px' }}>
        EV-to-Charger<br />Ratio
      </div>

      <div style={{ marginBottom: 4, color: '#aaa', fontSize: '9px' }}>
        Min: {minValue}
      </div>

      {classLabels.map(({ label }, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
            padding: selectedClass === i ? '3px 4px' : '0',
            backgroundColor: selectedClass === i ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderRadius: '4px'
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: colorScale(i),
              border: '1px solid #666',
              marginRight: 6,
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: '9px' }}>{label}</span>
        </div>
      ))}

      <div style={{ marginTop: 2, color: '#aaa', fontSize: '9px' }}>
        Max: {maxValue}
      </div>
    </div>
  );
};

export default ChoroplethLegendVert;

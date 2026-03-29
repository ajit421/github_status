const themes = {
  default: { bg: '#fff', text: '#333', ring: '#2f81f7', fire: '#e05344', border: '#e4e2e2', currStreak: '#0969da', side: '#151515' },
  dark: { bg: '#0d1117', text: '#fff', ring: '#2f81f7', fire: '#e05344', border: '#e4e2e2', currStreak: '#2f81f7', side: '#fff' },
  tokyonight: { bg: '#1a1b26', text: '#7aa2f7', ring: '#70a5fd', fire: '#ff9e64', border: '#1a1b26', currStreak: '#70a5fd', side: '#9aa5ce' },
  radical: { bg: '#141321', text: '#a9fef7', ring: '#fe428e', fire: '#fe428e', border: '#141321', currStreak: '#fe428e', side: '#a9fef7' },
};

const renderStreakCard = (streakData = {}, options = {}) => {
  const { totalContributions = 0, currentStreak = 0, longestStreak = 0 } = streakData;
  const { theme = 'default', hide_border = 'false' } = options;

  const t = { ...themes.default, ...themes[theme] };
  const border = hide_border === 'true' ? 'none' : t.border;

  // Animation for ring
  const circumference = 2 * Math.PI * 40;
  // Cap percentage at 100% for the ring
  const percentage = longestStreak > 0 ? Math.min(1, currentStreak / longestStreak) : 0;
  const offset = circumference - (percentage * circumference);

  return `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .stat-label { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.text}; }
        .stat-value { font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.side || t.text}; }
        .curr-streak-value { font: 800 36px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.currStreak}; }
        .curr-streak-label { font: 700 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.fire}; text-transform: uppercase; letter-spacing: 0.5px; }
        
        @keyframes ring {
          from { stroke-dashoffset: ${circumference}; }
          to { stroke-dashoffset: ${offset}; }
        }
        
        .ring-circle {
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference};
          animation: ring 1s ease-out forwards;
        }
        
        @keyframes fire-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .fire-icon { 
            animation: fire-pulse 2s infinite ease-in-out; 
            transform-origin: center;
            transform-box: fill-box;
        }
      </style>
      
      <rect x="0.5" y="0.5" width="494" height="194" rx="4.5" fill="${t.bg}" stroke="${border}" stroke-opacity="${hide_border === 'true' ? '0' : '1'}"/>

      <!-- Left: Total Contributions -->
      <g transform="translate(80, 85)" text-anchor="middle">
        <text y="0" class="stat-value">${totalContributions}</text>
        <text y="25" class="stat-label" font-size="12">Total Contributions</text>
      </g>
      
      <!-- Separator Left -->
      <line x1="165" y1="40" x2="165" y2="155" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

      <!-- Center: Current Streak Ring -->
      <g transform="translate(247.5, 97.5)">
        <!-- Fire Icon (Centered top of ring) -->
         <g transform="translate(0, -65)">
             <path class="fire-icon" d="M -6 12 Q 0 0 6 12 Q 12 24 0 30 Q -12 24 -6 12 M 0 30 C -8 20 -8 10 0 0 C 8 10 8 20 0 30" fill="${t.fire}" opacity="0.9" transform="scale(1.2)"/>
             <path class="fire-icon" d="M10.875 1.763c-.02.433-.315.823-.538 1.144-.805 1.155-1.92 1.996-2.913 2.993-.997 1.001-1.742 2.215-1.896 3.655-.078.718.069 1.341.317 1.914.3.693.81 1.258 1.378 1.73.064.053.155.104.22.02.062-.082-.008-.184-.047-.26-.713-1.396-.1-2.923.774-4.135.251-.349.529-.687.828-1.002.825-.87 1.636-1.764 2.126-2.883.257-.588.368-1.226.315-1.867-.015-.178-.041-.354-.076-.528-.016-.082-.128-.052-.164.02-.07.135-.125.292-.224.399zm-4.75 3.52c.006.184.055.362.115.534.225.642.668 1.154 1.168 1.618.596.554 1.272.986 2.038 1.218.423.128.868.182 1.309.183.178 0 .438-.013.564-.15.111-.121.084-.33.024-.486-.41-1.077-1.278-1.777-2.127-2.483-.497-.413-1.096-.913-1.428-1.487-.193-.334-.316-.704-.372-1.085-.018-.124-.183-.16-.23-.046-.388.948-.962 1.838-1.061 2.921z" fill="${t.fire}" transform="translate(-6.5, -28) scale(1.3)"/>
         </g>
        
        <circle r="50" stroke="${t.border}" stroke-width="4" fill="none" opacity="0.3"/>
        <circle r="50" stroke="${t.ring}" stroke-width="6" fill="none" class="ring-circle" transform="rotate(-90)"/>
        
        <text x="0" y="8" text-anchor="middle" class="curr-streak-value">${currentStreak}</text>
        <text x="0" y="70" text-anchor="middle" class="curr-streak-label" font-size="14">Current Streak</text>
      </g>
      
      <!-- Separator Right -->
      <line x1="330" y1="40" x2="330" y2="155" stroke="${t.border}" stroke-width="1" opacity="0.5"/>

      <!-- Right: Longest Streak -->
      <g transform="translate(415, 85)" text-anchor="middle">
        <text y="0" class="stat-value">${longestStreak}</text>
        <text y="25" class="stat-label">Longest Streak</text>
      </g>

    </svg>
    `;
};

module.exports = renderStreakCard;

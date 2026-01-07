// Theme Switcher Component
import React from 'react';

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { value: 'default', label: '🌙 Default' },
    { value: 'space-odyssey', label: '🚀 Space Odyssey' },
    { value: 'solar-flare', label: '☀️ Solar Flare' },
    { value: 'ghibli', label: '🌸 Studio Ghibli' }
  ];

  return (
    <div className="theme-switcher" style={{ display: 'flex', gap: '10px', padding: '10px' }}>
      {themes.map(theme => (
        <button
          key={theme.value}
          onClick={() => onThemeChange(theme.value)}
          className={currentTheme === theme.value ? 'active' : ''}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: currentTheme === theme.value ? '2px solid #4CAF50' : '1px solid #ccc',
            background: currentTheme === theme.value ? '#4CAF50' : '#fff',
            color: currentTheme === theme.value ? '#fff' : '#000',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
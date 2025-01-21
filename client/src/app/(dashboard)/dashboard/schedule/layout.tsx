import React from 'react';

const ScheduleLayout: React.FC = ({ children }) => {
    return (
        <div style={{ height: '100vh' }}>
            {children}
        </div>
    );
};

export default ScheduleLayout;
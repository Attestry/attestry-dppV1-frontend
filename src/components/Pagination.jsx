import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const btnBase = {
        padding: '8px 14px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '10px',
        border: '1px solid #E2E8F0', background: 'white', color: '#4A5568',
        cursor: 'pointer', transition: 'all 0.2s', minWidth: '38px', textAlign: 'center'
    };
    const btnActive = {
        ...btnBase, background: '#1A4D3B', color: 'white', border: '1px solid #1A4D3B', fontWeight: '700'
    };
    const btnDisabled = {
        ...btnBase, opacity: 0.4, cursor: 'default', pointerEvents: 'none'
    };

    const visiblePages = getVisiblePages();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '28px' }}>
            <button
                style={currentPage === 1 ? btnDisabled : btnBase}
                onClick={() => onPageChange(currentPage - 1)}
                onMouseEnter={e => { if (currentPage > 1) e.currentTarget.style.background = '#F0F9F4'; }}
                onMouseLeave={e => { if (currentPage > 1) e.currentTarget.style.background = 'white'; }}
            >
                ‹
            </button>

            {visiblePages[0] > 1 && (
                <>
                    <button style={btnBase} onClick={() => onPageChange(1)}>1</button>
                    {visiblePages[0] > 2 && <span style={{ color: '#A0AEC0', fontSize: '0.85rem', padding: '0 4px' }}>···</span>}
                </>
            )}

            {visiblePages.map(page => (
                <button
                    key={page}
                    style={page === currentPage ? btnActive : btnBase}
                    onClick={() => onPageChange(page)}
                    onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.background = '#F0F9F4'; }}
                    onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.background = 'white'; }}
                >
                    {page}
                </button>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span style={{ color: '#A0AEC0', fontSize: '0.85rem', padding: '0 4px' }}>···</span>}
                    <button style={btnBase} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                style={currentPage === totalPages ? btnDisabled : btnBase}
                onClick={() => onPageChange(currentPage + 1)}
                onMouseEnter={e => { if (currentPage < totalPages) e.currentTarget.style.background = '#F0F9F4'; }}
                onMouseLeave={e => { if (currentPage < totalPages) e.currentTarget.style.background = 'white'; }}
            >
                ›
            </button>

            <span style={{ fontSize: '0.8rem', color: '#A0AEC0', marginLeft: '12px' }}>
                {currentPage} / {totalPages}
            </span>
        </div>
    );
};

export default Pagination;

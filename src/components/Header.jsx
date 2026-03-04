import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ClipboardList, Key, Camera, FolderOpen, Settings } from '../components/Icons';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useDPPStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    if (location.pathname.startsWith('/p/')) {
        return null;
    }

    const NavItem = ({ path, label, icon, accentColor, borderStyle, mobile }) => (
        <button
            onClick={() => { navigate(path); setMobileOpen(false); }}
            style={{
                padding: mobile ? '12px 20px' : '8px 16px',
                borderRadius: '10px',
                border: borderStyle || 'none',
                background: isActive(path)
                    ? 'linear-gradient(135deg, rgba(26, 77, 59, 0.08), rgba(107, 76, 154, 0.06))'
                    : 'transparent',
                color: isActive(path) ? '#1A4D3B' : (accentColor || '#64748B'),
                fontSize: mobile ? '0.95rem' : '0.85rem',
                fontWeight: isActive(path) ? '700' : '600',
                cursor: 'pointer',
                fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '-0.01em',
                width: mobile ? '100%' : 'auto',
                textAlign: 'left',
                justifyContent: mobile ? 'flex-start' : 'center'
            }}
            onMouseEnter={e => {
                if (!isActive(path)) {
                    e.currentTarget.style.background = 'rgba(26, 77, 59, 0.04)';
                    e.currentTarget.style.color = '#1A4D3B';
                }
            }}
            onMouseLeave={e => {
                if (!isActive(path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = accentColor || '#64748B';
                }
            }}
        >
            {icon && <span style={{ fontSize: mobile ? '1.1rem' : '0.9rem', display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {label}
        </button>
    );

    const navItems = (mobile = false) => (
        <>
            {currentUser?.role === 'ADMIN' ? (
                <>
                    <NavItem path="/admin/approval" label="서비스 관리" icon={<Settings width={16} height={16} />} accentColor="#E53E3E" borderStyle="1px solid rgba(229, 62, 62, 0.2)" mobile={mobile} />
                    <NavItem path="/admin/users" label="가입 승인" icon={<ClipboardList width={16} height={16} />} accentColor="#6B4C9A" borderStyle="1px solid rgba(107, 76, 154, 0.2)" mobile={mobile} />
                </>
            ) : (
                <>
                    {currentUser?.role === 'RETAIL' && (
                        <NavItem path="/retail/issue-claim" label="클레임 발급" icon={<ClipboardList width={16} height={16} />} mobile={mobile} />
                    )}
                    <NavItem path="/claim-entry" label="소유권 이전" icon={<Key width={16} height={16} />} mobile={mobile} />
                    <NavItem path="/register" label="소유권 직접 등록" icon={<Camera width={16} height={16} />} mobile={mobile} />
                    <NavItem path="/me/passports" label="디지털 자산 지갑" icon={<FolderOpen width={16} height={16} />} mobile={mobile} />
                </>
            )}
        </>
    );

    return (
        <>
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 200,
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                padding: '0 24px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
            }}>
                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'opacity 0.2s',
                        flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 3L31 8.5V18C31 25.5 25 31.5 18 34C11 31.5 5 25.5 5 18V8.5Z" fill="url(#shieldGradHeader)"/>
                        <path d="M12.5 18.5L16.5 22.5L24 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                            <linearGradient id="shieldGradHeader" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#1A4D3B"/>
                                <stop offset="100%" stopColor="#6B4C9A"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div>
                        <div style={{
                            fontSize: '1.1rem', fontWeight: '800', color: '#102A20',
                            letterSpacing: '-0.02em', lineHeight: '1'
                        }}>
                            ATTESTRY
                            <span style={{
                                color: '#6B4C9A', marginLeft: '6px', fontWeight: '700', fontSize: '0.85rem'
                            }}>DPP</span>
                        </div>
                    </div>
                </div>

                {/* Separator - desktop only */}
                <div className="desktop-only" style={{ width: '1px', height: '28px', background: 'rgba(0,0,0,0.08)', margin: '0 6px', flexShrink: 0 }}></div>

                {/* Desktop Navigation */}
                <nav className="desktop-only" style={{
                    display: 'flex',
                    gap: '2px',
                    alignItems: 'center',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    {navItems(false)}
                </nav>

                {/* Desktop Right Section */}
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {currentUser && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '10px',
                            background: 'rgba(26, 77, 59, 0.04)',
                            border: '1px solid rgba(26, 77, 59, 0.08)'
                        }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1A4D3B, #6B4C9A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '0.65rem', fontWeight: '800'
                            }}>
                                {currentUser.email?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4A5568' }}>
                                {currentUser.email?.split('@')[0]}
                            </span>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: '700', color: '#6B4C9A',
                                background: 'rgba(107, 76, 154, 0.08)', padding: '2px 8px', borderRadius: '6px'
                            }}>
                                {currentUser.role}
                            </span>
                        </div>
                    )}

                    {!currentUser ? (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '9px 20px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                color: 'white', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                                fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
                                boxShadow: '0 2px 8px rgba(26, 77, 59, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            로그인
                        </button>
                    ) : (
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            style={{
                                padding: '8px 16px', borderRadius: '10px',
                                border: '1px solid rgba(220, 38, 38, 0.15)',
                                background: 'transparent', color: '#DC2626',
                                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                                fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
                                transition: 'all 0.2s'
                            }}
                        >
                            로그아웃
                        </button>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <div style={{ marginLeft: 'auto', flexShrink: 0 }} className="mobile-only">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '8px', display: 'flex', flexDirection: 'column',
                            gap: '5px', justifyContent: 'center', alignItems: 'center'
                        }}
                        aria-label="메뉴 열기"
                    >
                        <span style={{
                            width: '22px', height: '2px', background: '#102A20', borderRadius: '2px',
                            transition: 'all 0.3s',
                            transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none'
                        }} />
                        <span style={{
                            width: '22px', height: '2px', background: '#102A20', borderRadius: '2px',
                            transition: 'all 0.3s',
                            opacity: mobileOpen ? 0 : 1
                        }} />
                        <span style={{
                            width: '22px', height: '2px', background: '#102A20', borderRadius: '2px',
                            transition: 'all 0.3s',
                            transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
                        }} />
                    </button>
                </div>
            </header>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="mobile-only" style={{
                    position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
                    zIndex: 199,
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    overflowY: 'auto',
                    animation: 'slideDown 0.25s ease-out'
                }}>
                    {currentUser && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', marginBottom: '8px',
                            background: 'rgba(26, 77, 59, 0.04)', borderRadius: '12px',
                            border: '1px solid rgba(26, 77, 59, 0.08)'
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1A4D3B, #6B4C9A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '0.8rem', fontWeight: '800'
                            }}>
                                {currentUser.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#102A20' }}>
                                    {currentUser.email?.split('@')[0]}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6B4C9A', fontWeight: '600' }}>
                                    {currentUser.role}
                                </div>
                            </div>
                        </div>
                    )}

                    {navItems(true)}

                    <div style={{ height: '1px', background: '#E2E8F0', margin: '12px 0' }} />

                    {!currentUser ? (
                        <button
                            onClick={() => { navigate('/login'); setMobileOpen(false); }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                color: 'white', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                                fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
                            }}
                        >
                            로그인
                        </button>
                    ) : (
                        <button
                            onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                                background: '#FFF5F5', color: '#DC2626',
                                fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                                fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
                            }}
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

export default Header;

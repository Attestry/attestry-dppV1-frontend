import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { label: '서비스 소개', path: '/' },
        { label: '디지털 자산 지갑', path: '/me/passports' },
        { label: '소유권 직접 등록', path: '/register' },
    ];

    if (location.pathname.startsWith('/p/')) {
        return null;
    }

    return (
        <footer style={{
            background: 'linear-gradient(180deg, #FAFCFB 0%, #F0F4F2 100%)',
            borderTop: '1px solid #E2E8F0',
            padding: '48px 24px 32px',
            marginTop: '60px'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Top section */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '40px', marginBottom: '32px'
                }}>
                    {/* Brand */}
                    <div style={{ minWidth: '220px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', color: 'white', fontWeight: '900'
                            }}>A</div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#102A20', letterSpacing: '-0.02em' }}>
                                ATTESTRY DPP
                            </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#718096', lineHeight: '1.6', margin: 0, maxWidth: '350px' }}>
                            위변조가 불가능한 보안 원장(Ledger) 시스템으로<br />
                            제조부터 소유까지 완벽하게 보증합니다.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', margin: '0 0 12px 0' }}>
                                서비스
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {footerLinks.map(link => (
                                    <span
                                        key={link.path}
                                        onClick={() => navigate(link.path)}
                                        style={{
                                            fontSize: '0.9rem', color: location.pathname === link.path ? '#1A4D3B' : '#4A5568',
                                            cursor: 'pointer', fontWeight: location.pathname === link.path ? '600' : '400',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#1A4D3B'}
                                        onMouseLeave={e => e.currentTarget.style.color = location.pathname === link.path ? '#1A4D3B' : '#4A5568'}
                                    >
                                        {link.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', margin: '0 0 12px 0' }}>
                                정책
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>이용약관</span>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>개인정보처리방침</span>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>원장 데이터 정책</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', margin: '0 0 12px 0' }}>
                                보안
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>SHA-256 해시 체인</span>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>JWT 인증 기반</span>
                                <span style={{ fontSize: '0.9rem', color: '#4A5568', cursor: 'default' }}>HTTPS 암호화 전송</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #CBD5E0 50%, transparent 100%)', marginBottom: '24px' }} />

                {/* Bottom */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '12px'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#A0AEC0', lineHeight: '1.6' }}>
                        © {currentYear} Attestry DPP. All rights reserved.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#A0AEC0' }}>
                        <span>Developed by</span>
                        <span style={{ fontWeight: '700', color: '#718096' }}>김선욱</span>
                        <span>·</span>
                        <span style={{ fontWeight: '700', color: '#718096' }}>김민영</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

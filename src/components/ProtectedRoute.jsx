import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useDPPStore();
    const location = useLocation();
    const navigate = useNavigate();

    // If a user is logged in
    if (currentUser) {
        // If roles are specified and the user's role is not in the array, redirect them
        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
            // Redirect Admins to admin page, Brands to brand page, else to their wallet
            if (currentUser.role === 'ADMIN') return <Navigate to="/admin/approval" replace />;
            if (currentUser.role === 'BRAND') return <Navigate to="/brand/mint" replace />;
            return <Navigate to="/me/passports" replace />;
        }
        return children;
    }

    // If no user is logged in, show the premium "Access Denied" UI
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FAFCFB',
            backgroundImage: `
                radial-gradient(circle at 50% 10%, rgba(139, 115, 186, 0.08), transparent 30%),
                radial-gradient(circle at 10% 80%, rgba(20, 60, 48, 0.05), transparent 30%),
                radial-gradient(circle at 90% 50%, rgba(162, 133, 222, 0.06), transparent 40%)
            `,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#1A1D20',
            zIndex: 50,
            padding: '24px'
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '32px',
                padding: '50px 40px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                border: '1px solid rgba(26, 77, 59, 0.08)',
                textAlign: 'center',
                maxWidth: '460px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background glow inside card */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(107,76,154,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    fontSize: '3.5rem',
                    marginBottom: '24px',
                    background: 'rgba(107, 76, 154, 0.06)',
                    width: '90px',
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '24px',
                    color: '#6B4C9A',
                    boxShadow: 'inset 0 4px 10px rgba(107, 76, 154, 0.04)'
                }}>
                    🔒
                </div>

                <h2 style={{
                    fontSize: '1.6rem',
                    fontWeight: '800',
                    color: '#102A20',
                    marginBottom: '16px',
                    letterSpacing: '-0.02em'
                }}>
                    로그인이 필요한 서비스입니다
                </h2>

                <p style={{
                    fontSize: '1.05rem',
                    color: '#4A5568',
                    lineHeight: '1.6',
                    marginBottom: '36px'
                }}>
                    해당 페이지에 접근하거나 기능을 이용하려면<br />
                    먼저 <strong>내 패스포트 라운지</strong>에 입장해야 합니다.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    width: '100%'
                }}>
                    <button
                        onClick={() => navigate(`/login?return=${encodeURIComponent(location.pathname + location.search)}`)}
                        style={{
                            padding: '16px 24px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(26, 77, 59, 0.2)',
                            transition: 'all 0.3s ease',
                            width: '100%'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(26, 77, 59, 0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 77, 59, 0.2)'; }}
                    >
                        로그인하러 가기
                    </button>

                    <button
                        onClick={() => navigate('/signup')}
                        style={{
                            padding: '16px 24px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '16px',
                            background: '#FFFFFF',
                            color: '#6B4C9A',
                            border: '2px solid rgba(139, 115, 186, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139, 115, 186, 0.04)'; e.currentTarget.style.borderColor = 'rgba(139, 115, 186, 0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(139, 115, 186, 0.2)'; }}
                    >
                        회원가입하러 가기
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '12px',
                            padding: '12px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            background: 'transparent',
                            color: '#A0AEC0',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#4A5568'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#A0AEC0'; }}
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { useIsMobile } from '../hooks/useIsMobile';

const Screen2Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('return') || '/me/passports';
    const { currentUser, login } = useDPPStore();
    const isMobile = useIsMobile();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (currentUser) {
            let target = returnUrl;
            if (currentUser.role === 'ADMIN') target = '/admin/approval';
            else if (currentUser.role === 'BRAND') target = '/brand/mint';
            navigate(target, { replace: true });
        }
    }, [currentUser, navigate, returnUrl]);

    if (currentUser) return null;

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        try {
            await login(email, password);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    return (
        <div style={{ padding: isMobile ? '24px 12px' : '60px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '32px',
                padding: isMobile ? '30px 20px' : '50px 40px',
                width: '100%', maxWidth: '460px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.5s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>패스포트 라운지 입장</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', margin: 0, lineHeight: '1.5' }}>
                        안전한 자산 관리를 위해 로그인해 주세요.
                    </p>
                </div>

                {errorMsg && (
                    <div style={{ padding: '16px', background: '#FFF5F5', color: '#C53030', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #FEB2B2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>⚠️</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div>
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                                fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                            }}
                            onFocus={e => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                                fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                            }}
                            onFocus={e => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%', padding: '18px', borderRadius: '14px', border: 'none', marginTop: '8px',
                            background: 'linear-gradient(135deg, #102A20 0%, #1A4D3B 100%)',
                            color: 'white', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(26, 77, 59, 0.25)', transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        로그인
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => navigate(`/signup?return=${encodeURIComponent(returnUrl)}`)}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px',
                            background: '#FFFFFF', color: '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#F7FAFC'}
                        onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
                    >
                        새로운 계정 생성
                    </button>
                </div>
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Screen2Login;

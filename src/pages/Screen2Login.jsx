import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';

const Screen2Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('return') || '/me/passports';
    const { currentUser, login } = useDPPStore();

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

    const handleLogin = async () => {
        setErrorMsg('');
        if (!email.trim() || !password.trim()) {
            setErrorMsg("이메일과 비밀번호를 정확히 입력해주세요.");
            return;
        }

        try {
            const res = await login(email, password);
            let target = returnUrl;
            if (res && res.role === 'ADMIN') target = '/admin/approval';
            else if (res && res.role === 'BRAND') target = '/brand/mint';
            navigate(target);
        } catch (e) {
            setErrorMsg(e.message);
        }
    };



    return (
        <div style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '32px', padding: '50px 40px', width: '100%', maxWidth: '460px',
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

                {errorMsg ? (
                    <div style={{ padding: '16px', background: '#FFF5F5', color: '#C53030', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #FEB2B2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>⚠️</span> {errorMsg}
                    </div>
                ) : (
                    <div style={{ padding: '16px', background: '#F0F9F4', color: '#2A7258', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #C6F6D5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>ℹ</span> 테스트를 위해 하단의 프리셋 계정을 이용해 보세요.
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                        이메일 (ID)
                    </label>
                    <input
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                            border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                        최고 보안 비밀번호
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                            border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB', letterSpacing: '4px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)', color: 'white',
                            border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 8px 15px rgba(26, 77, 59, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 12px 20px rgba(26, 77, 59, 0.3)'}
                        onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 8px 15px rgba(26, 77, 59, 0.2)'}
                    >
                        로그인
                    </button>

                    <button
                        onClick={() => navigate(`/signup?return=${encodeURIComponent(returnUrl)}`)}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px',
                            background: '#FFFFFF', color: '#4A5568', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F7FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                    >
                        새로운 계정 등록
                    </button>
                </div>
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Screen2Login;

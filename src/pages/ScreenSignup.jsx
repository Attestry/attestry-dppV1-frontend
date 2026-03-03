import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { User } from '../components/Icons';

const ROLE_OPTIONS = [
    { value: 'OWNER', label: '일반 소비자', sub: 'Owner', icon: '👤', color: '#38A169' },
    { value: 'BRAND', label: '브랜드 본사', sub: 'Brand', icon: '🏢', color: '#6B4C9A' },
    { value: 'RETAIL', label: '유통 파트너', sub: 'Retail', icon: '🏪', color: '#3182CE' },
    { value: 'PROVIDER', label: '수선 업체', sub: 'Provider', icon: '🔧', color: '#DD6B20' },
];

const RoleDropdown = ({ role, setRole }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = ROLE_OPTIONS.find(o => o.value === role) || ROLE_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                    border: `1px solid ${open ? '#1A4D3B' : '#E2E8F0'}`, background: '#FAFCFB',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{selected.icon}</span>
                    <span>{selected.label}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                    background: '#FFFFFF', borderRadius: '14px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
                    animation: 'dropdownIn 0.2s ease-out'
                }}>
                    {ROLE_OPTIONS.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => { setRole(opt.value); setOpen(false); }}
                            style={{
                                padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                background: role === opt.value ? '#F0F9F4' : 'transparent',
                                transition: 'background 0.15s',
                                borderLeft: role === opt.value ? `3px solid ${opt.color}` : '3px solid transparent'
                            }}
                            onMouseOver={(e) => { if (role !== opt.value) e.currentTarget.style.background = '#F7FAFC'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = role === opt.value ? '#F0F9F4' : 'transparent'; }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#102A20' }}>{opt.label}</div>
                                <div style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>{opt.sub}</div>
                            </div>
                            {role === opt.value && (
                                <span style={{ marginLeft: 'auto', color: opt.color, fontWeight: '700', fontSize: '0.85rem' }}>✓</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes dropdownIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

const ScreenSignup = () => {
    const navigate = useNavigate();
    const returnUrl = '/me/passports';
    const { signup } = useDPPStore();

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('OWNER');
    const [businessNumber, setBusinessNumber] = useState('');
    const [brandName, setBrandName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const needsApproval = role === 'BRAND' || role === 'RETAIL';

    const validatePassword = (pw) => {
        const minLength = pw.length >= 8;
        const hasUpperCase = /[A-Z]/.test(pw);
        return minLength && hasUpperCase;
    };

    const validateEmail = (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    const validatePhone = (value) => /^010-\d{4}-\d{4}$/.test(value);
    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    const handleSignup = async () => {
        setErrorMsg('');
        if (!email.trim() || !phone.trim() || !password || !confirmPassword) {
            setErrorMsg("모든 필드를 정확하게 입력해주세요.");
            return;
        }

        if (!validateEmail(email.trim())) {
            setErrorMsg("이메일 형식이 올바르지 않습니다.");
            return;
        }

        if (!validatePhone(phone.trim())) {
            setErrorMsg("전화번호 형식은 010-0000-0000 이어야 합니다.");
            return;
        }

        if (needsApproval && !businessNumber.trim()) {
            setErrorMsg("사업자 등록번호를 입력해주세요.");
            return;
        }

        if (role === 'BRAND' && !brandName.trim()) {
            setErrorMsg("브랜드명을 입력해주세요.");
            return;
        }

        if (!validatePassword(password)) {
            setErrorMsg("보안을 위해 비밀번호는 8자 이상, 대문자를 1개 이상 포함해야 합니다.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        try {
            await signup(email, password, role, phone, businessNumber, brandName);
            if (needsApproval) {
                setSuccessMessage({
                    title: "가입 신청 접수 완료",
                    message: "가입 신청이 안전하게 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다. 승인까지 잠시 대기해 주세요."
                });
            } else {
                setSuccessMessage({
                    title: "회원가입 완료 🎉",
                    message: "환영합니다! 개인 금고 생성이 성공적으로 완료되었습니다."
                });
            }
            // Navigation handled by modal button
        } catch (e) {
            console.error("Signup error:", e);
            setErrorMsg(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '32px', padding: '50px 40px', width: '100%', maxWidth: '500px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.5s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '16px' }}><User width={36} height={36} stroke="#6B4C9A" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>새로운 계정 등록</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', margin: 0, lineHeight: '1.5' }}>
                        디지털 자산을 안전하게 관리할 개인 금고를 개설합니다.
                    </p>
                </div>

                {errorMsg && (
                    <div style={{ padding: '16px', background: '#FFF5F5', color: '#C53030', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #FEB2B2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>⚠️</span> {errorMsg}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                        이메일
                    </label>
                    <input
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                            border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            연락처
                        </label>
                        <input
                            type="tel"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={e => setPhone(formatPhone(e.target.value))}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            가입 형태 (역할)
                        </label>
                        <RoleDropdown role={role} setRole={setRole} />
                    </div>
                </div>

                {needsApproval && (
                    <div style={{ padding: '14px 16px', background: '#FFFAF0', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', color: '#C05621', border: '1px solid #FEEBC8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📋</span> 브랜드 및 유통 파트너 계정은 관리자 승인 후 활성화됩니다.
                    </div>
                )}

                {needsApproval && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            사업자 등록번호
                        </label>
                        <input
                            type="text"
                            placeholder="000-00-00000"
                            value={businessNumber}
                            onChange={e => setBusinessNumber(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                )}

                {role === 'BRAND' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            브랜드명
                        </label>
                        <input
                            type="text"
                            placeholder="예: Gucci, Louis Vuitton"
                            value={brandName}
                            onChange={e => setBrandName(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                        보안 비밀번호
                    </label>
                    <input
                        type="password"
                        placeholder="8자 이상 + 대문자 1개 이상 필수"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                            border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB', letterSpacing: '2px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                        보안 비밀번호 확인
                    </label>
                    <input
                        type="password"
                        placeholder="동일한 비밀번호 재입력"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{
                            width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                            border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FAFCFB', letterSpacing: '2px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                            background: loading ? '#A0AEC0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)', color: 'white',
                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'box-shadow 0.2s', boxShadow: loading ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                        }}
                        onMouseOver={(e) => !loading && (e.currentTarget.style.boxShadow = '0 12px 20px rgba(26, 77, 59, 0.3)')}
                        onMouseOut={(e) => !loading && (e.currentTarget.style.boxShadow = '0 8px 15px rgba(26, 77, 59, 0.2)')}
                    >
                        {loading ? '암호화 채널 구축 중...' : '가입하기'}
                    </button>

                    <button
                        onClick={() => navigate(`/login?return=${encodeURIComponent(returnUrl)}`)}
                        style={{
                            width: '100%', padding: '18px', fontSize: '1rem', fontWeight: '700', borderRadius: '14px',
                            background: '#FFFFFF', color: '#4A5568', border: 'none', cursor: 'pointer', textDecoration: 'underline'
                        }}
                    >
                        이미 계정이 있으신가요? 로그인
                    </button>
                </div>
            </div>

            {/* Custom Success Modal */}
            {successMessage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                    backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s'
                }}>
                    <div style={{
                        background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center',
                        maxWidth: '400px', width: '90%', animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', background: '#F0FFF4', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem'
                        }}>
                            👤
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#102A20',
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1A4D3B'}
                            onMouseOut={(e) => e.target.style.background = '#102A20'}
                        >
                            로그인 화면으로 이동
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ScreenSignup;

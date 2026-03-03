import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ShieldCheck, Package } from '../components/Icons';

const ScreenBBrandRelease = () => {
    const navigate = useNavigate();
    const { currentUser, release } = useDPPStore();

    const [passportId, setPassportId] = useState('P100');
    const [authError, setAuthError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setAuthError("총괄 브랜드 자산 관리 시스템입니다. 권한 확인이 필요합니다.");
            setTimeout(() => navigate('/login?return=/brand/release'), 4000);
        } else if (currentUser.role !== 'BRAND') {
            setAuthError("이 페이지는 최고 관리자(BRAND) 전용입니다. 일반 계정은 접근할 수 없습니다.");
            setTimeout(() => navigate('/'), 4000);
        }
    }, [currentUser, navigate]);

    if (authError) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
                    <div style={{ marginBottom: '20px' }}><ShieldCheck width={36} height={36} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.5rem', color: '#102A20', marginBottom: '16px' }}>보안 구역</h2>
                    <p style={{ color: '#718096' }}>{authError}</p>
                </div>
            </div>
        );
    }

    const handleRelease = async () => {
        if (!currentUser || currentUser.role !== 'BRAND') return;

        setLoading(true);
        try {
            await release(passportId);
            setSuccessMessage({
                title: "제품 유통망 출고 승인 완료",
                message: "출고 승인이 완료되었습니다.\n공식 판매처에서 클레임 코드를 발급할 수 있게 되었습니다."
            });
        } catch (e) {
            alert("출고 실패: " + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '50px 40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.4s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '16px' }}><Package width={28} height={28} stroke="#6B4C9A" /></div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>제품 유통망 출고 (Release)</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        원장이 생성(Mint)된 제품을 공식 판매처 등 유통 라인으로<br />출고 승인 처리하는 최상위 등급 관리 도구입니다.
                    </p>
                </div>

                <div style={{ background: '#FAFCFB', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            출고 검수 타겟 (Passport ID)
                        </label>
                        <input
                            value={passportId}
                            onChange={e => setPassportId(e.target.value)}
                            placeholder="P로 시작하는 고유 여권 ID 입력"
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2A4365'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            목적지 (인가된 공식 판매망)
                        </label>
                        <select
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', background: '#FFFFFF', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            <option value="U_RETAIL_1">지정점: 서울 강남 글로벌 플래그십 스토어</option>
                            <option value="U_RETAIL_2">온라인: 프리미엄 통합 물류 센터</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleRelease}
                    disabled={loading || !passportId}
                    style={{
                        width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                        background: (loading || !passportId) ? '#CBD5E0' : '#2A4365', // Dark distinct blue for BRAND
                        color: 'white', border: 'none', cursor: (loading || !passportId) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s', boxShadow: (loading || !passportId) ? 'none' : '0 8px 15px rgba(42, 67, 101, 0.2)'
                    }}
                >
                    {loading ? '글로벌 네트워크 동기화 중...' : '선택 제품 유통망 출고 완전 승인'}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#A0AEC0', borderTop: '1px dashed #E2E8F0', paddingTop: '20px' }}>
                    * 시스템상에 'RELEASED' 이벤트가 기록되며, 이관 받은 판매처에서 정상적으로 클레임 토큰 생성이 가능해집니다.
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
                            📦
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate('/');
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#2A4365', // Brand Blue
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1A365D'}
                            onMouseOut={(e) => e.target.style.background = '#2A4365'}
                        >
                            메인 화면으로 이동
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

export default ScreenBBrandRelease;

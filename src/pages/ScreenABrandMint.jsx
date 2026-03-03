import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { ShieldCheck } from '../components/Icons';

const ScreenABrandMint = () => {
    const navigate = useNavigate();
    const { currentUser, mint } = useDPPStore();

    const [model, setModel] = useState('New Model');
    const [sn, setSn] = useState('SN-' + Math.floor(Math.random() * 10000));
    const [authError, setAuthError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setAuthError("총괄 브랜드 자산 관리 시스템입니다. 권한 확인이 필요합니다.");
            setTimeout(() => navigate('/login?return=/brand/mint'), 4000);
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

    const handleMint = async () => {
        if (!currentUser || currentUser.role !== 'BRAND') return;

        setLoading(true);
        try {
            const res = await mint(model, sn, { color: 'Default', size: 'Standard', material: 'Leather' });
            setSuccessMessage({
                title: "제네시스 원장 발행 완료",
                message: `제품 원장 생성이 완료되었습니다!\n고유 식별 QR 코드: ${res.qrCode}`
            });
        } catch (e) {
            alert("제네시스 민팅 실패: " + (e.response?.data?.message || e.message));
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
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔨</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>제네시스 원장 발행 (Minting)</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        신규 제조된 제품의 최초 정보를 블록체인에 새겨넣는 최상위 관리자 기능입니다.
                    </p>
                </div>

                <div style={{ background: '#FAFCFB', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '30px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            생산 모델명
                        </label>
                        <input
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#4A5568', marginBottom: '10px' }}>
                            고유 시리얼 번호 (S/N)
                        </label>
                        <input
                            value={sn}
                            onChange={e => setSn(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', color: '#102A20',
                                border: '1px solid #E2E8F0', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', fontWeight: '600'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1A4D3B'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                        />
                    </div>
                </div>

                <button
                    onClick={handleMint}
                    disabled={loading || !model || !sn}
                    style={{
                        width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                        background: (loading || !model || !sn) ? '#CBD5E0' : '#2A4365', // Dark distinct blue for BRAND
                        color: 'white', border: 'none', cursor: (loading || !model || !sn) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s', boxShadow: (loading || !model || !sn) ? 'none' : '0 8px 15px rgba(42, 67, 101, 0.2)'
                    }}
                >
                    {loading ? '원장 생성 통신 중...' : '최초 원장(Genesis)에 각인하기'}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#A0AEC0', borderTop: '1px dashed #E2E8F0', paddingTop: '20px' }}>
                    * 이 작업은 되돌릴 수 없으며, 실행 즉시 글로벌 공용 원장에 (MINTED) 이벤트로 기록됩니다.
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
                            🔨
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>{successMessage.title}</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-wrap' }}>{successMessage.message}</p>
                        <button
                            onClick={() => {
                                setSuccessMessage(null);
                                navigate('/brand/release');
                            }}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#2A4365', // Match Brand Blue
                                color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#1A365D'}
                            onMouseOut={(e) => e.target.style.background = '#2A4365'}
                        >
                            출고 및 클레임 화면으로
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

export default ScreenABrandMint;

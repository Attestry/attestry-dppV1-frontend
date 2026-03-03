import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDPPStore } from '../store/useDPPStore';
import { Lock, Package } from '../components/Icons';

const Screen4Claim = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { currentUser, claimAsset, getTransferDetails } = useDPPStore();
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getTransferDetails(token)
            .then(res => setTokenData(res))
            .catch(() => alert("유효하지 않은 토큰입니다."))
            .finally(() => setLoading(false));
    }, [token, getTransferDetails]);

    const handleClaim = async () => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            navigate(`/login?return=/claim/${token}`);
            return;
        }
        setClaiming(true);
        try {
            await claimAsset(token);
            setSuccess(true);
            setTimeout(() => navigate('/me/passports'), 3000);
        } catch (e) {
            alert("클레임 실패: " + (e.response?.data?.message || e.message));
        } finally {
            setClaiming(false);
        }
    };

    if (success) {
        return (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FAFCFB',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px',
                zIndex: 100
            }}>
                <div style={{
                    background: '#FFFFFF', borderRadius: '32px', padding: '60px 40px',
                    boxShadow: '0 20px 50px rgba(56, 161, 105, 0.1)', border: '1px solid rgba(56, 161, 105, 0.2)',
                    textAlign: 'center', maxWidth: '420px', width: '100%',
                    animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{ marginBottom: '20px' }}><Lock width={48} height={48} stroke="#1A4D3B" /></div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1A4D3B', marginBottom: '16px' }}>소유권 장착 완료</h2>
                    <p style={{ fontSize: '1.05rem', color: '#4A5568', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>
                        축하합니다! 🥂 제품의 소유자로 원장에 영구 기록되었습니다.
                    </p>
                    <div style={{
                        width: '30px', height: '30px', border: '3px solid rgba(26, 77, 59, 0.1)',
                        borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#A0AEC0' }}>라운지로 이동 중입니다...</p>
                </div>
                <style>{`
                    @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A4D3B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{
                background: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '600px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)',
                animation: 'fadeInUp 0.4s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💼</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#102A20', margin: '0 0 12px 0' }}>소유권 등록 확인</h2>
                    <p style={{ fontSize: '0.95rem', color: '#718096', lineHeight: '1.5', margin: 0 }}>
                        판매처에서 발급한 유효한 양도 정보입니다.<br />아래 내용을 확인하고 내 제품으로 등록하세요.
                    </p>
                </div>

                <div style={{ background: '#F0F9F4', border: '1px solid #C6F6D5', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#2A7258', fontWeight: '600', fontSize: '0.9rem' }}>
                    <span>✓</span> 유효한 클레임 정보가 확인되었습니다.
                </div>

                <div style={{ background: '#FAFCFB', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ width: '56px', height: '56px', background: '#F0F9F4', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                            <Package width={28} height={28} stroke="#1A4D3B" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#102A20', margin: '0 0 4px 0' }}>{tokenData?.modelName || '제품 정보'}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>S/N: {tokenData?.serialNumber}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', fontSize: '0.9rem' }}>
                        <div style={{ color: '#718096', fontWeight: '600' }}>양도 방식</div>
                        <div style={{ color: '#102A20', fontWeight: '600' }}>{tokenData?.method === 'ONE_TIME_CODE' ? '시크릿 코드 (비대면)' : '매장 대면 스캔'}</div>

                        <div style={{ color: '#718096', fontWeight: '600' }}>양도자</div>
                        <div style={{ color: '#102A20', fontWeight: '600' }}>{tokenData?.fromUserName || '공식 판매처'}</div>

                        {tokenData?.receiptNumber && (
                            <>
                                <div style={{ color: '#718096', fontWeight: '600' }}>영수증 번호</div>
                                <div style={{ color: '#102A20', fontWeight: '600', fontFamily: 'monospace' }}>{tokenData.receiptNumber}</div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleClaim}
                    disabled={claiming}
                    style={{
                        width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '14px',
                        background: claiming ? '#CBD5E0' : 'linear-gradient(135deg, #1A4D3B 0%, #2A7258 100%)',
                        color: 'white', border: 'none', cursor: claiming ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s', boxShadow: claiming ? 'none' : '0 8px 15px rgba(26, 77, 59, 0.2)'
                    }}
                >
                    {claiming ? '등록 중...' : '내 제품으로 등록 확정'}
                </button>

                <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#A0AEC0', textAlign: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: '16px' }}>
                    * 등록 확정 시 CLAIMED 이벤트가 원장에 영구 기록되며,<br />향후 중고 거래 시 정품 구매 증빙 데이터로 활용됩니다.
                </div>
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Screen4Claim;
